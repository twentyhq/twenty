# MktDepartmentWorkspaceEntity - Thiết kế Quản lý Phòng ban

## Tổng quan

`MktDepartmentWorkspaceEntity` là entity cốt lõi để quản lý thông tin các phòng ban trong hệ thống Twenty.com CRM. Entity này được thiết kế để hỗ trợ quản lý toàn diện các phòng ban từ thông tin cơ bản đến các cài đặt nâng cao như KPI tracking, budget management và data access policies.

## Kiến trúc và Thiết kế

### Nguyên tắc thiết kế

1. **Centralized Management**: Quản lý tập trung thông tin phòng ban
2. **Flexible Configuration**: Cấu hình linh hoạt cho nhiều loại phòng ban
3. **RBAC Integration**: Tích hợp sâu với hệ thống phân quyền
4. **UI/UX Friendly**: Hỗ trợ customization giao diện người dùng
5. **Audit Trail**: Đầy đủ thông tin để audit và traceability

### Cấu trúc Entity

```typescript
@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktDepartment,
  namePlural: 'mktDepartments',
  labelSingular: 'Department',
  labelPlural: 'Departments', 
  description: 'Departments in the marketing system.',
  icon: 'IconBuilding',
  shortcut: 'D',
})
@WorkspaceIsSearchable()
export class MktDepartmentWorkspaceEntity extends BaseWorkspaceEntity
```

---

## Chi tiết các Field

### 1. Thông tin Định danh

#### `departmentCode: string`
- **Mục đích**: Mã định danh duy nhất cho phòng ban
- **Đặc điểm**: 
  - Bắt buộc (required)
  - Unique identifier trong hệ thống
  - Thường sử dụng format ngắn gọn
- **Ví dụ**:
  ```json
  {
    "departmentCode": "MKT-DIG",
    "departmentName": "Digital Marketing"
  }
  ```
- **Use cases**:
  - Integration với external systems
  - Reporting và analytics
  - API endpoint identification
  - Database indexing optimization

#### `departmentName: string`
- **Mục đích**: Tên hiển thị chính của phòng ban
- **Đặc điểm**:
  - Bắt buộc (required) 
  - Human-readable name
  - Sử dụng trong UI chính
- **Ví dụ**: "Digital Marketing", "Inside Sales", "Customer Support"

#### `departmentNameEn?: string`
- **Mục đích**: Tên phòng ban bằng tiếng Anh
- **Đặc điểm**: 
  - Optional field
  - Hỗ trợ internationalization (i18n)
  - Dùng cho multi-language support
- **Use cases**:
  - Global companies với nhân viên quốc tế
  - Export reports ra English
  - Integration với international systems

### 2. Thông tin Mô tả

#### `description?: string`
- **Mục đích**: Mô tả chi tiết về chức năng, nhiệm vụ của phòng ban
- **Đặc điểm**: Optional, free-text field
- **Ví dụ**:
  ```json
  {
    "departmentCode": "MKT-DIG",
    "departmentName": "Digital Marketing",
    "description": "Chuyên trách về marketing online, quản lý campaigns digital, SEO/SEM, social media marketing và analytics. Mục tiêu tăng brand awareness và lead generation thông qua các kênh digital."
  }
  ```

### 3. Quản lý Tài chính

#### `budgetCode?: string`
- **Mục đích**: Mã ngân sách để tracking chi phí của phòng ban
- **Integration**: Kết nối với hệ thống tài chính/accounting
- **Ví dụ**: "BGT-MKT-2024", "BUDGET-SALES-Q1"
- **Use cases**:
  - Budget tracking và reporting
  - Cost center allocation
  - Financial audit và compliance

#### `costCenter?: string`  
- **Mục đích**: Trung tâm chi phí để phân bổ costs
- **Accounting**: Dùng trong cost accounting
- **Ví dụ**: "CC-1001-MARKETING", "CC-2001-SALES"
- **Applications**:
  - P&L allocation
  - Department profitability analysis
  - Resource allocation decisions

