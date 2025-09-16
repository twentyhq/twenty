# **Tài liệu Chi tiết về defaultPermissions và accessLimitations**

## **Tổng quan**

Trong hệ thống RBAC của MktOrganizationLevelWorkspaceEntity, hai trường quan trọng `defaultPermissions` và `accessLimitations` đóng vai trò then chốt trong việc kiểm soát quyền truy cập. Tài liệu này giải thích chi tiết về cách thức hoạt động, cấu trúc dữ liệu và ví dụ thực tế của hai trường này.

## **1. defaultPermissions (Quyền Mặc định)**

### **Định nghĩa**
`defaultPermissions` là trường TEXT chứa cấu trúc JSON định nghĩa tập hợp quyền cơ bản mà người dùng ở cấp độ tổ chức này được phép thực hiện. Đây là "whitelist" - danh sách những gì được phép làm.

### **Chức năng trong RBAC**
- Thiết lập quyền cơ bản cho từng cấp độ tổ chức
- Định nghĩa phạm vi truy cập tài nguyên
- Xác định các hành động được phép thực hiện
- Làm cơ sở cho việc kiểm tra quyền đầu tiên

### **Cấu trúc Dữ liệu Chuẩn**

```json
{
  "resources": {
    "customers": ["read", "create", "update", "delete"],
    "orders": ["read", "create", "update", "delete"],
    "products": ["read", "create", "update", "delete"],
    "reports": ["read", "create", "export", "share"],
    "settings": ["read", "update"],
    "users": ["read", "create", "update", "deactivate"],
    "departments": ["read", "create", "update"],
    "kpis": ["read", "create", "update", "delete"]
  },
  "actions": {
    "data_export": true,
    "bulk_operations": true,
    "admin_functions": true,
    "cross_department_view": true,
    "escalation_approve": true,
    "budget_approve": true
  },
  "restrictions": {
    "max_records_per_query": 1000,
    "max_export_size": 50000,
    "working_hours_only": false,
    "approval_required": false
  }
}
```

### **Ví dụ theo Cấp độ Tổ chức**

#### **CEO (hierarchyLevel: 1) - Quyền Tối cao**
```json
{
  "resources": {
    "customers": ["read", "create", "update", "delete"],
    "orders": ["read", "create", "update", "delete"],
    "products": ["read", "create", "update", "delete"],
    "reports": ["read", "create", "export", "share"],
    "settings": ["read", "update"],
    "users": ["read", "create", "update", "deactivate"],
    "departments": ["read", "create", "update"],
    "kpis": ["read", "create", "update", "delete"],
    "financial_data": ["read", "create", "update", "delete"],
    "strategic_plans": ["read", "create", "update", "delete"]
  },
  "actions": {
    "data_export": true,
    "bulk_operations": true,
    "admin_functions": true,
    "cross_department_view": true,
    "escalation_approve": true,
    "budget_approve": true,
    "system_configuration": true,
    "user_management": true
  },
  "restrictions": {
    "max_records_per_query": -1,
    "max_export_size": -1,
    "working_hours_only": false,
    "approval_required": false
  }
}
```

#### **Department Manager (hierarchyLevel: 3) - Quyền Quản lý**
```json
{
  "resources": {
    "customers": ["read", "create", "update"],
    "orders": ["read", "create", "update"],
    "products": ["read", "update"],
    "reports": ["read", "create", "export"],
    "settings": [],
    "users": ["read"],
    "departments": ["read"],
    "kpis": ["read", "create", "update"]
  },
  "actions": {
    "data_export": true,
    "bulk_operations": true,
    "admin_functions": false,
    "cross_department_view": false,
    "escalation_approve": false,
    "budget_approve": false
  },
  "restrictions": {
    "max_records_per_query": 5000,
    "max_export_size": 100000,
    "working_hours_only": false,
    "approval_required": false
  }
}
```

#### **Staff (hierarchyLevel: 5) - Quyền Cơ bản**
```json
{
  "resources": {
    "customers": ["read", "create"],
    "orders": ["read", "create"],
    "products": ["read"],
    "reports": ["read"],
    "settings": [],
    "users": [],
    "departments": [],
    "kpis": ["read"]
  },
  "actions": {
    "data_export": false,
    "bulk_operations": false,
    "admin_functions": false,
    "cross_department_view": false,
    "escalation_approve": false,
    "budget_approve": false
  },
  "restrictions": {
    "max_records_per_query": 1000,
    "max_export_size": 10000,
    "working_hours_only": true,
    "approval_required": true
  }
}
```

