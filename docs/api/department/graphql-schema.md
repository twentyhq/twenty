# Department GraphQL Schema

## 1. Types Definition

### 1.1 Department Type

```graphql
type Department {
  # Core Fields
  id: UUID!
  departmentCode: String!
  departmentName: String!
  departmentNameEn: String
  description: String
  
  # Budget & Cost Management
  budgetCode: String
  costCenter: String
  
  # Configuration
  requiresKpiTracking: Boolean
  allowsCrossDepartmentAccess: Boolean
  defaultKpiCategory: String
  
  # Display & UI
  displayOrder: Int!
  colorCode: String
  iconName: String
  isActive: Boolean
  position: Float
  
  # Audit Fields
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: Actor!
  
  # Relations
  people: [WorkspaceMember!]! @relation(name: "DepartmentMembers")
  childHierarchies: [DepartmentHierarchy!]! @relation(name: "ParentDepartment")
  parentHierarchies: [DepartmentHierarchy!]! @relation(name: "ChildDepartment")
  dataAccessPolicies: [DataAccessPolicy!]! @relation(name: "DepartmentPolicies")
}
```

### 1.2 Input Types

#### CreateDepartmentInput

```graphql
input CreateDepartmentInput {
  departmentCode: String!
  departmentName: String!
  departmentNameEn: String
  description: String
  budgetCode: String
  costCenter: String
  requiresKpiTracking: Boolean = false
  allowsCrossDepartmentAccess: Boolean = false
  defaultKpiCategory: String
  displayOrder: Int!
  colorCode: String
  iconName: String
  isActive: Boolean = true
}
```

#### UpdateDepartmentInput

```graphql
input UpdateDepartmentInput {
  departmentName: String
  departmentNameEn: String
  description: String
  budgetCode: String
  costCenter: String
  requiresKpiTracking: Boolean
  allowsCrossDepartmentAccess: Boolean
  defaultKpiCategory: String
  displayOrder: Int
  colorCode: String
  iconName: String
  isActive: Boolean
  position: Float
}
```

#### DepartmentFilterInput

```graphql
input DepartmentFilterInput {
  and: [DepartmentFilterInput!]
  or: [DepartmentFilterInput!]
  not: DepartmentFilterInput
  
  # Field Filters
  id: UUIDFilterInput
  departmentCode: StringFilterInput
  departmentName: StringFilterInput
  departmentNameEn: StringFilterInput
  description: StringFilterInput
  budgetCode: StringFilterInput
  costCenter: StringFilterInput
  requiresKpiTracking: BooleanFilterInput
  allowsCrossDepartmentAccess: BooleanFilterInput
  defaultKpiCategory: StringFilterInput
  displayOrder: IntFilterInput
  colorCode: StringFilterInput
  iconName: StringFilterInput
  isActive: BooleanFilterInput
  position: FloatFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  
  # Relation Filters
  people: WorkspaceMemberFilterInput
  childHierarchies: DepartmentHierarchyFilterInput
  parentHierarchies: DepartmentHierarchyFilterInput
  dataAccessPolicies: DataAccessPolicyFilterInput
}
```

#### DepartmentOrderByInput

```graphql
input DepartmentOrderByInput {
  id: SortOrder
  departmentCode: SortOrder
  departmentName: SortOrder
  departmentNameEn: SortOrder
  description: SortOrder
  budgetCode: SortOrder
  costCenter: SortOrder
  requiresKpiTracking: SortOrder
  allowsCrossDepartmentAccess: SortOrder
  defaultKpiCategory: SortOrder
  displayOrder: SortOrder
  colorCode: SortOrder
  iconName: SortOrder
  isActive: SortOrder
  position: SortOrder
  createdAt: SortOrder
  updatedAt: SortOrder
}
```

### 1.3 Connection Types

```graphql
type DepartmentConnection {
  edges: [DepartmentEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type DepartmentEdge {
  node: Department!
  cursor: String!
}
```

### 1.4 Response Types

