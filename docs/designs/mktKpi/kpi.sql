-- === ENUM VALUES (Defined in source code, not database) ===
-- These are TEXT fields with allowed values defined in TypeScript/GraphQL schemas
-- 
-- KPI Types: 'REVENUE', 'NEW_CUSTOMERS', 'CONVERSION_RATE', 'CALLS', 'DEMOS', 
--           'DEALS_CLOSED', 'RETENTION_RATE', 'SATISFACTION_SCORE', 'RESPONSE_TIME', 'CUSTOM'
--
-- Period Types: 'DAILY', 'WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'
--
-- Status Types: 'DRAFT', 'IN_PROGRESS', 'ACHIEVED', 'NOT_ACHIEVED', 'EXCEEDED', 'CANCELLED'
--
-- Category Types: 'SALES', 'MARKETING', 'SUPPORT', 'OPERATIONS'
--
-- Priority Types: 'HIGH', 'MEDIUM', 'LOW'
--
-- Assignee Types: 'INDIVIDUAL', 'DEPARTMENT', 'TEAM'
--
-- Source Types: 'MANUAL', 'API', 'IMPORT', 'SYSTEM', 'AUTOMATIC', 'BULK_UPDATE'
--
-- Change Types: 'TARGET_UPDATED', 'ACTUAL_UPDATED', 'STATUS_CHANGED', 'ASSIGNED', 'CONFIGURATION_CHANGED'
--
-- Unit Types: 'VND', 'USD', 'PERCENT', 'COUNT', 'HOURS', 'DAYS', 'MINUTES'
--
-- Metric Types: 'REVENUE', 'COUNT', 'PERCENTAGE', 'DURATION', 'RATE', 'SCORE'

-- === MAIN TABLES ===

