# Department Hierarchy CRUD Operations

## 1. CREATE - Tạo mối quan hệ phân cấp mới

### GraphQL Mutation

```graphql
mutation CreateDepartmentHierarchy($input: CreateDepartmentHierarchyInput!) {
  createDepartmentHierarchy(input: $input) {
    id
    hierarchyLevel
    relationshipType
    validFrom
    validTo
    inheritsPermissions
    canEscalateToParent
    allowsCrossBranchAccess
    displayOrder
    notes
    isActive
    position
    hierarchyPath
    inheritsParentPermissions
    canViewTeamData
    canEditTeamData
    canExportTeamData
    createdAt
    updatedAt
    createdBy {
      workspaceMemberId
      name
    }
    parentDepartment {
      id
      departmentCode
      departmentName
    }
    childDepartment {
      id
      departmentCode
      departmentName
    }
  }
}
```

### Input Variables

```json
{
  "input": {
    "parentDepartmentId": "550e8400-e29b-41d4-a716-446655440001",
    "childDepartmentId": "550e8400-e29b-41d4-a716-446655440002",
    "hierarchyLevel": 1,
    "relationshipType": "PARENT_CHILD",
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": null,
    "inheritsPermissions": true,
    "canEscalateToParent": true,
    "allowsCrossBranchAccess": false,
    "displayOrder": 1,
    "notes": "Standard parent-child relationship",
    "isActive": true,
    "inheritsParentPermissions": true,
    "canViewTeamData": true,
    "canEditTeamData": false,
    "canExportTeamData": false
  }
}
```

### Success Response

```json
{
  "data": {
    "createDepartmentHierarchy": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "hierarchyLevel": 1,
      "relationshipType": "PARENT_CHILD",
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": null,
      "inheritsPermissions": true,
      "canEscalateToParent": true,
      "allowsCrossBranchAccess": false,
      "displayOrder": 1,
      "notes": "Standard parent-child relationship",
      "isActive": true,
      "position": 1.0,
      "hierarchyPath": ["550e8400-e29b-41d4-a716-446655440001"],
      "inheritsParentPermissions": true,
      "canViewTeamData": true,
      "canEditTeamData": false,
      "canExportTeamData": false,
      "createdAt": "2024-09-04T10:30:00Z",
      "updatedAt": "2024-09-04T10:30:00Z",
      "createdBy": {
        "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Nguyễn Văn Admin"
      },
      "parentDepartment": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "departmentCode": "SALES",
        "departmentName": "Phòng Kinh Doanh"
      },
      "childDepartment": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "departmentCode": "SALES_NORTH",
        "departmentName": "Kinh Doanh Miền Bắc"
      }
    }
  }
}
```

### Error Responses

```json
{
  "errors": [
    {
      "message": "Circular dependency detected in department hierarchy",
      "extensions": {
        "code": "CIRCULAR_HIERARCHY",
        "field": "parentDepartmentId",
        "path": ["SALES", "SALES_NORTH", "SALES"]
      }
    }
  ]
}
```

## 2. READ - Đọc dữ liệu mối quan hệ phân cấp

### 2.1 Lấy danh sách mối quan hệ phân cấp

```graphql
query GetDepartmentHierarchies($filter: DepartmentHierarchyFilterInput, $orderBy: [DepartmentHierarchyOrderByInput!], $first: Int, $after: String) {
  departmentHierarchies(filter: $filter, orderBy: $orderBy, first: $first, after: $after) {
    edges {
      node {
        id
        hierarchyLevel
        relationshipType
        validFrom
        validTo
        inheritsPermissions
        canEscalateToParent
        allowsCrossBranchAccess
        displayOrder
        notes
        isActive
        position
        hierarchyPath
        inheritsParentPermissions
        canViewTeamData
        canEditTeamData
        canExportTeamData
        createdAt
        updatedAt
        parentDepartment {
          id
          departmentCode
          departmentName
        }
        childDepartment {
          id
          departmentCode
          departmentName
        }
      }
    }
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    totalCount
  }
}
```