```graphql
type DepartmentMutationResponse {
  success: Boolean!
  message: String
  department: Department
}

type BulkDepartmentResponse {
  success: Boolean!
  created: Int!
  updated: Int!
  failed: Int!
  results: [DepartmentOperationResult!]!
}

type DepartmentOperationResult {
  id: UUID
  departmentCode: String!
  departmentName: String!
  success: Boolean!
  error: String
}
```

### 1.5 Statistics Types

```graphql
type DepartmentStatistics {
  totalDepartments: Int!
  activeDepartments: Int!
  inactiveDepartments: Int!
  departmentsWithKpiTracking: Int!
  departmentsWithCrossDepartmentAccess: Int!
  averageEmployeesPerDepartment: Float!
  departmentsByCategory: [DepartmentCategoryStats!]!
}

type DepartmentCategoryStats {
  category: String!
  count: Int!
  departments: [String!]!
}
```

## 2. Queries

### 2.1 Basic Queries

```graphql
type Query {
  # Single Department
  department(id: UUID!): Department
  departmentByCode(code: String!): Department
  
  # Department List with Filtering & Pagination
  departments(
    filter: DepartmentFilterInput
    orderBy: [DepartmentOrderByInput!]
    first: Int
    after: String
    last: Int
    before: String
  ): DepartmentConnection!
  
  # Search Departments
  searchDepartments(
    query: String!
    limit: Int = 10
  ): [Department!]!
  
  # Department Statistics
  departmentStatistics: DepartmentStatistics!
  
  # Department Hierarchy
  departmentHierarchy(
    rootId: UUID
    maxDepth: Int = 5
  ): [DepartmentNode!]!
  
  # Departments by User Access
  myDepartments: [Department!]!
  accessibleDepartments: [Department!]!
}
```

### 2.2 Advanced Queries

```graphql
# Department Tree Node
type DepartmentNode {
  id: UUID!
  departmentCode: String!
  departmentName: String!
  level: Int!
  children: [DepartmentNode!]!
  hierarchyType: String
  parent: DepartmentNode
}

# Department with Employee Count
type DepartmentWithStats {
  department: Department!
  totalEmployees: Int!
  activeEmployees: Int!
  inactiveEmployees: Int!
  childDepartmentCount: Int!
  parentDepartmentCount: Int!
}

extend type Query {
  departmentsWithStats(
    filter: DepartmentFilterInput
    orderBy: [DepartmentOrderByInput!]
  ): [DepartmentWithStats!]!
}
```

## 3. Mutations

### 3.1 CRUD Mutations

```graphql
type Mutation {
  # Create
  createDepartment(input: CreateDepartmentInput!): Department!
  
  # Update
  updateDepartment(
    id: UUID!
    input: UpdateDepartmentInput!
  ): Department!
  
  # Delete
  deleteDepartment(id: UUID!): DepartmentMutationResponse!
  
  # Soft Delete
  deactivateDepartment(id: UUID!): Department!
  activateDepartment(id: UUID!): Department!
}
```

### 3.2 Bulk Mutations

```graphql
extend type Mutation {
  # Bulk Create
  bulkCreateDepartments(
    input: [CreateDepartmentInput!]!
  ): BulkDepartmentResponse!
  
  # Bulk Update
  bulkUpdateDepartments(
    input: [BulkUpdateDepartmentInput!]!
  ): BulkDepartmentResponse!
  
  # Bulk Delete
  bulkDeleteDepartments(
    ids: [UUID!]!
  ): BulkDepartmentResponse!
  
  # Bulk Deactivate/Activate
  bulkDeactivateDepartments(ids: [UUID!]!): BulkDepartmentResponse!
  bulkActivateDepartments(ids: [UUID!]!): BulkDepartmentResponse!
}

input BulkUpdateDepartmentInput {
  id: UUID!
  data: UpdateDepartmentInput!
}
```

### 3.3 Position Management

```graphql
extend type Mutation {
  # Reorder Departments
  reorderDepartments(
    input: [DepartmentPositionInput!]!
  ): [Department!]!
  
  # Move Department Position
  moveDepartmentPosition(
    id: UUID!
    newPosition: Float!
  ): Department!
}

input DepartmentPositionInput {
  id: UUID!
  position: Float!
}
```