### 4. Cấu hình KPI và Performance

#### `requiresKpiTracking?: boolean`
- **Mục đích**: Xác định phòng ban có cần theo dõi KPI không
- **Default**: Thường là `true` cho most departments
- **Impact**: Ảnh hưởng đến:
  - KPI dashboard visibility
  - Performance review cycles
  - Reporting requirements
- **Ví dụ logic**:
  ```typescript
  if (department.requiresKpiTracking) {
    // Enable KPI modules
    await enableKpiDashboard(department.id);
    await schedulePerformanceReviews(department.id);
  }
  ```

#### `defaultKpiCategory?: string`
- **Mục đích**: Category mặc định cho KPIs của phòng ban
- **Standardization**: Giúp standardize KPI categorization
- **Ví dụ**: "Revenue", "Customer Satisfaction", "Operational Efficiency"
- **Applications**:
  - KPI template selection
  - Benchmarking across departments
  - Automated reporting

### 5. Cấu hình Truy cập và Permissions

#### `allowsCrossDepartmentAccess?: boolean`
- **Mục đích**: Cho phép truy cập dữ liệu từ phòng ban khác
- **Security**: Important security configuration
- **Default**: Thường là `false` cho security
- **Impact**:
  - Cross-department data sharing
  - Collaboration capabilities
  - Security boundary definitions

#### `isActive?: boolean`
- **Mục đích**: Trạng thái hoạt động của phòng ban
- **Soft Delete**: Alternative to hard deletion
- **Benefits**:
  - Preserve historical data
  - Easy reactivation
  - Audit trail maintenance

### 6. UI/UX Configuration

#### `displayOrder: number`
- **Mục đích**: Thứ tự hiển thị trong các danh sách
- **Required**: Bắt buộc để đảm bảo consistent ordering
- **Use cases**:
  - Department dropdown lists
  - Navigation menus
  - Reporting order

#### `colorCode?: string`
- **Mục đích**: Màu sắc đại diện cho phòng ban trong UI
- **Format**: Hex color codes (e.g., "#FF5722")
- **Applications**:
  - Charts và graphs
  - Calendar color coding
  - Visual department identification
- **Ví dụ**:
  ```json
  {
    "departmentCode": "MKT",
    "colorCode": "#FF5722", // Deep Orange for Marketing
    "departmentName": "Marketing Department"
  }
  ```

#### `iconName?: string`
- **Mục đích**: Tên icon đại diện cho phòng ban
- **Icon System**: Integration với Twenty.com icon system
- **Ví dụ**: "IconBullhorn", "IconPhone", "IconCode", "IconUsers"
- **Applications**:
  - Navigation icons
  - Department cards
  - Mobile app representation

#### `position?: number`
- **Mục đích**: Vị trí cho drag & drop functionality
- **UI/UX**: Support interactive department management
- **Different from displayOrder**: 
  - `displayOrder`: Business logic ordering
  - `position`: UI interaction ordering

### 7. Metadata và Audit

#### `createdBy: ActorMetadata`
- **Mục đích**: Thông tin người tạo phòng ban
- **Audit Trail**: Essential for compliance
- **Structure**: ActorMetadata composite type
- **Information includes**:
  - User ID
  - Workspace member information
  - Creation timestamp

---

## Relations (Quan hệ với Entities khác)

### 1. Quan hệ với WorkspaceMember

```typescript
@WorkspaceRelation({
  standardId: MKT_DEPARTMENT_FIELD_IDS.staffMembers,
  type: RelationType.ONE_TO_MANY,
  label: 'People',
  description: 'People in this department', 
  icon: 'IconUsers',
  inverseSideTarget: () => WorkspaceMemberWorkspaceEntity,
  inverseSideFieldKey: 'department',
})
people: Relation<WorkspaceMemberWorkspaceEntity[]>;
```

