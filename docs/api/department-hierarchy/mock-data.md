# Department Hierarchy Mock Data

## 1. Sample Department Hierarchies

### 1.1 CEO - Sales Department Hierarchy (Root Level)

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440001",
  "hierarchyLevel": 0,
  "relationshipType": "PARENT_CHILD",
  "validFrom": "2024-01-01T00:00:00Z",
  "validTo": null,
  "inheritsPermissions": false,
  "canEscalateToParent": false,
  "allowsCrossBranchAccess": false,
  "displayOrder": 1,
  "notes": "CEO directly manages Sales Department",
  "isActive": true,
  "position": 1.0,
  "hierarchyPath": [],
  "inheritsParentPermissions": false,
  "canViewTeamData": true,
  "canEditTeamData": true,
  "canExportTeamData": true,
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-09-04T10:30:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  },
  "parentDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "departmentCode": "CEO",
    "departmentName": "Ban Giám Đốc"
  },
  "childDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "departmentCode": "SALES",
    "departmentName": "Phòng Kinh Doanh"
  }
}
```

### 1.2 Sales - Sales North Hierarchy

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440002",
  "hierarchyLevel": 1,
  "relationshipType": "PARENT_CHILD",
  "validFrom": "2024-01-15T00:00:00Z",
  "validTo": null,
  "inheritsPermissions": true,
  "canEscalateToParent": true,
  "allowsCrossBranchAccess": false,
  "displayOrder": 1,
  "notes": "Sales North reports to main Sales Department",
  "isActive": true,
  "position": 1.0,
  "hierarchyPath": ["550e8400-e29b-41d4-a716-446655440000"],
  "inheritsParentPermissions": true,
  "canViewTeamData": true,
  "canEditTeamData": false,
  "canExportTeamData": false,
  "createdAt": "2024-01-15T08:45:00Z",
  "updatedAt": "2024-08-10T15:20:00Z",
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
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "departmentCode": "SALES_NORTH",
    "departmentName": "Kinh Doanh Miền Bắc"
  }
}
```

### 1.3 Sales - Sales South Hierarchy

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440003",
  "hierarchyLevel": 1,
  "relationshipType": "PARENT_CHILD",
  "validFrom": "2024-01-15T00:00:00Z",
  "validTo": null,
  "inheritsPermissions": true,
  "canEscalateToParent": true,
  "allowsCrossBranchAccess": false,
  "displayOrder": 2,
  "notes": "Sales South reports to main Sales Department",
  "isActive": true,
  "position": 2.0,
  "hierarchyPath": ["550e8400-e29b-41d4-a716-446655440000"],
  "inheritsParentPermissions": true,
  "canViewTeamData": true,
  "canEditTeamData": false,
  "canExportTeamData": false,
  "createdAt": "2024-01-15T08:50:00Z",
  "updatedAt": "2024-08-10T15:25:00Z",
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
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "departmentCode": "SALES_SOUTH",
    "departmentName": "Kinh Doanh Miền Nam"
  }
}
```

### 1.4 Matrix Relationship - Marketing & Sales Collaboration

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440004",
  "hierarchyLevel": 1,
  "relationshipType": "MATRIX",
  "validFrom": "2024-06-01T00:00:00Z",
  "validTo": "2024-12-31T23:59:59Z",
  "inheritsPermissions": false,
  "canEscalateToParent": false,
  "allowsCrossBranchAccess": true,
  "displayOrder": 3,
  "notes": "Matrix relationship for Q3-Q4 marketing campaigns collaboration",
  "isActive": true,
  "position": 3.0,
  "hierarchyPath": ["550e8400-e29b-41d4-a716-446655440000"],
  "inheritsParentPermissions": false,
  "canViewTeamData": true,
  "canEditTeamData": false,
  "canExportTeamData": false,
  "createdAt": "2024-06-01T09:00:00Z",
  "updatedAt": "2024-08-15T14:30:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440001",
    "name": "Trần Thị Sales Manager"
  },
  "parentDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440002",
    "departmentCode": "MKT",
    "departmentName": "Phòng Marketing"
  },
  "childDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "departmentCode": "SALES_NORTH",
    "departmentName": "Kinh Doanh Miền Bắc"
  }
}
```

