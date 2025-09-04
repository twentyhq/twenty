# MktDepartmentHierarchyWorkspaceEntity - Thiết kế Phân cấp Phòng ban

## Tổng quan

`MktDepartmentHierarchyWorkspaceEntity` là entity quản lý các mối quan hệ phân cấp giữa các phòng ban trong hệ thống Twenty.com. Entity này được thiết kế để hỗ trợ nhiều loại cấu trúc tổ chức phức tạp, từ hierarchy truyền thống đến matrix organization hiện đại.

## Kiến trúc và Thiết kế

### Nguyên tắc thiết kế

1. **Flexibility First**: Hỗ trợ nhiều loại quan hệ tổ chức khác nhau
2. **Time-aware**: Theo dõi thời gian hiệu lực của các mối quan hệ
3. **Permission-driven**: Tích hợp sâu với hệ thống RBAC
4. **Audit-friendly**: Lưu trữ đầy đủ thông tin để audit và trace

### Cấu trúc Entity

```typescript
@WorkspaceEntity({
  standardId: MKT_OBJECT_IDS.mktDepartmentHierarchy,
  namePlural: 'mktDepartmentHierarchies',
  labelSingular: 'Department Hierarchy',
  labelPlural: 'Department Hierarchies',
  description: 'Hierarchical relationships between departments in the marketing system.',
  icon: 'IconHierarchy',
})
```

---

## Chi tiết các Field

### 1. Thông tin Cơ bản về Phân cấp

#### `hierarchyLevel: number`
- **Mục đích**: Xác định cấp độ trong cây phân cấp tổ chức
- **Quy ước**: 
  - `0`: Cấp cao nhất (Root - CEO, Tổng giám đốc)
  - `1`: Cấp trực tiếp dưới root (Giám đốc các khối)
  - `2`: Cấp trưởng phòng/ban
  - `3+`: Các cấp nhân viên
- **Ví dụ**:
  ```
  CEO (0)
  ├── Giám đốc Marketing (1)
  │   ├── Trưởng phòng Digital Marketing (2)
  │   │   ├── SEO Specialist (3)
  │   │   └── SEM Specialist (3)
  │   └── Trưởng phòng Traditional Marketing (2)
  └── Giám đốc Sales (1)
      └── Trưởng phòng Inside Sales (2)
  ```

#### `relationshipType: string`
- **Mục đích**: Định nghĩa loại mối quan hệ phân cấp
- **Các giá trị**:

**PARENT_CHILD** (Cha-Con truyền thống)
- Quan hệ báo cáo trực tiếp
- Manager có toàn quyền quản lý nhân viên
- Phù hợp với cấu trúc tổ chức pyramid truyền thống

**MATRIX** (Ma trận)
- Nhân viên báo cáo cho nhiều manager
- Phù hợp với các dự án cross-functional
- Manager có quyền hạn chia sẻ

**FUNCTIONAL** (Chức năng)
- Quan hệ theo chuyên môn/kỹ năng
- Manager là mentor/technical lead
- Không có quyền administrative

**TEMPORARY** (Tạm thời)
- Quan hệ trong thời gian giới hạn
- Thường dùng cho dự án, thay thế tạm thời
- Tự động hết hiệu lực khi đến `validTo`

### 2. Quản lý Thời gian

#### `validFrom?: Date` & `validTo?: Date`
- **Mục đích**: Quản lý thời gian hiệu lực của mối quan hệ phân cấp
- **Use cases**:
  - **Restructuring**: Thay đổi cấu trúc tổ chức theo kế hoạch
  - **Temporary assignments**: Giao nhiệm vụ tạm thời
  - **Project-based reporting**: Báo cáo theo dự án có thời hạn
  - **Leave coverage**: Thay thế khi nghỉ phép

- **Ví dụ**:
  ```json
  {
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": "2024-03-31T23:59:59Z",
    "relationshipType": "TEMPORARY",
    "notes": "Tạm thời báo cáo cho PMO trong Q1 để launch sản phẩm mới"
  }
  ```

