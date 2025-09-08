# Department Hierarchy GraphQL Schema

## 1. Types Definition

### 1.1 DepartmentHierarchy Type

```graphql
type DepartmentHierarchy {
  # Core Fields
  id: UUID!
  hierarchyLevel: Int!
  relationshipType: DepartmentRelationshipType!
  
  # Temporal Validity
  validFrom: DateTime
  validTo: DateTime
  
  # Permission & Access Control
  inheritsPermissions: Boolean
  canEscalateToParent: Boolean
  allowsCrossBranchAccess: Boolean
  inheritsParentPermissions: Boolean
  canViewTeamData: Boolean
  canEditTeamData: Boolean
  canExportTeamData: Boolean
  
  # Display & Organization
  displayOrder: Int
  notes: String
  isActive: Boolean
  position: Float
  
  # Computed Fields
  hierarchyPath: [String!]
  
  # Audit Fields
  createdAt: DateTime!
  updatedAt: DateTime!
  createdBy: Actor!
  
  # Relations
  parentDepartment: Department! @relation(name: "ParentDepartmentHierarchy")
  childDepartment: Department! @relation(name: "ChildDepartmentHierarchy")
}
```

### 1.2 Enum Types

```graphql
enum DepartmentRelationshipType {
  PARENT_CHILD
  MATRIX
  FUNCTIONAL
  TEMPORARY
}

enum HierarchyStatus {
  ACTIVE
  INACTIVE
  EXPIRED
  PENDING
}
```

### 1.3 Input Types

#### CreateDepartmentHierarchyInput

```graphql
input CreateDepartmentHierarchyInput {
  parentDepartmentId: UUID!
  childDepartmentId: UUID!
  hierarchyLevel: Int!
  relationshipType: DepartmentRelationshipType! = PARENT_CHILD
  validFrom: DateTime
  validTo: DateTime
  inheritsPermissions: Boolean = true
  canEscalateToParent: Boolean = true
  allowsCrossBranchAccess: Boolean = false
  displayOrder: Int
  notes: String
  isActive: Boolean = true
  inheritsParentPermissions: Boolean = true
  canViewTeamData: Boolean = false
  canEditTeamData: Boolean = false
  canExportTeamData: Boolean = false
}
```

#### UpdateDepartmentHierarchyInput

```graphql
input UpdateDepartmentHierarchyInput {
  hierarchyLevel: Int
  relationshipType: DepartmentRelationshipType
  validFrom: DateTime
  validTo: DateTime
  inheritsPermissions: Boolean
  canEscalateToParent: Boolean
  allowsCrossBranchAccess: Boolean
  displayOrder: Int
  notes: String
  isActive: Boolean
  position: Float
  inheritsParentPermissions: Boolean
  canViewTeamData: Boolean
  canEditTeamData: Boolean
  canExportTeamData: Boolean
}
```

#### DepartmentHierarchyFilterInput

```graphql
input DepartmentHierarchyFilterInput {
  and: [DepartmentHierarchyFilterInput!]
  or: [DepartmentHierarchyFilterInput!]
  not: DepartmentHierarchyFilterInput
  
  # Field Filters
  id: UUIDFilterInput
  hierarchyLevel: IntFilterInput
  relationshipType: DepartmentRelationshipTypeFilterInput
  validFrom: DateTimeFilterInput
  validTo: DateTimeFilterInput
  inheritsPermissions: BooleanFilterInput
  canEscalateToParent: BooleanFilterInput
  allowsCrossBranchAccess: BooleanFilterInput
  displayOrder: IntFilterInput
  notes: StringFilterInput
  isActive: BooleanFilterInput
  position: FloatFilterInput
  hierarchyPath: StringArrayFilterInput
  inheritsParentPermissions: BooleanFilterInput
  canViewTeamData: BooleanFilterInput
  canEditTeamData: BooleanFilterInput
  canExportTeamData: BooleanFilterInput
  createdAt: DateTimeFilterInput
  updatedAt: DateTimeFilterInput
  
  # Relation Filters
  parentDepartment: DepartmentFilterInput
  childDepartment: DepartmentFilterInput
}
```

#### DepartmentHierarchyOrderByInput

```graphql
input DepartmentHierarchyOrderByInput {
  id: SortOrder
  hierarchyLevel: SortOrder
  relationshipType: SortOrder
  validFrom: SortOrder
  validTo: SortOrder
  displayOrder: SortOrder
  isActive: SortOrder
  position: SortOrder
  createdAt: SortOrder
  updatedAt: SortOrder
}
```

### 1.4 Connection Types

```graphql
type DepartmentHierarchyConnection {
  edges: [DepartmentHierarchyEdge!]!
  pageInfo: PageInfo!
  totalCount: Int!
}

type DepartmentHierarchyEdge {
  node: DepartmentHierarchy!
  cursor: String!
}
```