**Ý nghĩa**: Một phòng ban có nhiều nhân viên
- **Use cases**: 
  - Department member listing
  - Headcount reporting
  - Permission assignment by department
- **Business Logic**: 
  ```typescript
  // Get all members of a department
  const members = await department.people;
  
  // Calculate department headcount
  const headcount = members.length;
  
  // Assign permissions to all department members
  await assignPermissionsToDepartment(department.id, permissions);
  ```

### 2. Quan hệ Hierarchy - Child Hierarchies

```typescript
@WorkspaceRelation({
  standardId: MKT_DEPARTMENT_FIELD_IDS.childHierarchies,
  type: RelationType.ONE_TO_MANY,
  label: 'Child Hierarchies',
  description: 'Hierarchy entries where this department is the parent',
  icon: 'IconHierarchy',
  inverseSideTarget: () => MktDepartmentHierarchyWorkspaceEntity,
  inverseSideFieldKey: 'parentDepartment',
})
childHierarchies: Relation<MktDepartmentHierarchyWorkspaceEntity[]>;
```

**Ý nghĩa**: Các mối quan hệ phân cấp mà phòng ban này là parent
- **Applications**:
  - Build organization chart
  - Calculate reporting structure
  - Permission inheritance down the hierarchy

### 3. Quan hệ Hierarchy - Parent Hierarchies

```typescript
@WorkspaceRelation({
  standardId: MKT_DEPARTMENT_FIELD_IDS.parentHierarchies,
  type: RelationType.ONE_TO_MANY,
  label: 'Parent Hierarchies', 
  description: 'Hierarchy entries where this department is the child',
  icon: 'IconHierarchy2',
  inverseSideTarget: () => MktDepartmentHierarchyWorkspaceEntity,
  inverseSideFieldKey: 'childDepartment',
})
parentHierarchies: Relation<MktDepartmentHierarchyWorkspaceEntity[]>;
```

**Ý nghĩa**: Các mối quan hệ phân cấp mà phòng ban này là child
- **Support**: Matrix organization (một department có nhiều parents)
- **Use cases**:
  - Multi-reporting relationships
  - Cross-functional teams
  - Temporary project assignments

### 4. Quan hệ với Data Access Policies

```typescript
@WorkspaceRelation({
  standardId: MKT_DEPARTMENT_FIELD_IDS.dataAccessPolicies,
  type: RelationType.ONE_TO_MANY,
  label: 'Data Access Policies',
  description: 'Data access policies that apply to this department',
  icon: 'IconShield', 
  inverseSideTarget: () => MktDataAccessPolicyWorkspaceEntity,
  inverseSideFieldKey: 'department',
})
dataAccessPolicies: Relation<MktDataAccessPolicyWorkspaceEntity[]>;
```

**Ý nghĩa**: Các chính sách truy cập dữ liệu áp dụng cho phòng ban
- **Security**: Core component của data security
- **Flexibility**: Multiple policies per department
- **Examples**:
  ```typescript
  // Department có thể có nhiều data access policies
  const policies = [
    {
      objectName: 'mktKpi',
      filterConditions: { assigneeDepartmentId: department.id },
      priority: 1
    },
    {
      objectName: 'customer', 
      filterConditions: { region: department.region },
      priority: 2
    }
  ];
  ```

---

## Patterns và Use Cases

### 1. Standard Corporate Department

```json
{
  "departmentCode": "SALES-001",
  "departmentName": "Inside Sales",
  "departmentNameEn": "Inside Sales", 
  "description": "Remote sales team focused on inbound leads and phone/email sales",
  "budgetCode": "BGT-SALES-2024",
  "costCenter": "CC-2001", 
  "requiresKpiTracking": true,
  "defaultKpiCategory": "Revenue",
  "allowsCrossDepartmentAccess": false,
  "displayOrder": 10,
  "colorCode": "#4CAF50",
  "iconName": "IconPhone",
  "isActive": true
}
```

### 2. Support/Service Department

