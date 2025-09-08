# Department Hierarchy API Documentation

## Tổng quan

API Department Hierarchy cung cấp các endpoints để quản lý mối quan hệ phân cấp giữa các phòng ban trong hệ thống CRM. API được xây dựng trên nền tảng GraphQL và hỗ trợ đầy đủ các thao tác CRUD (Create, Read, Update, Delete).

## Cấu trúc Entity

Department Hierarchy entity bao gồm các trường sau:

| Trường | Kiểu | Bắt buộc | Mô tả |
|--------|------|----------|-------|
| id | UUID | Yes | ID duy nhất của mối quan hệ phân cấp |
| hierarchyLevel | Number | Yes | Cấp độ trong phân cấp (0 = root, 1 = con trực tiếp, ...) |
| relationshipType | String | Yes | Loại mối quan hệ phân cấp (PARENT_CHILD, MATRIX, FUNCTIONAL, TEMPORARY) |
| validFrom | DateTime | No | Ngày bắt đầu mối quan hệ |
| validTo | DateTime | No | Ngày kết thúc mối quan hệ |
| inheritsPermissions | Boolean | No | Phòng ban con có kế thừa quyền từ cha |
| canEscalateToParent | Boolean | No | Có thể leo thang vấn đề lên phòng ban cha |
| allowsCrossBranchAccess | Boolean | No | Cho phép truy cập liên nhánh |
| displayOrder | Number | No | Thứ tự hiển thị trong cây phân cấp |
| notes | String | No | Ghi chú về mối quan hệ |
| isActive | Boolean | No | Trạng thái hoạt động |
| position | Number | No | Vị trí trong danh sách |
| hierarchyPath | Array[String] | No | Đường dẫn phân cấp từ root đến node này |
| inheritsParentPermissions | Boolean | No | Kế thừa quyền từ phòng ban cha |
| canViewTeamData | Boolean | No | Manager có thể xem dữ liệu của phòng ban con |
| canEditTeamData | Boolean | No | Manager có thể chỉnh sửa dữ liệu của phòng ban con |
| canExportTeamData | Boolean | No | Manager có thể xuất dữ liệu của phòng ban con |
| createdAt | DateTime | Auto | Thời gian tạo |
| updatedAt | DateTime | Auto | Thời gian cập nhật |
| createdBy | Actor | Auto | Người tạo |

## Relationship Types

Hệ thống hỗ trợ 4 loại mối quan hệ phân cấp:

| Loại | Mô tả | Màu |
|------|-------|-----|
| PARENT_CHILD | Quan hệ cha-con truyền thống | Green |
| MATRIX | Quan hệ ma trận (báo cáo cho nhiều manager) | Blue |
| FUNCTIONAL | Quan hệ chức năng (chuyên môn) | Orange |
| TEMPORARY | Quan hệ tạm thời (dự án, task force) | Yellow |

## Relationships

- **parentDepartment**: Phòng ban cha (Many-to-One với MktDepartment)
- **childDepartment**: Phòng ban con (Many-to-One với MktDepartment)

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
      "message": "Circular dependency detected in department hierarchy",
      "extensions": {
        "code": "CIRCULAR_HIERARCHY",
        "field": "parentDepartmentId"
      }
    }
  ]
}
```

## Phân quyền

Các quyền cần thiết để thực hiện operations:

- **READ**: `DEPARTMENT_HIERARCHY_VIEW`, `DEPARTMENT_HIERARCHY_LIST`
- **CREATE**: `DEPARTMENT_HIERARCHY_CREATE`
- **UPDATE**: `DEPARTMENT_HIERARCHY_UPDATE`, `DEPARTMENT_HIERARCHY_EDIT`
- **DELETE**: `DEPARTMENT_HIERARCHY_DELETE`

## Validation Rules

1. **hierarchyLevel**:
   - Số nguyên không âm
   - Phải nhất quán với cấu trúc phân cấp thực tế

2. **relationshipType**:
   - Phải là một trong các giá trị: PARENT_CHILD, MATRIX, FUNCTIONAL, TEMPORARY
   - Mặc định là PARENT_CHILD

3. **validFrom/validTo**:
   - validFrom phải nhỏ hơn validTo (nếu có)
   - Không được trùng lặp với các mối quan hệ khác trong cùng thời gian

4. **Circular Dependencies**:
   - Không được tạo vòng lặp trong cây phân cấp
   - Một phòng ban không thể là cha và con của chính nó

## Business Rules

1. **Hierarchy Consistency**:
   - hierarchyLevel phải được tính toán chính xác dựa trên cấu trúc
   - hierarchyPath phải được cập nhật khi cấu trúc thay đổi

2. **Permission Inheritance**:
   - Quyền được kế thừa theo cây phân cấp nếu inheritsPermissions = true
   - Manager có thể quản lý dữ liệu của phòng ban con dựa trên các flags can*TeamData

3. **Temporal Validity**:
   - Mối quan hệ TEMPORARY phải có validTo được định nghĩa
   - Hệ thống tự động deactivate các mối quan hệ hết hạn

## Rate Limiting

- Giới hạn 1000 requests/hour cho mỗi user
- Giới hạn 50 requests/minute cho operations CREATE/UPDATE/DELETE
- Operations thay đổi cấu trúc phân cấp có thể có delay để tính toán lại hierarchyPath