## 4. Subscriptions

```graphql
type Subscription {
  # Department Changes
  departmentCreated: Department!
  departmentUpdated(id: UUID): Department!
  departmentDeleted: UUID!
  
  # Bulk Operations
  departmentBulkOperation: BulkDepartmentResponse!
  
  # Department Statistics
  departmentStatsUpdated: DepartmentStatistics!
}
```

## 5. Enums

```graphql
enum SortOrder {
  ASC
  DESC
}

enum DepartmentCategory {
  CORE_BUSINESS
  SUPPORT
  OPERATIONS
  RESEARCH_DEVELOPMENT
  QUALITY_ASSURANCE
  ADMINISTRATION
}

enum KpiCategory {
  SALES_PERFORMANCE
  MARKETING_PERFORMANCE
  HR_PERFORMANCE
  IT_PERFORMANCE
  FINANCE_PERFORMANCE
  PRODUCTION_PERFORMANCE
  RD_PERFORMANCE
  QA_PERFORMANCE
  GENERAL_PERFORMANCE
}

enum AccessLevel {
  DEPARTMENT_ONLY
  CROSS_DEPARTMENT
  COMPANY_WIDE
  RESTRICTED
}
```

## 6. Scalars

```graphql
scalar UUID
scalar DateTime
scalar Float
scalar JSON
```

## 7. Directives

```graphql
# Access Control
directive @auth(
  permissions: [String!]!
  roles: [String!]
) on FIELD_DEFINITION | OBJECT

# Rate Limiting
directive @rateLimit(
  max: Int!
  window: Int!
  message: String
) on FIELD_DEFINITION

# Caching
directive @cacheControl(
  maxAge: Int
  scope: CacheControlScope
) on FIELD_DEFINITION | OBJECT

# Field Validation
directive @constraint(
  minLength: Int
  maxLength: Int
  pattern: String
  min: Float
  max: Float
) on INPUT_FIELD_DEFINITION | ARGUMENT_DEFINITION
```

## 8. Usage Examples

### 8.1 Query with Fragments

```graphql
fragment DepartmentBasic on Department {
  id
  departmentCode
  departmentName
  departmentNameEn
  isActive
  displayOrder
  colorCode
  iconName
}

fragment DepartmentDetailed on Department {
  ...DepartmentBasic
  description
  budgetCode
  costCenter
  requiresKpiTracking
  allowsCrossDepartmentAccess
  defaultKpiCategory
  position
  createdAt
  updatedAt
  createdBy {
    workspaceMemberId
    name
  }
}

query GetDepartmentsList {
  departments(
    filter: {
      isActive: { eq: true }
    }
    orderBy: [
      { displayOrder: ASC }
      { departmentName: ASC }
    ]
    first: 20
  ) {
    edges {
      node {
        ...DepartmentDetailed
        people {
          totalCount
        }
        childHierarchies {
          totalCount
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
    totalCount
  }
}
```

### 8.2 Complex Filter Query

```graphql
query FilterDepartments {
  departments(
    filter: {
      and: [
        {
          isActive: { eq: true }
        },
        {
          or: [
            {
              departmentName: { ilike: "%kinh doanh%" }
            },
            {
              departmentNameEn: { ilike: "%sales%" }
            }
          ]
        },
        {
          requiresKpiTracking: { eq: true }
        },
        {
          people: {
            some: {
              isActive: { eq: true }
            }
          }
        }
      ]
    }
    orderBy: [
      { displayOrder: ASC }
    ]
  ) {
    edges {
      node {
        id
        departmentCode
        departmentName
        people(filter: { isActive: { eq: true } }) {
          totalCount
        }
      }
    }
  }
}
```

### 8.3 Mutation with Error Handling

```graphql
mutation CreateDepartmentWithErrorHandling($input: CreateDepartmentInput!) {
  createDepartment(input: $input) {
    id
    departmentCode
    departmentName
    createdAt
  }
}
```