### Filter Variables

```json
{
  "filter": {
    "and": [
      {
        "isActive": {
          "eq": true
        }
      },
      {
        "relationshipType": {
          "eq": "PARENT_CHILD"
        }
      },
      {
        "hierarchyLevel": {
          "lte": 2
        }
      },
      {
        "validFrom": {
          "lte": "2024-09-04T00:00:00Z"
        }
      },
      {
        "or": [
          {
            "validTo": {
              "gte": "2024-09-04T00:00:00Z"
            }
          },
          {
            "validTo": {
              "is": null
            }
          }
        ]
      }
    ]
  },
  "orderBy": [
    {
      "hierarchyLevel": "ASC"
    },
    {
      "displayOrder": "ASC"
    }
  ],
  "first": 20
}
```

### 2.2 Lấy thông tin một mối quan hệ cụ thể

```graphql
query GetDepartmentHierarchy($id: UUID!) {
  departmentHierarchy(id: $id) {
    id
    hierarchyLevel
    relationshipType
    validFrom
    validTo
    inheritsPermissions
    canEscalateToParent
    allowsCrossBranchAccess
    displayOrder
    notes
    isActive
    position
    hierarchyPath
    inheritsParentPermissions
    canViewTeamData
    canEditTeamData
    canExportTeamData
    createdAt
    updatedAt
    createdBy {
      workspaceMemberId
      name
    }
    parentDepartment {
      id
      departmentCode
      departmentName
      departmentNameEn
      description
      people {
        totalCount
      }
    }
    childDepartment {
      id
      departmentCode
      departmentName
      departmentNameEn
      description
      people {
        totalCount
      }
    }
  }
}
```

### 2.3 Lấy cây phân cấp từ một phòng ban

```graphql
query GetDepartmentHierarchyTree($rootDepartmentId: UUID!, $maxLevel: Int = 10) {
  departmentHierarchyTree(rootDepartmentId: $rootDepartmentId, maxLevel: $maxLevel) {
    id
    departmentCode
    departmentName
    level
    children {
      id
      departmentCode
      departmentName
      level
      relationshipType
      hierarchyId
      children {
        id
        departmentCode
        departmentName
        level
        relationshipType
        hierarchyId
      }
    }
  }
}
```

## 3. UPDATE - Cập nhật mối quan hệ phân cấp

### GraphQL Mutation

```graphql
mutation UpdateDepartmentHierarchy($id: UUID!, $input: UpdateDepartmentHierarchyInput!) {
  updateDepartmentHierarchy(id: $id, input: $input) {
    id
    hierarchyLevel
    relationshipType
    validFrom
    validTo
    inheritsPermissions
    canEscalateToParent
    allowsCrossBranchAccess
    displayOrder
    notes
    isActive
    position
    hierarchyPath
    inheritsParentPermissions
    canViewTeamData
    canEditTeamData
    canExportTeamData
    updatedAt
    parentDepartment {
      id
      departmentCode
      departmentName
    }
    childDepartment {
      id
      departmentCode
      departmentName
    }
  }
}
```

