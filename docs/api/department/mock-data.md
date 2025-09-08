# Department Mock Data

## 1. Sample Departments

### 1.1 Phòng Kinh Doanh (Sales Department)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "departmentCode": "SALES",
  "departmentName": "Phòng Kinh Doanh",
  "departmentNameEn": "Sales Department",
  "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh, bán hàng và chăm sóc khách hàng",
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
  "createdAt": "2024-01-15T08:30:00Z",
  "updatedAt": "2024-09-04T10:30:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  }
}
```

### 1.2 Phòng Marketing

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440002",
  "departmentCode": "MKT",
  "departmentName": "Phòng Marketing",
  "departmentNameEn": "Marketing Department",
  "description": "Phòng ban phụ trách hoạt động marketing, quảng cáo và xây dựng thương hiệu",
  "budgetCode": "BUD-MKT-2024",
  "costCenter": "CC-002",
  "requiresKpiTracking": true,
  "allowsCrossDepartmentAccess": true,
  "defaultKpiCategory": "MARKETING_PERFORMANCE",
  "displayOrder": 2,
  "colorCode": "#10B981",
  "iconName": "IconBullhorn",
  "isActive": true,
  "position": 2.0,
  "createdAt": "2024-01-15T09:00:00Z",
  "updatedAt": "2024-08-20T14:15:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  }
}
```

### 1.3 Phòng Nhân Sự (HR Department)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440003",
  "departmentCode": "HR",
  "departmentName": "Phòng Nhân Sự",
  "departmentNameEn": "Human Resources Department",
  "description": "Phòng ban quản lý nguồn nhân lực, tuyển dụng và phát triển nhân viên",
  "budgetCode": "BUD-HR-2024",
  "costCenter": "CC-003",
  "requiresKpiTracking": true,
  "allowsCrossDepartmentAccess": true,
  "defaultKpiCategory": "HR_PERFORMANCE",
  "displayOrder": 3,
  "colorCode": "#F59E0B",
  "iconName": "IconUsers",
  "isActive": true,
  "position": 3.0,
  "createdAt": "2024-01-15T09:30:00Z",
  "updatedAt": "2024-07-10T11:20:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  }
}
```

### 1.4 Phòng IT (IT Department)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440004",
  "departmentCode": "IT",
  "departmentName": "Phòng Công Nghệ Thông Tin",
  "departmentNameEn": "Information Technology Department",
  "description": "Phòng ban chịu trách nhiệm về hạ tầng IT, phát triển phần mềm và bảo mật thông tin",
  "budgetCode": "BUD-IT-2024",
  "costCenter": "CC-004",
  "requiresKpiTracking": true,
  "allowsCrossDepartmentAccess": false,
  "defaultKpiCategory": "IT_PERFORMANCE",
  "displayOrder": 4,
  "colorCode": "#8B5CF6",
  "iconName": "IconCode",
  "isActive": true,
  "position": 4.0,
  "createdAt": "2024-01-15T10:00:00Z",
  "updatedAt": "2024-09-01T16:45:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  }
}
```

### 1.5 Phòng Kế Toán (Finance Department)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440005",
  "departmentCode": "FIN",
  "departmentName": "Phòng Kế Toán",
  "departmentNameEn": "Finance & Accounting Department",
  "description": "Phòng ban quản lý tài chính, kế toán và các hoạt động tài chính của công ty",
  "budgetCode": "BUD-FIN-2024",
  "costCenter": "CC-005",
  "requiresKpiTracking": true,
  "allowsCrossDepartmentAccess": false,
  "defaultKpiCategory": "FINANCE_PERFORMANCE",
  "displayOrder": 5,
  "colorCode": "#EF4444",
  "iconName": "IconCash",
  "isActive": true,
  "position": 5.0,
  "createdAt": "2024-01-15T10:30:00Z",
  "updatedAt": "2024-08-15T13:30:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  }
}
```

### 1.6 Phòng Sản Xuất (Production Department)

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440006",
  "departmentCode": "PROD",
  "departmentName": "Phòng Sản Xuất",
  "departmentNameEn": "Production Department",
  "description": "Phòng ban chịu trách nhiệm về quy trình sản xuất và kiểm soát chất lượng sản phẩm",
  "budgetCode": "BUD-PROD-2024",
  "costCenter": "CC-006",
  "requiresKpiTracking": true,
  "allowsCrossDepartmentAccess": false,
  "defaultKpiCategory": "PRODUCTION_PERFORMANCE",
  "displayOrder": 6,
  "colorCode": "#06B6D4",
  "iconName": "IconTool",
  "isActive": true,
  "position": 6.0,
  "createdAt": "2024-01-15T11:00:00Z",
  "updatedAt": "2024-08-25T09:15:00Z",
  "createdBy": {
    "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
    "name": "Nguyễn Văn Admin"
  }
}
```