### 1.5 Response Types

```graphql
type DepartmentHierarchyMutationResponse {
  success: Boolean!
  message: String
  hierarchy: DepartmentHierarchy
  affectedHierarchies: Int
}

type BulkDepartmentHierarchyResponse {
  success: Boolean!
  created: Int!
  updated: Int!
  failed: Int!
  rebuilt: Int!
  results: [DepartmentHierarchyOperationResult!]!
}

type DepartmentHierarchyOperationResult {
  id: UUID
  parentDepartmentId: UUID!
  childDepartmentId: UUID!
  relationshipType: DepartmentRelationshipType!
  success: Boolean!
  error: String
}
```

### 1.6 Tree & Navigation Types

```graphql
type DepartmentTreeNode {
  id: UUID!
  departmentCode: String!
  departmentName: String!
  level: Int!
  relationshipType: DepartmentRelationshipType
  hierarchyId: UUID
  distance: Int
  path: [String!]
  children: [DepartmentTreeNode!]!
  parent: DepartmentTreeNode
}

type DepartmentAncestor {
  id: UUID!
  departmentCode: String!
  departmentName: String!
  level: Int!
  relationshipType: DepartmentRelationshipType!
  hierarchyId: UUID!
  distance: Int!
}

type DepartmentDescendant {
  id: UUID!
  departmentCode: String!
  departmentName: String!
  level: Int!
  relationshipType: DepartmentRelationshipType!
  hierarchyId: UUID!
  distance: Int!
  path: [String!]!
}
```

### 1.7 Statistics Types

```graphql
type HierarchyStatistics {
  totalHierarchies: Int!
  activeHierarchies: Int!
  inactiveHierarchies: Int!
  expiredHierarchies: Int!
  byRelationshipType: [RelationshipTypeStats!]!
  maxDepth: Int!
  averageDepth: Float!
  orphanedDepartments: Int!
  circularReferences: Int!
  temporaryRelationships: Int!
}

type RelationshipTypeStats {
  type: DepartmentRelationshipType!
  count: Int!
  percentage: Float!
  activeCount: Int!
  expiredCount: Int!
}

type HierarchyHealthCheck {
  isHealthy: Boolean!
  issues: [HierarchyIssue!]!
  warnings: [HierarchyWarning!]!
  suggestions: [HierarchyOptimization!]!
}

type HierarchyIssue {
  type: HierarchyIssueType!
  severity: IssueSeverity!
  message: String!
  affectedHierarchies: [UUID!]!
  suggestedFix: String
}

type HierarchyWarning {
  type: HierarchyWarningType!
  message: String!
  affectedHierarchies: [UUID!]!
}

type HierarchyOptimization {
  type: String!
  description: String!
  estimatedImpact: String!
}

enum HierarchyIssueType {
  CIRCULAR_DEPENDENCY
  ORPHANED_DEPARTMENT
  INCONSISTENT_LEVELS
  DUPLICATE_RELATIONSHIP
  EXPIRED_ACTIVE_HIERARCHY
}

enum HierarchyWarningType {
  DEEP_HIERARCHY
  TOO_MANY_CHILDREN
  TEMPORARY_RELATIONSHIP_WITHOUT_END_DATE
  PERMISSION_INHERITANCE_CONFLICT
}

enum IssueSeverity {
  LOW
  MEDIUM
  HIGH
  CRITICAL
}
```

## 2. Queries

### 2.1 Basic Queries

```graphql
type Query {
  # Single Hierarchy
  departmentHierarchy(id: UUID!): DepartmentHierarchy
  
  # Hierarchy List with Filtering & Pagination
  departmentHierarchies(
    filter: DepartmentHierarchyFilterInput
    orderBy: [DepartmentHierarchyOrderByInput!]
    first: Int
    after: String
    last: Int
    before: String
  ): DepartmentHierarchyConnection!
  
  # Tree Queries
  departmentHierarchyTree(
    rootDepartmentId: UUID!
    maxLevel: Int = 10
  ): DepartmentTreeNode!
  
  # Ancestor & Descendant Queries
  departmentAncestors(
    departmentId: UUID!
    relationshipTypes: [DepartmentRelationshipType!]
  ): [DepartmentAncestor!]!
  
  departmentDescendants(
    departmentId: UUID!
    maxDepth: Int = 5
    relationshipTypes: [DepartmentRelationshipType!]
  ): [DepartmentDescendant!]!
  
  # Statistics & Health
  hierarchyStatistics: HierarchyStatistics!
  hierarchyHealthCheck: HierarchyHealthCheck!
  
  # Current Active Hierarchies
  activeDepartmentHierarchies(
    asOfDate: DateTime = "now"
  ): [DepartmentHierarchy!]!
  
  # Expired Hierarchies
  expiredDepartmentHierarchies(
    asOfDate: DateTime = "now"
    includePendingExpiry: Boolean = false
    daysBeforeExpiry: Int = 30
  ): [DepartmentHierarchy!]!
}
```