```json
{
  "departmentCode": "SUP-CS",
  "departmentName": "Customer Support",
  "departmentNameEn": "Customer Support",
  "description": "24/7 customer support via chat, email, and phone",
  "budgetCode": "BGT-SUPPORT-2024",
  "costCenter": "CC-3001",
  "requiresKpiTracking": true, 
  "defaultKpiCategory": "Customer Satisfaction",
  "allowsCrossDepartmentAccess": true, // Need access to sales data
  "displayOrder": 30,
  "colorCode": "#2196F3", 
  "iconName": "IconHeadset",
  "isActive": true
}
```

### 3. Matrix/Cross-functional Team

```json
{
  "departmentCode": "PROJ-CRM",
  "departmentName": "CRM Implementation Project",
  "description": "Cross-functional team for CRM system implementation",
  "requiresKpiTracking": true,
  "defaultKpiCategory": "Project Delivery", 
  "allowsCrossDepartmentAccess": true, // Cross-functional needs
  "displayOrder": 100,
  "colorCode": "#FF9800",
  "iconName": "IconRocket", 
  "isActive": true
}
```

### 4. Temporary/Seasonal Department

```json
{
  "departmentCode": "TEMP-HOLIDAY",
  "departmentName": "Holiday Season Support",
  "description": "Temporary team for holiday season customer support surge", 
  "requiresKpiTracking": false, // Temporary, simple tracking
  "allowsCrossDepartmentAccess": true,
  "displayOrder": 999,
  "colorCode": "#E91E63",
  "iconName": "IconSnowflake",
  "isActive": true
}
```

---

## Integration với RBAC System

### Department-based Permission Assignment

```typescript
class DepartmentPermissionService {
  
  async assignPermissionsToDepartment(
    departmentId: string, 
    permissions: PermissionAction[]
  ): Promise<void> {
    
    // Get all department members
    const department = await this.getDepartmentWithMembers(departmentId);
    
    // Assign permissions to all members
    for (const member of department.people) {
      await this.rbacService.assignPermissions(member.id, permissions);
    }
    
    // Update department data access policies
    await this.updateDepartmentPolicies(departmentId, permissions);
  }
  
  async calculateDepartmentPermissions(
    departmentId: string
  ): Promise<PermissionAction[]> {
    
    let permissions: PermissionAction[] = [];
    
    // Base department permissions
    const baseDepartmentPerms = await this.getBaseDepartmentPermissions(departmentId);
    permissions.push(...baseDepartmentPerms);
    
    // Inherited permissions from parent departments
    if (await this.shouldInheritFromParents(departmentId)) {
      const inheritedPerms = await this.getInheritedPermissions(departmentId);
      permissions.push(...inheritedPerms);
    }
    
    // Cross-department permissions
    const dept = await this.getDepartment(departmentId);
    if (dept.allowsCrossDepartmentAccess) {
      permissions.push(PermissionAction.VIEW_CROSS_DEPARTMENT_DATA);
    }
    
    return this.deduplicatePermissions(permissions);
  }
}
```

### Department-based Data Filtering

```typescript
class DepartmentDataFilter {
  
  async applyDepartmentFilters(
    query: QueryBuilder,
    userId: string,
    objectName: string
  ): Promise<QueryBuilder> {
    
    // Get user's department
    const user = await this.getUserWithDepartment(userId);
    if (!user.department) return query;
    
    // Apply department-specific data access policies
    const policies = await user.department.dataAccessPolicies;
    
    for (const policy of policies) {
      if (policy.objectName === objectName && policy.isActive) {
        query = this.applyFilterConditions(query, policy.filterConditions);
      }
    }
    
    // Apply cross-department access rules
    if (!user.department.allowsCrossDepartmentAccess) {
      query = query.where('departmentId', user.department.id);
    }
    
    return query;
  }
  
  private applyFilterConditions(
    query: QueryBuilder, 
    conditions: any
  ): QueryBuilder {
    
    // Apply JSON filter conditions
    for (const [field, value] of Object.entries(conditions)) {
      if (Array.isArray(value)) {
        query = query.whereIn(field, value);
      } else {
        query = query.where(field, value);
      }
    }
    
    return query;
  }
}
```

