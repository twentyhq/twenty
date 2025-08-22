# Phân tích chi tiết cấu trúc thư mục `packages/twenty-server`

Tài liệu này cung cấp một cái nhìn sâu sắc và chi tiết về cấu trúc thư mục của gói `twenty-server` trong dự án Twenty CRM. Máy chủ này được xây dựng trên nền tảng **NestJS**, một framework Node.js mạnh mẽ để xây dựng các ứng dụng phía máy chủ hiệu quả và có khả năng mở rộng.

## Tổng quan kiến trúc

- **Framework**: **NestJS** được sử dụng làm nền tảng chính, áp dụng kiến trúc mô-đun hóa và sử dụng các khái niệm như Dependency Injection, Modules, Controllers/Resolvers, và Services.
- **API**: Giao diện chính là **GraphQL**. NestJS tích hợp liền mạch với GraphQL, cho phép xây dựng API một cách có cấu trúc và chặt chẽ.
- **Database**: **TypeORM** được sử dụng làm ORM (Object-Relational Mapping) để tương tác với cơ sở dữ liệu PostgreSQL. Nó giúp quản lý các thực thể (entities), quan hệ và di chuyển (migrations) cơ sở dữ liệu.
- **Monorepo**: Toàn bộ dự án được quản lý bởi **Nx**, giúp tối ưu hóa việc xây dựng, kiểm thử và chia sẻ mã giữa các gói khác nhau (`twenty-front`, `twenty-server`, `twenty-ui`, v.v.).

---

## Cấu trúc thư mục gốc

Đây là các tệp và thư mục cấu hình chính ở cấp cao nhất của `packages/twenty-server`.

- **`.env.example`**: Tệp mẫu chứa tất cả các biến môi trường cần thiết để chạy ứng dụng. Cần sao chép tệp này thành `.env` và điền các giá trị phù hợp cho môi trường phát triển cục bộ.
- **`.eslintrc.cjs`**: Tệp cấu hình cho **ESLint**, một công cụ phân tích mã tĩnh để xác định và báo cáo các mẫu có vấn đề được tìm thấy trong mã JavaScript/TypeScript.
- **`.swcrc`**: Tệp cấu hình cho **SWC** (Speedy Web Compiler), một trình biên dịch dựa trên Rust cho JavaScript/TypeScript. Nó được sử dụng để tăng tốc quá trình biên dịch trong quá trình phát triển và xây dựng.
- **`jest.config.ts`**: Tệp cấu hình cho **Jest**, framework kiểm thử được sử dụng trong dự án để chạy các bài kiểm thử đơn vị (unit tests) và kiểm thử tích hợp (integration tests).
- **`package.json`**: Tệp kê khai tiêu chuẩn của Node.js. Nó chứa siêu dữ liệu của gói (tên, phiên bản), danh sách các phụ thuộc (`dependencies` & `devDependencies`), và các tập lệnh (`scripts`) để chạy các tác vụ như khởi động, xây dựng và kiểm thử.
- **`project.json`**: Tệp cấu hình dành riêng cho **Nx**. Nó định nghĩa các "target" (mục tiêu) cho gói này, chẳng hạn như `build`, `serve`, `test`, `lint`. Nx sử dụng tệp này để biết cách thực thi các tác vụ trên gói.
- **`tsconfig.*.json`**: Các tệp cấu hình TypeScript.
    - `tsconfig.json`: Cấu hình cơ sở được các tệp khác kế thừa.
    - `tsconfig.app.json`: Cấu hình dành riêng cho việc biên dịch mã nguồn ứng dụng.
    - `tsconfig.spec.json`: Cấu hình dành riêng cho việc biên dịch các tệp kiểm thử.
- **`src/`**: Thư mục quan trọng nhất, chứa toàn bộ mã nguồn của ứng dụng máy chủ. Sẽ được phân tích chi tiết bên dưới.
- **`test/`**: Chứa các cấu hình và tệp cần thiết cho kiểm thử end-to-end (E2E).

---

## Phân tích chi tiết thư mục `src/`

Thư mục `src` là nơi chứa toàn bộ logic nghiệp vụ của ứng dụng.

### `main.ts`

Đây là điểm vào (entry point) của ứng dụng NestJS. Tệp này có trách nhiệm:
- Khởi tạo ứng dụng NestJS bằng cách sử dụng `NestFactory`.
- Áp dụng các middleware toàn cục (global middlewares) nếu có (ví dụ: `cors`, `helmet`).
- Lắng nghe các kết nối đến trên một cổng được chỉ định.

### `auth/`

Mô-đun này chịu trách nhiệm về tất cả các vấn đề liên quan đến **xác thực (authentication)** và **phân quyền (authorization)**.