#### **Intern (hierarchyLevel: 6) - Quyền Hạn chế**
```json
{
  "resources": {
    "customers": ["read"],
    "orders": ["read"],
    "products": ["read"],
    "reports": [],
    "settings": [],
    "users": [],
    "departments": [],
    "kpis": []
  },
  "actions": {
    "data_export": false,
    "bulk_operations": false,
    "admin_functions": false,
    "cross_department_view": false,
    "escalation_approve": false,
    "budget_approve": false
  },
  "restrictions": {
    "max_records_per_query": 500,
    "max_export_size": 0,
    "working_hours_only": true,
    "approval_required": true
  }
}
```

## **2. accessLimitations (Giới hạn Truy cập)**

### **Định nghĩa**
`accessLimitations` là trường TEXT chứa cấu trúc JSON định nghĩa các ràng buộc và giới hạn cụ thể áp dụng cho cấp độ tổ chức này. Đây là "blacklist" và "conditional list" - những gì bị cấm hoặc cần điều kiện đặc biệt.

### **Chức năng trong RBAC**
- Ghi đè và hạn chế quyền được định nghĩa trong defaultPermissions
- Áp dụng các ràng buộc thời gian, địa điểm, bảo mật
- Định nghĩa các điều kiện phê duyệt
- Đảm bảo tuân thủ chính sách bảo mật

### **Cấu trúc Dữ liệu Chuẩn**

```json
{
  "temporal": {
    "working_hours": {
      "enabled": true,
      "start": "08:00",
      "end": "18:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "weekdays_only": true
    },
    "session_timeout": 3600,
    "max_daily_hours": 8
  },
  "data_access": {
    "sensitive_fields": ["salary", "personal_id", "bank_account"],
    "restricted_departments": ["hr", "finance"],
    "data_retention_days": 90,
    "own_records_only": false
  },
  "operational": {
    "max_concurrent_sessions": 3,
    "ip_restrictions": ["192.168.1.0/24"],
    "require_2fa": true,
    "audit_all_actions": true
  },
  "functional": {
    "blocked_actions": ["delete_customer", "modify_order_status"],
    "require_approval": ["bulk_export", "cross_dept_access"],
    "escalation_required": ["financial_data", "confidential_reports"]
  }
}
```

### **Ví dụ theo Cấp độ Tổ chức**

#### **CEO (hierarchyLevel: 1) - Giới hạn Tối thiểu**
```json
{
  "temporal": {
    "working_hours": {
      "enabled": false
    },
    "session_timeout": 14400
  },
  "data_access": {
    "sensitive_fields": [],
    "restricted_departments": [],
    "data_retention_days": -1
  },
  "operational": {
    "max_concurrent_sessions": -1,
    "ip_restrictions": [],
    "require_2fa": true,
    "audit_all_actions": true
  },
  "functional": {
    "blocked_actions": [],
    "require_approval": ["system_shutdown", "database_backup"],
    "escalation_required": []
  }
}
```

#### **Department Manager (hierarchyLevel: 3) - Giới hạn Trung bình**
```json
{
  "temporal": {
    "working_hours": {
      "enabled": true,
      "start": "07:00",
      "end": "20:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "weekdays_only": false
    },
    "session_timeout": 7200
  },
  "data_access": {
    "sensitive_fields": ["personal_id", "bank_account"],
    "restricted_departments": ["hr"],
    "data_retention_days": 180
  },
  "operational": {
    "max_concurrent_sessions": 5,
    "ip_restrictions": [],
    "require_2fa": true,
    "audit_all_actions": true
  },
  "functional": {
    "blocked_actions": ["delete_user", "system_configuration"],
    "require_approval": ["large_data_export", "department_budget_changes"],
    "escalation_required": ["hr_data_access"]
  }
}
```

#### **Staff (hierarchyLevel: 5) - Giới hạn Cao**
```json
{
  "temporal": {
    "working_hours": {
      "enabled": true,
      "start": "08:00",
      "end": "18:00",
      "timezone": "Asia/Ho_Chi_Minh",
      "weekdays_only": true
    },
    "session_timeout": 3600,
    "max_daily_hours": 8
  },
  "data_access": {
    "sensitive_fields": ["salary", "personal_id", "bank_account", "profit_margin"],
    "restricted_departments": ["hr", "finance", "executive"],
    "data_retention_days": 60,
    "own_records_only": false
  },
  "operational": {
    "max_concurrent_sessions": 2,
    "ip_restrictions": ["192.168.1.0/24"],
    "require_2fa": false,
    "audit_all_actions": true
  },
  "functional": {
    "blocked_actions": [
      "delete_any_record",
      "bulk_operations",
      "admin_functions",
      "export_data"
    ],
    "require_approval": [
      "create_high_value_customer",
      "update_important_data",
      "access_historical_data"
    ],
    "escalation_required": [
      "customer_complaints",
      "data_discrepancies",
      "system_errors"
    ]
  }
}
```