---

## Department Lifecycle Management

### 1. Department Creation Workflow

```typescript
async function createDepartment(
  departmentData: CreateDepartmentDto,
  createdBy: string
): Promise<MktDepartmentWorkspaceEntity> {
  
  return await db.transaction(async (trx) => {
    
    // 1. Create department record
    const department = await trx('mktDepartment').insert({
      ...departmentData,
      createdBy: { userId: createdBy, timestamp: new Date() },
      isActive: true
    }).returning('*');
    
    // 2. Setup default data access policies
    await createDefaultDataAccessPolicies(department.id, trx);
    
    // 3. Create hierarchy relationships if specified
    if (departmentData.parentDepartmentId) {
      await createHierarchyRelationship(
        departmentData.parentDepartmentId,
        department.id, 
        'PARENT_CHILD',
        trx
      );
    }
    
    // 4. Setup default KPI templates if required
    if (department.requiresKpiTracking) {
      await setupDefaultKpiTemplates(department.id, trx);
    }
    
    // 5. Send notifications
    await notifyDepartmentCreation(department);
    
    return department;
  });
}
```

### 2. Department Restructuring

```typescript
async function restructureDepartment(
  departmentId: string,
  restructureData: RestructureDto
): Promise<void> {
  
  await db.transaction(async (trx) => {
    
    // 1. Update department information
    await trx('mktDepartment')
      .where('id', departmentId)
      .update(restructureData.departmentUpdates);
    
    // 2. Handle hierarchy changes
    if (restructureData.hierarchyChanges) {
      // Deactivate old relationships
      await deactivateHierarchyRelationships(departmentId, trx);
      
      // Create new relationships
      for (const change of restructureData.hierarchyChanges) {
        await createHierarchyRelationship(
          change.parentId,
          change.childId,
          change.type,
          trx
        );
      }
    }
    
    // 3. Update member assignments
    if (restructureData.memberTransfers) {
      await transferMembers(restructureData.memberTransfers, trx);
    }
    
    // 4. Recalculate permissions
    await recalculateDepartmentPermissions(departmentId, trx);
    
    // 5. Update data access policies
    await updateDataAccessPolicies(departmentId, trx);
    
    // 6. Audit logging
    await logRestructureActivity(departmentId, restructureData, trx);
  });
}
```

### 3. Department Deactivation

```typescript
async function deactivateDepartment(
  departmentId: string,
  reason: string
): Promise<void> {
  
  await db.transaction(async (trx) => {
    
    // 1. Soft delete department
    await trx('mktDepartment')
      .where('id', departmentId) 
      .update({ 
        isActive: false,
        deactivatedAt: new Date(),
        deactivationReason: reason
      });
    
    // 2. Handle member reassignment
    const members = await getDepartmentMembers(departmentId);
    if (members.length > 0) {
      // Either reassign to parent department or make department-less
      await reassignOrphanedMembers(members, trx);
    }
    
    // 3. Deactivate hierarchy relationships
    await trx('mktDepartmentHierarchy')
      .where(builder => 
        builder.where('parentDepartmentId', departmentId)
               .orWhere('childDepartmentId', departmentId)
      )
      .update({ isActive: false });
    
    // 4. Handle ongoing KPIs and projects
    await handleOngoingDepartmentWork(departmentId, trx);
    
    // 5. Archive data access policies
    await archiveDataAccessPolicies(departmentId, trx);
    
    // 6. Notification and cleanup
    await notifyDepartmentDeactivation(departmentId, reason);
  });
}
```

---

## Performance Optimization

### 1. Database Indexing