### 2.2 Advanced Tree Queries

```graphql
extend type Query {
  # Multi-root Forest
  departmentForest(
    rootIds: [UUID!]
    maxDepth: Int = 5
  ): [DepartmentTreeNode!]!
  
  # Hierarchy by Type
  hierarchiesByType(
    relationshipType: DepartmentRelationshipType!
    includeInactive: Boolean = false
  ): [DepartmentHierarchy!]!
  
  # Department Siblings
  departmentSiblings(
    departmentId: UUID!
    relationshipType: DepartmentRelationshipType
  ): [Department!]!
  
  # Reporting Structure
  reportingStructure(
    managerId: UUID!
    includeTemporary: Boolean = false
  ): DepartmentTreeNode!
  
  # Permission Inheritance Chain
  permissionInheritanceChain(
    departmentId: UUID!
  ): [DepartmentPermissionLevel!]!
}

type DepartmentPermissionLevel {
  department: Department!
  level: Int!
  inheritsFromParent: Boolean!
  permissions: [String!]!
  accessPolicies: [String!]!
}
```

## 3. Mutations

### 3.1 CRUD Mutations

```graphql
type Mutation {
  # Create
  createDepartmentHierarchy(
    input: CreateDepartmentHierarchyInput!
  ): DepartmentHierarchy! 
    @auth(permissions: ["DEPARTMENT_HIERARCHY_CREATE"])
    @rateLimit(max: 50, window: 3600)
  
  # Update
  updateDepartmentHierarchy(
    id: UUID!
    input: UpdateDepartmentHierarchyInput!
  ): DepartmentHierarchy!
    @auth(permissions: ["DEPARTMENT_HIERARCHY_UPDATE"])
  
  # Delete
  deleteDepartmentHierarchy(
    id: UUID!
  ): DepartmentHierarchyMutationResponse!
    @auth(permissions: ["DEPARTMENT_HIERARCHY_DELETE"])
  
  # Soft Delete/Activate
  deactivateDepartmentHierarchy(id: UUID!): DepartmentHierarchy!
  activateDepartmentHierarchy(id: UUID!): DepartmentHierarchy!
}
```

### 3.2 Bulk Operations

```graphql
extend type Mutation {
  # Bulk Create
  bulkCreateDepartmentHierarchies(
    input: [CreateDepartmentHierarchyInput!]!
  ): BulkDepartmentHierarchyResponse!
    @auth(permissions: ["DEPARTMENT_HIERARCHY_BULK_CREATE"])
    @rateLimit(max: 10, window: 3600)
  
  # Bulk Update
  bulkUpdateDepartmentHierarchies(
    input: [BulkUpdateDepartmentHierarchyInput!]!
  ): BulkDepartmentHierarchyResponse!
  
  # Bulk Delete
  bulkDeleteDepartmentHierarchies(
    ids: [UUID!]!
  ): BulkDepartmentHierarchyResponse!
}

input BulkUpdateDepartmentHierarchyInput {
  id: UUID!
  data: UpdateDepartmentHierarchyInput!
}
```

### 3.3 Hierarchy Management

```graphql
extend type Mutation {
  # Rebuild Hierarchy Paths
  rebuildHierarchyPaths(
    rootDepartmentId: UUID
  ): DepartmentHierarchyMutationResponse!
    @auth(permissions: ["DEPARTMENT_HIERARCHY_ADMIN"])
  
  # Move Department in Hierarchy
  moveDepartmentInHierarchy(
    departmentId: UUID!
    newParentId: UUID
    relationshipType: DepartmentRelationshipType = PARENT_CHILD
  ): [DepartmentHierarchy!]!
  
  # Create Department Branch
  createDepartmentBranch(
    parentId: UUID!
    departments: [CreateDepartmentInput!]!
    relationshipType: DepartmentRelationshipType = PARENT_CHILD
  ): [DepartmentHierarchy!]!
  
  # Merge Department Branches
  mergeDepartmentBranches(
    sourceBranchId: UUID!
    targetBranchId: UUID!
    strategy: MergeStrategy = KEEP_BOTH
  ): [DepartmentHierarchy!]!
  
  # Fix Circular Dependencies
  fixCircularDependencies: DepartmentHierarchyMutationResponse!
    @auth(permissions: ["DEPARTMENT_HIERARCHY_ADMIN"])
  
  # Expire Temporary Hierarchies
  expireTemporaryHierarchies(
    beforeDate: DateTime = "now"
  ): BulkDepartmentHierarchyResponse!
}

enum MergeStrategy {
  KEEP_SOURCE
  KEEP_TARGET  
  KEEP_BOTH
  MERGE_PERMISSIONS
}
```