## 2. Department List Response

### Complete List with Pagination

```json
{
  "data": {
    "departments": {
      "edges": [
        {
          "node": {
            "id": "550e8400-e29b-41d4-a716-446655440001",
            "departmentCode": "SALES",
            "departmentName": "Phòng Kinh Doanh",
            "departmentNameEn": "Sales Department",
            "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh, bán hàng và chăm sóc khách hàng",
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
            "createdAt": "2024-01-15T08:30:00Z",
            "updatedAt": "2024-09-04T10:30:00Z",
            "createdBy": {
              "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
              "name": "Nguyễn Văn Admin"
            },
            "people": {
              "totalCount": 12
            },
            "childHierarchies": {
              "totalCount": 2
            },
            "parentHierarchies": {
              "totalCount": 0
            }
          }
        },
        {
          "node": {
            "id": "550e8400-e29b-41d4-a716-446655440002",
            "departmentCode": "MKT",
            "departmentName": "Phòng Marketing",
            "departmentNameEn": "Marketing Department",
            "description": "Phòng ban phụ trách hoạt động marketing, quảng cáo và xây dựng thương hiệu",
            "budgetCode": "BUD-MKT-2024",
            "costCenter": "CC-002",
            "requiresKpiTracking": true,
            "allowsCrossDepartmentAccess": true,
            "defaultKpiCategory": "MARKETING_PERFORMANCE",
            "displayOrder": 2,
            "colorCode": "#10B981",
            "iconName": "IconBullhorn",
            "isActive": true,
            "position": 2.0,
            "createdAt": "2024-01-15T09:00:00Z",
            "updatedAt": "2024-08-20T14:15:00Z",
            "createdBy": {
              "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
              "name": "Nguyễn Văn Admin"
            },
            "people": {
              "totalCount": 8
            },
            "childHierarchies": {
              "totalCount": 3
            },
            "parentHierarchies": {
              "totalCount": 1
            }
          }
        }
      ],
      "pageInfo": {
        "hasNextPage": true,
        "hasPreviousPage": false,
        "startCursor": "cursor_1",
        "endCursor": "cursor_2"
      },
      "totalCount": 6
    }
  }
}
```

## 3. Detailed Department with Relations

```json
{
  "data": {
    "department": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "departmentCode": "SALES",
      "departmentName": "Phòng Kinh Doanh",
      "departmentNameEn": "Sales Department",
      "description": "Phòng ban chịu trách nhiệm về hoạt động kinh doanh, bán hàng và chăm sóc khách hàng",
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
      "createdAt": "2024-01-15T08:30:00Z",
      "updatedAt": "2024-09-04T10:30:00Z",
      "createdBy": {
        "workspaceMemberId": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Nguyễn Văn Admin"
      },
      "people": {
        "edges": [
          {
            "node": {
              "id": "emp-001",
              "name": {
                "firstName": "Nguyễn",
                "lastName": "Văn A"
              },
              "email": "vana@company.com"
            }
          },
          {
            "node": {
              "id": "emp-002",
              "name": {
                "firstName": "Trần",
                "lastName": "Thị B"
              },
              "email": "thib@company.com"
            }
          }
        ]
      },
      "childHierarchies": {
        "edges": [
          {
            "node": {
              "id": "hier-001",
              "hierarchyType": "FUNCTIONAL",
              "childDepartment": {
                "id": "550e8400-e29b-41d4-a716-446655440007",
                "departmentName": "Nhóm Bán Hàng Trực Tiếp"
              }
            }
          },
          {
            "node": {
              "id": "hier-002",
              "hierarchyType": "FUNCTIONAL",
              "childDepartment": {
                "id": "550e8400-e29b-41d4-a716-446655440008",
                "departmentName": "Nhóm Chăm Sóc Khách Hàng"
              }
            }
          }
        ]
      },
      "parentHierarchies": {
        "edges": []
      },
      "dataAccessPolicies": {
        "edges": [
          {
            "node": {
              "id": "policy-001",
              "policyName": "Sales Data Access Policy",
              "accessLevel": "DEPARTMENT_ONLY"
            }
          }
        ]
      }
    }
  }
}
```

## 4. Bulk Operations Mock Data

### 4.1 Bulk Create Request