- **`auth.module.ts`**: Định nghĩa `AuthModule`, đóng gói tất cả các thành phần liên quan đến xác thực. Nó nhập các mô-đun cần thiết khác như `PassportModule`, `JwtModule`, và `UsersModule`.
- **`auth.resolver.ts`**: Lớp trình giải quyết GraphQL. Nó định nghĩa các `Query` (truy vấn) và `Mutation` (đột biến) liên quan đến xác thực, ví dụ: `login()`, `register()`, `refreshToken()`, và `me()`.
- **`auth.service.ts`**: Chứa logic nghiệp vụ cốt lõi cho xác thực. Các phương thức ở đây bao gồm `validateUser()` (kiểm tra tên người dùng và mật khẩu), `login()` (tạo và trả về JWT), v.v.
- **`dto/`**: (Data Transfer Objects) Định nghĩa hình dạng của dữ liệu được truyền vào và ra khỏi các resolver. Ví dụ: `LoginInput.ts`, `RegisterInput.ts`.
- **`guards/`**: Chứa các "guards" của NestJS. Một guard là một lớp quyết định xem một yêu cầu có được xử lý hay không. Ví dụ, `JwtAuthGuard` sẽ kiểm tra xem yêu cầu có chứa một JSON Web Token (JWT) hợp lệ hay không trước khi cho phép truy cập vào một resolver được bảo vệ.
- **`strategies/`**: Chứa các chiến lược xác thực của **Passport.js**. Ví dụ, `JwtStrategy` định nghĩa cách xác thực và giải mã một JWT từ tiêu đề yêu cầu.

### `core/`

Chứa các thành phần cốt lõi, được chia sẻ và tái sử dụng trên toàn bộ ứng dụng.

- **`core.module.ts`**: Tập hợp các dịch vụ và cấu hình cốt lõi.
- **`entities/`**: Có thể chứa các lớp thực thể (entity) cơ sở mà các thực thể khác kế thừa, ví dụ như một `BaseEntity` với các trường `id`, `createdAt`, `updatedAt`.
- **`services/`**: Các dịch vụ dùng chung như dịch vụ logging, dịch vụ cấu hình, v.v.

### `database/`

Quản lý mọi thứ liên quan đến cơ sở dữ liệu.

- **`database.module.ts`**: Cấu hình kết nối đến cơ sở dữ liệu bằng TypeORM, sử dụng thông tin từ các biến môi trường.
- **`migrations/`**: Chứa các tệp di chuyển (migration) của TypeORM. Mỗi tệp di chuyển là một bản ghi về sự thay đổi lược đồ cơ sở dữ liệu (tạo bảng, thêm cột, v.v.). Điều này cho phép quản lý phiên bản cơ sở dữ liệu một cách nhất quán.
- **`seeds/`**: Chứa các tệp "seed" để điền dữ liệu mẫu hoặc dữ liệu ban đầu vào cơ sở dữ liệu, rất hữu ích cho môi trường phát triển và kiểm thử.

### `graphql/`

Cấu hình chung cho máy chủ GraphQL.

- **`graphql.module.ts`**: Cấu hình `GraphQLModule` của NestJS. Nó chỉ định loại trình điều khiển (driver) (ví dụ: `ApolloDriver`), và cấu hình cách lược đồ GraphQL được tạo ra (ví dụ: `autoSchemaFile: true` để tự động tạo tệp lược đồ).
- **`scalars/`**: Định nghĩa các kiểu dữ liệu "scalar" tùy chỉnh cho GraphQL. Ví dụ, GraphQL không có kiểu `DateTime` gốc, vì vậy một scalar tùy chỉnh có thể được tạo ra ở đây để xử lý nó.

### `modules/`

Đây là nơi chứa các **mô-đun tính năng (feature modules)**, là trái tim của ứng dụng. Mỗi thư mục con đại diện cho một lĩnh vực nghiệp vụ riêng biệt. Cấu trúc này giúp giữ cho mã nguồn được tổ chức, dễ bảo trì và mở rộng.

Một mô-đun tính năng điển hình (ví dụ: `users/`, `companies/`, `tasks/`) thường có cấu trúc bên trong như sau:
- **`*.module.ts`**: (ví dụ: `users.module.ts`) Định nghĩa mô-đun, khai báo các resolver, service và nhập các mô-đun phụ thuộc khác.
- **`*.resolver.ts`**: (ví dụ: `users.resolver.ts`) Trình giải quyết GraphQL cho mô-đun này. Nó xử lý các truy vấn và đột biến liên quan đến tính năng (ví dụ: `getUsers`, `createUser`, `updateUser`).
- **`*.service.ts`**: (ví dụ: `users.service.ts`) Chứa logic nghiệp vụ chính. Nó tương tác với cơ sở dữ liệu (thông qua repository của TypeORM) và thực hiện các thao tác xử lý dữ liệu.
- **`entities/`**: Chứa các lớp thực thể TypeORM cho mô-đun này (ví dụ: `user.entity.ts`). Các lớp này định nghĩa cấu trúc của bảng trong cơ sở dữ liệu.
- **`dto/`**: Chứa các DTO để xác định dữ liệu đầu vào và đầu ra cho các resolver của mô-đun.

### `queue/`

Xử lý các tác vụ nền (background jobs) bằng **BullMQ** và **Redis**. Điều này rất quan trọng để giảm tải cho các yêu cầu API chính và cải thiện trải nghiệm người dùng.

- **`queue.module.ts`**: Cấu hình kết nối đến Redis và đăng ký các hàng đợi (queues).
- **`processors/`**: Chứa các "job processor". Đây là các lớp xử lý logic cho các công việc được lấy ra từ hàng đợi. Ví dụ, một `EmailProcessor` có thể chứa logic để gửi email.
- **`services/`**: Chứa các dịch vụ được sử dụng để *thêm* công việc vào hàng đợi từ các phần khác của ứng dụng.

### `utils/`

Chứa các hàm và lớp tiện ích nhỏ, có thể tái sử dụng và không thuộc về một mô-đun nghiệp vụ cụ thể nào. Ví dụ: các hàm định dạng ngày tháng, tạo chuỗi ngẫu nhiên, v.v.
