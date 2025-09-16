# **Tài liệu Quy trình Kiểm tra Phân quyền RBAC (Version 2.0)**

## **Tổng quan**

Tài liệu này mô tả quy trình kiểm tra phân quyền dựa trên vai trò (RBAC) được triển khai trong hệ thống marketing. Hệ thống RBAC sử dụng phương pháp **6-layer validation** kết hợp static permissions, dynamic policies, và temporal overrides để đảm bảo bảo mật toàn diện.

## **Các Thành phần Cốt lõi**

### **Thành phần RBAC Chính (Coarse-grained)**
- **MktOrganizationLevelWorkspaceEntity**: Định nghĩa các cấp độ phân cấp tổ chức và quyền cơ bản
- **MktDepartmentWorkspaceEntity**: Đại diện cho các phòng ban chức năng với chính sách truy cập cụ thể
- **MktDepartmentHierarchyWorkspaceEntity**: Quản lý mối quan hệ cha-con giữa các phòng ban
- **WorkspaceMemberMktEntity**: Liên kết người dùng với bối cảnh tổ chức của họ

### **Thành phần Fine-grained Access Control**
- **MktDataAccessPolicyWorkspaceEntity**: Chính sách lọc dữ liệu cụ thể (Row-Level Security)
- **MktTemporaryPermissionWorkspaceEntity**: Quyền tạm thời có thời hạn (Override permissions)
- **MktPermissionAuditWorkspaceEntity**: Nhật ký kiểm toán cho việc kiểm tra quyền

### **Thành phần Configuration & Constants**
- **RBAC_RESOURCES**: Định nghĩa tất cả tài nguyên hệ thống
- **RBAC_ACTIONS**: Các hành động cơ bản (CRUD, Export, Approve, etc.)
- **RBAC_SYSTEM_ACTIONS**: Các khả năng cấp hệ thống
- **PERMISSION_TEMPLATES**: Template quyền theo từng organization level
- **ACCESS_LIMITATIONS**: Giới hạn và điều kiện truy cập

## **Quy trình Kiểm tra Phân quyền (6 Layers)**

### **Layer 1: Xác thực & Phân giải Bối cảnh Người dùng**
Hệ thống đầu tiên thiết lập bối cảnh tổ chức của người dùng:
```typescript
interface UserContext {
  userId: string;
  departmentId: string;
  organizationLevelId: string;
  employmentStatusId: string;
  region: string;
  directReports: string[];
}
```

### **Layer 2: Kiểm tra Cấp độ Tổ chức**
**Mục đích**: Thiết lập khung quyền cơ bản từ PERMISSION_TEMPLATES

**Cấu trúc permissions**:
```typescript
defaultPermissions: {
  resources: {
    [RBAC_RESOURCES.CUSTOMERS]: [RBAC_ACTIONS.READ, RBAC_ACTIONS.CREATE],
    [RBAC_RESOURCES.ORDERS]: [RBAC_ACTIONS.READ, RBAC_ACTIONS.UPDATE],
    // ...
  },
  actions: {
    [RBAC_SYSTEM_ACTIONS.DATA_EXPORT]: false,
    [RBAC_SYSTEM_ACTIONS.ADMIN_FUNCTIONS]: false,
    // ...
  },
  restrictions: {
    [RBAC_RESTRICTIONS.MAX_RECORDS_PER_QUERY]: 1000,
    [RBAC_RESTRICTIONS.WORKING_HOURS_ONLY]: true,
    // ...
  }
}
```

**Điểm quyết định**: Nếu action không có trong resources hoặc actions = false → DENY

### **Layer 3: Đánh giá Truy cập Phòng ban & Phân cấp**
**Mục đích**: Xác thực quyền phòng ban và áp dụng hierarchy rules

**Các kiểm tra chính**:
- Trạng thái hoạt động của phòng ban
- Quyền truy cập liên phòng ban (`allowsCrossDepartmentAccess`)
- Manager privileges trong hierarchy:
  - `canViewTeamData`: Xem dữ liệu team con
  - `canEditTeamData`: Sửa dữ liệu team con
  - `canExportTeamData`: Xuất dữ liệu team con

### **Layer 4: Áp dụng Access Limitations**
**Mục đích**: Áp dụng các ràng buộc từ accessLimitations

**Các kiểm tra**:
```typescript
accessLimitations: {
  temporal: {
    working_hours: { enabled: true, start: "08:00", end: "18:00" },
    session_timeout: 3600
  },
  functional: {
    blocked_actions: ["delete_any_record", "admin_functions"],
    require_approval: ["large_data_export"],
    escalation_required: ["financial_data"]
  }
}
```

