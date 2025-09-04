# Department API Documentation

## Tổng quan

API Department cung cấp các endpoints để quản lý phòng ban trong hệ thống CRM. API được xây dựng trên nền tảng GraphQL và hỗ trợ đầy đủ các thao tác CRUD (Create, Read, Update, Delete).

## Cấu trúc Entity

Department entity bao gồm các trường sau:

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| id | UUID | Yes | ID duy nhất của phòng ban |
| departmentCode | String | Yes | Mã phòng ban (unique) |
| departmentName | String | Yes | Tên phòng ban |
| departmentNameEn | String | No | Tên phòng ban (tiếng Anh) |
| description | String | No | Mô tả chi tiết |
| budgetCode | String | No | Mã ngân sách |
| costCenter | String | No | Trung tâm chi phí |
| requiresKpiTracking | Boolean | No | Yêu cầu theo dõi KPI |
| allowsCrossDepartmentAccess | Boolean | No | Cho phép truy cập liên phòng ban |
| defaultKpiCategory | String | No | Danh mục KPI mặc định |
| displayOrder | Number | Yes | Thứ tự hiển thị |
| colorCode | String | No | Mã màu cho UI |
| iconName | String | No | Tên icon hiển thị |
| isActive | Boolean | No | Trạng thái hoạt động |
| position | Number | No | Vị trí trong danh sách |
| createdAt | DateTime | Auto | Thời gian tạo |
| updatedAt | DateTime | Auto | Thời gian cập nhật |
| createdBy | Actor | Auto | Người tạo |

## Relationships

- **people**: Danh sách nhân viên thuộc phòng ban (One-to-Many với WorkspaceMember)
- **childHierarchies**: Các mối quan hệ phân cấp con (One-to-Many với MktDepartmentHierarchy)
- **parentHierarchies**: Các mối quan hệ phân cấp cha (One-to-Many với MktDepartmentHierarchy)
- **dataAccessPolicies**: Các chính sách truy cập dữ liệu (One-to-Many với MktDataAccessPolicy)

## Base URL

```
https://api.your-domain.com/graphql
```

## Authentication

Tất cả requests đều yêu cầu authentication token trong header:

```http
Authorization: Bearer YOUR_ACCESS_TOKEN
Content-Type: application/json
```

## Error Handling

API trả về lỗi theo format GraphQL standard:

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

## Phân quyền

Các quyền cần thiết để thực hiện operations:

- **READ**: `DEPARTMENT_VIEW`, `DEPARTMENT_LIST`
- **CREATE**: `DEPARTMENT_CREATE`
- **UPDATE**: `DEPARTMENT_UPDATE`, `DEPARTMENT_EDIT`
- **DELETE**: `DEPARTMENT_DELETE`

## Validation Rules

1. **departmentCode**: 
   - Phải unique trong toàn hệ thống
   - Độ dài 2-20 ký tự
   - Chỉ chứa chữ cái, số và dấu gạch dưới

2. **departmentName**:
   - Độ dài 1-100 ký tự
   - Không được trống

3. **displayOrder**:
   - Số nguyên dương
   - Unique trong cùng cấp phân cấp

## Rate Limiting

- Giới hạn 1000 requests/hour cho mỗi user
- Giới hạn 100 requests/minute cho operations CREATE/UPDATE/DELETE