```sql
-- Essential indexes for department operations
CREATE INDEX idx_department_code ON mkt_department(department_code) 
WHERE is_active = true;

CREATE INDEX idx_department_active ON mkt_department(is_active, display_order);

CREATE INDEX idx_department_budget ON mkt_department(budget_code) 
WHERE budget_code IS NOT NULL;

CREATE INDEX idx_department_search ON mkt_department 
USING gin(to_tsvector('english', department_name || ' ' || COALESCE(description, '')));

-- Composite indexes for common queries
CREATE INDEX idx_department_kpi_tracking ON mkt_department(requires_kpi_tracking, is_active)
WHERE requires_kpi_tracking = true;

CREATE INDEX idx_department_cross_access ON mkt_department(allows_cross_department_access)
WHERE allows_cross_department_access = true;
```

### 2. Caching Strategy

```typescript
class DepartmentCacheService {
  private departmentCache = new Map<string, MktDepartmentWorkspaceEntity>();
  private hierarchyCache = new Map<string, DepartmentHierarchy>();
  
  async getDepartment(id: string): Promise<MktDepartmentWorkspaceEntity> {
    // Check cache first
    if (this.departmentCache.has(id)) {
      return this.departmentCache.get(id)!;
    }
    
    // Load from database
    const department = await this.loadDepartmentFromDb(id);
    
    // Cache for future use
    this.departmentCache.set(id, department);
    
    return department;
  }
  
  async getDepartmentHierarchy(departmentId: string): Promise<DepartmentHierarchy> {
    const cacheKey = `hierarchy:${departmentId}`;
    
    if (this.hierarchyCache.has(cacheKey)) {
      return this.hierarchyCache.get(cacheKey)!;
    }
    
    const hierarchy = await this.buildDepartmentHierarchy(departmentId);
    this.hierarchyCache.set(cacheKey, hierarchy);
    
    return hierarchy;
  }
  
  // Cache invalidation on department changes
  invalidateDepartmentCache(departmentId: string): void {
    this.departmentCache.delete(departmentId);
    
    // Also invalidate hierarchy caches that might be affected
    const hierarchyKeys = Array.from(this.hierarchyCache.keys())
      .filter(key => key.includes(departmentId));
    
    hierarchyKeys.forEach(key => this.hierarchyCache.delete(key));
  }
}
```

### 3. Query Optimization

```typescript
// Optimized queries for common department operations

class DepartmentQueryService {
  
  // Get department with related data in one query
  async getDepartmentWithDetails(id: string): Promise<DepartmentDetails> {
    return await db('mktDepartment as d')
      .select([
        'd.*',
        'wm.id as member_id',
        'wm.nameFirstName', 
        'wm.nameLastName',
        db.raw('count(h1.id) as child_count'),
        db.raw('count(h2.id) as parent_count'),
        db.raw('count(dap.id) as policy_count')
      ])
      .leftJoin('workspaceMember as wm', 'wm.departmentId', 'd.id')
      .leftJoin('mktDepartmentHierarchy as h1', function() {
        this.on('h1.parentDepartmentId', 'd.id')
            .andOn('h1.isActive', db.raw('true'));
      })
      .leftJoin('mktDepartmentHierarchy as h2', function() {
        this.on('h2.childDepartmentId', 'd.id')
            .andOn('h2.isActive', db.raw('true'));
      })
      .leftJoin('mktDataAccessPolicy as dap', 'dap.departmentId', 'd.id')
      .where('d.id', id)
      .groupBy('d.id', 'wm.id')
      .first();
  }
  
  // Efficient department search with filters
  async searchDepartments(filters: DepartmentFilters): Promise<MktDepartmentWorkspaceEntity[]> {
    let query = db('mktDepartment')
      .where('isActive', true);
    
    if (filters.searchTerm) {
      query = query.where(function() {
        this.where('departmentName', 'ilike', `%${filters.searchTerm}%`)
            .orWhere('departmentCode', 'ilike', `%${filters.searchTerm}%`)
            .orWhere('description', 'ilike', `%${filters.searchTerm}%`);
      });
    }
    
    if (filters.requiresKpiTracking !== undefined) {
      query = query.where('requiresKpiTracking', filters.requiresKpiTracking);
    }
    
    if (filters.allowsCrossDepartmentAccess !== undefined) {
      query = query.where('allowsCrossDepartmentAccess', filters.allowsCrossDepartmentAccess);
    }
    
    return await query.orderBy('displayOrder');
  }
}
```

