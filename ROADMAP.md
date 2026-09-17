# Crove CRM — Product & Engineering Roadmap

> **Phiên bản:** 2026.Q3  
> **Nền tảng cốt lõi:** Crove CRM (Twenty CRM Fork + Crove OS Ecosystem)  
> **Mục tiêu:** Xây dựng giải pháp CRM & Omni-Commerce toàn diện cho SME và solo founders tại Việt Nam & Đông Nam Á, tích hợp sâu vào hệ sinh thái Crove OS (`post`, `cal`, `sign`, `desk`).

---

## 🧭 Nguyên tắc Kiến trúc & Phát triển

1. **Fork Minimal Modification**: Không sửa đè mã nguồn core (`packages/twenty-server`, `packages/twenty-front`). Tất cả tính năng mở rộng, đối tượng mới và tích hợp bên thứ ba đều được đóng gói thành **Twenty Apps** (`packages/twenty-apps/<app-name>`), **Metadata Syncable Entities** hoặc **Micro-services / Logic Functions**.
2. **Modular & Plug-and-Play**: Từng kênh giao tiếp (Zalo OA, SMS, Facebook CAPI, Tổng đài) hoạt động như các ứng dụng độc lập có thể bật/tắt theo nhu cầu của từng Workspace.
3. **Async & Performance-First**: Sử dụng BullMQ + Redis sẵn có để xử lý toàn bộ các tác vụ gửi tin nhắn, đồng bộ CAPI và xử lý webhook ngoài luồng nhằm đảm bảo UI phản hồi tức thì.

---

## 🗺️ Lộ trình Phát triển (Phased Roadmap)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                    CROVE CRM ROADMAP OVERVIEW                                   │
├───────────────────┬───────────────────┬───────────────────┬───────────────────┬──────────────────┤
│    GIAI ĐOẠN 1    │    GIAI ĐOẠN 2    │    GIAI ĐOẠN 3    │    GIAI ĐOẠN 4    │   GIAI ĐOẠN 5    │
│  Commerce & Đơn   │   Kênh Zalo & SMS │  Báo trùng & Phễu │  CAPI & Tổng đài  │  Omni-Inbox Sync │
│  hàng / Dịch vụ   │   Bản địa hóa VN  │  Báo cáo chuyên sâu│ VOIP Tele-center  │   & Crove OS Hub │
└───────────────────┴───────────────────┴───────────────────┴───────────────────┴──────────────────┘
```

---

### ⚡ Giai đoạn 0: Kích hoạt Tích hợp Google & Microsoft (Native Quick-Win)
* **Trạng thái:** 🎯 Sẵn sàng kích hoạt ngay (Zero Core Modification)
* **Mục tiêu:** Kích hoạt tính năng kết nối tài khoản cá nhân (Connected Accounts) để tự động đồng bộ 2 chiều Email (Gmail / Outlook) và Lịch họp (Google Calendar / Microsoft 365 Calendar) vào dòng thời gian khách hàng (Activity Timeline).
* **Bản chất kỹ thuật:** Twenty CRM đã tích hợp sẵn toàn bộ Driver và Worker cho Google APIs và Microsoft Graph API trong engine core. Chỉ cần cấu hình OAuth App và biến môi trường:
  - [ ] **Tích hợp Google Workspace / Gmail & Google Calendar**:
    - Tạo OAuth 2.0 Client ID trên Google Cloud Console (`https://console.cloud.google.com/`).
    - Thêm Authorized Redirect URI: `https://crm.crove.com/auth/google-apis/get-access-token`
    - Cấu hình server `.env`:
      ```env
      AUTH_GOOGLE_CLIENT_ID=your_google_client_id
      AUTH_GOOGLE_CLIENT_SECRET=your_google_client_secret
      AUTH_GOOGLE_APIS_CALLBACK_URL=https://crm.crove.com/auth/google-apis/get-access-token
      MESSAGING_PROVIDER_GMAIL_ENABLED=true
      CALENDAR_PROVIDER_GOOGLE_ENABLED=true
      ```
  - [ ] **Tích hợp Microsoft 365 / Outlook & Microsoft Calendar**:
    - Tạo App Registration trên Azure Portal (`https://portal.azure.com/` - Entra ID).
    - Thêm Redirect URI Web: `https://crm.crove.com/auth/microsoft-apis/get-access-token`
    - Cấp quyền Microsoft Graph Delegated: `User.Read`, `Mail.ReadWrite`, `Mail.Send`, `Calendars.ReadWrite`, `offline_access`.
    - Cấu hình server `.env`:
      ```env
      AUTH_MICROSOFT_CLIENT_ID=your_azure_client_id
      AUTH_MICROSOFT_CLIENT_SECRET=your_azure_client_secret
      AUTH_MICROSOFT_APIS_CALLBACK_URL=https://crm.crove.com/auth/microsoft-apis/get-access-token
      CALENDAR_PROVIDER_MICROSOFT_ENABLED=true
      ```