```json
{
  "input": [
    {
      "departmentCode": "R&D",
      "departmentName": "Phòng Nghiên Cứu & Phát Triển",
      "departmentNameEn": "Research & Development",
      "description": "Phòng ban nghiên cứu và phát triển sản phẩm mới",
      "budgetCode": "BUD-RD-2024",
      "costCenter": "CC-007",
      "requiresKpiTracking": true,
      "allowsCrossDepartmentAccess": true,
      "defaultKpiCategory": "RD_PERFORMANCE",
      "displayOrder": 7,
      "colorCode": "#F97316",
      "iconName": "IconFlask",
      "isActive": true
    },
    {
      "departmentCode": "QA",
      "departmentName": "Phòng Đảm Bảo Chất Lượng",
      "departmentNameEn": "Quality Assurance",
      "description": "Phòng ban đảm bảo chất lượng sản phẩm và dịch vụ",
      "budgetCode": "BUD-QA-2024",
      "costCenter": "CC-008",
      "requiresKpiTracking": true,
      "allowsCrossDepartmentAccess": false,
      "defaultKpiCategory": "QA_PERFORMANCE",
      "displayOrder": 8,
      "colorCode": "#84CC16",
      "iconName": "IconShield",
      "isActive": true
    }
  ]
}
```

### 4.2 Bulk Create Response

```json
{
  "data": {
    "bulkCreateDepartments": {
      "success": true,
      "created": 2,
      "failed": 0,
      "results": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440007",
          "departmentCode": "R&D",
          "departmentName": "Phòng Nghiên Cứu & Phát Triển",
          "error": null
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440008",
          "departmentCode": "QA",
          "departmentName": "Phòng Đảm Bảo Chất Lượng",
          "error": null
        }
      ]
    }
  }
}
```

## 5. Error Scenarios Mock Data

### 5.1 Duplicate Department Code Error

```json
{
  "errors": [
    {
      "message": "Department with code 'SALES' already exists",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createDepartment"],
      "extensions": {
        "code": "DUPLICATE_DEPARTMENT_CODE",
        "field": "departmentCode",
        "value": "SALES",
        "existingDepartmentId": "550e8400-e29b-41d4-a716-446655440001"
      }
    }
  ]
}
```

### 5.2 Validation Error

```json
{
  "errors": [
    {
      "message": "Invalid department code format",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createDepartment"],
      "extensions": {
        "code": "INVALID_DEPARTMENT_CODE",
        "field": "departmentCode",
        "value": "SALES@123",
        "validationRules": [
          "Must be 2-20 characters long",
          "Only letters, numbers, and underscores allowed",
          "Must start with a letter"
        ]
      }
    }
  ]
}
```

### 5.3 Permission Error

```json
{
  "errors": [
    {
      "message": "Insufficient permissions to create department",
      "locations": [
        {
          "line": 2,
          "column": 3
        }
      ],
      "path": ["createDepartment"],
      "extensions": {
        "code": "INSUFFICIENT_PERMISSIONS",
        "requiredPermissions": ["DEPARTMENT_CREATE"],
        "userPermissions": ["DEPARTMENT_VIEW", "DEPARTMENT_LIST"]
      }
    }
  ]
}
```

## 6. Statistics and Analytics Mock Data

### 6.1 Department Statistics

```json
{
  "data": {
    "departmentStats": {
      "totalDepartments": 6,
      "activeDepartments": 6,
      "inactiveDepartments": 0,
      "departmentsWithKpiTracking": 6,
      "departmentsWithCrossDepartmentAccess": 2,
      "averageEmployeesPerDepartment": 10.5,
      "departmentsByCategory": [
        {
          "category": "CORE_BUSINESS",
          "count": 2,
          "departments": ["SALES", "MKT"]
        },
        {
          "category": "SUPPORT",
          "count": 3,
          "departments": ["HR", "IT", "FIN"]
        },
        {
          "category": "OPERATIONS",
          "count": 1,
          "departments": ["PROD"]
        }
      ]
    }
  }
}
```

### 6.2 Department Hierarchy Tree

```json
{
  "data": {
    "departmentHierarchy": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "departmentCode": "SALES",
      "departmentName": "Phòng Kinh Doanh",
      "level": 0,
      "children": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440007",
          "departmentCode": "SALES_DIRECT",
          "departmentName": "Nhóm Bán Hàng Trực Tiếp",
          "level": 1,
          "hierarchyType": "FUNCTIONAL",
          "children": [
            {
              "id": "550e8400-e29b-41d4-a716-446655440009",
              "departmentCode": "SALES_B2B",
              "departmentName": "Nhóm Bán Hàng B2B",
              "level": 2
            },
            {
              "id": "550e8400-e29b-41d4-a716-446655440010",
              "departmentCode": "SALES_B2C",
              "departmentName": "Nhóm Bán Hàng B2C",
              "level": 2
            }
          ]
        },
        {
          "id": "550e8400-e29b-41d4-a716-446655440008",
          "departmentCode": "CUST_CARE",
          "departmentName": "Nhóm Chăm Sóc Khách Hàng",
          "level": 1,
          "hierarchyType": "FUNCTIONAL",
          "children": []
        }
      ]
    }
  }
}
```