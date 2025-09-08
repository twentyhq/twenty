# Department CRUD Operations

## 1. CREATE - Tạo phòng ban mới

### GraphQL Mutation

```graphql
mutation CreateDepartment($input: CreateDepartmentInput!) {
  createDepartment(input: $input) {
    id
    departmentCode
    departmentName
    departmentNameEn
    description
    budgetCode
    costCenter
    requiresKpiTracking
    allowsCrossDepartmentAccess
    defaultKpiCategory
    displayOrder
    colorCode
    iconName
    isActive
    position
    createdAt
    updatedAt
    createdBy {
      workspaceMemberId
      name
    }
  }
}
```

### Input Variables

```json
{
  "input": {
    "departmentCode": "SALES",
    "departmentName": "Phòng Kinh Doanh",
    "departmentNameEn": "Sales Department",
    "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh và bán hàng",
    "budgetCode": "BUD-SALES-2024",
    "costCenter": "CC-001",
    "requiresKpiTracking": true,
    "allowsCrossDepartmentAccess": false,
    "defaultKpiCategory": "SALES_PERFORMANCE",
    "displayOrder": 1,
    "colorCode": "#3B82F6",
    "iconName": "IconChart",
    "isActive": true
  }
}
```

### Success Response

```json
{
  "data": {
    "createDepartment": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "departmentCode": "SALES",
      "departmentName": "Phòng Kinh Doanh",
      "departmentNameEn": "Sales Department",
      "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh và bán hàng",
      "budgetCode": "BUD-SALES-2024",
      "costCenter": "CC-001",
      "requiresKpiTracking": true,
      "allowsCrossDepartmentAccess": false,
      "defaultKpiCategory": "SALES_PERFORMANCE",
      "displayOrder": 1,
      "colorCode": "#3B82F6",
      "iconName": "IconChart",
      "isActive": true,
      "position": 1.0,
      "createdAt": "2024-09-04T10:30:00Z",
      "updatedAt": "2024-09-04T10:30:00Z",
      "createdBy": {
        "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Nguyễn Văn Admin"
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
      "message": "Department with code 'SALES' already exists",
      "extensions": {
        "code": "DUPLICATE_DEPARTMENT_CODE",
        "field": "departmentCode"
      }
    }
  ]
}
```

## 2. READ - Đọc dữ liệu phòng ban

### 2.1 Lấy danh sách phòng ban

```graphql
query GetDepartments($filter: DepartmentFilterInput, $orderBy: [DepartmentOrderByInput!], $first: Int, $after: String) {
  departments(filter: $filter, orderBy: $orderBy, first: $first, after: $after) {
    edges {
      node {
        id
        departmentCode
        departmentName
        departmentNameEn
        description
        budgetCode
        costCenter
        requiresKpiTracking
        allowsCrossDepartmentAccess
        defaultKpiCategory
        displayOrder
        colorCode
        iconName
        isActive
        position
        createdAt
        updatedAt
        createdBy {
          workspaceMemberId
          name
        }
        people {
          totalCount
        }
        childHierarchies {
          totalCount
        }
        parentHierarchies {
          totalCount
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
        "departmentName": {
          "ilike": "%kinh doanh%"
        }
      }
    ]
  },
  "orderBy": [
    {
      "displayOrder": "ASC"
    },
    {
      "departmentName": "ASC"
    }
  ],
  "first": 10
}
```

### 2.2 Lấy thông tin một phòng ban cụ thể

```graphql
query GetDepartment($id: UUID!) {
  department(id: $id) {
    id
    departmentCode
    departmentName
    departmentNameEn
    description
    budgetCode
    costCenter
    requiresKpiTracking
    allowsCrossDepartmentAccess
    defaultKpiCategory
    displayOrder
    colorCode
    iconName
    isActive
    position
    createdAt
    updatedAt
    createdBy {
      workspaceMemberId
      name
    }
    people {
      edges {
        node {
          id
          name {
            firstName
            lastName
          }
          email
        }
      }
    }
    childHierarchies {
      edges {
        node {
          id
          hierarchyType
          childDepartment {
            id
            departmentName
          }
        }
      }
    }
    parentHierarchies {
      edges {
        node {
          id
          hierarchyType
          parentDepartment {
            id
            departmentName
          }
        }
      }
    }
    dataAccessPolicies {
      edges {
        node {
          id
          policyName
          accessLevel
        }
      }
    }
  }
}
```