### 1.5 Functional Relationship - IT Support

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440005",
  "hierarchyLevel": 0,
  "relationshipType": "FUNCTIONAL",
  "validFrom": "2024-01-01T00:00:00Z",
  "validTo": null,
  "inheritsPermissions": false,
  "canEscalateToParent": true,
  "allowsCrossBranchAccess": true,
  "displayOrder": 1,
  "notes": "IT provides functional support to all departments",
  "isActive": true,
  "position": 1.0,
  "hierarchyPath": [],
  "inheritsParentPermissions": false,
  "canViewTeamData": false,
  "canEditTeamData": false,
  "canExportTeamData": false,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-09-01T16:45:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  },
  "parentDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440004",
    "departmentCode": "IT",
    "departmentName": "Phòng Công Nghệ Thông Tin"
  },
  "childDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "departmentCode": "SALES",
    "departmentName": "Phòng Kinh Doanh"
  }
}
```

### 1.6 Temporary Project Team

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440006",
  "hierarchyLevel": 2,
  "relationshipType": "TEMPORARY",
  "validFrom": "2024-09-01T00:00:00Z",
  "validTo": "2024-11-30T23:59:59Z",
  "inheritsPermissions": true,
  "canEscalateToParent": true,
  "allowsCrossBranchAccess": true,
  "displayOrder": 1,
  "notes": "Temporary project team for Q4 product launch",
  "isActive": true,
  "position": 1.0,
  "hierarchyPath": ["550e8400-e29b-41d4-a716-446655440000", "550e8400-e29b-41d4-a716-446655440001"],
  "inheritsParentPermissions": true,
  "canViewTeamData": true,
  "canEditTeamData": true,
  "canExportTeamData": false,
  "createdAt": "2024-09-01T08:00:00Z",
  "updatedAt": "2024-09-04T11:15:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440002",
    "name": "Lê Văn Project Manager"
  },
  "parentDepartment": {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "departmentCode": "SALES_NORTH",
    "departmentName": "Kinh Doanh Miền Bắc"
  },
  "childDepartment": {
    "id": "650e8400-e29b-41d4-a716-446655440020",
    "departmentCode": "PROJ_Q4_LAUNCH",
    "departmentName": "Dự Án Ra Mắt Q4"
  }
}
```

## 2. Department Tree Structure