#### **Intern (hierarchyLevel: 6) - Giới hạn Tối đa**
```json
{
  "temporal": {
    "working_hours": {
      "enabled": true,
      "start": "08:30",
      "end": "17:30",
      "timezone": "Asia/Ho_Chi_Minh",
      "weekdays_only": true
    },
    "session_timeout": 1800,
    "max_daily_hours": 6,
    "break_required": true
  },
  "data_access": {
    "sensitive_fields": [
      "salary", "personal_id", "bank_account",
      "profit_margin", "cost", "revenue", "financial_data"
    ],
    "restricted_departments": ["hr", "finance", "executive", "legal"],
    "data_retention_days": 30,
    "own_records_only": true,
    "supervisor_approval_required": true
  },
  "operational": {
    "max_concurrent_sessions": 1,
    "ip_restrictions": ["192.168.1.100/32"],
    "require_2fa": false,
    "audit_all_actions": true,
    "supervisor_oversight": true,
    "screen_recording": true
  },
  "functional": {
    "blocked_actions": [
      "delete_any_record",
      "modify_any_record",
      "export_data",
      "create_reports",
      "approve_anything",
      "escalate_to_external"
    ],
    "require_approval": [
      "create_customer",
      "update_customer_info",
      "access_customer_history",
      "view_reports",
      "contact_customers"
    ],
    "escalation_required": [
      "any_financial_data",
      "customer_complaints",
      "system_errors",
      "data_access_outside_scope",
      "unusual_activity"
    ]
  }
}
```

## **3. Cách Hoạt động trong Hệ thống RBAC**

### **Quy trình Kiểm tra Permission**

```
1. Authenticate User
   ↓
2. Get Organization Level Context
   ↓
3. Load defaultPermissions
   ↓
4. Check Basic Permission in defaultPermissions
   ├── NOT FOUND → DENY
   └── FOUND → Continue
   ↓
5. Load accessLimitations
   ↓
6. Check Blocked Actions
   ├── FOUND IN blocked_actions → DENY
   └── NOT FOUND → Continue
   ↓
7. Check Temporal Restrictions
   ├── OUTSIDE working_hours → DENY
   ├── SESSION timeout → DENY
   └── VALID → Continue
   ↓
8. Check Data Access Restrictions
   ├── SENSITIVE field access → DENY
   ├── RESTRICTED department → DENY
   └── ALLOWED → Continue
   ↓
9. Check Operational Restrictions
   ├── TOO MANY sessions → DENY
   ├── INVALID IP → DENY
   └── VALID → Continue
   ↓
10. Check Approval Requirements
    ├── REQUIRE approval → CONDITIONAL GRANT
    ├── REQUIRE escalation → ESCALATION
    └── NO CONDITIONS → GRANT
```

### **Nguyên tắc Ưu tiên**

1. **accessLimitations.blocked_actions** → **DENY tuyệt đối** (cao nhất)
2. **accessLimitations.temporal** → **DENY theo thời gian**
3. **defaultPermissions** → **GRANT cơ bản**
4. **accessLimitations.require_approval** → **CONDITIONAL GRANT**
5. **accessLimitations.escalation_required** → **ESCALATION**

## **4. Ví dụ Thực tế**

### **Trường hợp 1: Staff Export Customer Data**

**Tình huống**:
- User: Marketing Staff (Level: Staff)
- Action: export
- Resource: customers
- Time: 14:00 (thứ 3)

**Quy trình kiểm tra**:

```
1. Load defaultPermissions (Staff):
   - actions.data_export = false
   → DENY ngay tại bước này

Kết quả: ❌ DENIED
Lý do: Staff không có quyền export cơ bản
```

### **Trường hợp 2: Manager Access Financial Reports Ngoài giờ**

**Tình huống**:
- User: Sales Manager (Level: Department Manager)
- Action: read
- Resource: financial_reports
- Time: 22:00 (thứ 6)

**Quy trình kiểm tra**:

```
1. Load defaultPermissions (Manager):
   - resources.reports = ["read", "create", "export"]
   → GRANT cơ bản ✅

2. Load accessLimitations (Manager):
   - blocked_actions: không chứa "read" ✅

3. Check temporal restrictions:
   - working_hours.enabled = true
   - working_hours: 07:00-20:00
   - current_time: 22:00 (ngoài khung giờ)
   → DENY

Kết quả: ❌ DENIED
Lý do: Ngoài giờ làm việc được phép (07:00-20:00)
```

### **Trường hợp 3: Intern Create Customer**

**Tình huống**:
- User: Sales Intern (Level: Intern)
- Action: create
- Resource: customers
- Time: 14:00 (thứ 3)