### 3. Hệ thống Permission và Kế thừa

#### `inheritsPermissions?: boolean`
- **Mục đích**: Xác định phòng ban con có kế thừa permissions từ phòng ban cha không
- **Logic**:
  - `true`: Con có tất cả permissions của cha + permissions riêng của con
  - `false`: Con chỉ có permissions được gán trực tiếp
- **Ví dụ**:
  - Marketing Director có quyền `VIEW_ALL_CAMPAIGNS`
  - Digital Marketing (con) với `inheritsPermissions: true` → cũng có `VIEW_ALL_CAMPAIGNS`
  - SEO Team (cháu) với `inheritsPermissions: true` → cũng có `VIEW_ALL_CAMPAIGNS`

#### `inheritsParentPermissions?: boolean`
- **Note**: Field này tương tự `inheritsPermissions`, có thể cân nhắc consolidate
- **Recommended**: Sử dụng một field duy nhất để tránh confusion

#### `canEscalateToParent?: boolean`
- **Mục đích**: Cho phép escalate issues/requests lên cấp cha
- **Use cases**:
  - Escalate bugs không thể resolve ở cấp hiện tại
  - Request approval từ cấp cao hơn
  - Chuyển giao công việc khi vượt thẩm quyền

- **Ví dụ workflow**:
  ```
  SEO Specialist gặp issue → Escalate to Digital Marketing Manager
  Digital Marketing Manager không resolve được → Escalate to Marketing Director
  ```

#### `allowsCrossBranchAccess?: boolean`
- **Mục đích**: Cho phép truy cập dữ liệu của các nhánh anh em (sibling branches)
- **Use cases**:
  - Cross-team collaboration
  - Shared resources between departments
  - Matrix organization support

- **Ví dụ**:
  ```
  Digital Marketing ←→ Traditional Marketing (cùng cấp)
  Nếu allowsCrossBranchAccess = true → có thể share campaigns, audiences
  ```

### 4. Quyền Truy cập Dữ liệu Team

#### `canViewTeamData?: boolean`
- **Mục đích**: Manager có thể xem dữ liệu của tất cả team con
- **Phạm vi**: Read-only access
- **Ví dụ**:
  - Marketing Director có thể xem performance của tất cả team marketing con
  - Báo cáo tổng hợp từ nhiều team

#### `canEditTeamData?: boolean`  
- **Mục đích**: Manager có thể sửa đổi dữ liệu của team con
- **Phạm vi**: Write access với proper audit
- **Use cases**:
  - Điều chỉnh targets/goals
  - Correcting data errors
  - Emergency interventions

#### `canExportTeamData?: boolean`
- **Mục đích**: Manager có thể export dữ liệu team con
- **Security**: Kiểm soát data leakage
- **Compliance**: Meet data protection requirements

### 5. Quản lý Hiển thị và Navigation

#### `displayOrder?: number`
- **Mục đích**: Thứ tự hiển thị trong org chart/hierarchy tree
- **Use cases**:
  - Sắp xếp theo importance
  - Alphabetical ordering
  - Custom business logic ordering

#### `hierarchyPath?: string[]`
- **Mục đích**: Array chứa đường dẫn từ root đến node hiện tại
- **Performance**: Tối ưu cho hierarchy traversal
- **Ví dụ**:
  ```json
  {
    "hierarchyPath": [
      "ceo-department-id",
      "marketing-director-id", 
      "digital-marketing-id",
      "seo-team-id"
    ]
  }
  ```

- **Applications**:
  - Breadcrumb navigation
  - Permission calculation
  - Reporting aggregation

### 6. Metadata và Quản lý

#### `notes?: string`
- **Mục đích**: Ghi chú về mối quan hệ phân cấp
- **Use cases**:
  - Giải thích lý do thay đổi
  - Special instructions
  - Temporary arrangements context