CREATE TABLE mktKpi
(
    -- === SYSTEM FIELDS (Theo chuẩn Twenty.com) ===
    id                         UUID             NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- ID duy nhất của KPI, được tạo tự động bằng UUID version 4

    createdAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm tạo KPI, tự động gán = thời gian hiện tại

    updatedAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm cập nhật cuối cùng, tự động update mỗi lần sửa

    deletedAt                  TIMESTAMPTZ,
    -- Thời điểm xóa KPI (soft delete), NULL = chưa xóa

    position                   DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- Vị trí sắp xếp hiển thị trong danh sách (để drag & drop)

    -- === METADATA CREATION (Theo chuẩn Twenty.com) ===
    createdBySource            TEXT             NOT NULL DEFAULT 'MANUAL',
    -- Nguồn tạo: MANUAL (thủ công), API (qua API), IMPORT (nhập file), SYSTEM (tự động)

    createdByWorkspaceMemberId UUID,
    -- ID của nhân viên tạo KPI này (link đến workspaceMember)

    createdByName              TEXT             NOT NULL DEFAULT 'System',
    -- Tên người tạo (backup, có thể khác với workspaceMember nếu tạo qua API)

    createdByContext           JSONB                     DEFAULT '{}',
    -- Context thêm về việc tạo KPI: {"importFile": "kpi.xlsx", "apiKey": "xxx"}

    -- === THÔNG TIN CƠ BẢN CỦA KPI ===
    kpiName                    TEXT             NOT NULL DEFAULT '',
    -- Tên hiển thị của KPI
    -- VD: "Doanh số bán hàng tháng 1/2025", "Số khách hàng mới Q1"

    kpiCode                    TEXT             NOT NULL DEFAULT '',
    -- Mã KPI duy nhất, dùng để tham chiếu và tự động hóa
    -- VD: "REV_202501_NGUYEN_VAN_A", "NEW_CUST_Q1_2025_SALES_TEAM"

    kpiType                    TEXT             NOT NULL DEFAULT 'REVENUE',
    -- Loại KPI chính: REVENUE (doanh thu), NEW_CUSTOMERS (khách mới),
    -- CONVERSION_RATE (tỷ lệ chuyển đổi), CALLS (cuộc gọi), DEMOS (demo)

    kpiCategory                TEXT             NOT NULL DEFAULT 'SALES',
    -- Phân loại nghiệp vụ: SALES (bán hàng), SUPPORT (hỗ trợ),
    -- MARKETING (marketing), OPERATIONS (vận hành)

    -- === GIÁ TRỊ MUC TIÊU VÀ THỰC TẾ ===
    targetValue                DECIMAL(15, 2)   NOT NULL DEFAULT 0,
    -- Mục tiêu cần đạt được
    -- VD: 50000000 (50 triệu VND), 15 (15 khách hàng), 85.5 (85.5% tỷ lệ)

    actualValue                DECIMAL(15, 2)   NOT NULL DEFAULT 0,
    -- Giá trị thực tế đã đạt được hiện tại
    -- Được cập nhật thủ công hoặc tự động từ hệ thống

    unitOfMeasure              TEXT                      DEFAULT 'VND',
    -- Đơn vị đo lường: VND, USD, PERCENT (%), COUNT (số lượng),
    -- HOURS (giờ), DAYS (ngày)

    -- === THỜI GIAN VÀ KỲ HẠN ===
    periodType                 TEXT             NOT NULL DEFAULT 'MONTHLY',
    -- Loại kỳ đo: DAILY (hàng ngày), WEEKLY (hàng tuần),
    -- MONTHLY (hàng tháng), QUARTERLY (hàng quý), YEARLY (hàng năm)

    periodYear                 INTEGER          NOT NULL,
    -- Năm áp dụng KPI (VD: 2025)

    periodQuarter              INTEGER          CHECK (periodQuarter >= 1 AND periodQuarter <= 4),
    -- Quý trong năm (1,2,3,4) - chỉ dùng khi periodType = QUARTERLY

    periodMonth                INTEGER          CHECK (periodMonth >= 1 AND periodMonth <= 12),
    -- Tháng trong năm (1-12) - dùng khi periodType = MONTHLY hoặc cụ thể hơn

    periodWeek                 INTEGER          CHECK (periodWeek >= 1 AND periodWeek <= 53),
    -- Tuần trong năm (1-53) - dùng khi periodType = WEEKLY

    periodStartDate            DATE,
    -- Ngày bắt đầu chính xác của kỳ KPI (có thể khác với đầu tháng/quý)

    periodEndDate              DATE,
    -- Ngày kết thúc chính xác của kỳ KPI

    -- === PHÂN CÔNG VÀ NGƯỜI PHỤ TRÁCH ===
    assigneeType               TEXT             NOT NULL DEFAULT 'INDIVIDUAL',
    -- Loại đối tượng được giao KPI:
    -- INDIVIDUAL (cá nhân), DEPARTMENT (phòng ban), TEAM (nhóm)

    assigneeWorkspaceMemberId  UUID,
    -- ID nhân viên được giao KPI (khi assigneeType = INDIVIDUAL)
    -- Link tới bảng workspaceMember

    assigneeDepartmentId       UUID,
    -- ID phòng ban được giao KPI (khi assigneeType = DEPARTMENT/TEAM)
    -- Link tới bảng mktDepartment

    -- === TRẠNG THÁI VÀ TIẾN ĐỘ ===
    status                     TEXT             NOT NULL DEFAULT 'IN_PROGRESS',
    -- Trạng thái KPI: DRAFT (nháp), IN_PROGRESS (đang thực hiện),
    -- ACHIEVED (đã đạt), NOT_ACHIEVED (chưa đạt), EXCEEDED (vượt mục tiêu),
    -- CANCELLED (đã hủy)

    progressPercentage         DECIMAL(5, 2) GENERATED ALWAYS AS 
        (CASE 
            WHEN targetValue > 0 THEN LEAST((actualValue / targetValue) * 100, 999.99)
            ELSE 0 
        END) STORED,
    -- Phần trăm hoàn thành (0.00 - 999.99) - tính tự động từ actualValue/targetValue

    achievedAt                 TIMESTAMPTZ,
    -- Thời điểm chính thức đạt được KPI (khi status = ACHIEVED)

    -- === CẤU HÌNH TÍNH TOÁN ===
    isAutoCalculated           BOOLEAN                   DEFAULT false,
    -- KPI có được tính tự động từ dữ liệu hệ thống không?
    -- true = tự động cập nhật từ đơn hàng, khách hàng, v.v.
    -- false = cập nhật thủ công

    calculationFormula         TEXT,
    -- Công thức tính toán (khi isAutoCalculated = true)
    -- VD: "SUM(mktOrder.totalAmount WHERE salesPersonId = @assigneeId AND period = @period)"

    alertThresholds            JSONB                     DEFAULT '{}',
    -- Ngưỡng cảnh báo dạng JSON
    -- VD: {"warning": 70, "danger": 90, "critical": 95} (% hoàn thành để báo động)

    -- === THÔNG TIN BỔ SUNG ===
    description                TEXT                      DEFAULT '',
    -- Mô tả chi tiết về KPI này

    notes                      TEXT                      DEFAULT '',
    -- Ghi chú, lưu ý đặc biệt từ manager hoặc HR

    priority                   TEXT                      DEFAULT 'MEDIUM',
    -- Mức độ ưu tiên: HIGH (cao), MEDIUM (trung bình), LOW (thấp)

    weight                     DECIMAL(5, 2)             DEFAULT 1.0,
    -- Trọng số của KPI này trong tính toán tổng thể
    -- VD: KPI doanh số có weight = 0.6, KPI khách mới có weight = 0.4

    -- === CONSTRAINTS ===
    CONSTRAINT chk_progress_percentage CHECK (progressPercentage >= 0),
    CONSTRAINT chk_weight_positive CHECK (weight > 0),
    CONSTRAINT chk_target_positive CHECK (targetValue >= 0),
    CONSTRAINT chk_actual_positive CHECK (actualValue >= 0),
    CONSTRAINT chk_period_dates CHECK (periodEndDate IS NULL OR periodStartDate IS NULL OR periodEndDate >= periodStartDate),
    CONSTRAINT uk_kpi_code UNIQUE (kpiCode),

    -- === FOREIGN KEYS ===
    FOREIGN KEY (createdByWorkspaceMemberId) REFERENCES workspaceMember (id),
    FOREIGN KEY (assigneeWorkspaceMemberId) REFERENCES workspaceMember (id),
    FOREIGN KEY (assigneeDepartmentId) REFERENCES mktDepartment (id)
);