**Điểm quyết định**:
- `blocked_actions` → **DENY tuyệt đối**
- `temporal violations` → **DENY**
- `require_approval` → **CONDITIONAL**
- `escalation_required` → **ESCALATION**

### **Layer 5: Áp dụng Data Access Policies (Row-Level Security)**
**Mục đích**: Lọc dữ liệu theo business rules cụ thể

**Cấu trúc policy**:
```typescript
{
  name: "Regional Sales Access",
  department: "Sales",
  objectName: "mktCustomer",
  filterConditions: {
    "region": "${user.region}",
    "assignedTo": "${current_user_id}",
    "status": {"$ne": "inactive"}
  },
  priority: 100
}
```

**Xử lý**:
- Multiple policies → Merge by priority (higher number = higher precedence)
- Dynamic variables: `${user.id}`, `${user.region}`, `${user.department}`
- Complex conditions: AND, OR, nested objects
- **Kết quả**: FILTERED DATA (không phải GRANT/DENY)

### **Layer 6: Kiểm tra Temporary Permissions (Override Layer)**
**Mục đích**: Override mọi giới hạn trên với quyền có thời hạn

**Cấu trúc temporary permission**:
```typescript
{
  granteeWorkspaceMember: "user_123",
  granterWorkspaceMember: "manager_456",
  objectName: "mktFinancialReport",
  recordId: "specific_report_id", // null = all records
  canRead: true,
  canUpdate: false,
  canDelete: false,
  expiresAt: "2024-12-31T23:59:59",
  reason: "Year-end audit compliance",
  purpose: "External auditor data access",
  isActive: true
}
```

**Điểm quyết định**: Nếu có temporary permission hợp lệ → **OVERRIDE** tất cả restrictions trên

## **Luồng Quyết định**

### **Thứ tự Phân giải Quyền**
```
1. Organization Level (defaultPermissions/accessLimitations)
   ↓ GRANT/DENY
2. Department Access (basic department rules)
   ↓ GRANT/DENY
3. Department Hierarchy (inheritance & delegation)
   ↓ INHERIT/OVERRIDE
4. Access Limitations (temporal, functional blocks)
   ↓ DENY/CONDITIONAL/ESCALATION
5. Data Access Policies (Row-Level Security)
   ↓ FILTER/REFINE
6. Temporary Permissions (Override)
   ↓ OVERRIDE/GRANT
7. Final Result
```

### **Priority Matrix**

| Priority Level | Component | Override Capability |
|---------------|-----------|---------------------|
| **1 (Highest)** | Temporary Permissions | Can override ALL restrictions |
| **2** | accessLimitations.blocked_actions | Cannot be overridden by org level |
| **3** | accessLimitations.temporal | Can be overridden by temporary |
| **4** | Data Access Policies | Filter data, don't deny access |
| **5** | Department Hierarchy Rules | Apply inheritance and delegation |
| **6 (Lowest)** | defaultPermissions | Base permissions framework |

### **Decision Matrix**

| Organization Level | Data Policy | Temporary Permission | Final Result |
|-------------------|-------------|---------------------|--------------|
| DENY | Any | None | ❌ DENY |
| DENY | Any | ACTIVE GRANT | ✅ TEMPORARY GRANT |
| GRANT | FILTER | None | ✅ FILTERED GRANT |
| GRANT | FILTER | ACTIVE GRANT | ✅ TEMPORARY (Bypass Filter) |
| GRANT | blocked_actions | None | ❌ DENY |
| GRANT | blocked_actions | ACTIVE GRANT | ✅ TEMPORARY OVERRIDE |
| GRANT | temporal violation | None | ❌ DENY |
| GRANT | temporal violation | ACTIVE GRANT | ✅ TEMPORARY OVERRIDE |
| GRANT | require_approval | None | ⚠️ CONDITIONAL |
| GRANT | escalation_required | None | 🔄 ESCALATION |
| GRANT | No restrictions | None | ✅ FULL GRANT |

## **Ví dụ Thực tế**

### **Trường hợp 1: Standard Department Access**
```
User: Sales Staff (Level: SENIOR_STAFF, Department: Sales)
Request: Read customers assigned to them
Time: 14:00 (Tuesday)

Flow:
1. Organization Level: ✅ SENIOR_STAFF.defaultPermissions.resources.customers = ['read', 'create']
2. Department: ✅ Sales department active
3. Hierarchy: ✅ No cross-department access needed
4. Access Limitations: ✅ Within working hours
5. Data Policy: Applied "Own Records Only"
   filterConditions: {"assignedTo": "${current_user_id}"}
6. Temporary: None

Result: ✅ GRANTED with DATA FILTERING
→ User chỉ thấy customers được assign cho mình
```