#### `isActive?: boolean`
- **Mục đích**: Soft disable relationship
- **Benefits**:
  - Preserve historical data
  - Easy rollback
  - Audit trail maintenance

#### `position?: number`
- **Mục đích**: Vị trí trong list (drag & drop support)
- **UI/UX**: Support interactive org chart editing

### 7. Relations (Quan hệ với Entities khác)

#### `parentDepartment` & `parentDepartmentId`
```typescript
@WorkspaceRelation({
  type: RelationType.MANY_TO_ONE,
  inverseSideTarget: () => MktDepartmentWorkspaceEntity,
  inverseSideFieldKey: 'childHierarchies',
})
parentDepartment: Relation<MktDepartmentWorkspaceEntity>;
```

#### `childDepartment` & `childDepartmentId`
```typescript
@WorkspaceRelation({
  type: RelationType.MANY_TO_ONE,  
  inverseSideTarget: () => MktDepartmentWorkspaceEntity,
  inverseSideFieldKey: 'parentHierarchies',
})
childDepartment: Relation<MktDepartmentWorkspaceEntity>;
```

**Thiết kế Many-to-One cho cả parent và child**:
- Mỗi hierarchy record định nghĩa MỘT mối quan hệ giữa 2 departments
- Một department có thể có NHIỀU records as parent (nhiều con)
- Một department có thể có NHIỀU records as child (nhiều cha - matrix org)

#### `createdBy: ActorMetadata`
- **Mục đích**: Audit trail - ai tạo mối quan hệ này
- **Compliance**: Meet audit requirements
- **Accountability**: Track organizational changes

---

## Patterns và Use Cases

### 1. Traditional Hierarchy (Phân cấp truyền thống)

```json
{
  "parentDepartment": "CEO Office",
  "childDepartment": "Marketing Department", 
  "hierarchyLevel": 1,
  "relationshipType": "PARENT_CHILD",
  "inheritsPermissions": true,
  "canViewTeamData": true,
  "canEditTeamData": true,
  "canExportTeamData": false,
  "allowsCrossBranchAccess": false,
  "isActive": true
}
```

### 2. Matrix Organization (Tổ chức ma trận)

```json
[
  {
    "parentDepartment": "Product Manager",
    "childDepartment": "Frontend Developer", 
    "relationshipType": "FUNCTIONAL",
    "canViewTeamData": true,
    "canEditTeamData": false,
    "notes": "Technical mentoring và code review"
  },
  {
    "parentDepartment": "Engineering Manager", 
    "childDepartment": "Frontend Developer",
    "relationshipType": "PARENT_CHILD", 
    "canViewTeamData": true,
    "canEditTeamData": true,
    "notes": "Administrative management và performance review"
  }
]
```

### 3. Temporary Project Assignment

```json
{
  "parentDepartment": "Project Management Office",
  "childDepartment": "Senior Developer",
  "relationshipType": "TEMPORARY", 
  "validFrom": "2024-01-01T00:00:00Z",
  "validTo": "2024-06-30T23:59:59Z",
  "canEscalateToParent": true,
  "notes": "Lead backend development cho dự án CRM upgrade"
}
```

### 4. Cross-Department Collaboration

```json
{
  "parentDepartment": "Marketing Department",
  "childDepartment": "Sales Engineering", 
  "relationshipType": "FUNCTIONAL",
  "allowsCrossBranchAccess": true,
  "canViewTeamData": true,
  "notes": "Collaboration cho technical sales support"
}
```

---

## Integration với RBAC System

### Permission Calculation Logic