### 3.4 Position Management

```graphql
extend type Mutation {
  # Reorder Hierarchies
  reorderDepartmentHierarchies(
    parentId: UUID!
    hierarchyIds: [UUID!]!
  ): [DepartmentHierarchy!]!
  
  # Move Hierarchy Position
  moveDepartmentHierarchyPosition(
    id: UUID!
    newPosition: Float!
  ): DepartmentHierarchy!
}
```

## 4. Subscriptions

```graphql
type Subscription {
  # Hierarchy Changes
  departmentHierarchyCreated: DepartmentHierarchy!
  departmentHierarchyUpdated(id: UUID): DepartmentHierarchy!
  departmentHierarchyDeleted: UUID!
  
  # Tree Structure Changes
  departmentTreeChanged(rootId: UUID): DepartmentTreeNode!
  
  # Bulk Operations
  departmentHierarchyBulkOperation: BulkDepartmentHierarchyResponse!
  
  # Statistics Updates
  hierarchyStatsUpdated: HierarchyStatistics!
  
  # Health Monitoring
  hierarchyHealthChanged: HierarchyHealthCheck!
  
  # Expiry Notifications
  hierarchiesExpiring(daysBeforeExpiry: Int = 30): [DepartmentHierarchy!]!
}
```

## 5. Advanced Filter Inputs

```graphql
input DepartmentRelationshipTypeFilterInput {
  eq: DepartmentRelationshipType
  ne: DepartmentRelationshipType
  in: [DepartmentRelationshipType!]
  notIn: [DepartmentRelationshipType!]
}

input StringArrayFilterInput {
  contains: String
  containsAny: [String!]
  containsAll: [String!]
  isEmpty: Boolean
  isNotEmpty: Boolean
  size: IntFilterInput
}

# Date Range Filters for Temporal Queries
input TemporalFilterInput {
  validOn: DateTime
  validBetween: DateRangeInput
  expiredBy: DateTime
  activeDuring: DateRangeInput
}

input DateRangeInput {
  from: DateTime!
  to: DateTime!
}
```

## 6. Directives & Validation

```graphql
# Custom Directives for Hierarchy
directive @hierarchyValidation(
  preventCircular: Boolean = true
  maxDepth: Int = 10
  requireConsistentLevels: Boolean = true
) on INPUT_OBJECT

directive @temporalValidation(
  requireEndDateForTemporary: Boolean = true
  allowPastDates: Boolean = false
  maxDuration: Int
) on INPUT_OBJECT

# Field-level Validation
directive @departmentExists(
  field: String!
) on INPUT_FIELD_DEFINITION

directive @uniqueHierarchy(
  fields: [String!]!
) on INPUT_OBJECT
```

## 7. Usage Examples

### 7.1 Complex Hierarchy Query with Fragments

```graphql
fragment HierarchyBasic on DepartmentHierarchy {
  id
  hierarchyLevel
  relationshipType
  validFrom
  validTo
  isActive
  displayOrder
  inheritsPermissions
  canEscalateToParent
}

fragment HierarchyDetailed on DepartmentHierarchy {
  ...HierarchyBasic
  allowsCrossBranchAccess
  notes
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

query GetActiveHierarchies {
  departmentHierarchies(
    filter: {
      and: [
        { isActive: { eq: true } },
        {
          or: [
            { validTo: { gte: "2024-09-04T00:00:00Z" } },
            { validTo: { is: null } }
          ]
        }
      ]
    }
    orderBy: [
      { hierarchyLevel: ASC },
      { displayOrder: ASC }
    ]
    first: 50
  ) {
    edges {
      node {
        ...HierarchyDetailed
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

### 7.2 Tree Structure Query

```graphql
query GetDepartmentOrgChart($rootId: UUID!) {
  departmentHierarchyTree(
    rootDepartmentId: $rootId
    maxLevel: 5
  ) {
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
  
  hierarchyStatistics {
    totalHierarchies
    maxDepth
    byRelationshipType {
      type
      count
      activeCount
    }
  }
}
```

### 7.3 Temporal Hierarchy Query

```graphql
query GetHierarchyHistory($departmentId: UUID!) {
  departmentHierarchies(
    filter: {
      or: [
        { parentDepartment: { id: { eq: $departmentId } } },
        { childDepartment: { id: { eq: $departmentId } } }
      ]
    }
    orderBy: [{ validFrom: DESC }]
  ) {
    edges {
      node {
        id
        relationshipType
        validFrom
        validTo
        isActive
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