---

### 📦 Giai đoạn 1: Bán hàng cốt lõi & Quản lý Sản phẩm / Đơn hàng (Core Commerce Extension)
* **Trạng thái:** 🚀 Đã hoàn thiện mã nguồn (`packages/twenty-apps/public/commerce`)
* **Mục tiêu:** Bổ sung phân hệ Sản phẩm (Product), Gói dịch vụ (Services có thời lượng) và Đơn hàng (Orders) vào CRM.
* **Hạng mục kỹ thuật:**
  - [x] Tạo Twenty App `@twentyhq/commerce` trong `packages/twenty-apps/public/commerce`.
  - [x] Khởi tạo Object `Product`: Tên, SKU, Loại hình (`Product` / `Service` / `Service Package`), Giá bán, Tồn kho, **Thời lượng (Phút)** cho dịch vụ (Spa, Clinic, Tư vấn), Hình ảnh.
  - [x] Khởi tạo Object `Order`: Mã đơn hàng (`OD...`), Tổng tiền, Giảm giá, Còn lại, Nguồn đơn, Trạng thái đơn (`Mới`, `Đang xử lý`, `Hoàn thành`, `Đã hủy`).
  - [x] Khởi tạo Object `OrderItem`: Liên kết bảng Đơn hàng và Sản phẩm (Số lượng, Đơn giá, Thành tiền).
  - [x] Thiết lập quan hệ Many-to-One giữa `Order` với `Person` (Khách hàng) và `WorkspaceMember` (Sales phụ trách).
  - [x] Tạo Views (All Products, All Orders, Orders Board Kanban) & Navigation menu items.
  - [x] Tự động tính toán tổng tiền, chiết khấu và công nợ qua Logic Function (`calculate-order-totals`, `create-order-route`).

---

### 💬 Giai đoạn 2: Tích hợp Giao tiếp Bản địa Việt Nam (Zalo OA / ZNS & SMS Brandname)
* **Trạng thái:** 🚀 Đã hoàn thiện mã nguồn (`packages/twenty-apps/public/zalo-oa`)
* **Mục tiêu:** Tự động bắt lead từ Zalo OA, gửi tin nhắn xác nhận đơn, nhắc lịch hẹn và chăm sóc khách hàng qua Zalo ZNS và SMS Brandname.
* **Hạng mục kỹ thuật:**
  - [x] Tạo Twenty App `@twentyhq/zalo-oa` trong `packages/twenty-apps/public/zalo-oa`.
  - [x] Khởi tạo `defineConnectionProvider` cho Zalo OA (OAuth 2.0 PKCE, lưu trữ Access Token / Refresh Token).
  - [x] Xây dựng Logic Function `zalo-webhook` (`/webhook/zalo`) tự động tạo/cập nhật `Person` lead khi khách follow, gửi tin nhắn hoặc điền form.
  - [x] Xây dựng Logic Function `zalo-send-message` gửi tin nhắn CSKH 1-on-1 qua Zalo OA API.
  - [x] Xây dựng Logic Function `zalo-send-zns` gửi tin nhắn Zalo Notification Service (ZNS) template.
  - [x] Xây dựng Front Component và Command Menu Action "Send Zalo message".
  - [ ] Tạo Twenty App `crove-sms` hỗ trợ tích hợp eSMS, Vietguys, FPT SMS Gateway.

---