**Quy trình kiểm tra**:

```
1. Load defaultPermissions (Intern):
   - resources.customers = ["read"]
   - Không có "create" permission
   → DENY

Kết quả: ❌ DENIED
Lý do: Intern không có quyền tạo customer
```

### **Trường hợp 4: Manager Create Large Export**

**Tình huống**:
- User: Marketing Manager (Level: Department Manager)
- Action: bulk_export
- Resource: customer_database
- Time: 10:00 (thứ 2)
- Size: 80,000 records

**Quy trình kiểm tra**:

```
1. Load defaultPermissions (Manager):
   - actions.data_export = true
   - actions.bulk_operations = true
   → GRANT cơ bản ✅

2. Load accessLimitations (Manager):
   - blocked_actions: không chứa "bulk_export" ✅

3. Check temporal restrictions:
   - working_hours: 07:00-20:00, current: 10:00 ✅

4. Check functional restrictions:
   - require_approval: chứa "large_data_export"
   → REQUIRE APPROVAL

Kết quả: ⚠️ CONDITIONAL GRANT
Lý do: Cần phê duyệt từ cấp trên cho việc export dữ liệu lớn
```

### **Trường hợp 5: CEO System Configuration**

**Tình huống**:
- User: CEO (Level: CEO)
- Action: system_configuration
- Resource: database_settings
- Time: 23:00 (chủ nhật)

**Quy trình kiểm tra**:

```
1. Load defaultPermissions (CEO):
   - actions.system_configuration = true
   → GRANT cơ bản ✅

2. Load accessLimitations (CEO):
   - blocked_actions: [] (rỗng) ✅

3. Check temporal restrictions:
   - working_hours.enabled = false ✅

4. Check functional restrictions:
   - require_approval: chứa "system_shutdown", "database_backup"
   - "system_configuration" không có trong danh sách
   → GRANT

Kết quả: ✅ GRANTED
Lý do: CEO có quyền tối cao, không bị giới hạn thời gian
```

## **5. Mối Quan hệ defaultPermissions vs accessLimitations**

### **Bảng So sánh**

| Khía cạnh | defaultPermissions | accessLimitations |
|-----------|-------------------|-------------------|
| **Mục đích** | Định nghĩa quyền cơ bản | Áp đặt giới hạn và điều kiện |
| **Kiểu logic** | Whitelist (cho phép) | Blacklist + Conditional |
| **Thứ tự kiểm tra** | Kiểm tra đầu tiên | Kiểm tra sau, có thể override |
| **Khi nào áp dụng** | Luôn luôn | Chỉ khi có điều kiện cụ thể |
| **Tác động** | GRANT/DENY cơ bản | DENY/CONDITIONAL/ESCALATION |

### **Ma trận Quyết định**

| defaultPermissions | accessLimitations | Kết quả cuối cùng |
|-------------------|-------------------|-------------------|
| DENY | Bất kỳ | ❌ DENY |
| GRANT | blocked_actions | ❌ DENY |
| GRANT | temporal violation | ❌ DENY |
| GRANT | require_approval | ⚠️ CONDITIONAL |
| GRANT | escalation_required | 🔄 ESCALATION |
| GRANT | Không giới hạn | ✅ GRANT |

## **6. Best Practices**

### **Thiết kế defaultPermissions**
- Áp dụng nguyên tắc **Least Privilege** - chỉ cấp quyền tối thiểu cần thiết
- Cấu trúc theo tài nguyên và hành động rõ ràng
- Sử dụng mảng để liệt kê các hành động được phép
- Đặt giá trị -1 cho "unlimited" ở cấp độ cao

### **Thiết kế accessLimitations**
- Ưu tiên sử dụng `blocked_actions` cho các hành động tuyệt đối cấm
- Áp dụng `temporal` restrictions cho kiểm soát thời gian
- Sử dụng `require_approval` cho các hành động nhạy cảm
- Đặt `escalation_required` cho các tình huống cần leo thang

### **Bảo mật**
- Luôn validate cả hai trường khi kiểm tra quyền
- Log tất cả các quyết định DENY và CONDITIONAL
- Định kỳ review và cập nhật permissions
- Sử dụng versioning cho việc thay đổi permissions

### **Performance**
- Cache kết quả permission checking với TTL phù hợp
- Index các trường thường xuyên query
- Sử dụng lazy loading cho dữ liệu lớn
- Optimize JSON parsing cho các cấu trúc phức tạp

---

**Lưu ý**: Tài liệu này mô tả cấu trúc dữ liệu và logic xử lý. Trong triển khai thực tế, cần có các layer validation, caching và error handling phù hợp để đảm bảo hiệu suất và bảo mật.