```typescript
async function calculateEffectivePermissions(
  userId: string, 
  targetDepartmentId: string
): Promise<Permission[]> {
  
  // 1. Get user's primary department
  const userDept = await getUserDepartment(userId);
  
  // 2. Find hierarchy relationships
  const hierarchies = await getHierarchyPath(userDept.id, targetDepartmentId);
  
  // 3. Calculate permissions based on relationships
  let permissions: Permission[] = [];
  
  for (const hierarchy of hierarchies) {
    // Direct parent-child relationship
    if (hierarchy.relationshipType === 'PARENT_CHILD') {
      if (hierarchy.canViewTeamData) {
        permissions.push(PermissionAction.VIEW_DEPARTMENT_DATA);
      }
      if (hierarchy.canEditTeamData) {
        permissions.push(PermissionAction.EDIT_DEPARTMENT_DATA);
      }
    }
    
    // Cross-branch access
    if (hierarchy.allowsCrossBranchAccess) {
      permissions.push(PermissionAction.VIEW_CROSS_DEPARTMENT_DATA);
    }
    
    // Permission inheritance
    if (hierarchy.inheritsPermissions) {
      const inheritedPerms = await getParentPermissions(hierarchy.parentDepartmentId);
      permissions.push(...inheritedPerms);
    }
  }
  
  return deduplicatePermissions(permissions);
}
```

### Hierarchy Traversal

```typescript
async function getHierarchyPath(
  fromDeptId: string, 
  toDeptId: string
): Promise<MktDepartmentHierarchyWorkspaceEntity[]> {
  
  // Use hierarchyPath field for efficient traversal
  const hierarchyRecords = await db('mktDepartmentHierarchy')
    .where('isActive', true)
    .where('childDepartmentId', toDeptId)
    .where(raw('? = ANY(hierarchy_path)', [fromDeptId]));
    
  return hierarchyRecords;
}
```

---

## Performance Considerations

### 1. Indexing Strategy

```sql
-- Hierarchy traversal optimization
CREATE INDEX idx_dept_hierarchy_path 
ON mkt_department_hierarchy USING gin(hierarchy_path);

-- Active relationships lookup
CREATE INDEX idx_dept_hierarchy_active 
ON mkt_department_hierarchy(is_active, valid_from, valid_to) 
WHERE is_active = true;

-- Parent-child relationships
CREATE INDEX idx_dept_hierarchy_parent_child 
ON mkt_department_hierarchy(parent_department_id, child_department_id, is_active);
```

### 2. Caching Strategy

```typescript
class DepartmentHierarchyCache {
  // Cache hierarchy paths for frequent lookups
  private hierarchyPathCache = new Map<string, string[]>();
  
  // Cache permission calculations
  private permissionCache = new Map<string, Permission[]>();
  
  async getHierarchyPath(deptId: string): Promise<string[]> {
    if (this.hierarchyPathCache.has(deptId)) {
      return this.hierarchyPathCache.get(deptId)!;
    }
    
    const path = await this.calculateHierarchyPath(deptId);
    this.hierarchyPathCache.set(deptId, path);
    
    return path;
  }
}
```

### 3. Batch Operations

```typescript
async function updateHierarchyBatch(
  updates: HierarchyUpdate[]
): Promise<void> {
  
  await db.transaction(async (trx) => {
    // Update all hierarchy records
    for (const update of updates) {
      await trx('mktDepartmentHierarchy')
        .where('id', update.id)
        .update(update.data);
    }
    
    // Recalculate hierarchy paths for affected departments
    const affectedDepts = updates.flatMap(u => [u.parentId, u.childId]);
    await recalculateHierarchyPaths(affectedDepts, trx);
  });
}
```

---

## Migration và Maintenance

### 1. Data Migration Scripts

```typescript
async function migrateFromOldHierarchy(): Promise<void> {
  // Migrate from old manager_id fields to new hierarchy system
  const oldRelationships = await db('old_departments')
    .select('id', 'manager_id', 'level');
    
  for (const rel of oldRelationships) {
    if (rel.manager_id) {
      await db('mktDepartmentHierarchy').insert({
        parentDepartmentId: rel.manager_id,
        childDepartmentId: rel.id,
        hierarchyLevel: rel.level,
        relationshipType: 'PARENT_CHILD',
        inheritsPermissions: true,
        canViewTeamData: true,
        canEditTeamData: true,
        isActive: true
      });
    }
  }
}
```