### 2.1 Complete Organization Tree

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "departmentCode": "CEO",
  "departmentName": "Ban Giám Đốc",
  "level": 0,
  "children": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "departmentCode": "SALES",
      "departmentName": "Phòng Kinh Doanh",
      "level": 1,
      "relationshipType": "PARENT_CHILD",
      "hierarchyId": "650e8400-e29b-41d4-a716-446655440001",
      "children": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440010",
          "departmentCode": "SALES_NORTH",
          "departmentName": "Kinh Doanh Miền Bắc",
          "level": 2,
          "relationshipType": "PARENT_CHILD",
          "hierarchyId": "650e8400-e29b-41d4-a716-446655440002",
          "children": [
            {
              "id": "650e8400-e29b-41d4-a716-446655440020",
              "departmentCode": "PROJ_Q4_LAUNCH",
              "departmentName": "Dự Án Ra Mắt Q4",
              "level": 3,
              "relationshipType": "TEMPORARY",
              "hierarchyId": "650e8400-e29b-41d4-a716-446655440006"
            }
          ]
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440011",
          "departmentCode": "SALES_SOUTH",
          "departmentName": "Kinh Doanh Miền Nam",
          "level": 2,
          "relationshipType": "PARENT_CHILD",
          "hierarchyId": "650e8400-e29b-41d4-a716-446655440003"
        }
      ]
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "departmentCode": "MKT",
      "departmentName": "Phòng Marketing",
      "level": 1,
      "relationshipType": "PARENT_CHILD",
      "hierarchyId": "650e8400-e29b-41d4-a716-446655440007"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440003",
      "departmentCode": "HR",
      "departmentName": "Phòng Nhân Sự",
      "level": 1,
      "relationshipType": "PARENT_CHILD",
      "hierarchyId": "650e8400-e29b-41d4-a716-446655440008"
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "departmentCode": "IT",
      "departmentName": "Phòng Công Nghệ Thông Tin",
      "level": 1,
      "relationshipType": "PARENT_CHILD",
      "hierarchyId": "650e8400-e29b-41d4-a716-446655440009"
    }
  ]
}
```

## 3. Hierarchy Statistics Sample

```json
{
  "totalHierarchies": 15,
  "activeHierarchies": 13,
  "inactiveHierarchies": 0,
  "expiredHierarchies": 2,
  "byRelationshipType": [
    {
      "type": "PARENT_CHILD",
      "count": 10,
      "percentage": 66.67,
      "activeCount": 10,
      "expiredCount": 0
    },
    {
      "type": "MATRIX",
      "count": 2,
      "percentage": 13.33,
      "activeCount": 1,
      "expiredCount": 1
    },
    {
      "type": "FUNCTIONAL",
      "count": 2,
      "percentage": 13.33,
      "activeCount": 2,
      "expiredCount": 0
    },
    {
      "type": "TEMPORARY",
      "count": 1,
      "percentage": 6.67,
      "activeCount": 1,
      "expiredCount": 0
    }
  ],
  "maxDepth": 3,
  "averageDepth": 1.8,
  "orphanedDepartments": 0,
  "circularReferences": 0,
  "temporaryRelationships": 1
}
```

## 4. Sample Query Results

### 4.1 Department Ancestors Query Result

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "departmentCode": "SALES",
    "departmentName": "Phòng Kinh Doanh",
    "level": 1,
    "relationshipType": "PARENT_CHILD",
    "hierarchyId": "650e8400-e29b-41d4-a716-446655440002",
    "distance": 1
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "departmentCode": "CEO",
    "departmentName": "Ban Giám Đốc",
    "level": 0,
    "relationshipType": "PARENT_CHILD",
    "hierarchyId": "650e8400-e29b-41d4-a716-446655440001",
    "distance": 2
  }
]
```

### 4.2 Department Descendants Query Result

```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440010",
    "departmentCode": "SALES_NORTH",
    "departmentName": "Kinh Doanh Miền Bắc",
    "level": 2,
    "relationshipType": "PARENT_CHILD",
    "hierarchyId": "650e8400-e29b-41d4-a716-446655440002",
    "distance": 1,
    "path": ["SALES", "SALES_NORTH"]
  },
  {
    "id": "550e8400-e29b-41d4-a716-446655440011",
    "departmentCode": "SALES_SOUTH",
    "departmentName": "Kinh Doanh Miền Nam",
    "level": 2,
    "relationshipType": "PARENT_CHILD",
    "hierarchyId": "650e8400-e29b-41d4-a716-446655440003",
    "distance": 1,
    "path": ["SALES", "SALES_SOUTH"]
  },
  {
    "id": "650e8400-e29b-41d4-a716-446655440020",
    "departmentCode": "PROJ_Q4_LAUNCH",
    "departmentName": "Dự Án Ra Mắt Q4",
    "level": 3,
    "relationshipType": "TEMPORARY",
    "hierarchyId": "650e8400-e29b-41d4-a716-446655440006",
    "distance": 2,
    "path": ["SALES", "SALES_NORTH", "PROJ_Q4_LAUNCH"]
  }
]
```

## 5. Bulk Operation Sample Data

### 5.1 Bulk Create Input