### Input Variables

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "input": {
    "relationshipType": "MATRIX",
    "validTo": "2024-12-31T23:59:59Z",
    "inheritsPermissions": false,
    "canEscalateToParent": false,
    "allowsCrossBranchAccess": true,
    "notes": "Temporary matrix relationship for Q4 project",
    "canViewTeamData": true,
    "canEditTeamData": true,
    "canExportTeamData": false
  }
}
```

### Success Response

```json
{
  "data": {
    "updateDepartmentHierarchy": {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "hierarchyLevel": 1,
      "relationshipType": "MATRIX",
      "validFrom": "2024-01-01T00:00:00Z",
      "validTo": "2024-12-31T23:59:59Z",
      "inheritsPermissions": false,
      "canEscalateToParent": false,
      "allowsCrossBranchAccess": true,
      "displayOrder": 1,
      "notes": "Temporary matrix relationship for Q4 project",
      "isActive": true,
      "position": 1.0,
      "hierarchyPath": ["550e8400-e29b-41d4-a716-446655440001"],
      "inheritsParentPermissions": true,
      "canViewTeamData": true,
      "canEditTeamData": true,
      "canExportTeamData": false,
      "updatedAt": "2024-09-04T15:45:00Z",
      "parentDepartment": {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "departmentCode": "SALES",
        "departmentName": "Phòng Kinh Doanh"
      },
      "childDepartment": {
        "id": "550e8400-e29b-41d4-a716-446655440002",
        "departmentCode": "SALES_NORTH",
        "departmentName": "Kinh Doanh Miền Bắc"
      }
    }
  }
}
```

## 4. DELETE - Xóa mối quan hệ phân cấp

### GraphQL Mutation

```graphql
mutation DeleteDepartmentHierarchy($id: UUID!) {
  deleteDepartmentHierarchy(id: $id) {
    success
    message
    affectedHierarchies
  }
}
```

### Input Variables

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003"
}
```

### Success Response

```json
{
  "data": {
    "deleteDepartmentHierarchy": {
      "success": true,
      "message": "Department hierarchy deleted successfully",
      "affectedHierarchies": 5
    }
  }
}
```

### Error Response

```json
{
  "errors": [
    {
      "message": "Cannot delete hierarchy: child departments would become orphaned",
      "extensions": {
        "code": "ORPHANED_DEPARTMENTS",
        "affectedDepartments": [
          "550e8400-e29b-41d4-a716-446655440004",
          "550e8400-e29b-41d4-a716-446655440005"
        ]
      }
    }
  ]
}
```

## 5. BULK Operations - Thao tác hàng loạt

### 5.1 Bulk Create Hierarchies

```graphql
mutation BulkCreateDepartmentHierarchies($input: [CreateDepartmentHierarchyInput!]!) {
  bulkCreateDepartmentHierarchies(input: $input) {
    success
    created
    failed
    results {
      id
      parentDepartmentId
      childDepartmentId
      relationshipType
      error
    }
  }
}
```

### 5.2 Rebuild Hierarchy Paths

```graphql
mutation RebuildHierarchyPaths($rootDepartmentId: UUID) {
  rebuildHierarchyPaths(rootDepartmentId: $rootDepartmentId) {
    success
    rebuilt
    message
  }
}
```

## 6. Advanced Queries

### 6.1 Get All Ancestors of a Department

```graphql
query GetDepartmentAncestors($departmentId: UUID!) {
  departmentAncestors(departmentId: $departmentId) {
    id
    departmentCode
    departmentName
    level
    relationshipType
    hierarchyId
    distance
  }
}
```

### 6.2 Get All Descendants of a Department

```graphql
query GetDepartmentDescendants($departmentId: UUID!, $maxDepth: Int = 5) {
  departmentDescendants(departmentId: $departmentId, maxDepth: $maxDepth) {
    id
    departmentCode
    departmentName
    level
    relationshipType
    hierarchyId
    distance
    path
  }
}
```

### 6.3 Get Hierarchy Statistics

```graphql
query GetHierarchyStatistics {
  hierarchyStatistics {
    totalHierarchies
    byRelationshipType {
      type
      count
      percentage
    }
    maxDepth
    averageDepth
    orphanedDepartments
    circularReferences
  }
}
```

### 6.4 Get Expired Hierarchies

```graphql
query GetExpiredHierarchies($asOfDate: DateTime!) {
  departmentHierarchies(filter: {
    and: [
      { validTo: { lt: $asOfDate } },
      { isActive: { eq: true } }
    ]
  }) {
    edges {
      node {
        id
        relationshipType
        validFrom
        validTo
        parentDepartment {
          departmentCode
          departmentName
        }
        childDepartment {
          departmentCode
          departmentName
        }
      }
    }
  }
}
```