### 2. Data Integrity Checks

```typescript
async function validateHierarchyIntegrity(): Promise<ValidationResult[]> {
  const issues: ValidationResult[] = [];
  
  // Check for circular references
  const circularRefs = await detectCircularReferences();
  issues.push(...circularRefs);
  
  // Validate hierarchy levels
  const levelIssues = await validateHierarchyLevels();
  issues.push(...levelIssues);
  
  // Check permission consistency
  const permissionIssues = await validatePermissionConsistency();
  issues.push(...permissionIssues);
  
  return issues;
}
```

---

## Best Practices

### 1. Thiết kế Hierarchy

1. **Keep It Simple**: Bắt đầu với PARENT_CHILD, thêm complexity khi cần
2. **Document Relationships**: Luôn có notes giải thích mối quan hệ đặc biệt
3. **Time Boundaries**: Sử dụng validFrom/validTo cho temporary relationships
4. **Permission Principle of Least Privilege**: Chỉ grant permissions cần thiết

### 2. Performance

1. **Batch Operations**: Group hierarchy updates trong transactions
2. **Cache Frequently Used Paths**: Cache hierarchy paths cho performance
3. **Index Strategically**: Index based on query patterns
4. **Monitor Query Performance**: Track slow hierarchy queries

### 3. Security

1. **Audit All Changes**: Log tất cả hierarchy modifications
2. **Validate Permissions**: Double-check permission calculations
3. **Regular Reviews**: Định kỳ review hierarchy structure
4. **Emergency Procedures**: Có plan cho emergency hierarchy changes

---

## Troubleshooting

### Common Issues

1. **Circular References**: 
   - Detect: Run integrity checks
   - Fix: Break cycles, redesign problematic relationships

2. **Permission Inheritance Problems**:
   - Debug: Trace permission calculation steps
   - Fix: Review inheritsPermissions settings

3. **Performance Issues**:
   - Monitor: Track hierarchy query performance
   - Optimize: Add indexes, implement caching

4. **Data Inconsistency**:
   - Validate: Run data integrity checks
   - Repair: Fix inconsistent hierarchy_path arrays

### Monitoring Queries

```sql
-- Find departments with no parent (potential roots)
SELECT d.* 
FROM mkt_department d
LEFT JOIN mkt_department_hierarchy h ON d.id = h.child_department_id
WHERE h.id IS NULL AND d.is_active = true;

-- Find circular references
WITH RECURSIVE hierarchy_check AS (
  SELECT parent_department_id, child_department_id, ARRAY[child_department_id] as path
  FROM mkt_department_hierarchy 
  WHERE is_active = true
  
  UNION ALL
  
  SELECT h.parent_department_id, h.child_department_id, 
         hc.path || h.child_department_id
  FROM mkt_department_hierarchy h
  JOIN hierarchy_check hc ON h.parent_department_id = hc.child_department_id
  WHERE h.child_department_id != ALL(hc.path)
)
SELECT * FROM hierarchy_check 
WHERE parent_department_id = ANY(path);
```

---

## Kết luận

`MktDepartmentHierarchyWorkspaceEntity` được thiết kế để hỗ trợ các cấu trúc tổ chức phức tạp với:

- ✅ **Flexibility**: Hỗ trợ nhiều loại relationship types
- ✅ **Scalability**: Efficient hierarchy traversal với hierarchyPath
- ✅ **Security**: Tích hợp sâu với RBAC system  
- ✅ **Maintainability**: Clear data model với proper audit trails
- ✅ **Time-awareness**: Support cho temporary và time-bound relationships

Entity này là foundation cho việc xây dựng system organizational management mạnh mẽ và linh hoạt trong Twenty.com CRM.