CREATE TABLE mktKpiHistory
(
    -- === SYSTEM FIELDS ===
    id                         UUID             NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- ID duy nhất của bản ghi lịch sử

    createdAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm ghi nhận thay đổi

    updatedAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm cập nhật bản ghi lịch sử (hiếm khi dùng)

    deletedAt                  TIMESTAMPTZ,
    -- Xóa mềm bản ghi lịch sử (rất hiếm khi cần)

    position                   DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- Thứ tự sắp xếp trong danh sách lịch sử

    -- === METADATA ===
    createdBySource            TEXT             NOT NULL DEFAULT 'MANUAL',
    -- Nguồn ghi nhận: MANUAL, API, SYSTEM (tự động)

    createdByWorkspaceMemberId UUID,
    -- Người ghi nhận thay đổi này

    createdByName              TEXT             NOT NULL DEFAULT 'System',
    -- Tên người ghi nhận (backup)

    createdByContext           JSONB                     DEFAULT '{}',
    -- Context thêm: {"reason": "monthly_review", "batchId": "xxx"}

    -- === LIÊN KẾT VỚI KPI ===
    kpiId                      UUID             NOT NULL,
    -- ID của KPI bị thay đổi (tham chiếu tới mktKpi)

    -- === THÔNG TIN THAY ĐỔI ===
    changeType                 TEXT             NOT NULL,
    -- Loại thay đổi: TARGET_UPDATED, ACTUAL_UPDATED, STATUS_CHANGED, ASSIGNED, CONFIGURATION_CHANGED

    oldValue                   JSONB,
    -- Giá trị cũ trước khi thay đổi (dạng JSON)
    -- VD: {"targetValue": 50000000, "status": "IN_PROGRESS"}

    newValue                   JSONB,
    -- Giá trị mới sau khi thay đổi
    -- VD: {"targetValue": 60000000, "status": "IN_PROGRESS"}

    changeReason               TEXT,
    -- Lý do thay đổi (ngắn gọn)
    -- VD: "Điều chỉnh target theo kế hoạch Q1", "Đạt mục tiêu sớm"

    changeDescription          TEXT,
    -- Mô tả chi tiết về thay đổi

    -- === CONTEXT THAY ĐỔI ===
    changedByWorkspaceMemberId UUID,
    -- Người thực hiện thay đổi (có thể khác với createdBy)

    changeSource               TEXT                      DEFAULT 'MANUAL',
    -- Nguồn thay đổi: MANUAL (thủ công), AUTOMATIC (tự động), API (qua API), BULK_UPDATE (cập nhật hàng loạt)

    changeTimestamp            TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm chính xác của thay đổi

    -- === DỮ LIỆU BỔ SUNG ===
    additionalData             JSONB                     DEFAULT '{}',
    -- Dữ liệu thêm về thay đổi
    -- VD: {"automaticTrigger": "order_completed", "orderId": "xxx"}

    -- === FOREIGN KEYS ===
    FOREIGN KEY (kpiId) REFERENCES mktKpi (id) ON DELETE CASCADE,
    FOREIGN KEY (createdByWorkspaceMemberId) REFERENCES workspaceMember (id),
    FOREIGN KEY (changedByWorkspaceMemberId) REFERENCES workspaceMember (id)
);