### **Trường hợp 2: Cross-Department Denial**
```
User: Sales Staff (Level: SENIOR_STAFF)
Request: Read HR employee records
Time: 10:00 (Monday)

Flow:
1. Organization Level: ✅ SENIOR_STAFF có basic read permissions
2. Department: ❌ Sales department, allowsCrossDepartmentAccess = false
3. Access Limitations: HR in restricted_departments = ['hr', 'finance', 'executive']
4. → MULTIPLE LAYER DENIAL

Result: ❌ DENIED
→ Multiple layers block HR data access
```

### **Trường hợp 3: Manager Hierarchy Access**
```
User: Sales Manager (Level: MANAGER)
Request: Update performance data của Sales Staff
Time: 16:00 (Wednesday)

Flow:
1. Organization Level: ✅ MANAGER.defaultPermissions supports update
2. Department: ✅ Same department (Sales)
3. Hierarchy: ✅ Manager → Staff relationship
   - canEditTeamData = true
   - inheritsPermissions = false (Manager có quyền riêng)
4. Access Limitations: ✅ No blocks
5. Data Policy: "Manager Team Access"
   filterConditions: {"department": "Sales", "reportingTo": "${user.id}"}

Result: ✅ GRANTED with TEAM FILTERING
→ Manager chỉ edit được data của direct reports
```

### **Trường hợp 4: Temporary Permission Emergency Access**
```
User: Marketing Staff (Level: SENIOR_STAFF)
Request: Read specific financial report for audit
Resource: mktFinancialReport
Record: "Q4_2024_Budget_Analysis"
Time: 20:00 (Friday) - Outside working hours

Flow:
1. Organization Level: ❌ SENIOR_STAFF không có financial_data access
2. Access Limitations: ❌ Outside working_hours (08:00-18:00)
3. Temporary Permission Found:
   {
     "grantee": "current_user",
     "granter": "finance_manager",
     "objectName": "mktFinancialReport",
     "recordId": "Q4_2024_Budget_Analysis",
     "canRead": true,
     "expiresAt": "2024-12-31T23:59:59",
     "reason": "External audit compliance requirement",
     "purpose": "Year-end financial audit support"
   }
   → TEMPORARY OVERRIDE ✅

Result: ✅ GRANTED (Temporary, Audited)
→ Override both organization level và temporal restrictions
→ Full audit trail: who, what, why, when, until when
```

### **Trường hợp 5: Complex Data Policy with Regional Restrictions**
```
User: Regional Manager (Level: MANAGER, Region: Central)
Request: Bulk export customer data
Resource: mktCustomer (all records)
Time: 11:00 (Thursday)

Flow:
1. Organization Level: ✅ MANAGER.actions.data_export = true
2. Department: ✅ Sales department
3. Hierarchy: ✅ Manager level access
4. Access Limitations: ✅ Within working hours, no blocks
5. Data Policy Stack (multiple policies applied):

   Policy 1: "Regional Access Control" (Priority: 100)
   filterConditions: {"region": "Central"}

   Policy 2: "Manager Customer Access" (Priority: 50)
   filterConditions: {"status": {"$in": ["active", "pending"]}}

   Policy 3: "Export Size Limit" (Priority: 75)
   filterConditions: {"createdAt": {"$gte": "2024-01-01"}}

   Combined Filter (by priority):
   {
     "region": "Central",
     "status": {"$in": ["active", "pending"]},
     "createdAt": {"$gte": "2024-01-01"}
   }

6. Restrictions Check:
   - max_export_size: 100,000 records
   - require_approval: ["large_data_export"]
   → CONDITIONAL (if result > 100k records)

Result: ✅ GRANTED with MULTI-LAYER FILTERING + SIZE LIMIT
→ Export chỉ customers: Central region + Active/Pending + Created 2024+
→ Nếu > 100k records thì cần approval từ Director
```

## **RBAC Architecture Summary**

### **Static vs Dynamic Permissions**

| Loại | Entity | Mục đích | Đặc điểm |
|------|--------|----------|----------|
| **Static** | MktOrganizationLevelWorkspaceEntity | Khung quyền cơ bản | Ít thay đổi, theo cấp bậc |
| **Static** | MktDepartmentWorkspaceEntity | Nhóm chức năng | Theo phòng ban, business rules |
| **Dynamic** | MktDataAccessPolicyWorkspaceEntity | Row-level filtering | Linh hoạt, theo dữ liệu |
| **Dynamic** | MktTemporaryPermissionWorkspaceEntity | Exception handling | Tạm thời, có thời hạn |

### **Data Storage Evolution**