## 3. UPDATE - Cập nhật phòng ban

### GraphQL Mutation

```graphql
mutation UpdateDepartment($id: UUID!, $input: UpdateDepartmentInput!) {
  updateDepartment(id: $id, input: $input) {
    id
    departmentCode
    departmentName
    departmentNameEn
    description
    budgetCode
    costCenter
    requiresKpiTracking
    allowsCrossDepartmentAccess
    defaultKpiCategory
    displayOrder
    colorCode
    iconName
    isActive
    position
    updatedAt
  }
}
```

### Input Variables

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "input": {
    "departmentName": "Phòng Kinh Doanh & Marketing",
    "departmentNameEn": "Sales & Marketing Department",
    "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh, bán hàng và marketing",
    "budgetCode": "BUD-SAL-MKT-2024",
    "requiresKpiTracking": true,
    "allowsCrossDepartmentAccess": true,
    "defaultKpiCategory": "SALES_MARKETING_PERFORMANCE",
    "colorCode": "#10B981",
    "iconName": "IconChartBar"
  }
}
```

### Success Response

```json
{
  "data": {
    "updateDepartment": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "departmentCode": "SALES",
      "departmentName": "Phòng Kinh Doanh & Marketing",
      "departmentNameEn": "Sales & Marketing Department",
      "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh, bán hàng và marketing",
      "budgetCode": "BUD-SAL-MKT-2024",
      "costCenter": "CC-001",
      "requiresKpiTracking": true,
      "allowsCrossDepartmentAccess": true,
      "defaultKpiCategory": "SALES_MARKETING_PERFORMANCE",
      "displayOrder": 1,
      "colorCode": "#10B981",
      "iconName": "IconChartBar",
      "isActive": true,
      "position": 1.0,
      "updatedAt": "2024-09-04T15:45:00Z"
    }
  }
}
```

## 4. DELETE - Xóa phòng ban

### GraphQL Mutation

```graphql
mutation DeleteDepartment($id: UUID!) {
  deleteDepartment(id: $id) {
    success
    message
  }
}
```

### Input Variables

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001"
}
```

### Success Response

```json
{
  "data": {
    "deleteDepartment": {
      "success": true,
      "message": "Department deleted successfully"
    }
  }
}
```

### Error Response

```json
{
  "errors": [
    {
      "message": "Cannot delete department with existing employees",
      "extensions": {
        "code": "DEPARTMENT_HAS_EMPLOYEES",
        "employeeCount": 15
      }
    }
  ]
}
```

## 5. BULK Operations - Thao tác hàng loạt

### 5.1 Bulk Create

```graphql
mutation BulkCreateDepartments($input: [CreateDepartmentInput!]!) {
  bulkCreateDepartments(input: $input) {
    success
    created
    failed
    results {
      id
      departmentCode
      departmentName
      error
    }
  }
}
```

### 5.2 Bulk Update

```graphql
mutation BulkUpdateDepartments($input: [BulkUpdateDepartmentInput!]!) {
  bulkUpdateDepartments(input: $input) {
    success
    updated
    failed
    results {
      id
      departmentCode
      departmentName
      error
    }
  }
}
```

### 5.3 Bulk Delete

```graphql
mutation BulkDeleteDepartments($ids: [UUID!]!) {
  bulkDeleteDepartments(ids: $ids) {
    success
    deleted
    failed
    results {
      id
      departmentCode
      deleted
      error
    }
  }
}
```

## 6. Advanced Queries

### 6.1 Departments with Statistics

```graphql
query DepartmentsWithStats {
  departments {
    edges {
      node {
        id
        departmentCode
        departmentName
        people {
          totalCount
        }
        activeEmployeesCount: people(filter: { isActive: { eq: true } }) {
          totalCount
        }
        childHierarchies {
          totalCount
        }
        parentHierarchies {
          totalCount
        }
      }
    }
  }
}
```

### 6.2 Department Hierarchy Tree

```graphql
query DepartmentHierarchyTree($rootDepartmentId: UUID) {
  departmentHierarchy(rootId: $rootDepartmentId) {
    id
    departmentCode
    departmentName
    level
    children {
      id
      departmentCode
      departmentName
      level
      hierarchyType
      children {
        id
        departmentCode
        departmentName
        level
      }
    }
  }
}
```