---

## Monitoring và Analytics

### 1. Department Metrics

```typescript
class DepartmentAnalytics {
  
  async getDepartmentMetrics(departmentId: string): Promise<DepartmentMetrics> {
    const [basicMetrics, hierarchyMetrics, activityMetrics] = await Promise.all([
      this.getBasicMetrics(departmentId),
      this.getHierarchyMetrics(departmentId), 
      this.getActivityMetrics(departmentId)
    ]);
    
    return {
      ...basicMetrics,
      ...hierarchyMetrics,
      ...activityMetrics,
      calculatedAt: new Date()
    };
  }
  
  private async getBasicMetrics(departmentId: string) {
    const result = await db('mktDepartment as d')
      .select([
        db.raw('count(wm.id) as member_count'),
        db.raw('count(dap.id) as policy_count'),
        db.raw('avg(case when wm.isActive then 1 else 0 end) as active_member_ratio')
      ])
      .leftJoin('workspaceMember as wm', 'wm.departmentId', 'd.id')
      .leftJoin('mktDataAccessPolicy as dap', 'dap.departmentId', 'd.id')
      .where('d.id', departmentId)
      .first();
    
    return result;
  }
  
  private async getHierarchyMetrics(departmentId: string) {
    return await db('mktDepartmentHierarchy')
      .select([
        db.raw('count(case when parent_department_id = ? then 1 end) as children_count', [departmentId]),
        db.raw('count(case when child_department_id = ? then 1 end) as parents_count', [departmentId]),
        db.raw('max(hierarchy_level) as max_depth')
      ])
      .where('isActive', true)
      .andWhere(function() {
        this.where('parentDepartmentId', departmentId)
            .orWhere('childDepartmentId', departmentId);
      })
      .first();
  }
}
```

### 2. Health Checks

```typescript
class DepartmentHealthCheck {
  
  async runHealthChecks(): Promise<HealthCheckResult[]> {
    const checks = [
      this.checkOrphanedDepartments(),
      this.checkCircularHierarchies(),
      this.checkInactiveWithActiveMembers(),
      this.checkMissingPermissions(),
      this.checkDataConsistency()
    ];
    
    const results = await Promise.allSettled(checks);
    
    return results.map((result, index) => ({
      checkName: this.checkNames[index],
      status: result.status === 'fulfilled' ? 'passed' : 'failed',
      details: result.status === 'fulfilled' ? result.value : result.reason,
      timestamp: new Date()
    }));
  }
  
  private async checkOrphanedDepartments() {
    const orphaned = await db('mktDepartment as d')
      .select('d.*')
      .leftJoin('mktDepartmentHierarchy as h', function() {
        this.on('h.childDepartmentId', 'd.id')
            .orOn('h.parentDepartmentId', 'd.id');
      })
      .whereNull('h.id')
      .andWhere('d.isActive', true);
    
    return {
      healthy: orphaned.length === 0,
      message: `Found ${orphaned.length} orphaned departments`,
      data: orphaned
    };
  }
  
  private async checkInactiveWithActiveMembers() {
    const inconsistent = await db('mktDepartment as d')
      .select(['d.id', 'd.departmentName'])
      .join('workspaceMember as wm', 'wm.departmentId', 'd.id')
      .where('d.isActive', false)
      .andWhere('wm.isActive', true)
      .groupBy('d.id', 'd.departmentName');
    
    return {
      healthy: inconsistent.length === 0,
      message: `Found ${inconsistent.length} inactive departments with active members`,
      data: inconsistent
    };
  }
}
```