CREATE TABLE mktKpiTemplate
(
    -- === SYSTEM FIELDS ===
    id                         UUID             NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- ID duy nhất của template KPI

    createdAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm tạo template

    updatedAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm cập nhật template gần nhất

    deletedAt                  TIMESTAMPTZ,
    -- Xóa mềm template (khi không sử dụng nữa)

    position                   DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- Thứ tự hiển thị trong danh sách template

    -- === METADATA ===
    createdBySource            TEXT             NOT NULL DEFAULT 'MANUAL',
    -- Nguồn tạo template: MANUAL, IMPORT, API

    createdByWorkspaceMemberId UUID,
    -- HR hoặc Manager tạo template này

    createdByName              TEXT             NOT NULL DEFAULT 'System',
    -- Tên người tạo

    createdByContext           JSONB                     DEFAULT '{}',
    -- Context: {"importedFrom": "hr_system", "version": "v2"}

    -- === THÔNG TIN TEMPLATE ===
    templateName               TEXT             NOT NULL DEFAULT '',
    -- Tên template
    -- VD: "KPI Sales Rep Doanh số", "KPI Senior Sales Khách hàng mới"

    templateCode               TEXT             NOT NULL DEFAULT '',
    -- Mã template duy nhất (để code tham chiếu)
    -- VD: "SALES_REP_REVENUE", "SENIOR_SALES_NEW_CUSTOMERS"

    description                TEXT                      DEFAULT '',
    -- Mô tả mục đích và cách sử dụng template

    -- === ĐỐI TƯỢNG ÁP DỤNG ===
    targetRole                 TEXT                      DEFAULT '',
    -- Vị trí công việc áp dụng template này
    -- VD: "SALES_REP", "SENIOR_SALES", "TEAM_LEADER", "SALES_MANAGER"

    targetDepartmentId         UUID,
    -- Phòng ban áp dụng (nếu specific cho department)
    -- Link tới mktDepartment

    -- === CẤU HÌNH KPI MẶC ĐỊNH ===
    kpiType                    TEXT             NOT NULL,
    -- Loại KPI sẽ tạo: REVENUE, NEW_CUSTOMERS, CONVERSION_RATE, etc.

    kpiCategory                TEXT             NOT NULL DEFAULT 'SALES',
    -- Phân loại: SALES, SUPPORT, MARKETING, OPERATIONS

    unitOfMeasure              TEXT                      DEFAULT 'VND',
    -- Đơn vị đo mặc định: VND, USD, PERCENT, COUNT

    defaultTargetValue         DECIMAL(15, 2)            DEFAULT 0,
    -- Mục tiêu mặc định khi tạo KPI từ template
    -- VD: Sales Rep = 50M VND, Senior Sales = 100M VND

    periodType                 TEXT             NOT NULL DEFAULT 'MONTHLY',
    -- Kỳ đo mặc định: MONTHLY, QUARTERLY, YEARLY

    -- === TÍNH TOÁN TỰ ĐỘNG ===
    isAutoCalculated           BOOLEAN                   DEFAULT false,
    -- KPI tạo từ template có tự động tính không?

    calculationFormula         TEXT,
    -- Công thức tính mặc định
    -- VD: "SUM(orders.total WHERE sales_id = @assignee AND period = @period)"

    -- === CẤU HÌNH TEMPLATE ===
    isActive                   BOOLEAN                   DEFAULT true,
    -- Template có đang hoạt động không? (để ẩn/hiện)

    isDefault                  BOOLEAN                   DEFAULT false,
    -- Có phải template mặc định cho role này không?
    -- Khi tạo nhân viên mới sẽ tự động áp dụng

    priority                   TEXT                      DEFAULT 'MEDIUM',
    -- Mức độ ưu tiên mặc định: HIGH, MEDIUM, LOW

    weight                     DECIMAL(5, 2)             DEFAULT 1.0,
    -- Trọng số mặc định trong tính toán tổng thể

    -- === CẤU HÌNH NÂNG CAO ===
    templateConfig             JSONB                     DEFAULT '{}',
    -- Cấu hình phức tạp dạng JSON
    -- VD: {
    --   "alertThresholds": {"warning": 70, "danger": 90},
    --   "autoAssignRules": {...},
    --   "reportingSchedule": "weekly"
    -- }

    -- === CONSTRAINTS ===
    CONSTRAINT chk_template_weight_positive CHECK (weight > 0),
    CONSTRAINT chk_template_target_positive CHECK (defaultTargetValue >= 0),
    CONSTRAINT uk_template_code UNIQUE (templateCode),

    -- === FOREIGN KEYS ===
    FOREIGN KEY (createdByWorkspaceMemberId) REFERENCES workspaceMember (id),
    FOREIGN KEY (targetDepartmentId) REFERENCES mktDepartment (id)
);