**Trước đây (TEXT-based)**:
```typescript
// Lưu trữ
defaultPermissions: string // JSON.stringify()
accessLimitations: string  // JSON.stringify()

// Sử dụng
const perms = JSON.parse(user.organizationLevel.defaultPermissions);
```

**Hiện tại (Native JSON)**:
```typescript
// Lưu trữ
defaultPermissions: DefaultPermissions  // Native JSON
accessLimitations: AccessLimitations   // Native JSON

// Sử dụng (no parsing needed)
const perms = user.organizationLevel.defaultPermissions;
if (perms.actions[RBAC_SYSTEM_ACTIONS.DATA_EXPORT]) { /* ... */ }
```

### **Centralized Configuration**

**RBAC Constants Structure**:
```typescript
// Resource definitions
RBAC_RESOURCES: { CUSTOMERS: 'customers', ORDERS: 'orders', ... }

// Action definitions
RBAC_ACTIONS: { READ: 'read', CREATE: 'create', ... }

// System capabilities
RBAC_SYSTEM_ACTIONS: { DATA_EXPORT: 'data_export', ... }

// Pre-built templates
PERMISSION_TEMPLATES: {
  DIRECTOR: { defaultPermissions: {...}, accessLimitations: {...} },
  MANAGER: { defaultPermissions: {...}, accessLimitations: {...} },
  // ...
}
```

## **Implementation Guidelines**

### **Security Best Practices**
- **Fail-Safe Default**: Mặc định DENY nếu không có quyền rõ ràng
- **Audit Logging**: Log tất cả permission decisions và temporary grants
- **Input Validation**: Validate tất cả filterConditions và permission scopes
- **SQL Injection Prevention**: Sử dụng parameterized queries cho data policies

### **Performance Optimization**
- **Strategic Caching**: Cache permission results, data policies, và user contexts
- **Database Optimization**: Index department, organization level, và policy lookups
- **Efficient Queries**: Batch permission checks và optimize data policy queries
- **Native JSON**: Sử dụng RAW_JSON thay vì TEXT để tránh parsing overhead

### **Monitoring & Alerting**
- **Permission Failures**: Alert khi có quá nhiều DENY
- **Temporary Permission Usage**: Monitor việc sử dụng temporary permissions
- **Policy Conflicts**: Detect và alert policy conflicts
- **Performance Metrics**: Track permission check latency

### **Testing Strategy**
- **Unit Tests**: Test từng layer permission riêng biệt
- **Integration Tests**: Test full permission flow
- **Security Tests**: Test bypass attempts và edge cases
- **Load Tests**: Test performance với large datasets

## **Migration & Deployment**

### **Database Migration Strategy**
1. **Schema Updates**: Migrate defaultPermissions và accessLimitations from TEXT to RAW_JSON
2. **Data Conversion**: Convert existing JSON strings to native JSON objects
3. **Template Application**: Update existing records to use PERMISSION_TEMPLATES
4. **Index Creation**: Add indexes for performance optimization

### **Rollback Plan**
- Keep backup of original TEXT-based data
- Maintain conversion scripts for rollback if needed
- Gradual rollout với feature flags

### **Testing Checklist**
- [ ] Unit tests cho tất cả permission layers
- [ ] Integration tests cho complex scenarios
- [ ] Performance tests với large datasets
- [ ] Security penetration testing
- [ ] Load testing cho concurrent users
- [ ] Audit trail validation

## **System Guarantees**

🔒 **Security Guarantees**:
- **Fail-Safe**: Default DENY if any component fails
- **No Privilege Escalation**: Temporary permissions cannot exceed organizational boundaries for critical actions
- **Audit Completeness**: Every permission decision is logged with full context
- **Time Bounds**: All temporary access automatically expires

⚡ **Performance Guarantees**:
- **Sub-second Response**: Permission checks complete within 500ms for 99% of requests
- **Efficient Caching**: Cache hit rate > 90% for repeated permission checks
- **Graceful Degradation**: System remains functional even if policy services are degraded

🎯 **Functional Guarantees**:
- **Consistency**: Same user, same context, same resource = same permission result
- **Precedence**: Clear precedence order prevents ambiguous permission states
- **Granularity**: Support from organization-wide down to individual record permissions

---

**⚠️ Lưu ý Quan trọng**: Đây là hệ thống RBAC multi-layer phức tạp. Việc triển khai yêu cầu:
- **Extensive Testing**: Test kỹ lưỡng tất cả scenarios
- **Gradual Rollout**: Deploy từng layer một để identify issues sớm
- **Monitoring**: Set up comprehensive monitoring và alerting
- **Documentation**: Maintain up-to-date permission documentation
- **Training**: Train developers về RBAC flow và troubleshooting

**🔐 Security First**: Always err on the side of denial. Better to have false negatives than false positives trong access control.