### 🔍 Giai đoạn 3: Báo trùng Số điện thoại & Báo cáo Phễu Nâng cao (Deduplication & Advanced Analytics)
* **Trạng thái:** 📋 Dự kiến
* **Mục tiêu:** Ngăn chặn việc nhân viên sales tranh chấp lead do trùng số điện thoại và cung cấp hệ thống biểu đồ phân tích kinh doanh chuyên sâu.
* **Hạng mục kỹ thuật:**
  - [ ] Phát triển Frontend Interceptor / Hook kiểm tra trùng số điện thoại khi nhập liệu `Person` và hiển thị popover cảnh báo lịch sử tương tác.
  - [ ] Bổ sung Front Component Dashboard Widgets:
    - [ ] Biểu đồ phễu chuyển đổi khách hàng (Conversion Funnel Chart).
    - [ ] Biểu đồ so sánh doanh thu đa chu kỳ (Tháng này vs Tháng trước).
    - [ ] Biểu đồ phân bổ doanh thu theo nguồn (Website, Sự kiện, Social Ads...).
    - [ ] Thống kê nhân khẩu học khách hàng (Độ tuổi, Giới tính).

---

### 📞 Giai đoạn 4: Tích hợp Quảng cáo CAPI & Tổng đài Ảo (Ads CAPI & VOIP Tele-center)
* **Trạng thái:** 📋 Dự kiến
* **Mục tiêu:** Đồng bộ sự kiện chuyển đổi về Facebook/TikTok Ads để tối ưu chi phí quảng cáo, hỗ trợ telesales gọi điện trực tiếp trên CRM.
* **Hạng mục kỹ thuật:**
  - [ ] Tạo Logic Function `SyncFacebookCapi`: Gửi event `Purchase`, `Lead`, `Schedule` về Meta Graph API (`POST /{pixel_id}/events`).
  - [ ] Tạo Logic Function `SyncTikTokEventsApi`: Gửi sự kiện chuyển đổi về TikTok Marketing API.
  - [ ] Tích hợp WebRTC SIP Softphone (JsSIP / Stringee Web SDK) vào giao diện chi tiết khách hàng để bấm gọi nhanh (Click-to-Call).
  - [ ] Nhận Webhook từ tổng đài ảo (OMICall, Stringee, Voiptalk) lưu file ghi âm và thời lượng vào `callRecording` entity.

---

### 🔄 Giai đoạn 5: Hợp nhất Hội thoại Đa kênh & Đồng bộ Hệ sinh thái Crove OS
* **Trạng thái:** 📋 Định hướng dài hạn
* **Mục tiêu:** Kết nối hoàn chỉnh giữa Crove CRM với `desk.crove.com` (AI Support/Live Chat), `cal.crove.com` (Booking), `post.crove.com` (Social), và `sign.crove.com` (Hợp đồng).
* **Hạng mục kỹ thuật:**
  - [ ] Đẩy tự động Leads thu được từ `post.crove.com` và Fanpage Facebook/Instagram/Zalo về `Person` trên CRM.
  - [ ] Đồng bộ lịch hẹn 2 chiều giữa `cal.crove.com` và bảng Lịch hẹn `calendarEvent` của CRM.
  - [ ] Đồng bộ trạng thái hợp đồng đã ký từ `sign.crove.com` để tự động chuyển Stage của Cơ hội bán hàng sang "Closed Won".
  - [ ] Đồng bộ Ticket/Khiếu nại từ `desk.crove.com` vào dòng thời gian khách hàng 360°.

---