CREATE TABLE mktKpiMetric
(
    -- === SYSTEM FIELDS ===
    id                         UUID             NOT NULL DEFAULT uuid_generate_v4() PRIMARY KEY,
    -- ID duy nhất của metric

    createdAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm ghi nhận metric

    updatedAt                  TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm cập nhật metric

    deletedAt                  TIMESTAMPTZ,
    -- Xóa mềm metric (khi cần cleanup data cũ)

    position                   DOUBLE PRECISION NOT NULL DEFAULT 0,
    -- Thứ tự sắp xếp

    -- === METADATA ===
    createdBySource            mktKpi_source_enum NOT NULL DEFAULT 'AUTOMATIC',
    -- Nguồn thu thập: AUTOMATIC (hệ thống), MANUAL (nhập tay), API

    createdByWorkspaceMemberId UUID,
    -- Người ghi nhận metric (nếu manual)

    createdByName              TEXT             NOT NULL DEFAULT 'System',
    -- Tên nguồn ghi nhận

    createdByContext           JSONB                     DEFAULT '{}',
    -- Context: {"triggerEvent": "order_completed", "batchId": "daily_sync"}

    -- === THÔNG TIN METRIC ===
    metricName                 TEXT             NOT NULL DEFAULT '',
    -- Tên metric
    -- VD: "Doanh số ngày", "Số khách hàng mới", "Thời gian phản hồi trung bình"

    metricType                 TEXT             NOT NULL,
    -- Loại metric: REVENUE, COUNT, PERCENTAGE, DURATION, RATE, SCORE

    metricValue                DECIMAL(15, 2)   NOT NULL DEFAULT 0,
    -- Giá trị metric đo được
    -- VD: 5000000 (5M VND), 3 (3 khách hàng), 95.5 (95.5%)

    metricUnit                 TEXT                      DEFAULT 'COUNT',
    -- Đơn vị cụ thể: VND, USD, MINUTES, HOURS, PERCENTAGE

    -- === THÔNG TIN THỜI GIAN ===
    measurementDate            DATE             NOT NULL,
    -- Ngày đo metric này (để group theo ngày)

    measurementTime            TIMESTAMPTZ      NOT NULL DEFAULT now(),
    -- Thời điểm chính xác đo metric

    periodType                 mktKpi_periodType_enum NOT NULL DEFAULT 'DAILY',
    -- Kỳ đo: HOURLY, DAILY, WEEKLY (để biết metric này thuộc kỳ nào)

    -- === THÔNG TIN NGUỒN DỮ LIỆU ===
    sourceEntity               TEXT,
    -- Entity nguồn tạo ra metric này
    -- VD: "mktOrder", "person", "mktLicense", "calendarEvent"

    sourceEntityId             UUID,
    -- ID cụ thể của record nguồn (nếu có)
    -- VD: ID của đơn hàng, ID khách hàng

    relatedKpiIds              UUID[],
    -- Array các KPI ID sử dụng metric này
    -- VD: [kpi_doanh_so_thang, kpi_doanh_so_quy] cùng dùng metric doanh số ngày

    -- === PHÂN CÔNG ===
    workspaceMemberId          UUID,
    -- Metric này thuộc về nhân viên nào (VD: doanh số của sales A)

    departmentId               UUID,
    -- Metric này thuộc về department nào (VD: tổng cuộc gọi của team sales)

    -- === DỮ LIỆU BỔ SUNG ===
    additionalData             JSONB                     DEFAULT '{}',
    -- Dữ liệu thêm về metric
    -- VD: {
    --   "orderDetails": {"productType": "MKT_CARE", "customerType": "ENTERPRISE"},
    --   "calculationMethod": "sum_by_sales_person",
    --   "qualityScore": 95
    -- }

    tags                       TEXT[]                    DEFAULT '{}',
    -- Tags để group và filter
    -- VD: ["high_value", "enterprise_customer", "recurring_revenue"]

    -- === CONSTRAINTS ===
    CONSTRAINT chk_metric_value_positive CHECK (metricValue >= 0),

    -- === FOREIGN KEYS ===
    FOREIGN KEY (createdByWorkspaceMemberId) REFERENCES workspaceMember (id),
    FOREIGN KEY (workspaceMemberId) REFERENCES workspaceMember (id),
    FOREIGN KEY (departmentId) REFERENCES mktDepartment (id)
);