---

## Best Practices

### 1. Department Design

1. **Unique Codes**: Luôn sử dụng departmentCode unique và meaningful
2. **Clear Naming**: departmentName phải clear và consistent
3. **Proper Hierarchy**: Thiết kế hierarchy logic, tránh circular references
4. **Permission Design**: Theo nguyên tắc least privilege
5. **Documentation**: Luôn có description rõ ràng cho department

### 2. Performance

1. **Index Properly**: Index các fields thường query (departmentCode, isActive)
2. **Cache Smart**: Cache department info và hierarchy data
3. **Batch Operations**: Batch updates khi có thể
4. **Lazy Loading**: Lazy load relations khi không cần thiết

### 3. Security

1. **Data Access Policies**: Setup proper data access policies
2. **Cross-Department Access**: Cẩn thận với allowsCrossDepartmentAccess
3. **Audit Trail**: Log tất cả department changes
4. **Regular Review**: Định kỳ review department structure

### 4. Maintenance

1. **Regular Health Checks**: Run health checks định kỳ
2. **Data Cleanup**: Clean up inactive departments
3. **Performance Monitoring**: Monitor query performance
4. **User Training**: Train users về proper department management

---

## Troubleshooting

### Common Issues và Solutions

1. **Orphaned Departments**:
   ```sql
   -- Find departments without hierarchy relationships
   SELECT d.* FROM mkt_department d
   LEFT JOIN mkt_department_hierarchy h ON (h.parent_department_id = d.id OR h.child_department_id = d.id)
   WHERE h.id IS NULL AND d.is_active = true;
   ```

2. **Permission Issues**:
   ```typescript
   // Debug permission calculation for department
   const permissions = await debugDepartmentPermissions(departmentId);
   console.log('Effective permissions:', permissions);
   ```

3. **Performance Issues**:
   ```sql
   -- Analyze slow department queries
   EXPLAIN ANALYZE SELECT * FROM mkt_department 
   WHERE department_code = 'MKT-001' AND is_active = true;
   ```

4. **Data Inconsistency**:
   ```typescript
   // Validate department data consistency
   const issues = await validateDepartmentData();
   if (issues.length > 0) {
     await fixDataInconsistencies(issues);
   }
   ```

---

## Kết luận

`MktDepartmentWorkspaceEntity` là foundation entity cho toàn bộ hệ thống quản lý tổ chức trong Twenty.com CRM. Entity này được thiết kế với:

- ✅ **Comprehensive Information Management**: Quản lý đầy đủ thông tin từ cơ bản đến nâng cao
- ✅ **Flexible Configuration**: Hỗ trợ many loại department và organizational structures
- ✅ **RBAC Integration**: Tích hợp sâu với permission system
- ✅ **UI/UX Support**: Đầy đủ fields cho customizable user interface  
- ✅ **Performance Optimized**: Thiết kế để support large-scale organizations
- ✅ **Audit Ready**: Full audit trail và compliance support

Entity này là core foundation để xây dựng sophisticated organizational management system trong enterprise CRM environment.

```graphql
fragment DepartmentNode on DepartmentTreeNode {
    id
    departmentCode
    departmentName
    level
    relationshipType
    hierarchyId
}
fragment DepartmentTree7Levels on DepartmentTreeNode {
    ...DepartmentNode
    children {
        ...DepartmentNode
        children {
            ...DepartmentNode
            children {
                ...DepartmentNode
                children {
                    ...DepartmentNode
                    children {
                        ...DepartmentNode
                        children {
                            ...DepartmentNode
                            children {
                                ...DepartmentNode
                            }
                        }
                    }
                }
            }
        }
    }
}
query GetDepartmentHierarchyTree {
    getDepartmentHierarchyTree(
        rootDepartmentId: "1d2e3f4a-5b6c-7d8e-9f0a-1b2c3d4e5f6a"
    ) {
        ...DepartmentTree7Levels
    }
}

```