### 🧠 Giai đoạn 6: AI Customer Memory (Lightfield-inspired Synthesis Layer)
* **Trạng thái:** 📋 Đề xuất — chi tiết đầy đủ tại [`docs/LIGHTFIELD-CONCEPT-ROADMAP-2026-09-15.html`](./docs/LIGHTFIELD-CONCEPT-ROADMAP-2026-09-15.html)
* **Mục tiêu:** Học concept của Lightfield (AI-native CRM, $47M Series A a16z): CRM tự tổng hợp mọi tương tác (email, lịch, Zalo, ghi chú) thành "brief sống" per record, tự flag deal rủi ro, và cho phép agent chạy follow-up có người duyệt. Bổ sung lớp **synthesis** + **proactive signals** mà Twenty core chưa có, tận dụng sẵn AI Agents/Skills/Workflows/MCP của v2.38.
* **Điều kiện khởi động:** Giai đoạn 0 (email/calendar sync) đã bật trên workspace thật + merge upstream v2.40.0.
* **Hạng mục kỹ thuật:**
  - [x] **Phase A — Account Brief sống (2-3 tuần):** ✅ Đã hoàn thiện mã nguồn — internal app `@crove/ai-brief` (`packages/twenty-apps/internal/ai-brief`, PR #6): cron sweep 02:00 hằng đêm enqueue job cho record thiếu/stale brief (>7 ngày, cap 200/object) → logic function đọc 90 ngày `timelineActivity` → chạy agent `account-brief-synthesizer` (built-in agent infra) → ghi `AI Brief` (markdown) + `AI Brief Updated At` + `AI Sentiment`. UI block riêng trên record page để Phase A.5 (fields hiển thị sẵn ở record page).
  - [ ] **Phase B — Deal health & signals (2 tuần):** heuristic flag at-risk (không activity 14 ngày, email cuối chưa được trả lời, sentiment âm) + weekly digest qua email/Zalo OA.
  - [ ] **Phase C — Agent follow-up + hàng đợi "For review" (3-4 tuần):** agent nháp follow-up từ Brief → custom object `AgentSuggestion` làm hàng đợi Approve/Dismiss → gửi qua Brevo/Zalo OA. Eval so draft agent vs follow-up thật trong quá khứ.
  - [ ] **Phase D — Versioned synthesis + citation (1-2 quý):** bảng `synthesisRun` (prompt/schema version, cited activity ids), re-synthesis lịch sử theo lens mới, pgvector cho hội thoại — moat dài hạn, chỉ làm khi A-C có user thật.
* **Nguyên tắc:** Fork Minimal Modification (metadata fields / Twenty App / BullMQ, không sửa core); token cost per workspace phải log từ ngày đầu; tuân thủ NĐ 13/2023/NĐ-CP (DPA với LLM provider, option self-host cho khách finance).

---

## 📊 Bảng Theo dõi Tiến độ (Progress Tracker)

| Phân hệ / Tính năng | Phương thức Triển khai | Mức độ ưu tiên | Độ khó | Trạng thái |
| :--- | :--- | :--- | :--- | :--- |
| **Google Sync (Gmail + Calendar)** | Native Twenty Driver (`.env` config) | ⚡ P0 (Quick-win) | Cực dễ (30 phút cấu hình) | 🎯 Sẵn sàng kích hoạt |
| **Microsoft Sync (Outlook + M365)**| Native Twenty Driver (`.env` config) | ⚡ P0 (Quick-win) | Cực dễ (30 phút cấu hình) | 🎯 Sẵn sàng kích hoạt |
| **Quản lý Sản phẩm (Product)** | Twenty App (`@twentyhq/commerce`) | 🔥 P0 (Cao nhất) | Dễ | 🚀 Đã hoàn thiện mã nguồn |
| **Quản lý Đơn hàng (Order)** | Twenty App (`@twentyhq/commerce`) | 🔥 P0 (Cao nhất) | Dễ - TB | 🚀 Đã hoàn thiện mã nguồn |
| **Zalo OA / ZNS Integration** | Twenty App (`@twentyhq/zalo-oa`) | 🔥 P0 (Cao nhất) | Trung bình | 🚀 Đã hoàn thiện mã nguồn |
| **SMS Brandname Gateway** | Twenty App (`crove-sms`) | P1 (Cao) | Dễ - TB (2 ngày) | 📋 Sắp triển khai |
| **Cảnh báo Trùng SĐT** | Front Hook & Validation | P1 (Cao) | Dễ (1 ngày) | 📋 Sắp triển khai |
| **Funnel & Analytics Dashboard** | Custom Dashboard Widgets | P1 (Cao) | Trung bình (3 ngày) | 📋 Dự kiến |
| **Facebook & TikTok CAPI** | Logic Function Trigger | P2 (Trung bình) | Dễ (2 ngày) | 📋 Dự kiến |
| **Tổng đài Click-to-call** | WebRTC + CallRecording Sync | P2 (Trung bình) | Khá (4-6 ngày) | 📋 Dự kiến |
| **Crove OS Full Suite Sync** | Webhook Micro-services | P3 (Dài hạn) | Khá (1-2 tuần) | 📋 Định hướng |
| **AI Customer Memory — Phase A: Account Brief** | Twenty App `@crove/ai-brief` (cron + agent + logic functions) | P1 (Cao) | Khá | 🚀 Đã merge (PR #6) |
| **AI Customer Memory — Phase B: Deal health & digest** | Heuristic + Weekly digest qua Zalo/email | P1 (Cao) | Trung bình (2 tuần) | 📋 Sắp triển khai |