```json
[
  {
    "parentDepartmentId": "550e8400-e29b-41d4-a716-446655440002",
    "childDepartmentId": "550e8400-e29b-41d4-a716-446655440021",
    "hierarchyLevel": 2,
    "relationshipType": "PARENT_CHILD",
    "validFrom": "2024-10-01T00:00:00Z",
    "inheritsPermissions": true,
    "canEscalateToParent": true,
    "notes": "Marketing Digital team under Marketing"
  },
  {
    "parentDepartmentId": "550e8400-e29b-41d4-a716-446655440002",
    "childDepartmentId": "550e8400-e29b-41d4-a716-446655440022",
    "hierarchyLevel": 2,
    "relationshipType": "PARENT_CHILD",
    "validFrom": "2024-10-01T00:00:00Z",
    "inheritsPermissions": true,
    "canEscalateToParent": true,
    "notes": "Marketing Traditional team under Marketing"
  }
]
```

### 5.2 Bulk Create Response

```json
{
  "success": true,
  "created": 2,
  "failed": 0,
  "results": [
    {
      "id": "650e8400-e29b-41d4-a716-446655440010",
      "parentDepartmentId": "550e8400-e29b-41d4-a716-446655440002",
      "childDepartmentId": "550e8400-e29b-41d4-a716-446655440021",
      "relationshipType": "PARENT_CHILD",
      "success": true,
      "error": null
    },
    {
      "id": "650e8400-e29b-41d4-a716-446655440011",
      "parentDepartmentId": "550e8400-e29b-41d4-a716-446655440002",
      "childDepartmentId": "550e8400-e29b-41d4-a716-446655440022",
      "relationshipType": "PARENT_CHILD",
      "success": true,
      "error": null
    }
  ]
}
```

## 6. Error Scenarios

### 6.1 Circular Dependency Error

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

### 6.2 Expired Hierarchy Warning

```json
{
  "id": "650e8400-e29b-41d4-a716-446655440004",
  "hierarchyLevel": 1,
  "relationshipType": "MATRIX",
  "validFrom": "2024-06-01T00:00:00Z",
  "validTo": "2024-08-31T23:59:59Z",
  "isActive": true,
  "notes": "This hierarchy has expired but is still active",
  "parentDepartment": {
    "departmentCode": "MKT",
    "departmentName": "Phòng Marketing"
  },
  "childDepartment": {
    "departmentCode": "SALES_NORTH",
    "departmentName": "Kinh Doanh Miền Bắc"
  }
}
```

## 7. Test Data Sets

### 7.1 Minimal Hierarchy (2 levels)

```json
[
  {
    "id": "test-hierarchy-001",
    "parentDepartmentId": "test-dept-parent",
    "childDepartmentId": "test-dept-child",
    "hierarchyLevel": 1,
    "relationshipType": "PARENT_CHILD",
    "isActive": true
  }
]
```

### 7.2 Complex Matrix Structure

```json
[
  {
    "id": "test-matrix-001",
    "parentDepartmentId": "dept-a",
    "childDepartmentId": "dept-shared",
    "relationshipType": "MATRIX",
    "validTo": "2024-12-31T23:59:59Z"
  },
  {
    "id": "test-matrix-002", 
    "parentDepartmentId": "dept-b",
    "childDepartmentId": "dept-shared",
    "relationshipType": "MATRIX",
    "validTo": "2024-12-31T23:59:59Z"
  }
]
```

### 7.3 Temporal Overlap Test

```json
[
  {
    "id": "temporal-001",
    "parentDepartmentId": "dept-parent",
    "childDepartmentId": "dept-child",
    "relationshipType": "TEMPORARY",
    "validFrom": "2024-01-01T00:00:00Z",
    "validTo": "2024-06-30T23:59:59Z"
  },
  {
    "id": "temporal-002",
    "parentDepartmentId": "dept-parent",
    "childDepartmentId": "dept-child",
    "relationshipType": "PARENT_CHILD",
    "validFrom": "2024-07-01T00:00:00Z",
    "validTo": null
  }
]
```