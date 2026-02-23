# Foundry Data Dictionary

Business-level documentation for all 305 migrated object types.
Generated from the Foundry Ontology Manager JSON export.

---

## [Advertisement] Email Subject Line

**Table:** `advertisement_email_subject_line`  
**Foundry apiName:** `AdvertisementEmailSubjectLine`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `email_subject_line` | Email Subject Line | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `review_comment` | Review Comment | STRING |  | datasourceColumn |  |
| `review_status` | Review Status | STRING |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | TIMESTAMP |  | editOnly |  |
| `reviewed_by` | Reviewed By | STRING |  | editOnly |  |
| `source` | Source | STRING |  | datasourceColumn |  |

---

## [Advertisement] Hook

**Table:** `advertisement_hook`  
**Foundry apiName:** `AdvertisementHook`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `add_hook_text` | Add Hook Text | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `review_comment` | Review Comment | STRING |  | datasourceColumn |  |
| `review_status` | Review Status | STRING |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | TIMESTAMP |  | editOnly |  |
| `reviewed_by` | Reviewed By | STRING |  | editOnly |  |
| `source` | Source | STRING |  | datasourceColumn |  |

---

## [Advertisement] Landing Page Headline

**Table:** `advertisement_landing_page_headline`  
**Foundry apiName:** `AdvertisementLandingPageHeadline`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `landing_page_headline` | Landing Page Headline | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `review_comment` | Review Comment | STRING |  | datasourceColumn |  |
| `review_status` | Review Status | STRING |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | TIMESTAMP |  | editOnly |  |
| `reviewed_by` | Reviewed By | STRING |  | editOnly |  |
| `source` | Source | STRING |  | datasourceColumn |  |

---

## Analysed User Picture (as api response)

**Table:** `analysed_user_picture`  
**Foundry apiName:** `AnalysedUserPicture`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `blurred_output_image_rid` | Blurred Output Image Rid | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `errors` | Errors | STRING |  | redacted |  |
| `full_report` | Full Report | STRING |  | redacted |  |
| `input_image_rid` | Input Image Rid | STRING |  | redacted |  |
| `input_metadata_id` | Input Metadata Id | STRING |  | redacted |  |
| `media_reference_blurred_output` | Media Reference Blurred Output | MEDIA_REFERENCE |  | redacted |  |
| `node1_text` | node1 Text | STRUCT |  | redacted |  |
| `node2_text` | node2 Text | STRUCT |  | redacted |  |
| `node3_text` | node3 Text | STRUCT |  | redacted |  |
| `node4_text` | node4 Text | STRUCT |  | redacted |  |
| `node5_text` | node5 Text | STRUCT |  | redacted |  |
| `node6_text` | node6 Text | STRUCT |  | redacted |  |
| `node7a_text` | node7a Text | STRUCT |  | redacted |  |
| `node7b_text` | node7b Text | STRUCT |  | redacted |  |
| `output_image_rid` | Output Image Rid | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `processing_status` | Processing Status | STRING |  | redacted |  |
| `source` | Source | STRING |  | redacted |  |
| `timestamp` | Timestamp | TIMESTAMP |  | redacted |  |
| `validation` | Validation | STRING |  | redacted |  |

---

## App Discrepancy

**Table:** `app_discrepancy`  
**Foundry apiName:** `AppDiscrepancy`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Data quality issues requiring manual resolution.  

**Relationships:**
- belongs to **AppUser** via `app_user_id` (link: "App User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_user_id` | App User Id | STRING |  | redacted |  |
| `context` | Context | STRING |  | redacted | Details about the discrepancy (e.g., which programs are mismatched). |
| `discrepancy_type` | Discrepancy Type | STRING |  | redacted | Type of data quality issue (e.g., "App user without customer", "Assigned programs not matching expected programs"). |
| `id` | Id | STRING | PK | redacted |  |
| `notes` | Notes | STRING |  | redacted | Free-text notes added during resolution. |
| `status` | Status | STRING |  | redacted | Workflow status. Values: "To review" (new), "Review in progress", "Closed" (resolved). |

---

## App Event

**Table:** `app_event`  
**Foundry apiName:** `AppEvent`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SessionInfo** via `event_id` (link: "Session Info")
- belongs to **Sessions** via `event_id` (link: "Session  Happened")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action` | Action | STRING |  | datasourceColumn |  |
| `date` | Date | DATE |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_id` | Event Id | STRING | PK | datasourceColumn |  |
| `session_id` | Session Id | STRING |  | datasourceColumn |  |
| `strategy` | Strategy | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |
| `user_mail` | User Mail | STRING |  | datasourceColumn |  |

---

## App Lecture

**Table:** `app_lecture`  
**Foundry apiName:** `AppLecture`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Educational content within a module (videos, quizzes, exercises). May be always available or require module enrollment.  

**Relationships:**
- has many **AppModuleAppLectureLink** (link: "App Module App Lecture Link")
- has many **SubscriptionLectureProgress** (link: "Subscription Lecture Progress")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_lecture_description` | App Lecture Description | STRING |  | redacted |  |
| `app_lecture_id` | App Lecture Id | STRING | PK | redacted |  |
| `app_lecture_name` | App Lecture Name | STRING |  | redacted |  |

---

## App Module

**Table:** `app_module`  
**Foundry apiName:** `AppModule`  
**Status:** active  
**Datasources:** 1  
**Description:** A themed section within a program containing lectures (e.g., "M5: Rumpf - Integration"). Ordered list that unlocks progressively after previous module's minimum duration and completion.  

**Relationships:**
- has many **AppModuleAppLectureLink** (link: "App Module App Lecture Link")
- has many **ProgramAppModuleLink** (link: "Program App Module Link")
- has many **SubscriptionModuleProgress** (link: "Subscription Module Progress")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_module_description` | App Module Description | STRING |  | redacted |  |
| `app_module_id` | App Module Id | STRING | PK | redacted | Primary key - unique identifier for each module in the web app. |
| `app_module_name` | App Module Name | STRING |  | redacted |  |
| `app_module_url` | App Module Url | STRING |  | redacted |  |

---

## App Module App Lecture Link

**Table:** `app_module_app_lecture_link`  
**Foundry apiName:** `AppModuleAppLectureLink`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **AppLecture** via `app_lecture_id` (link: "App Lecture")
- belongs to **AppModule** via `app_module_id` (link: "App Module")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_lecture_id` | App Lecture Id | STRING |  | redacted |  |
| `app_module_app_lecture_link_id` | App Module App Lecture Link Id | STRING | PK | redacted |  |
| `app_module_id` | App Module Id | STRING |  | redacted |  |
| `position` | Position | LONG |  | redacted |  |

---

## App Session

**Table:** `app_session`  
**Foundry apiName:** `AppSession`  
**Status:** active  
**Datasources:** 1  
**Description:** Live coached workout (via Zoom) or recording. Users actively practice exercises with coach guidance. Can be blocked until lecture completion or open to all program users.  

**Relationships:**
- belongs to **AppSessionCategory** via `category_id` (link: "App Session Category")
- has many **SessionParticipationSubscription** (link: "Session Participation Subscription")
- has many **SessionParticipation** (link: "Session Participation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `body_position_id` | Body Position Id | STRING |  | redacted |  |
| `category_id` | Category Id | STRING |  | redacted |  |
| `coach_name` | Coach Name | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `date_of_session` | Date Of Session | DATE |  | redacted |  |
| `duration` | Duration (minutes) | INTEGER |  | redacted |  |
| `equipment_id` | Equipment Id | STRING |  | redacted |  |
| `locked` | Locked | BOOLEAN |  | redacted |  |
| `participant_limit` | Participant Limit | INTEGER |  | redacted |  |
| `recording_url` | Recording Url | STRING |  | redacted | URL to watch session recording (if available). |
| `session_description` | Session Description | STRING |  | redacted |  |
| `session_end_timestamp` | Session End Timestamp | TIMESTAMP |  | redacted | Scheduled end time for the session. |
| `session_id` | Session Id | STRING | PK | redacted | Primary key - unique identifier for each app session. |
| `session_name` | Session Name | STRING |  | redacted | Internal session name/identifier. |
| `session_start_timestamp` | Session Start Timestamp | TIMESTAMP |  | redacted | Scheduled start time for the session. |
| `session_title` | Session Title | STRING |  | redacted | Human-readable title of the training session. Used as the title property. |
| `status` | Status | STRING |  | redacted | Session availability status. |
| `token_cost` | Token Cost | INTEGER |  | redacted |  |
| `vector_id` | Vector Id | STRING |  | redacted |  |
| `zoom_url` | Zoom Url | STRING |  | redacted |  |

---

## App Session Category

**Table:** `app_session_category`  
**Foundry apiName:** `AppSessionCategory`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Reference data for categorizing sessions (type, body position, movement vector, equipment).  

**Relationships:**
- has many **AppSession** (link: "App Session")
- has many **SessionParticipation** (link: "Session Participation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `colour` | Colour | STRING |  | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `session_category_id` | Session Category Id | STRING | PK | redacted |  |
| `slug` | Slug | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |
| `type` | Type | STRING |  | redacted |  |

---

## App User

**Table:** `app_user`  
**Foundry apiName:** `AppUser`  
**Status:** active  
**Datasources:** 1  
**Description:** Account in the app. Created internally after contract signing. Edge case: may exist without customer record.  

**Relationships:**
- has many **Subscription** (link: "Subscription")
- has many **AppDiscrepancy** (link: "App Discrepancy")
- has many **TicketFluent** (link: "Tickets [Fluent]")
- has many **SessionParticipation** (link: "Session Participation")
- has many **UserMediaReference** (link: "User Media Reference")
- has many **Customer** (link: "Customer")
- has many **FormSubmission** (link: "Form Submission")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_display_name` | App Display Name | STRING |  | redacted |  |
| `app_user_email` | App User Email | STRING |  | redacted | User's email address in the app. |
| `app_user_id` | App User Id | STRING | PK | redacted | Primary key - unique identifier for each user in the web application. |
| `avg_max_sessions_oneday` | Average number of sessions on days with many sessions in the overall period | DOUBLE |  | redacted | 'Many sessions' is calculated as max of sessions on a day per week, averaged over the overall available time |
| `avg_max_sessions_oneday_prevperiod` | Average number of session on days with many sessions in the previous period | DOUBLE |  | redacted | 'Many sessions' is calculated as max of sessions on a day per week, averaged over the time period 4-7 weeks prior to now. |
| `avg_pause_days_recentweeks` | Average number of recovery days between training sessions in the recent weeks | DOUBLE |  | redacted | recent weeks = 3 |
| `avg_recovery_days` | Average number of recovery days between training sessions | DOUBLE |  | redacted | Average rest days between training sessions. Higher values may indicate lower engagement or intentional recovery periods. |
| `avg_sessions_perday` | Average number of sessions over days trained | DOUBLE |  | redacted | Average sessions per training day. Higher values indicate users doing multiple sessions per active day. |
| `avg_sessions_perday_recentweeks` | Average number of sessions over days trained in recent weeks | DOUBLE |  | redacted | recent = last 3 weeks |
| `avg_sessions_perweek_prevperiod` | Average number of sessions per week over days trained in the previous period | DOUBLE |  | redacted | Average number of sessions per week over days trained in the previous period of 4-7 weeks |
| `days_since_start` | Days Since Start | LONG |  | redacted |  |
| `end_date` | End Date | DATE |  | redacted | Program end date for the user's subscription. |
| `last_login_date` | Last Login Date | DATE |  | redacted |  |
| `max_sessions_oneday_avg_recentweeks` | Average number of session on days with many sessions recently | DOUBLE |  | redacted | Average number of session on days with many sessions in the recent timeframe of 3 weeks |
| `registration_date` | Registration Date | DATE |  | redacted |  |
| `sessions_last30_days` | Sessions Last 30 Days | LONG |  | redacted |  |
| `sessions_per_day` | Sessions Per Day | DOUBLE |  | redacted |  |
| `sessions_per_week` | Sessions Per Week | DOUBLE |  | redacted |  |
| `sessions_per_week_previousmonth` | Sessions Per Week Previousmonth | DOUBLE |  | redacted |  |
| `sessions_per_week_thismonth` | Sessions Per Week Thismonth | DOUBLE |  | redacted |  |
| `sessions_previousmonth` | Sessions Previousmonth | LONG |  | redacted |  |
| `sessions_prior30_days` | Sessions Prior 30 Days | LONG |  | redacted |  |
| `sessions_thismonth` | Sessions Thismonth | LONG |  | redacted |  |
| `sessions_total` | Sessions Total | LONG |  | redacted |  |
| `start_date` | Start Date | DATE |  | redacted | Official program start date for the user. |
| `total_sessions` | Total Sessions | LONG |  | redacted |  |
| `trend30_days` | Trend 30 Days | DOUBLE |  | redacted | Percentage change in activity comparing last 30 days to prior 30 days. Positive = increased engagement, Negative = declining engagement. |
| `weeks_since_start` | Weeks Since Start | INTEGER |  | redacted |  |

---

## Appointment [Funnelbox]

**Table:** `appointment_funnelbox`  
**Foundry apiName:** `AppointmentFunnelbox`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_id` | App Id | STRING |  | datasourceColumn |  |
| `appointment_address` | Appointment Address | STRING |  | datasourceColumn |  |
| `appointment_appointment_status` | Appointment Appointment Status | STRING |  | datasourceColumn |  |
| `appointment_assigned_user_id` | Appointment Assigned User Id | STRING |  | datasourceColumn |  |
| `appointment_calendar_id` | Appointment Calendar Id | STRING |  | datasourceColumn |  |
| `appointment_contact_id` | Appointment Contact Id | STRING |  | datasourceColumn |  |
| `appointment_date_added` | Appointment Date Added | TIMESTAMP |  | datasourceColumn |  |
| `appointment_date_updated` | Appointment Date Updated | TIMESTAMP |  | datasourceColumn |  |
| `appointment_end_time` | Appointment End Time | TIMESTAMP |  | datasourceColumn |  |
| `appointment_id` | Appointment Id | STRING | PK | datasourceColumn |  |
| `appointment_source` | Appointment Source | STRING |  | datasourceColumn |  |
| `appointment_start_time` | Appointment Start Time | TIMESTAMP |  | datasourceColumn |  |
| `appointment_title` | Appointment Title | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `is_active` | Is Active | BOOLEAN |  | datasourceColumn |  |
| `location_id` | Location Id | STRING |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `version_id` | Version Id | STRING |  | datasourceColumn |  |
| `webhook_id` | Webhook Id | STRING |  | datasourceColumn |  |

---

## Tasks [AST]

**Table:** `armins_tasks`  
**Foundry apiName:** `ArminsTasks`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **TaskKontextAst** via `context_id` (link: "Task-Kontext[AST]")
- belongs to **InitiativeAst** via `task_initiative` (link: "Initiativen [AST]")
- belongs to **ArminsTasksContacts** via `primary_key` (link: "Task-Contacts [AST]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact` | ArminTaskContactID | STRING |  | redacted |  |
| `context` | Context | STRING |  | redacted |  |
| `context_id` | Context ID | STRING |  | redacted |  |
| `date_created` | Date Created | TIMESTAMP |  | redacted |  |
| `due_date` | Due Date | TIMESTAMP |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `task_description` | Task Description | STRING |  | redacted |  |
| `task_initiative` | Initiativen ID | STRING |  | redacted |  |
| `task_title` | Task Title | STRING |  | redacted |  |
| `urgency` | Urgency | STRING |  | redacted |  |

---

## Task-Contacts [AST]

**Table:** `armins_tasks_contacts`  
**Foundry apiName:** `ArminsTasksContacts`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ArminsTasks** (link: "Tasks [AST]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_name` | Contact Name | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |

---

## [WAHA] Audio Message With Transcription

**Table:** `audio_message_with_transcription`  
**Foundry apiName:** `AudioMessageWithTranscription`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Audio Messages With Transcription  

**Relationships:**
- belongs to **WahaMessageNoRv** via `audio_message_id` (link: "[Waha] Messages (no RV)")
- belongs to **WahaMessage** via `audio_message_id` (link: "[Waha] Message")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `audio_message_id` | audio_message_id | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `transcription` | transcription | STRING |  | editOnly |  |

---

## [Bexio] Product Article

**Table:** `bexio_product_article`  
**Foundry apiName:** `BexioProductArticle`  
**Status:** experimental  
**Datasources:** 1  
**Description:** [Bexio] Product Articles  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account Id | INTEGER |  | redacted |  |
| `article_code` | Article Code | STRING |  | redacted |  |
| `article_description` | Article Description | STRING |  | redacted |  |
| `article_id` | Article Id | INTEGER | PK | redacted |  |
| `article_name` | Article Name | STRING |  | redacted |  |
| `article_type_id` | Article Type Id | INTEGER |  | redacted |  |
| `currency_id` | Currency Id | INTEGER |  | redacted |  |
| `data_id` | Data Id | INTEGER |  | redacted |  |
| `sale_price` | Sale Price | INTEGER |  | redacted |  |
| `stock_reserved_nr` | Stock Reserved Nr | INTEGER |  | redacted |  |
| `tax_expense_id` | Tax Expense Id | INTEGER |  | redacted |  |
| `tax_id` | Tax Id | INTEGER |  | redacted |  |
| `tax_income_id` | Tax Income Id | INTEGER |  | redacted |  |

---

## Emails for Bulk Contract Creation

**Table:** `bulk_contract_creation`  
**Foundry apiName:** `BulkContractCreation`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Bulk Contracts Creation  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `added_ts` | Added Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `client_submitter_link` | Client Submitter Link | STRING |  | editOnly |  |
| `client_submitter_link_cert` | Client Submitter Link CERT Program | STRING |  | editOnly |  |
| `client_submitter_link_coaching_program` | Client Submitter Link Coaching Program | STRING |  | editOnly |  |
| `contract_id` | Contract ID | STRING |  | editOnly |  |
| `contract_url` | Contract URL | STRING |  | editOnly |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `email_id` | Email Id | STRING | PK | datasourceColumn |  |
| `export_error` | Export Error | STRING |  | editOnly |  |
| `trigger_automate_run` | Trigger Automate Run | BOOLEAN |  | editOnly |  |

---

## Assignments for Bulk Contract Creation

**Table:** `bulk_created_submissions`  
**Foundry apiName:** `BulkCreatedSubmissions`  
**Status:** experimental  
**Datasources:** 1  
**Description:** [Bulk] [Docuseal] Docuseal Submissions that are generated in bulk mode from Foundry  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")
- belongs to **Contract** via `submission_id` (link: "Contract")
- belongs to **BulkExportDetails** via `bulk_export_job` (link: "Bulk Export Detail")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `bulk_export_job` | bulk_export_job | STRING |  | editOnly | PK on the details. |
| `created_at` | created_at | TIMESTAMP |  | editOnly |  |
| `email` | email | STRING |  | editOnly |  |
| `execution_timestamp` | execution_timestamp | TIMESTAMP |  | editOnly |  |
| `export_job_created_at` | export_job_created_at | TIMESTAMP |  | editOnly | When was this object (email + bulk job) initially created. |
| `mail_sent_status` | mail_sent_status | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `response` | response | STRING |  | editOnly |  |
| `response_status_code` | response_status_code | STRING |  | editOnly |  |
| `sign_url` | sign_url | STRING |  | editOnly |  |
| `status` | status | STRING |  | editOnly |  |
| `submission_id` | submission_id | STRING |  | editOnly |  |
| `template_id` | template_id | STRING |  | editOnly |  |
| `trigger_automate_run` | trigger automate run  | INTEGER |  | editOnly |  |

---

## Bulk Export Details - Offers

**Table:** `bulk_export_details`  
**Foundry apiName:** `BulkExportDetails`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Bulk Export Details  

**Relationships:**
- has many **BulkCreatedSubmissions** (link: "Bulk Created Submission")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contract_duration` | contract_duration | INTEGER |  | editOnly |  |
| `contract_name` | contract_name | STRING |  | editOnly |  |
| `contract_start_date` | contract_start_date | STRING |  | editOnly |  |
| `expires_at` | expires_at | STRING |  | editOnly |  |
| `export_job_name` | export_job_name | STRING |  | editOnly |  |
| `is_pre_signed_from_tob` | is_pre_signed_from_tob | BOOLEAN |  | editOnly |  |
| `message_body` | message_body | STRING |  | editOnly |  |
| `message_subject` | message_subject | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `send_email` | send_email | STRING |  | editOnly |  |
| `template_id` | template_id | STRING |  | editOnly |  |
| `tob_email_closer` | tob_email_closer | STRING |  | editOnly |  |
| `tob_program` | tob_program | STRING |  | editOnly |  |

---

## Call [Close]

**Table:** `call_close`  
**Foundry apiName:** `CallClose`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **LeadClose** via `close_lead_id_1` (link: "Lead [Close]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `event_data_is_to_group_number` | Call is to Group Number | BOOLEAN |  | datasourceColumn |  |
| `event_data_call_method` | Call Method | STRING |  | datasourceColumn |  |
| `call_over_10_minute` | Call Over 10 Minute | TIMESTAMP |  | datasourceColumn |  |
| `call_over_20_minute` | Call Over 20 Minute | TIMESTAMP |  | datasourceColumn |  |
| `call_over_3_minute` | Call Over 3 Minute | TIMESTAMP |  | datasourceColumn |  |
| `call_over_minute` | Call Over Minute | TIMESTAMP |  | datasourceColumn |  |
| `close_lead_id` | Close Lead ID | STRING |  | datasourceColumn |  |
| `event_data_cost` | Cost | STRING |  | datasourceColumn |  |
| `event_data_local_country_iso` | Country ISO Code | STRING |  | datasourceColumn |  |
| `created_by` | Created by | STRING |  | datasourceColumn |  |
| `event_data_date_answered` | Date Answered | STRING |  | datasourceColumn |  |
| `event_data_dialer_id` | Dialer ID | STRING |  | datasourceColumn |  |
| `event_data_dialer_saved_search_id` | Dialer Saved Search ID | STRING |  | datasourceColumn |  |
| `event_data_disposition` | Disposition | STRING |  | datasourceColumn |  |
| `event_data_duration` | Duration | DOUBLE |  | datasourceColumn |  |
| `event_action` | Event Action | STRING |  | datasourceColumn |  |
| `event_data_created_by` | Event Data Created By | STRING |  | datasourceColumn |  |
| `event_data_direction` | Event Data Direction | STRING |  | datasourceColumn |  |
| `event_data_id` | Event Data ID | STRING |  | datasourceColumn |  |
| `event_data_voicemail_duration` | Event Data Voicemail Duration | DOUBLE |  | datasourceColumn |  |
| `event_id` | Event ID | STRING | PK | datasourceColumn |  |
| `event_object_id` | Event Object ID | STRING |  | datasourceColumn |  |
| `event_request_id` | Event Request ID | STRING |  | datasourceColumn |  |
| `event_data_has_recording` | Has Recording | BOOLEAN |  | datasourceColumn |  |
| `event_data_lead_id` | Lead Id | STRING |  | datasourceColumn |  |
| `mariadb_id` | MariaDB Id | STRING |  | datasourceColumn |  |
| `event_data_note` | Note | STRING |  | datasourceColumn |  |
| `event_data_note_date_updated` | Note Date Updated | STRING |  | datasourceColumn |  |
| `event_data_note_html` | Note HTML | STRING |  | datasourceColumn |  |
| `event_data_notetaker_id` | Notetaker ID | STRING |  | datasourceColumn |  |
| `event_data_parent_meeting_id` | Parent Meeting ID | STRING |  | datasourceColumn |  |
| `event_data_phone` | Phone | STRING |  | datasourceColumn |  |
| `event_data_recording_duration` | Recording Duration | STRING |  | datasourceColumn |  |
| `event_data_recording_expires_at` | Recording Expires at | STRING |  | datasourceColumn |  |
| `event_data_recording_history` | Recording History | ARRAY |  | datasourceColumn |  |
| `event_data_recording_transcript` | Recording Transcript | STRING |  | datasourceColumn |  |
| `event_data_recording_url` | Recording URL | STRING |  | datasourceColumn |  |
| `event_data_sequence_name` | Sequence Name | STRING |  | datasourceColumn |  |
| `event_data_sequence_subscription_id` | Sequence Subscription ID | STRING |  | datasourceColumn |  |
| `event_data_status` | Status | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `timestamp_string` | Timestamp String | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `event_data_updated_by` | Updated by | STRING |  | datasourceColumn |  |
| `event_data_updated_by_name` | Updated by Name | STRING |  | datasourceColumn |  |
| `event_data_user_name` | User Name | STRING |  | datasourceColumn |  |
| `event_data_voicemail_transcript` | Voicemail Transcript | STRING |  | datasourceColumn |  |

---

## Call Insight Answer

**Table:** `call_insight_answer`  
**Foundry apiName:** `CallInsightAnswer`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

AI-extracted answers from sales call transcripts, mapping specific questions to insights found in conversations.

**Key Relationships:**
- Links to [Insight] Scope Call for call context
- Links to Call Insight Question for question definitions
- Links to [Insight] Scope Run for batch processing context
- Links to [11 Labs] Phone Call Information for source call data
- Links to ID Match for lead identification

**Use Cases:**
- Extracting structured insights from unstructured call transcripts
- Analyzing customer responses to specific sales questions
- Building lead qualification models based on call content
- Sales coaching and quality assurance

**Relevant Properties:**
- Question: The insight question asked of the transcript
- Answer: The extracted answer from the call
- Answered: Whether the question was answered (Yes/No/Partially)
- Quote: Direct quote from the transcript supporting the answer
- Lead Email: Contact identifier for the lead
- Conversation Id: Reference to the source call  

**Relationships:**
- belongs to **CallInsightQuestion** via `question_id` (link: "Call Insight Question")
- belongs to **InsightScopeCall** via `conversation_id` (link: "[Insight] Scope Call")
- belongs to **InsightScopeRun** via `scope_run_foreign_key` (link: "[Insight] Scope Run")
- belongs to **IdMatch** via `lead_email` (link: "ID Match")
- belongs to **_11LabsPhoneCallInformation** via `conversation_id` (link: "[11 Labs] Phone Call Information")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | datasourceColumn | The extracted answer from the call transcript for the corresponding question |
| `answered` | Answered | STRING |  | datasourceColumn | Whether the question was answered in the call (Yes/No/Partially) |
| `call_duration` | Call Duration | INTEGER |  | editOnly |  |
| `category` | Category | STRING |  | editOnly |  |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn | Unique identifier for the conversation/call |
| `full_transcript_text` | Full Transcript Text | STRING |  | datasourceColumn | Complete text transcript of the call |
| `lead_email` | Lead Email | STRING |  | datasourceColumn | Email address of the lead associated with this call |
| `qa_id` | Primary Key | STRING | PK | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn | The insight question that was asked of the transcript |
| `question_id` | Question Id | STRING |  | datasourceColumn | Foreign key to the Call Insight Question object |
| `quote` | Quote | STRING |  | datasourceColumn | Direct quote from the transcript supporting the answer |
| `sales_representative_name` | Sales Representative Name | STRING |  | editOnly |  |
| `scope_run_foreign_key` | Scope Run Foreign Key | STRING |  | editOnly |  |

---

## Call Insight Answer Aggregated

**Table:** `call_insight_answer_aggregated`  
**Foundry apiName:** `CallInsightAnswerAggregated`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **CallInsightQuestion** via `question_id` (link: "Call Insight Question")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `aggregated_answers` | Aggregated Answers | STRING |  | datasourceColumn |  |
| `answer_json_list` | Answer Json List | ARRAY |  | datasourceColumn |  |
| `pk` | Pk | STRING | PK | datasourceColumn |  |
| `question_id` | Question Id | STRING |  | datasourceColumn |  |

---

## Call Insight Question

**Table:** `call_insight_question`  
**Foundry apiName:** `CallInsightQuestion`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **CallInsightAnswer** (link: "Call Insight Answer")
- has many **CallInsightAnswerAggregated** (link: "Call Insight Answer Aggregated")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `campaign` | Campaign | STRING |  | datasourceColumn |  |
| `category` | Category | STRING |  | editOnly |  |
| `exploration` | Exploration | ARRAY |  | datasourceColumn |  |
| `possible_answers` | Possible Answers | ARRAY |  | editOnly |  |
| `question_id` | Question Id | STRING | PK | datasourceColumn |  |
| `question_text` | Question Text | STRING |  | datasourceColumn |  |
| `question_title` | Question Title | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | editOnly |  |

---

## Call [Kickscale]

**Table:** `call_kickscale`  
**Foundry apiName:** `CallKickscale`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- has many **LeadKickscale** (link: "Lead [Kickscale]")
- has many **SpeakerKickscale** (link: "Speaker [Kickscale]")
- has many **InsightKickscale** (link: "Insight [Kickscale]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_created_at` | Call Created At | TIMESTAMP |  | datasourceColumn |  |
| `call_created_at_string` | Call Created At String | STRING |  | datasourceColumn |  |
| `call_crm_reference_lead_id` | Call Crm Reference Lead Id | STRING |  | datasourceColumn |  |
| `call_date` | Call Date | TIMESTAMP |  | datasourceColumn |  |
| `call_date_string` | Call Date String | STRING |  | datasourceColumn |  |
| `call_duration` | Call Duration | DOUBLE |  | datasourceColumn |  |
| `call_email_draft` | Call Email Draft | STRING |  | datasourceColumn |  |
| `call_feedback_text` | Call Feedback Text | STRING |  | datasourceColumn |  |
| `call_language` | Call Language | STRING |  | datasourceColumn |  |
| `call_transcript` | Call Transcript | STRING |  | datasourceColumn |  |
| `call_type_name` | Call Type Name | STRING |  | datasourceColumn |  |
| `call_user_id` | Call User Id | STRING |  | datasourceColumn |  |
| `call_user_name` | Call User Name | STRING |  | datasourceColumn |  |
| `call_id` | Call ID | STRING | PK | datasourceColumn |  |
| `id` | ID | STRING |  | datasourceColumn |  |

---

## [Zoom] Chat Message

**Table:** `chat_message_zoom`  
**Foundry apiName:** `ChatMessageZoom`  
**Status:** active  
**Datasources:** 3  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_instance_id_1` (link: "Meeting [Zoom]")
- belongs to **IdMatch** via `message_sender_e_mail` (link: "Contacts [TOB]")
- belongs to **MeetingParticipationZoom_1** via `primary_key_sender` (link: "[Zoom] Meeting Participation")
- has many **ZoomChatInsight** (link: "[Zoom] Chat Insight")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account ID | STRING |  | datasourceColumn |  |
| `count_characters` | Count Characters | INTEGER |  | datasourceColumn |  |
| `count_words` | Count Words | INTEGER |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_ts` | Event Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_date_created` | MariaDB Date Created | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | MariaDB ID | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_instance_id` | Meeting Instance ID | STRING |  | datasourceColumn |  |
| `message_content` | Message Content | STRING |  | datasourceColumn |  |
| `message_content_vector` | Message Content Vector | ARRAY |  | datasourceColumn |  |
| `message_datetime` | Message Date Time | TIMESTAMP |  | datasourceColumn |  |
| `message_id` | Message ID | STRING | PK | datasourceColumn |  |
| `recipient_email` | Message Recipient Email | STRING |  | datasourceColumn |  |
| `recipient_name` | Message Recipient Name | STRING |  | datasourceColumn |  |
| `recipient_session_id` | Message Recipient Session ID | STRING |  | datasourceColumn |  |
| `recipient_type` | Message Recipient Type | STRING |  | datasourceColumn |  |
| `sender_email` | Message Sender eMail | STRING |  | datasourceColumn |  |
| `sender_name` | Message Sender Name | STRING |  | datasourceColumn |  |
| `sender_session_id` | Message Sender Session ID | STRING |  | datasourceColumn |  |
| `sender_type` | Message Sender Type | STRING |  | datasourceColumn |  |
| `primary_key_sender` | Primary Key Sender | STRING |  | datasourceColumn |  |
| `recipient_foreign_key` | Recipient Foreign Key | STRING |  | datasourceColumn |  |
| `sender_foreign_key` | Sender Foreign Key | STRING |  | datasourceColumn |  |
| `strategy` | Strategy | STRING |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `word_list` | Word List | ARRAY |  | datasourceColumn |  |

---

## [Classified] Schmerzfrei Umfrage Unpivotiert

**Table:** `classified_schmerzfrei_umfrage_unpivotiert`  
**Foundry apiName:** `ClassifiedSchmerzfreiUmfrageUnpivotiert`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `e_mail_adresse` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `e_mail_adresse` | E Mail Adresse | STRING |  | datasourceColumn |  |
| `hash` | Hash | STRING | PK | datasourceColumn |  |
| `schmerzfrei_umfrage_answer` | Schmerzfrei Umfrage Answer | STRING |  | datasourceColumn |  |
| `schmerzfrei_umfrage_context_info` | Schmerzfrei Umfrage Context Info | STRING |  | datasourceColumn |  |
| `schmerzfrei_umfrage_question` | Schmerzfrei Umfrage Question | STRING |  | datasourceColumn |  |
| `submission_date` | Submission Date | STRING |  | datasourceColumn |  |
| `survey_source` | Survey Source | STRING |  | datasourceColumn |  |

---

## [Classified] WhatsApp

**Table:** `classified_whats_app`  
**Foundry apiName:** `ClassifiedWhatsApp`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `body` | Body | STRING |  | datasourceColumn |  |
| `contact_id` | Contact ID | STRING |  | datasourceColumn |  |
| `count_character` | Count Character | INTEGER |  | datasourceColumn |  |
| `count_words` | Count Words | INTEGER |  | datasourceColumn |  |
| `date_added` | Date Added | TIMESTAMP |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `mariadb_id` | Mariadb ID | STRING |  | datasourceColumn |  |
| `message_id` | Message ID | STRING | PK | datasourceColumn |  |
| `validation_reason` | Validation Reason | STRING |  | datasourceColumn |  |
| `validation_status` | Validation Status | BOOLEAN |  | datasourceColumn |  |

---

## [Classified] Zoom Chats

**Table:** `classified_zoom_chats`  
**Foundry apiName:** `ClassifiedZoomChats`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `sender_email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `count_characters` | Count Characters | INTEGER |  | datasourceColumn |  |
| `insight_decision` | Insight Decision | BOOLEAN |  | datasourceColumn |  |
| `insight_decision_reason` | Insight Decision Reason | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_instance_id` | Meeting Instance Id | STRING |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `message_content` | Message Content | STRING |  | datasourceColumn |  |
| `message_datetime` | Message Datetime | TIMESTAMP |  | datasourceColumn |  |
| `message_id` | Message Id | STRING | PK | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | datasourceColumn |  |
| `zoom_message_insight_classifier` | Zoom Message Insight Classifier | STRING |  | datasourceColumn |  |

---

## [Zoom] [Classified] Surveys

**Table:** `classified_zoom_surveys`  
**Foundry apiName:** `ClassifiedZoomSurveys`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `filename` | Filename | STRING |  | datasourceColumn |  |
| `id` | ID | STRING | PK | datasourceColumn |  |
| `man_ext_kontextualisierung_was_sollte_der_ai_agent_ber_diese_frage_wissen` | Man Ext Kontextualisierung Was Sollte Der AI Agent Uber Diese Frage Wissen | STRING |  | datasourceColumn |  |
| `man_ext_question_weight1_10` | Man Ext Question Weight 1 10 | INTEGER |  | datasourceColumn |  |
| `man_ext_use_question` | Man Ext Use Question | BOOLEAN |  | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |
| `question_utility_validation` | Question Utility Validation | STRING |  | datasourceColumn |  |
| `submission_date` | Submission Date | TIMESTAMP |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `validation_reason` | Validation Reason | STRING |  | datasourceColumn |  |
| `validation_status` | Validation Status | BOOLEAN |  | datasourceColumn |  |

---

## [Close] Call Transcript Chunks Embbeding

**Table:** `close_call_transcript_chunks_embbeding`  
**Foundry apiName:** `CloseCallTranscriptChunksEmbbeding`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **CloseTranscript** via `call_id` (link: "[Close] Transcript")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_id` | Call Id | STRING |  | datasourceColumn |  |
| `chunk_id` | Chunk Id | STRING | PK | datasourceColumn |  |
| `chunk_order` | Chunk Order | DOUBLE |  | datasourceColumn |  |
| `embedded_at` | Embedded At | TIMESTAMP |  | datasourceColumn |  |
| `embedding_vector` | Embedding Vector | VECTOR |  | datasourceColumn |  |
| `text_to_embed` | Text To Embed | STRING |  | datasourceColumn |  |
| `tokens` | Tokens | DOUBLE |  | datasourceColumn |  |
| `total_number_of_chunks` | Total Number Of Chunks | LONG |  | datasourceColumn |  |

---

## [Close] Connecting Call

**Table:** `close_connecting_call2`  
**Foundry apiName:** `CloseConnectingCall2`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **WahaLeadDraft** (link: "WAHA Lead Draft")
- belongs to **SalesAgent** via `activity_user_id` (link: "Sales Agent")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `activity_at` | Activity At | TIMESTAMP |  | datasourceColumn |  |
| `activity_call_id` | Activity Call Id | STRING |  | datasourceColumn |  |
| `activity_contact_id` | Activity Contact Id | STRING |  | datasourceColumn |  |
| `activity_conversation` | Activity Conversation | STRING |  | datasourceColumn |  |
| `activity_lead_id` | Activity Lead Id | STRING |  | datasourceColumn |  |
| `activity_summary_text` | Activity Summary Text | STRING |  | datasourceColumn |  |
| `activity_user_id` | Activity User Id | STRING |  | datasourceColumn |  |
| `custom_field_call_id` | Custom Field Call Id | STRING | PK | datasourceColumn |  |

---

## Close Generation Queue

**Table:** `close_generation_queue`  
**Foundry apiName:** `CloseGenerationQueue`  
**Status:** experimental  
**Datasources:** 1  
**Description:** OT to trigger AIP Logic for Close Insights Generation  

**Relationships:**
- has many **CloseInsightAnswer** (link: "Close Insight Answer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `generation_name` | Generation Name | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `selected_campaign` | Selected Campaign | STRING |  | editOnly |  |
| `transcript` | Transcript | STRING |  | editOnly |  |
| `user_id` | User Id | STRING |  | editOnly |  |

---

## Close Insight Answer

**Table:** `close_insight_answer`  
**Foundry apiName:** `CloseInsightAnswer`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Answers generated for questions  

**Relationships:**
- belongs to **CloseGenerationQueue** via `generation_id` (link: "Close Generation Queue")
- belongs to **CloseInsightQuestion** via `question_id` (link: "Close Insight Question")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answered` | Answered | STRING |  | editOnly |  |
| `close_call_id` | Close Call Id | STRING |  | editOnly |  |
| `close_lead_id` | Close Lead Id | STRING |  | editOnly |  |
| `created_at` | Created At | TIMESTAMP |  | editOnly |  |
| `generation_id` | Generation Id | STRING |  | editOnly |  |
| `generation_name` | Generation Name | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `question_id` | Question Id | STRING |  | editOnly |  |
| `sentiment` | Sentiment | STRING |  | editOnly |  |
| `summary` | Summary | STRING |  | editOnly |  |
| `transcript` | Transcript | STRING |  | editOnly |  |
| `user_id` | User Id | STRING |  | editOnly |  |

---

## Close Insight Question

**Table:** `close_insight_question`  
**Foundry apiName:** `CloseInsightQuestion`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Questions to generate insights on top of Close.io calls  

**Relationships:**
- has many **CloseInsightAnswer** (link: "Close Insight Answer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `campaign` | Campaign | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |

---

## Close IO Campaign Creation Job

**Table:** `close_io_campaign_creation_job`  
**Foundry apiName:** `CloseIoCampaignCreationJob`  
**Status:** experimental  
**Datasources:** 1  
**Description:** A queue to generate Close Smart View & Tasks for the leads  

**Relationships:**
- has many **CloseIoTaskForCampaign** (link: "Close IO Tasks For Campaign")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `additional_smart_view_filters` | Additional Smart View Filters | STRING |  | editOnly |  |
| `campaign_description` | Campaign Description | STRING |  | editOnly |  |
| `campaign_expiration_date` | Campaign Expiration Date | TIMESTAMP |  | editOnly |  |
| `campaign_id` | Campaign Id | STRING |  | editOnly |  |
| `campaign_objective` | Campaign Objective | STRING |  | editOnly |  |
| `lead_emails` | Lead Emails | ARRAY |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `triggered_at` | Triggered At | TIMESTAMP |  | editOnly |  |
| `triggered_by` | Triggered By | STRING |  | editOnly |  |

---

## Close IO Smart View Creation Job

**Table:** `close_io_smart_view_creation_job`  
**Foundry apiName:** `CloseIoSmartViewCreationJob`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **InsightCall** (link: "[Insight] Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `primary_key` | jobID | STRING | PK | datasourceColumn |  |
| `lead_emails` | leadEmails | ARRAY |  | editOnly |  |
| `smart_view_name` | smartViewName | STRING |  | editOnly |  |
| `triggered_at` | triggeredAt | TIMESTAMP |  | editOnly |  |
| `triggered_by` | triggeredBy | STRING |  | editOnly |  |

---

## Close IO Task For Campaign

**Table:** `close_io_task_for_campaign`  
**Foundry apiName:** `CloseIoTaskForCampaign`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Campaign Specific Tasks  

**Relationships:**
- belongs to **CloseIoCampaignCreationJob** via `campaign_pk` (link: "Close IO Campaign Creation Job")
- belongs to **CloseLeadViaApi** via `lead_close_id` (link: "[Close] Leads via API")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `campaign_pk` | Campaign PK | STRING |  | editOnly |  |
| `close_sync_details` | Close Sync Details | STRING |  | editOnly | Response code + trace of the api call to sync the task with close |
| `close_task_id` | Close Task Id | STRING |  | editOnly | CloseIO Task Id - present after successful sync |
| `description` | Description | STRING |  | editOnly | task description |
| `expiration_date` | Expiration Date | TIMESTAMP |  | editOnly | task expiration date |
| `lead_close_id` | Lead Id | STRING |  | editOnly |  |
| `lead_email` | Lead Email | STRING |  | editOnly |  |
| `objective` | Objective | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `status` | Status | STRING |  | editOnly |  |
| `task_owner` | Task Owner | STRING |  | editOnly | CloseIO Lead Owner |

---

## [Close] Lead via API

**Table:** `close_lead_via_api`  
**Foundry apiName:** `CloseLeadViaApi`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Lead records ingested directly from Close CRM via API. Each record represents a lead with full contact details, ownership information, and status as maintained in the Close sales platform.

**Lead Statuses:**
- Unklar (unclear)
- Interessiert (interested)
- Disqualifiziert (disqualified)
- Generell nicht Interessiert (generally not interested)
- Aktuell nicht interessiert (currently not interested)
- Aktiver Kunde (active customer)
- Nummer ungültig (invalid number)
- Ehemaliger Kunde (former customer)

**Key Relationships:**
- Links to [Close] Transcript (ONE-to-MANY) - call transcripts
- Links to ID Match (MANY-to-ONE) - identity resolution
- Links to Notes For High Quality Close Lead (ONE-to-ONE) - sales briefing notes
- Links to Close IO Tasks For Campaign (ONE-to-MANY) - campaign tasks

**Primary Use Cases:**
- Authoritative Close CRM lead data source
- Lead ownership and assignment tracking
- Status-based workflow automation
- Direct links to Close web interface for quick access

**Relevant Properties:**
- Display Name: Human-readable lead name
- Email: Primary email address
- Status Label: Current CRM status
- Lead Owner Full Name: Assigned sales rep
- HTML Url: Direct link to Close CRM
- Date Created: When lead was created

**Data Freshness:** Synced from Close API via incremental ingestion  

**Relationships:**
- has many **CloseIoTaskForCampaign** (link: "Close IO Tasks For Campaign")
- belongs to **IdMatch** via `email` (link: "ID Match")
- has many **CloseTranscript** (link: "[Close] Transcript")
- has many **NoteForHighQualityCloseLeads** (link: "Notes For High Quality Close Lead")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `date_created` | Date Created | TIMESTAMP |  | datasourceColumn | When the lead was created in Close |
| `date_updated` | Date Updated | TIMESTAMP |  | datasourceColumn | Last update timestamp in Close |
| `description` | Description | STRING |  | datasourceColumn | Lead description or notes from Close |
| `display_name` | Display Name | STRING |  | datasourceColumn | Human-readable display name of the lead |
| `email` | Email | STRING |  | datasourceColumn | Primary email address of the lead |
| `html_url` | Html Url | STRING |  | datasourceColumn | Direct link to the lead in Close CRM web interface |
| `ingestion_timestamp` | Ingestion Timestamp | TIMESTAMP |  | datasourceColumn | When this record was ingested into Foundry |
| `lead_country` | Lead Country | STRING |  | datasourceColumn | Country of the lead |
| `lead_id` | Lead Id | STRING | PK | datasourceColumn | Close CRM lead identifier (primary key) |
| `lead_owner_email` | Lead Owner Email | STRING |  | datasourceColumn | Email of the sales rep who owns this lead |
| `lead_owner_full_name` | Lead Owner Full Name | STRING |  | datasourceColumn | Name of the sales rep who owns this lead |
| `lead_owner_id` | Lead Owner Id | STRING |  | datasourceColumn | Close user ID of the lead owner |
| `lead_phone_formatted_raw` | Lead Phone Formatted Raw | STRING |  | datasourceColumn | Formatted but unvalidated phone number |
| `lead_phone_processed` | Lead Phone Processed | STRING |  | datasourceColumn | Normalized/processed phone number |
| `lead_phone_raw` | Lead Phone Raw | STRING |  | datasourceColumn | Original unprocessed phone number |
| `status_id` | Status Id | STRING |  | datasourceColumn | Close status ID (internal identifier) |
| `status_label` | Status Label | STRING |  | datasourceColumn | Current status in Close CRM (e.g., Unklar, Interessiert, Disqualifiziert) |
| `url` | Url | STRING |  | datasourceColumn | API URL for the lead in Close |

---

## [Close] Transcript

**Table:** `close_transcript`  
**Foundry apiName:** `CloseTranscript`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **LeadClose** via `lead_id` (link: "Leads [Close]")
- belongs to **CloseUser** via `user_id` (link: "[Close] User")
- belongs to **CloseLeadViaApi** via `lead_id` (link: "[Close] Leads via API")
- has many **InsightCall** (link: "[Insight] Call")
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")
- has many **CloseCallTranscriptChunksEmbbeding** (link: "[Close] Call Chunks Embbeding")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `activity_at` | Activity At | TIMESTAMP |  | datasourceColumn |  |
| `activity_custom_field_foundry` | Activity Custom Field Foundry | STRING |  | datasourceColumn |  |
| `activity_type` | Activity Type | STRING |  | datasourceColumn |  |
| `call_id` | Call Id | STRING | PK | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `conversation` | Conversation | STRING |  | datasourceColumn |  |
| `custom_activity_type_id` | Custom Activity Type Id | STRING |  | datasourceColumn |  |
| `date_created` | Date Created | TIMESTAMP |  | datasourceColumn |  |
| `date_updated` | Date Updated | TIMESTAMP |  | datasourceColumn |  |
| `direction` | Direction | STRING |  | datasourceColumn |  |
| `disposition` | Disposition | STRING |  | datasourceColumn |  |
| `duration` | Duration | INTEGER |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `has_speaker_labels` | Has Speaker Labels | BOOLEAN |  | datasourceColumn |  |
| `lead_id` | Lead Id | STRING |  | datasourceColumn |  |
| `processing_timestamp` | Processing Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `speakers` | Speakers | STRING |  | datasourceColumn |  |
| `summary_html` | Summary Html | STRING |  | datasourceColumn |  |
| `summary_text` | Summary Text | STRING |  | datasourceColumn |  |
| `transcript_id` | Transcript Id | STRING |  | datasourceColumn |  |
| `transcript_type` | Transcript Type | STRING |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |
| `utterances` | Utterances | STRING |  | datasourceColumn |  |

---

## [Close] User

**Table:** `close_user`  
**Foundry apiName:** `CloseUser`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **InsightCall** (link: "[Insight] Call")
- has many **CloseTranscript** (link: "[Close] Transcript")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `date_created` | Date Created | TIMESTAMP |  | datasourceColumn |  |
| `date_updated` | Date Updated | TIMESTAMP |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `email_verified_at` | Email Verified At | TIMESTAMP |  | datasourceColumn |  |
| `first_name` | First Name | STRING |  | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `google_profile_image_url` | Google Profile Image Url | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `image` | Image | STRING |  | datasourceColumn |  |
| `last_name` | Last Name | STRING |  | datasourceColumn |  |
| `last_used_timezone` | Last Used Timezone | STRING |  | datasourceColumn |  |
| `organizations` | Organizations | STRING |  | datasourceColumn |  |

---

## Coach

**Table:** `coach`  
**Foundry apiName:** `Coach`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `bio` | Bio | STRING |  | datasourceColumn |  |
| `certifications` | Certifications | STRING |  | datasourceColumn |  |
| `coach_id` | Coach Id | STRING | PK | datasourceColumn |  |
| `contact_info` | Contact Info | STRING |  | datasourceColumn |  |
| `experience_years` | Experience Years | STRING |  | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `languages` | Languages | STRING |  | datasourceColumn |  |
| `photo_link` | Photo Link | STRING |  | datasourceColumn |  |
| `specialty` | Specialty | STRING |  | datasourceColumn |  |

---

## Cohort

**Table:** `cohort`  
**Foundry apiName:** `Cohort`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Groups users who started their program around the same date. Enables cohort-based progress tracking.  

**Relationships:**
- has many **Subscription** (link: "Subscription")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `cohort_slug` | Cohort Slug | STRING | PK | redacted |  |
| `cohort_subscription_start_date` | Cohort Subscription Start Date | DATE |  | redacted |  |

---

## Complete Survey Text

**Table:** `complete_survey_text`  
**Foundry apiName:** `CompleteSurveyText`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING | PK | datasourceColumn |  |
| `readable_survey` | Readable Survey | STRING |  | datasourceColumn |  |

---

## Contract

**Table:** `contract`  
**Foundry apiName:** `Contract`  
**Status:** active  
**Datasources:** 1  
**Description:** Signed contracts from both PandaDocs and Docuseal representing customer agreements for program enrollment. The source of truth for billing, payment schedules, and subscription terms.

**📊 Data Statistics:**
*Last updated: February 3rd, 2026 at 13:09 CET — Statistics may be outdated; refresh if needed.*

- Total Contracts: 12,915
- Unique Customers: 6,644
- Unique Programs: 3

**Status Distribution:**
- Expired: 10,247 (79%)
- Completed: 2,627 (20%)
- Pending: 41 (<1%)

**Contract Type Distribution:**
- New Subscription: 11,458 (89%)
- Subscription Extension: 1,001 (8%)
- Other: 303 (2%)
- Test Contract: 141 (1%)

**Value Statistics:**
- Average Value: €9,149
- Maximum Value: €500,000 (likely outlier)
- Minimum Value: €0

**Top Contract Templates:**
- SF.Ausbildung BULK: 4,626 contracts
- SF.Foundation Performance BULK: 4,156 contracts
- SF.Blueprint.Arthrose BULK: 1,418 contracts

**Key Relationships:**
- Links to Customer (contract signer)
- Links to Program (enrolled program)
- Links to Subscriptions (created subscriptions)
- Links to Orders
- Links to Opportunities

**Payment Structure:**
- Supports up to 12 payment installments
- Includes payment dates and amounts for each installment

**Primary Use Cases:**
- Revenue tracking and forecasting
- Payment schedule management
- Subscription creation workflow
- Customer financial history

**Data Freshness:** Synced from Docuseal contract platform  

**Relationships:**
- has many **BulkCreatedSubmissions** (link: "Bulk Created Submission")
- has many **Order** (link: "Order")
- has many **Opportunity** (link: "Opportunity")
- belongs to **Program** via `program_id` (link: "Program")
- belongs to **Contract** via `first_subscription_contract_id` (link: "First Subscription Contract")
- has many **Contract** (link: "Extension Contract")
- belongs to **Customer** via `customer_id` (link: "Customer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `completion_date` | Completion Date | DATE |  | datasourceColumn | Date the contract was fully signed/completed. |
| `customer_email` | Contract Customer Email | STRING |  | datasourceColumn | Email of the customer who signed the contract. |
| `contract_id` | Contract Id | STRING | PK | datasourceColumn | Primary key - unique identifier for each contract from Docuseal. |
| `contract_name` | Contract Name | STRING |  | datasourceColumn | Human-readable name of the contract, typically includes program and date information. |
| `contract_type` | Contract Type | STRING |  | datasourceColumn | Type of contract: 'New Subscription' (11,458 - 89%), 'Subscription Extension' (1,001 - 8%), 'Other' (303), 'Test Contract' (141). |
| `contract_url` | Contract Url | STRING |  | datasourceColumn | Direct link to view the signed contract document. |
| `creation_date` | Creation Date | DATE |  | datasourceColumn | Date the contract was created/generated. |
| `currency_base` | Currency Base | STRING |  | datasourceColumn | Base currency for the contract value (typically EUR). |
| `customer_address` | Customer Address | STRING |  | datasourceColumn |  |
| `customer_birth_date` | Customer Birth Date | DATE |  | datasourceColumn |  |
| `customer_city` | Customer City | STRING |  | datasourceColumn |  |
| `customer_contract_status` | Customer Contract Status | STRING |  | datasourceColumn |  |
| `customer_country` | Customer Country | STRING |  | datasourceColumn |  |
| `customer_first_name` | Customer First Name | STRING |  | datasourceColumn | First name as provided on the contract. |
| `customer_id` | Customer Id | STRING |  | datasourceColumn | Foreign key linking to the Customer object. |
| `customer_last_name` | Customer Last Name | STRING |  | datasourceColumn | Last name as provided on the contract. |
| `customer_postal_code` | Customer Postal Code | STRING |  | datasourceColumn |  |
| `duration_months` | Duration (Months) | STRING |  | datasourceColumn | Contract duration in months. |
| `end_date` | Expected End Date | DATE |  | datasourceColumn | Expected contract/subscription end date. |
| `first_subscription_contract_id` | First Subscription Contract ID | STRING |  | datasourceColumn | References the original contract ID for subscription extensions, linking back to the first contract in the subscription chain. |
| `is_missing_info` | Is Missing Info | BOOLEAN |  | datasourceColumn | Indicates whether a subscription contract (New Subscription or Subscription Extension) is missing key information required for processing. Automatically flagged when contracts are missing program assignments, start dates, values, or other critical data. |
| `missing_info_issues` | Missing Info Issues | ARRAY |  | editOnly | List of specific data quality issues found in subscription contracts. Possible values: 'Missing assigned program', 'Missing start date', 'Missing gross value', 'Missing First Subscription Contract ID', 'Missing duration'. |
| `payment_01_amount` | Payment 01 Amount | FLOAT |  | datasourceColumn |  |
| `payment_01_date` | Payment 01 Date | DATE |  | datasourceColumn |  |
| `payment_02_amount` | Payment 02 Amount | FLOAT |  | datasourceColumn |  |
| `payment_02_date` | Payment 02 Date | DATE |  | datasourceColumn |  |
| `payment_03_amount` | Payment 03 Amount | FLOAT |  | datasourceColumn |  |
| `payment_03_date` | Payment 03 Date | DATE |  | datasourceColumn |  |
| `payment_04_amount` | Payment 04 Amount | FLOAT |  | datasourceColumn |  |
| `payment_04_date` | Payment 04 Date | DATE |  | datasourceColumn |  |
| `payment_05_amount` | Payment 05 Amount | FLOAT |  | datasourceColumn |  |
| `payment_05_date` | Payment 05 Date | DATE |  | datasourceColumn |  |
| `payment_06_amount` | Payment 06 Amount | FLOAT |  | datasourceColumn |  |
| `payment_06_date` | Payment 06 Date | DATE |  | datasourceColumn |  |
| `payment_07_amount` | Payment 07 Amount | FLOAT |  | datasourceColumn |  |
| `payment_07_date` | Payment 07 Date | DATE |  | datasourceColumn |  |
| `payment_08_amount` | Payment 08 Amount | FLOAT |  | datasourceColumn |  |
| `payment_08_date` | Payment 08 Date | DATE |  | datasourceColumn |  |
| `payment_09_amount` | Payment 09 Amount | FLOAT |  | datasourceColumn |  |
| `payment_09_date` | Payment 09 Date | DATE |  | datasourceColumn |  |
| `payment_10_amount` | Payment 10 Amount | FLOAT |  | datasourceColumn |  |
| `payment_10_date` | Payment 10 Date | DATE |  | datasourceColumn |  |
| `payment_11_amount` | Payment 11 Amount | FLOAT |  | datasourceColumn |  |
| `payment_11_date` | Payment 11 Date | DATE |  | datasourceColumn |  |
| `payment_12_amount` | Payment 12 Amount | FLOAT |  | datasourceColumn |  |
| `payment_12_date` | Payment 12 Date | DATE |  | datasourceColumn |  |
| `payment_terms` | Payment Terms | STRING |  | datasourceColumn | Payment schedule terms (e.g., monthly, quarterly, full payment). |
| `program_id` | Program Id | STRING |  | datasourceColumn | Foreign key linking to the Program object. |
| `source` | Source | STRING |  | datasourceColumn |  |
| `start_date` | Start Date | DATE |  | datasourceColumn | Program/subscription start date per contract terms. |
| `status` | Status | STRING |  | datasourceColumn | Contract status: 'expired' (10,247 - 79%), 'completed' (2,627 - 20%), 'pending' (41 - <1%). Conditional formatting: green=completed, red=expired. |
| `template_id` | Template Id | STRING |  | datasourceColumn |  |
| `template_name` | Template Name | STRING |  | datasourceColumn | Name of the contract template used. Top templates include SF.Ausbildung BULK, SF.Foundation Performance BULK, SF.Blueprint.Arthrose BULK. |
| `tob_contract_status` | Tob Contract Status | STRING |  | datasourceColumn |  |
| `value_gross_base` | Value Gross Base | DOUBLE |  | datasourceColumn | Total contract value in base currency (EUR). Average: €9,149, Max: €500,000. |

---

## Contracts To Be Exported (need approval)

**Table:** `contracts_to_be_exported_need_approval`  
**Foundry apiName:** `ContractsToBeExportedNeedApproval`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Contracts To Be Exported (need approval)  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `additional_clause_satisfaction_guarantee` | Additional Clause Satisfaction Guarantee | STRING |  | datasourceColumn |  |
| `additional_contract_information` | Additional Contract Information | STRING |  | datasourceColumn |  |
| `billing_address_city` | Billing Address City | STRING |  | datasourceColumn |  |
| `billing_address_company_name` | Billing Address Company Name | STRING |  | datasourceColumn |  |
| `billing_address_country` | Billing Address Country | STRING |  | datasourceColumn |  |
| `billing_address_postal_code` | Billing Address Postal Code | STRING |  | datasourceColumn |  |
| `billing_address_street_house_number` | Billing Address Street House Number | STRING |  | datasourceColumn |  |
| `billing_address_vat_id` | Billing Address Vat Id | STRING |  | datasourceColumn |  |
| `close_opportunity_id` | Close Opportunity Id | STRING |  | datasourceColumn |  |
| `confirmation_information_correct` | Confirmation Information Correct | STRING |  | datasourceColumn |  |
| `contract_date_time` | Contract Date Time | STRING |  | datasourceColumn |  |
| `contract_id` | Contract Id | STRING | PK | datasourceColumn |  |
| `contract_name` | Contract Name | STRING |  | datasourceColumn |  |
| `contract_recording_video` | Contract Recording Video | STRING |  | datasourceColumn |  |
| `contract_recording_zoom_link` | Contract Recording Zoom Link | STRING |  | datasourceColumn |  |
| `contract_url` | Contract Url | STRING |  | datasourceColumn |  |
| `customer_birthday` | Customer Birthday | DATE |  | datasourceColumn |  |
| `customer_email` | Customer Email | STRING |  | datasourceColumn |  |
| `customer_email_ab_re1` | Customer Email Ab re1 | STRING |  | datasourceColumn |  |
| `customer_first_name` | Customer First Name | STRING |  | datasourceColumn |  |
| `customer_gender` | Customer Gender | STRING |  | datasourceColumn |  |
| `customer_last_name` | Customer Last Name | STRING |  | datasourceColumn |  |
| `customer_type` | Customer Type | STRING |  | datasourceColumn |  |
| `effective_product_price_gross_total` | Effective Product Price Gross Total | DOUBLE |  | datasourceColumn |  |
| `email_address` | Email Address | STRING |  | datasourceColumn |  |
| `export_status` | Export Status | STRING |  | datasourceColumn |  |
| `has_matched_bexio_order` | Has Matched Bexio Order | BOOLEAN |  | datasourceColumn |  |
| `has_previous_contract_in_30_days` | Has Previous Contract In 30 Days | BOOLEAN |  | datasourceColumn |  |
| `lzr_end` | Lzr End | DATE |  | datasourceColumn |  |
| `lzr_start` | Lzr Start | DATE |  | datasourceColumn |  |
| `make_execution_id` | Make Execution Id | STRING |  | datasourceColumn |  |
| `payment_10_amount` | Payment 10 Amount | FLOAT |  | datasourceColumn |  |
| `payment_10_date` | Payment 10 Date | DATE |  | datasourceColumn |  |
| `payment_11_amount` | Payment 11 Amount | FLOAT |  | datasourceColumn |  |
| `payment_11_date` | Payment 11 Date | DATE |  | datasourceColumn |  |
| `payment_12_amount` | Payment 12 Amount | FLOAT |  | datasourceColumn |  |
| `payment_12_date` | Payment 12 Date | DATE |  | datasourceColumn |  |
| `payment_13_amount` | Payment 13 Amount | FLOAT |  | datasourceColumn |  |
| `payment_13_date` | Payment 13 Date | DATE |  | datasourceColumn |  |
| `payment_14_amount` | Payment 14 Amount | FLOAT |  | datasourceColumn |  |
| `payment_14_date` | Payment 14 Date | DATE |  | datasourceColumn |  |
| `payment_15_amount` | Payment 15 Amount | FLOAT |  | datasourceColumn |  |
| `payment_15_date` | Payment 15 Date | DATE |  | datasourceColumn |  |
| `payment_16_amount` | Payment 16 Amount | FLOAT |  | datasourceColumn |  |
| `payment_16_date` | Payment 16 Date | DATE |  | datasourceColumn |  |
| `payment_1_amount` | Payment 1 Amount | FLOAT |  | datasourceColumn |  |
| `payment_1_date` | Payment 1 Date | DATE |  | datasourceColumn |  |
| `payment_2_amount` | Payment 2 Amount | FLOAT |  | datasourceColumn |  |
| `payment_2_date` | Payment 2 Date | DATE |  | datasourceColumn |  |
| `payment_3_amount` | Payment 3 Amount | FLOAT |  | datasourceColumn |  |
| `payment_3_date` | Payment 3 Date | DATE |  | datasourceColumn |  |
| `payment_4_amount` | Payment 4 Amount | FLOAT |  | datasourceColumn |  |
| `payment_4_date` | Payment 4 Date | DATE |  | datasourceColumn |  |
| `payment_5_amount` | Payment 5 Amount | FLOAT |  | datasourceColumn |  |
| `payment_5_date` | Payment 5 Date | DATE |  | datasourceColumn |  |
| `payment_6_amount` | Payment 6 Amount | FLOAT |  | datasourceColumn |  |
| `payment_6_date` | Payment 6 Date | DATE |  | datasourceColumn |  |
| `payment_7_amount` | Payment 7 Amount | FLOAT |  | datasourceColumn |  |
| `payment_7_date` | Payment 7 Date | DATE |  | datasourceColumn |  |
| `payment_8_amount` | Payment 8 Amount | FLOAT |  | datasourceColumn |  |
| `payment_8_date` | Payment 8 Date | DATE |  | datasourceColumn |  |
| `payment_9_amount` | Payment 9 Amount | FLOAT |  | datasourceColumn |  |
| `payment_9_date` | Payment 9 Date | DATE |  | datasourceColumn |  |
| `payment_agreements` | Payment Agreements | STRING |  | datasourceColumn |  |
| `prev_contract_id` | Prev Contract Id | STRING |  | datasourceColumn |  |
| `prev_contract_url` | Prev Contract Url | STRING |  | datasourceColumn |  |
| `prev_signature_date` | Prev Signature Date | DATE |  | datasourceColumn |  |
| `product_currency` | Product Currency | STRING |  | datasourceColumn |  |
| `program_start_session_scheduled_on` | Program Start Session Scheduled On | STRING |  | datasourceColumn |  |
| `reason_for_decline_export` | reason_for_decline_export | STRING |  | editOnly | Decline export for a specific contract. This property stores the reason for declining this contract. |
| `send_onboarding` | Send Onboarding | BOOLEAN |  | datasourceColumn |  |
| `signature_date` | Signature Date | DATE |  | datasourceColumn |  |
| `skool_invite` | Skool Invite | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `upload_ab_re1_to_pipedrive` | Upload Ab re1 To Pipedrive | STRING |  | datasourceColumn |  |
| `your_email_address_according_to_close_account` | Your Email Address According To Close Account | STRING |  | datasourceColumn |  |

---

## CSIC - Coaching Session Insight Chunk

**Table:** `csic_coaching_session_insight_chunk`  
**Foundry apiName:** `CsicCoachingSessionInsightChunk`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `chunk_position` | Chunk Position | INTEGER |  | datasourceColumn |  |
| `chunk_row_id` | Chunk Row Id | LONG |  | datasourceColumn |  |
| `complete_chunk` | Complete Chunk | STRING |  | datasourceColumn |  |
| `complete_chunk_embedding` | Complete Chunk Embedding | VECTOR |  | datasourceColumn |  |
| `csicid` | Csicid | STRING | PK | datasourceColumn |  |
| `csictitle` | Csictitle | STRING |  | datasourceColumn |  |
| `guided_exercises` | Guided Exercises | STRING |  | datasourceColumn |  |
| `meeting_start_time` | Meeting Start Time | TIMESTAMP |  | datasourceColumn |  |
| `meeting_duration` | Payload Object Duration | DOUBLE |  | datasourceColumn |  |
| `meeting_id` | Payload Object Id | STRING |  | datasourceColumn |  |
| `meeting_topic` | Payload Object Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Payload Object Uuid | STRING |  | datasourceColumn |  |
| `recording_id` | Recording Id | STRING |  | datasourceColumn |  |
| `required_equipment` | Required Equipment | STRING |  | datasourceColumn |  |
| `session_goal` | Session Goal | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `session_name_abbreviation` | Session Name Abbreviation | STRING |  | datasourceColumn |  |
| `session_name_description` | Session Name Description | STRING |  | datasourceColumn |  |
| `session_summary_long` | Session Summary Long | STRING |  | datasourceColumn |  |
| `session_summary_short` | Session Summary Short | STRING |  | datasourceColumn |  |

---

## Customer

**Table:** `customer`  
**Foundry apiName:** `Customer`  
**Status:** active  
**Datasources:** 1  
**Description:** Person who signed a contract for a program. Created when contract is completed. App account is created internally afterward. May not have app_user yet if account creation is pending.  

**Relationships:**
- has many **FormSubmissionsV2** (link: "Form Submissions v2")
- has many **StructureAnalysisInstance** (link: "Structure Analysis Instance")
- has many **Subscription** (link: "Subscription")
- belongs to **LeadClose** via `lead_id` (link: "Leads")
- has many **Order** (link: "Order")
- has many **FunnelboxContactV2** (link: "[Funnelbox] Contact v2")
- has many **FunnelboxEmailThread** (link: "[Funnelbox] EMail Thread")
- has many **Invoice** (link: "Invoice")
- has many **Opportunity** (link: "Opportunity")
- has many **TicketFluent** (link: "Tickets [Fluent]")
- belongs to **AppUser** via `app_user_id` (link: "App User")
- has many **GhlMessageV2** (link: "[Funnelbox] eMail")
- has many **Contract** (link: "Contract")
- has many **StructureAnalysisElement** (link: "Structure Analysis Element")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `address` | Address | STRING |  | redacted |  |
| `app_user_id` | App User Id | STRING |  | redacted | Foreign key linking to the App User object. Used for linking customer to their web app account and tracking app engagement. |
| `birth_date` | Birth Date | DATE |  | redacted | Customer's date of birth. Used for age-based program recommendations. |
| `city` | City | STRING |  | redacted |  |
| `contact_id` | Contact Id | STRING |  | redacted | Funnelbox Contact ID for linking to marketing/engagement data. |
| `country` | Country | STRING |  | redacted |  |
| `customer_id` | Customer Id (Email) | STRING | PK | redacted | Primary key - typically the customer's email (lowercase). |
| `email` | Email | STRING |  | redacted |  |
| `first_name` | First Name | STRING |  | redacted |  |
| `full_name` | Full Name | STRING |  | redacted |  |
| `has_booked_celebration_call` | Has Booked Celebration Call | BOOLEAN |  | redacted | Deprecated - no longer in use. |
| `has_participated_to_celebration_call` | Has Participated To Celebration Call | BOOLEAN |  | redacted | Deprecated - no longer in use. |
| `last_name` | Last Name | STRING |  | redacted |  |
| `lead_id` | Lead Id | STRING |  | redacted | Reference to the original Lead record from Close CRM. Links customer back to their pre-conversion lead data. |
| `phone` | Phone | STRING |  | redacted | Customer phone number. Hidden by default for privacy. |
| `postal_code` | Postal Code | STRING |  | redacted |  |
| `user_created_in_web_app` | Is User Created In Web App | BOOLEAN |  | redacted | Whether an app account exists for this customer. False = pending account creation. |

---

## Customer Session Opened

**Table:** `customer_session_opened`  
**Foundry apiName:** `CustomerSessionOpened`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Log events of a person opening a session from the app  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action` | Action | STRING |  | datasourceColumn |  |
| `created_ts` | Created Ts | LONG |  | datasourceColumn |  |
| `data_user_mail` | Data User Mail | STRING | PK | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |

---

## Daily Recap Email

**Table:** `daily_recap_email`  
**Foundry apiName:** `DailyRecapEmail`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `date_session` | Date Session | DATE | PK | datasourceColumn |  |
| `day_content` | Day Content | STRING |  | datasourceColumn |  |
| `focus_points` | Focus Points | STRING |  | datasourceColumn |  |
| `moment_content` | Moment Content | STRING |  | datasourceColumn |  |
| `morning_email_betreff` | Morning Email Betreff | STRING |  | datasourceColumn |  |
| `morning_email_highlight` | Morning Email Highlight | STRING |  | datasourceColumn |  |
| `morning_email_intro` | Morning Email Intro | STRING |  | datasourceColumn |  |
| `morning_email_moment` | Morning Email Moment | STRING |  | datasourceColumn |  |
| `morning_email_outro` | Morning Email Outro | STRING |  | datasourceColumn |  |
| `morning_email_reconnection` | Morning Email Reconnection | STRING |  | datasourceColumn |  |
| `morning_email_session` | Morning Email Session | STRING |  | datasourceColumn |  |
| `morning_email_support` | Morning Email Support | STRING |  | datasourceColumn |  |
| `pain_point` | Pain Point | ARRAY |  | datasourceColumn |  |
| `recap_email_betreff` | Recap Email Betreff | STRING |  | datasourceColumn |  |
| `recap_email_editorial` | Recap Email Editorial | STRING |  | datasourceColumn |  |
| `recap_email_moment` | Recap Email Moment | STRING |  | datasourceColumn |  |
| `recap_email_outlook` | Recap Email Outlook | STRING |  | datasourceColumn |  |
| `recap_email_sessions` | Recap Email Sessions | STRING |  | datasourceColumn |  |
| `recap_email_support` | Recap Email Support | STRING |  | datasourceColumn |  |
| `remainder_email_editorial` | Remainder Email Editorial | STRING |  | datasourceColumn |  |
| `remainder_email_help` | Remainder Email Help | STRING |  | datasourceColumn |  |
| `remainder_email_moment` | Remainder Email Moment | STRING |  | datasourceColumn |  |
| `remainder_email_outro` | Remainder Email Outro | STRING |  | datasourceColumn |  |
| `remainder_email_session` | Remainder Email Session | STRING |  | datasourceColumn |  |
| `remainder_email_subject` | Remainder Email Subject | STRING |  | datasourceColumn |  |
| `session_day` | Session Day | LONG |  | datasourceColumn |  |

---

## Draft Whatsapp Answer

**Table:** `draft_whatsapp_answer`  
**Foundry apiName:** `DraftWhatsappAnswer`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **WhatsAppMessageV4** via `message_replied_to` (link: "Whats App Message V4")
- belongs to **WhatsappDraftGeneration** via `generation_id` (link: "Whatsapp Draft Generation")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | datasourceColumn |  |
| `approved_at` | Approved At | TIMESTAMP |  | datasourceColumn |  |
| `approved_by` | Approved By | STRING |  | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `draft_id` | Draft Id | STRING | PK | datasourceColumn |  |
| `generated_answer` | Generated Answer | STRING |  | datasourceColumn |  |
| `generated_at` | Generated At | TIMESTAMP |  | datasourceColumn |  |
| `generation_id` | Generation Id | STRING |  | datasourceColumn |  |
| `message_replied_to` | Message Replied To | STRING |  | datasourceColumn |  |
| `modified_at` | Modified At | TIMESTAMP |  | datasourceColumn |  |
| `modified_by` | Modified By | STRING |  | datasourceColumn |  |

---

## Email Offer Cohort

**Table:** `email_offer_cohort`  
**Foundry apiName:** `EmailOfferCohort`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")
- belongs to **leadProfilev2** via `ghl_contact_ids` (link: "Lead Profile")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `cohort_name` | Cohort Name | STRING |  | editOnly |  |
| `created_at` | Created At | TIMESTAMP |  | editOnly |  |
| `created_by` | Created By | STRING |  | editOnly |  |
| `email` | Email | STRING |  | editOnly |  |
| `ghl_contact_ids` | GHL Contact IDs | ARRAY |  | editOnly |  |
| `name` | Name | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | editOnly |  |
| `sender_name` | Sender Name | STRING |  | editOnly |  |

---

## [Embedding] Cluster

**Table:** `embedding_cluster`  
**Foundry apiName:** `EmbeddingCluster`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `cluster_description_embd` | Cluster Description Embedding | VECTOR |  | datasourceColumn |  |
| `cluster_id` | Cluster Id | STRING | PK | datasourceColumn |  |
| `cluster_ticket_example_embd` | Cluster Ticket Example Embd | VECTOR |  | datasourceColumn |  |
| `similarity_score` | Similarity Score | DOUBLE |  | datasourceColumn |  |

---

## Equipment

**Table:** `equipment`  
**Foundry apiName:** `Equipment`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **Part** (link: "Part")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `equipment_active` | Equipment Active | BOOLEAN |  | redacted |  |
| `equipment_capacity` | Equipment Capacity | INTEGER |  | redacted |  |
| `equipment_id` | Equipment Id | STRING | PK | redacted |  |
| `equipment_inspection_date` | Equipment Inspection Date | DATE |  | redacted |  |
| `equipment_inspection_id` | Equipment Inspection Id | STRING |  | redacted |  |
| `equipment_installation_date` | Equipment Installation Date | DATE |  | redacted |  |
| `equipment_model` | Equipment Model | STRING |  | redacted |  |
| `equipment_name` | Equipment Name | STRING |  | redacted |  |
| `equipment_plant` | Equipment Plant | STRING |  | redacted |  |
| `equipment_type` | Equipment Type | STRING |  | redacted |  |
| `equipment_year` | Equipment Year | INTEGER |  | redacted |  |

---

## Final Output

**Table:** `final_output`  
**Foundry apiName:** `FinalOutput`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `all_landmarks` | All Landmarks | STRING |  | datasourceColumn |  |
| `analysis_text` | Analysis Text | STRUCT |  | datasourceColumn |  |
| `error` | Error | STRING |  | datasourceColumn |  |
| `image_name` | Image Name | STRING |  | datasourceColumn |  |
| `input_image_rid` | Input Image Rid | STRING |  | datasourceColumn |  |
| `landmarks` | Landmarks | STRING |  | datasourceColumn |  |
| `measurements` | Measurements | STRING |  | datasourceColumn |  |
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `model` | Model | STRING |  | datasourceColumn |  |
| `ok` | Ok | STRING |  | datasourceColumn |  |
| `output_image_rid` | Output Image Rid | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `processing_status` | Processing Status | STRING |  | datasourceColumn |  |
| `prompt_version` | Prompt Version | STRING |  | datasourceColumn |  |
| `segmentation` | Segmentation | STRING |  | datasourceColumn |  |
| `standardization` | Standardization | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `uuid` | UUID | STRING | PK | datasourceColumn |  |
| `validation` | Validation | STRING |  | datasourceColumn |  |

---

## Final Output multi nodes

**Table:** `final_output_multi_nodes`  
**Foundry apiName:** `FinalOutputMultiNodes`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `all_landmarks` | All Landmarks | STRING |  | datasourceColumn |  |
| `ankle_tibia_analysis_text` | Analysis Text | STRUCT |  | datasourceColumn |  |
| `breathing_space_analysis_text` | Breathing Space Analysis Text | STRUCT |  | datasourceColumn |  |
| `cervical_head_analysis_text` | Cervical Head Analysis Text | STRUCT |  | datasourceColumn |  |
| `cervical_spine_behavior_text` | Cervical Spine Behavior Text | STRUCT |  | datasourceColumn |  |
| `correction_prio_text` | Correction Prio Text | STRUCT |  | datasourceColumn |  |
| `error` | Error | STRING |  | datasourceColumn |  |
| `femur_hip_analysis_text` | Femur Hip Analysis Text | STRUCT |  | datasourceColumn |  |
| `image_name` | Image Name | STRING |  | datasourceColumn |  |
| `input_image_rid` | Input Image Rid | STRING |  | datasourceColumn |  |
| `kinetics_breaks_ditribution_text` | Kinetics Breaks Ditribution Text | STRUCT |  | datasourceColumn |  |
| `knee_analysis_text` | Knee Analysis Text | STRUCT |  | datasourceColumn |  |
| `landmarks` | Landmarks | STRING |  | datasourceColumn |  |
| `lumbar_spine_behavior_text` | Lumbar Spine Behavior Text | STRUCT |  | datasourceColumn |  |
| `measurements` | Measurements | STRING |  | datasourceColumn |  |
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `model` | Model | STRING |  | datasourceColumn |  |
| `ok_knee_analysis_text` | Ok Knee Analysis Text | STRING |  | datasourceColumn |  |
| `ok_ankle_tibia_text` | Ok Ankle Tibia Text | STRING |  | datasourceColumn |  |
| `ok_breathing_space_analysis_text` | Ok Breathing Space Analysis Text | STRING |  | datasourceColumn |  |
| `ok_cervical_head_analysis_text` | Ok Cervical Head Analysis Text | STRING |  | datasourceColumn |  |
| `ok_cervical_spine_behavior_text` | Ok Cervical Spine Behavior Text | STRING |  | datasourceColumn |  |
| `ok_correction_prio_text` | Ok Correction Prio Text | STRING |  | datasourceColumn |  |
| `ok_femur_hip_analysis_text` | Ok Femur Hip Analysis Text | STRING |  | datasourceColumn |  |
| `ok_kinetics_breaks_ditribution_text` | Ok Kinetics Breaks Ditribution Text | STRING |  | datasourceColumn |  |
| `ok_lumbar_spine_behavior_text` | Ok Lumbar Spine Behavior Text | STRING |  | datasourceColumn |  |
| `ok_pattern_chain_recognition_text` | Ok Pattern Chain Recognition Text | STRING |  | datasourceColumn |  |
| `ok_pattern_integration_text` | Ok Pattern Integration Text | STRING |  | datasourceColumn |  |
| `ok_pelvis_analysis_text` | Ok Pelvis Analysis Text | STRING |  | datasourceColumn |  |
| `ok_shoulder_arm_text` | Ok Shoulder Arm Text | STRING |  | datasourceColumn |  |
| `ok_thoracic_spine_behavior_text` | Ok Thoracic Spine Behavior Text | STRING |  | datasourceColumn |  |
| `ok_thorax_analysis_text` | Ok Thorax Analysis Text | STRING |  | datasourceColumn |  |
| `ok_trunk_pressure_distribution_text` | Ok Trunk Pressure Distribution Text | STRING |  | datasourceColumn |  |
| `output_image_rid` | Output Image Rid | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `pattern_chain_recognition_text` | Pattern Chain Recognition Text | STRUCT |  | datasourceColumn |  |
| `pattern_integration_text` | Pattern Integration Text | STRUCT |  | datasourceColumn |  |
| `pelvis_analysis_text` | Pelvis Analysis Text | STRUCT |  | datasourceColumn |  |
| `processing_status` | Processing Status | STRING |  | datasourceColumn |  |
| `prompt_version` | Prompt Version | STRING |  | datasourceColumn |  |
| `segmentation` | Segmentation | STRING |  | datasourceColumn |  |
| `shoulder_arm_text` | Shoulder Arm Text | STRUCT |  | datasourceColumn |  |
| `standardization` | Standardization | STRING |  | datasourceColumn |  |
| `thoracic_spine_behavior_text` | Thoracic Spine Behavior Text | STRUCT |  | datasourceColumn |  |
| `thorax_analysis_text` | Thorax Analysis Text | STRUCT |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `trunk_pressure_distribution_text` | Trunk Pressure Distribution Text | STRUCT |  | datasourceColumn |  |
| `uuid` | UUID | STRING | PK | datasourceColumn |  |
| `validation` | Validation | STRING |  | datasourceColumn |  |

---

## Form Submission

**Table:** `form_submission`  
**Foundry apiName:** `FormSubmission`  
**Status:** experimental  
**Datasources:** 1  
**Description:** User form submission (CW Form Tool).  

**Relationships:**
- has many **FormSubmissionAnswer** (link: "Form Submission Answer")
- belongs to **AppUser** via `user_id` (link: "App User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `form_name` | Form Name | STRING |  | redacted |  |
| `form_submission_id` | Form Submission Id | STRING | PK | redacted |  |
| `submission_date` | Submission Date | TIMESTAMP |  | redacted |  |
| `user_id` | User Id | STRING |  | redacted |  |

---

## Form Submission Answer

**Table:** `form_submission_answer`  
**Foundry apiName:** `FormSubmissionAnswer`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Individual question/answer pairs within a form submission. Contains user-provided health data, quiz responses, and self-assessments.  

**Relationships:**
- belongs to **FormSubmission** via `form_submission_id` (link: "Form Submission")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | redacted |  |
| `form_submission_answer_id` | Form Submission Answer Id | STRING | PK | redacted |  |
| `form_submission_id` | Form Submission Id | STRING |  | redacted |  |
| `question` | Question | STRING |  | redacted |  |
| `question_index` | Question Index | INTEGER |  | redacted |  |

---

## Form Submissions v2

**Table:** `form_submissions_v2`  
**Foundry apiName:** `FormSubmissionsV2`  
**Status:** active  
**Datasources:** 1  
**Description:** Form submissions from marketing and customer engagement forms. Tracks lead capture, opt-ins, surveys, and other form-based interactions.

**📊 Data Statistics:**
*Last updated: February 3rd, 2026 at 13:09 CET — Statistics may be outdated; refresh if needed.*

- Total Submissions: 294,760
- Unique Emails: 94,109
- Unique Forms: 108

**Top Forms by Submission Count:**
1. Phone Optin Schmerzfrei Summit - korall: 68,256
2. Schmerzfrei-Summit Formular PopUp Red Button: 53,712
3. Abmelden (Opt-Out) Formular - Newsletter: 17,351
4. Schmerzfrei Show: Popup LP NEU: 14,004
5. Summit Pop-Up Formular für LP HELL: 13,728
6. Phone Optin Schmerzfrei Show: 12,459
7. Arthrosefrei-Workshop Formular PopUp Red Button: 11,618
8. Summit 11-2025 Formular für LP INPAGE: 10,477
9. Ausbildung 10-2025 LP PopUp Formular: 8,483
10. Schmerzfrei-Umfrage Summit 2025-08: 8,320

**Form Categories:**
- Phone opt-in forms (summit, show, workshop, ausbildung)
- Pop-up forms (landing pages)
- Opt-out/unsubscribe forms
- Survey/Umfrage forms

**Key Relationships:**
- Links to Customer (via email)
- Links to Funnelbox Contact v2

**Primary Use Cases:**
- Lead capture tracking
- Marketing funnel analysis
- Opt-in/opt-out management
- Survey response tracking
- Event registration

**Note:** Consider consolidating with App Form Submission object for unified form tracking.

**Data Freshness:** Updated from GHL/Funnelbox form submissions  

**Relationships:**
- belongs to **Customer** via `email` (link: "Customer")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | datasourceColumn | Foreign key linking to Funnelbox Contact. |
| `email` | Email | STRING |  | datasourceColumn | Email of the person who submitted the form. Links to Customer. |
| `form_id` | Form Id | STRING |  | datasourceColumn | Technical identifier for the form template. |
| `form_name` | Form Name | STRING |  | datasourceColumn | Name of the submitted form. 108 unique forms. Top forms include Phone Optin forms (68k), Summit Popup forms (54k), Opt-Out forms (17k). |
| `form_submission_id` | Form Submission Id | STRING | PK | datasourceColumn | Primary key - unique identifier for each form submission. |
| `submitted_at` | Submitted At | TIMESTAMP |  | datasourceColumn | Timestamp when the form was submitted. |
| `submitter_full_name` | Submitter Full Name | STRING |  | datasourceColumn | Full name of the form submitter. |

---

## [Product] Lecture

**Table:** `foundry_data_coaching_programm_lektionen`  
**Foundry apiName:** `FoundryDataCoachingProgrammLektionen`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Lektionen werden aufgezählt & beschrieben  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `lektion_beschreibung` | Lektion Beschreibung | STRING |  | datasourceColumn |  |
| `lektion_id` | Lektion ID | STRING | PK | datasourceColumn |  |
| `lektion_name` | Lektion Name | STRING |  | datasourceColumn |  |
| `lektion_url` | Lektion URL | STRING |  | datasourceColumn |  |
| `zuordnung_modul_id` | Zuordnung Modul ID | DECIMAL |  | datasourceColumn |  |

---

## [Product] Module

**Table:** `foundry_data_coaching_programm_module`  
**Foundry apiName:** `FoundryDataCoachingProgrammModule`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Module Innerhalb des Programmes: Schmerzfrei 4.0 werden beschrieben   

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `modul_beschreibung` | Modul Beschreibung | STRING |  | datasourceColumn |  |
| `modul_id` | Modul ID | STRING | PK | datasourceColumn |  |
| `modul_name` | Modul Name | STRING |  | datasourceColumn |  |
| `modul_url` | Modul URL | STRING |  | datasourceColumn |  |
| `zuordnung_programm_id` | Zuordnung Programm ID | DECIMAL |  | datasourceColumn |  |

---

## [Product] Session-Type

**Table:** `foundry_data_coaching_programm_session_typen`  
**Foundry apiName:** `FoundryDataCoachingProgrammSessionTypen`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Die verschiedenen Session Typen im Programm 4.0 werden beschrieben und aufgezählt  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `session_description` | Session Description | STRING |  | datasourceColumn |  |
| `session_id` | Session ID | STRING | PK | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `zuordnung_lekture_id` | Zuordnung Lekture ID | DECIMAL |  | datasourceColumn |  |

---

## Foundry Resource

**Table:** `foundry_resource`  
**Foundry apiName:** `FoundryResource`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **FoundryResourceRole** (link: "Foundry Resource Role")
- has many **FoundryResourceAlert** (link: "Foundry Resource Alert")
- has many **FoundryResourceDailyCost** (link: "Foundry Resource Daily Cost")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `avg_file_size_mb` | Avg File Size Mb | DOUBLE |  | datasourceColumn |  |
| `created_by` | Created By | STRING |  | datasourceColumn |  |
| `created_time` | Created Time | TIMESTAMP |  | datasourceColumn |  |
| `description` | Description | STRING |  | datasourceColumn |  |
| `display_name` | Display Name | STRING |  | datasourceColumn |  |
| `documentation` | Documentation | STRING |  | datasourceColumn |  |
| `number_of_files` | Number Of Files | LONG |  | datasourceColumn |  |
| `parent_folder_rid` | Parent Folder Rid | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `project_name` | Project Name | STRING |  | datasourceColumn |  |
| `project_rid` | Project Rid | STRING |  | datasourceColumn |  |
| `rid` | Rid | STRING | PK | datasourceColumn |  |
| `service_account_access_error` | Service Account Access Error | STRING |  | datasourceColumn |  |
| `size_gbs` | Size Gbs | DOUBLE |  | datasourceColumn |  |
| `space_rid` | Space Rid | STRING |  | datasourceColumn |  |
| `trash_status` | Trash Status | STRING |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `updated_by` | Updated By | STRING |  | datasourceColumn |  |
| `updated_time` | Updated Time | TIMESTAMP |  | datasourceColumn |  |

---

## Foundry Resource Alert

**Table:** `foundry_resource_alert`  
**Foundry apiName:** `FoundryResourceAlert`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FoundryResource** via `rid` (link: "Foundry Resource")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `alert_category` | Alert Category | STRING |  | datasourceColumn |  |
| `alert_id` | Alert Id | STRING | PK | datasourceColumn |  |
| `alert_type` | Alert Type | STRING |  | datasourceColumn |  |
| `assignee` | Assignee | STRING |  | datasourceColumn |  |
| `context` | Context | STRING |  | datasourceColumn |  |
| `rid` | Rid | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |

---

## Foundry Resource Daily Cost

**Table:** `foundry_resource_daily_cost`  
**Foundry apiName:** `FoundryResourceDailyCost`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FoundryResource** via `resource_rid` (link: "Foundry Resource")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `currency_usage` | Currency Usage | DOUBLE |  | datasourceColumn |  |
| `currency_usage_unit` | Currency Usage Unit | STRING |  | datasourceColumn |  |
| `date` | Date | DATE |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `resource_rid` | Resource Rid | STRING |  | datasourceColumn |  |

---

## Foundry Resource Role

**Table:** `foundry_resource_role`  
**Foundry apiName:** `FoundryResourceRole`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FoundryResource** via `resource_rid` (link: "Foundry Resource")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `principal_id` | Principal Id | STRING |  | datasourceColumn |  |
| `principal_type` | Principal Type | STRING |  | datasourceColumn |  |
| `resource_rid` | Resource Rid | STRING |  | datasourceColumn |  |
| `resource_role_id` | Resource Role Id | STRING | PK | datasourceColumn |  |
| `role_id` | Role Id | STRING |  | datasourceColumn |  |

---

## Foundry User

**Table:** `foundry_user`  
**Foundry apiName:** `FoundryUser`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Foundry Users  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `attributes` | Attributes | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `family_name` | Family Name | STRING |  | datasourceColumn |  |
| `given_name` | Given Name | STRING |  | datasourceColumn |  |
| `group_names_membership` | Group Names Membership | ARRAY |  | datasourceColumn |  |
| `hash_called` | Hash Called | STRING |  | datasourceColumn |  |
| `hash_value` | Hash Value | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `organization` | Organization | STRING |  | datasourceColumn |  |
| `realm` | Realm | STRING |  | datasourceColumn |  |
| `username` | Username | STRING |  | datasourceColumn |  |

---

## [Funnelbox] Contact v2

**Table:** `funnelbox_contact_v2`  
**Foundry apiName:** `FunnelboxContactV2`  
**Status:** active  
**Datasources:** 2  
**Description:** **Last time documentation was updated: 2026-02-04**

Marketing automation contacts from the Funnelbox (GHL) platform. This is the central contact entity linking leads across marketing campaigns, contracts, support interactions, and sales activities. Contains comprehensive attribution, contract status, and engagement data.

**Key Data Categories:**
- **Attribution**: First/last source, session tracking
- **Bexio Integration**: Client status, LZR dates, program enrollment
- **PandaDoc/DocuSeal**: Contract sending, viewing, signing status
- **Communication**: DND settings, email status
- **Sales Assignment**: TOB user assignments, favorited by users

**Key Relationships:**
- Links to [Typed Facts] Lead (MANY-to-ONE) - consolidated lead data
- Links to Touchpoints v2 Curated (ONE-to-MANY) - all interactions
- Links to [Funnelbox] WhatsApp Chat (MANY-to-ONE)
- Links to [Funnelbox] eMail (ONE-to-MANY)
- Links to Marketing Offer Participation (ONE-to-MANY)
- Links to Customer (MANY-to-ONE)
- Links to ID Match (ONE-to-ONE)
- Plus 19 more link types

**Primary Use Cases:**
- Central contact management and 360° view
- Contract status tracking (PandaDoc/DocuSeal)
- Marketing attribution analysis
- Sales assignment and ownership
- Client lifecycle tracking (Bexio integration)

**Relevant Properties:**
- Email: Primary contact email
- Full Name: Contact full name
- Phone: Contact phone number
- Tags: Segmentation tags
- Pandadoc/Docuseal fields: Contract status
- Bexio fields: Client lifecycle status
- Attribution fields: Marketing source tracking

**Data Freshness:** Synced from Funnelbox/GHL with enrichment from multiple sources  

**Relationships:**
- has many **FormSubmissionsV2** (link: "Form Submissions v2")
- has many **GhlFormQA** (link: "[GHL] Form Q&A")
- has many **StructureAnalysisInstance** (link: "Structure Analysis Instance")
- has many **ZoomEventSessionAttendance** (link: "[Zoom] Event Session Attendance")
- has many **DraftWhatsappAnswer** (link: "Draft Whatsapp Answer")
- has many **JanaDraft** (link: "Jana Draft")
- has many **TouchpointV2Embeddings** (link: "Touchpoint v2 Embedding")
- belongs to **SalesCrmAusbildungLeadEnriched** via `email` (link: "[Sales CRM] Ausbildung Leads Enriched")
- has many **GhlMessageV2** (link: "[Funnelbox] eMail")
- has many **TouchpointsV2Curated** (link: "Touchpoints v2 Curated")
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")
- belongs to **WhatsAppChatV2** via `id` (link: "[Funnelbox] WhatsApp Chat")
- has many **MarketingOfferParticipationDaily** (link: "Marketing Offer Participation Daily")
- has many **WhatsAppThreadV4** (link: "Whats App Thread V4")
- has many **LeadProfile** (link: "Lead Metric")
- has many **InsightCall** (link: "[Insight] Call")
- has many **FunnelboxEmailThread** (link: "[Funnelbox] EMail Thread")
- has many **LeadMindsetStagesv2** (link: "Lead Mindset Stage")
- has many **SalesAlerts** (link: "Sales Alert")
- belongs to **leadProfilev2** via `id` (link: "Lead Profile")
- has many **GhlSurveyQA** (link: "[GHL] Survey Q&A")
- has many **InsightTypeResponseV2** (link: "Insight Type Responses v2")
- belongs to **Customer** via `email` (link: "Customer")
- has many **StructureAnalysisElement** (link: "Structure Analysis Element")
- has many **FunnelboxVideoTracking** (link: "[Funnelbox] Video Tracking")
- has many **TouchpointV2** (link: "Touchpoints v2")
- has many **MarketingOfferParticipation** (link: "Marketing Offer Participation")
- has many **WhatsAppMessageV4** (link: "Whats App Message V4")
- has many **IdMatch** (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `attribution_source_session_source` | Attribution Source Session Source | STRING |  | datasourceColumn | Detailed session-level source attribution for the contact's most recent or current session. |
| `bexio_is_active_main_program_client` | Bexio Is Active Main Program Client | BOOLEAN |  | datasourceColumn | Indicates whether the contact is currently active in the main program (within their LZR/contract period). |
| `bexio_is_client` | Bexio Is Client | BOOLEAN |  | datasourceColumn | Indicates whether this contact exists as a client in the Bexio accounting/ERP system. True means they have made at least one purchase. |
| `bexio_is_finishing_lzr_30_days` | Bexio Is Finishing Lzr 30 Days | BOOLEAN |  | datasourceColumn | Indicates whether the client's service period ends within the next 30 days. Used for early renewal campaign targeting. |
| `bexio_is_finishing_lzr_7_days` | Bexio Is Finishing Lzr 7 Days | BOOLEAN |  | datasourceColumn | Indicates whether the client's service period ends within the next 7 days. Used for renewal/retention outreach triggers. |
| `bexio_is_finishing_lzr_90_days` | Bexio Is Finishing Lzr 90 Days | BOOLEAN |  | datasourceColumn | Indicates whether the client's service period ends within the next 90 days. Used for long-term renewal planning. |
| `bexio_is_main_program_client` | Bexio Is Main Program Client | BOOLEAN |  | datasourceColumn | Indicates whether the contact is enrolled in the main program (SF.Foundation Performance 12-month coaching program). |
| `bexio_is_training_cert_client` | Bexio Is Training Cert Client | BOOLEAN |  | datasourceColumn | Indicates whether the contact is enrolled in a training certification program (Ausbildung). |
| `bexio_lzr_end_date` | Bexio Lzr End Date | DATE |  | datasourceColumn | End date of the contact's Leistungszeitraum (service period). Used to identify clients nearing program completion. |
| `bexio_lzr_month_duration` | Bexio Lzr Month Duration | LONG |  | datasourceColumn | Duration of the client's program in months (typically 12 or 13 months for the main program). |
| `bexio_lzr_start_date` | Bexio Lzr Start Date | DATE |  | datasourceColumn | Start date of the contact's Leistungszeitraum (service period) for their main program subscription. |
| `bexio_was_main_program_client` | Bexio Was Main Program Client | BOOLEAN |  | datasourceColumn | Indicates whether the contact was previously enrolled in the main program but has since completed or churned. |
| `contract_is_signed` | Contract Is Signed | BOOLEAN |  | datasourceColumn | Unified flag indicating whether a contract has been signed via either PandaDoc or DocuSeal. Primary indicator for sales conversion. |
| `country` | Country | STRING |  | datasourceColumn | Contact's country of residence, typically captured as an ISO country code (e.g., 'CH' for Switzerland). Used for regional targeting and compliance. |
| `custom_fields` | Custom Fields | ARRAY |  | datasourceColumn | Array of custom field values in JSON format. Contains additional data captured from forms or workflows that doesn't fit standard fields. |
| `dnd_settings_email_status` | Dnd Settings Email Status | STRING |  | datasourceColumn | Email Do-Not-Disturb status. Values: 'active' (can receive emails) or 'inactive' (opted out or unsubscribed from email communications). |
| `docuseal_bexio_id` | Docuseal Bexio Id | STRING |  | datasourceColumn | Bexio client ID reference stored in the DocuSeal contract for accounting integration. |
| `docuseal_contract_id` | Docuseal Contract Id | STRING |  | datasourceColumn | Unique identifier for the DocuSeal contract associated with this contact. |
| `docuseal_contract_name` | Docuseal Contract Name | STRING |  | datasourceColumn | Human-readable name of the DocuSeal contract. |
| `docuseal_duration_months` | Docuseal Duration Months | STRING |  | datasourceColumn | Contract duration in months as specified in the DocuSeal contract. |
| `docuseal_is_contract_main_program` | Docuseal Is Contract Main Program | BOOLEAN |  | datasourceColumn | Indicates whether the DocuSeal contract is for the main program. |
| `docuseal_is_signed` | Docuseal Is Signed | BOOLEAN |  | datasourceColumn | Indicates whether the contact has signed the DocuSeal contract. |
| `docuseal_program` | Docuseal Program | STRING |  | datasourceColumn | Program type specified in the DocuSeal contract (e.g., 'Schmerzfrei-Coaching'). |
| `docuseal_sent_date` | Docuseal Sent Date | DATE |  | datasourceColumn | Date when the DocuSeal contract was sent to the contact. |
| `docuseal_sent_last_4_weeks` | Docuseal Sent Last 4 Weeks | BOOLEAN |  | datasourceColumn | Indicates whether a DocuSeal contract was sent within the last 4 weeks. Used to avoid duplicate sends. |
| `docuseal_start_date` | Docuseal Start Date | DATE |  | datasourceColumn | Program start date as specified in the DocuSeal contract. |
| `docuseal_template_id` | Docuseal Template Id | STRING |  | datasourceColumn | ID of the DocuSeal template used to generate the contract. |
| `email` | Email | STRING |  | datasourceColumn | Primary email address of the contact. Used as the title property and main communication channel for marketing and sales outreach. |
| `favorited_by_tob` | Favorited By Tob | ARRAY |  | datasourceColumn | Array of TOB user IDs who have marked this contact as a favorite for quick access or priority follow-up. |
| `first_attribution_source` | First Attribution Source | STRING |  | datasourceColumn | Marketing channel that first brought this contact. Values include: 'CRM UI', 'CRM Workflows', 'Trigger Link', 'Referral', 'Social media', 'Third Party', 'Direct traffic', 'Paid Search', 'Organic Search', 'Other'. |
| `first_name` | First Name | STRING |  | datasourceColumn | Contact's first name as provided during sign-up or captured from form submissions. |
| `full_name` | Full Name | STRING |  | datasourceColumn | Contact's complete name, typically derived by combining first and last name fields. |
| `has_ticket` | Has Ticket | BOOLEAN |  | datasourceColumn | Indicates whether the contact has an open support ticket requiring attention. |
| `id` | Id | STRING | PK | datasourceColumn | Unique identifier for the contact in the Funnelbox/GHL system. This is the primary key used to link across all related entities. |
| `is_deleted` | Is Deleted | BOOLEAN |  | datasourceColumn | Indicates whether the contact has been soft-deleted in the source system. Deleted contacts are retained for historical reference but excluded from active workflows. |
| `is_qualified_for_psychological_profile` | Is Qualified For Psychological Profile | BOOLEAN |  | datasourceColumn | Indicates whether the contact has sufficient touchpoint data to generate a psychological profile for personalized sales engagement. |
| `last_attribution_source` | Last Attribution Source | STRING |  | datasourceColumn | Most recent marketing channel the contact interacted with. Values match First Attribution Source options. |
| `last_name` | Last Name | STRING |  | datasourceColumn | Contact's last name as provided during sign-up or captured from form submissions. |
| `lobby_attendance` | Lobby Attendance | BOOLEAN |  | datasourceColumn | Indicates whether the contact attended the lobby/waiting room for a live event or session. |
| `notes` | Notes | STRING |  | datasourceColumn | Free-text notes about the contact, typically added by sales or support team members for additional context. |
| `pandadoc_has_draft` | Pandadoc Has Draft | BOOLEAN |  | datasourceColumn | Indicates whether a PandaDoc contract draft has been created for this contact. |
| `pandadoc_is_contract_main_program` | Pandadoc Is Contract Main Program | BOOLEAN |  | datasourceColumn | Indicates whether the PandaDoc contract is for the main SF.Foundation Performance program. |
| `pandadoc_is_sent` | Pandadoc Is Sent | BOOLEAN |  | datasourceColumn | Indicates whether a PandaDoc contract has been sent to the contact for signature. |
| `pandadoc_is_signed` | Pandadoc Is Signed | BOOLEAN |  | datasourceColumn | Indicates whether the contact has signed the PandaDoc contract. Critical for sales conversion tracking. |
| `pandadoc_is_viewed` | Pandadoc Is Viewed | BOOLEAN |  | datasourceColumn | Indicates whether the contact has opened/viewed the sent PandaDoc contract. |
| `pandadoc_is_voided` | Pandadoc Is Voided | BOOLEAN |  | datasourceColumn | Indicates whether the PandaDoc contract was voided/cancelled before completion. |
| `pandadoc_name` | Pandadoc Name | STRING |  | datasourceColumn | Name of the contact as recorded in PandaDoc for contract generation. |
| `pandadoc_pandadoc_document_id` | Pandadoc Pandadoc Document Id | STRING |  | datasourceColumn | ID of the most recent PandaDoc document/contract associated with this contact. |
| `pandadoc_pandadoc_id` | Pandadoc Pandadoc Id | STRING |  | datasourceColumn | Unique PandaDoc recipient/contact ID used to link contracts and documents. |
| `pandadoc_sent_last_4_weeks` | Pandadoc Sent Last 4 Weeks | BOOLEAN |  | datasourceColumn | Indicates whether a PandaDoc contract was sent to this contact within the last 4 weeks. Used to avoid duplicate sends. |
| `pandadoc_template_name` | Pandadoc Template Name | STRING |  | datasourceColumn | Name of the PandaDoc contract template used. Indicates program type and version (e.g., SF.Foundation Performance 12-Monate). |
| `pandadoc_ts_document_draft` | Pandadoc Ts Document Draft | TIMESTAMP |  | datasourceColumn | Timestamp when the PandaDoc contract draft was created. |
| `pandadoc_ts_document_sent` | Pandadoc Ts Document Sent | TIMESTAMP |  | datasourceColumn | Timestamp when the PandaDoc contract was sent to the contact. |
| `pandadoc_ts_document_signed` | Pandadoc Ts Document Signed | TIMESTAMP |  | datasourceColumn | Timestamp when the contact signed the PandaDoc contract. |
| `pandadoc_ts_document_viewed` | Pandadoc Ts Document Viewed | TIMESTAMP |  | datasourceColumn | Timestamp when the contact first viewed the PandaDoc contract. |
| `pandadoc_ts_document_voided` | Pandadoc Ts Document Voided | TIMESTAMP |  | datasourceColumn | Timestamp when the PandaDoc contract was voided. |
| `pandadoc_url_signing_customer` | Pandadoc Url Signing Customer | STRING |  | datasourceColumn | Direct URL for the customer to access and sign the PandaDoc contract. |
| `phone` | Phone | STRING |  | datasourceColumn | Contact's phone number in international format. Used for SMS campaigns, WhatsApp communication, and sales calls. |
| `profile_generated_at` | Profile Generated At | TIMESTAMP |  | datasourceColumn | Timestamp when the psychological profile was last generated or updated. |
| `psychological_profile` | Psychological Profile | STRING |  | datasourceColumn | AI-generated psychological profile summarizing the contact's pain points, motivations, objections, and transformation goals based on their touchpoint data and survey responses. |
| `source` | Source | STRING |  | datasourceColumn | Original source where the contact was captured (e.g., form name, landing page, popup). Contains the specific form or campaign identifier. |
| `tags` | Tags | ARRAY |  | datasourceColumn | Array of tags applied to the contact for segmentation and automation purposes. Tags indicate campaign participation, event attendance, workflow triggers, and behavioral segments (e.g., 'summit-2025-11-14-anmeldung', 'email clicked alltime'). |
| `timestamp_creation` | Timestamp Creation | TIMESTAMP |  | datasourceColumn | Timestamp when the contact was first created in the Funnelbox/GHL system. |
| `timestamp_last_update` | Timestamp Last Update | TIMESTAMP |  | datasourceColumn | Timestamp of the most recent update to the contact record in Funnelbox/GHL. |
| `tob_assigned_email` | Tob Assigned Email | STRING |  | datasourceColumn | Email address of the assigned TOB team member for internal routing and notifications. |
| `tob_assigned_id` | Tob Assigned Id | STRING |  | datasourceColumn | Internal ID of the TOB (The Original Body) team member assigned to this contact for sales or support ownership. |
| `tob_assigned_name` | Tob Assigned Name | STRING |  | datasourceColumn | Name of the assigned TOB team member responsible for this contact. |

---

## [Funnelbox] EMail Thread

**Table:** `funnelbox_email_thread`  
**Foundry apiName:** `FunnelboxEmailThread`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- belongs to **Customer** via `contact_email` (link: "Customer")
- has many **GhlMessageV2** (link: "[Funnelbox] eMail")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_email` | Contact Email | STRING |  | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `from` | From | STRING |  | datasourceColumn |  |
| `is_thread_unanswered` | Is Thread Unanswered | BOOLEAN |  | datasourceColumn |  |
| `latest_message_timestamp` | Latest Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `mailbox` | Mailbox | STRING |  | datasourceColumn |  |
| `original_direction` | Original Direction | STRING |  | datasourceColumn |  |
| `original_timestamp` | Original Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `subject` | Subject | STRING |  | datasourceColumn |  |
| `thread_id` | Thread Id | STRING | PK | datasourceColumn |  |
| `to` | To | STRING |  | datasourceColumn |  |

---

## Funnelbox Tags Creation Job

**Table:** `funnelbox_tags_creation_job`  
**Foundry apiName:** `FunnelboxTagsCreationJob`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `primary_key` | chunkID | STRING | PK | datasourceColumn |  |
| `contact_ids` | contactIDs | ARRAY |  | editOnly |  |
| `description` | description | STRING |  | editOnly |  |
| `errors` | errors | ARRAY |  | editOnly |  |
| `errors_count` | errorsCount | INTEGER |  | editOnly |  |
| `failed_contact_ids` | failedContactIDs | ARRAY |  | editOnly |  |
| `job_id` | jobID | STRING |  | editOnly |  |
| `name` | name | STRING |  | editOnly |  |
| `response_code` | responseCode | INTEGER |  | editOnly |  |
| `response_succeded` | responseSucceded | BOOLEAN |  | editOnly |  |
| `tags` | tags | ARRAY |  | editOnly |  |
| `triggered_at` | triggeredAt | TIMESTAMP |  | editOnly |  |
| `triggered_by` | triggeredBy | STRING |  | editOnly |  |

---

## [Funnelbox] Video

**Table:** `funnelbox_video`  
**Foundry apiName:** `FunnelboxVideo`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxVideoTracking** via `video_trackings` (link: "[Funnelbox] Video Tracking")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `emails` | Emails | ARRAY |  | datasourceColumn |  |
| `ghl_contact_ids` | Ghl Contact Ids | ARRAY |  | datasourceColumn |  |
| `mean_watchtime` | Mean Watchtime | DOUBLE |  | datasourceColumn |  |
| `num_consumers` | Num Consumers | LONG |  | datasourceColumn |  |
| `video` | Video | STRING | PK | datasourceColumn |  |
| `video_trackings` | Video Trackings | ARRAY |  | datasourceColumn |  |

---

## [Funnelbox] Video Tracking

**Table:** `funnelbox_video_tracking`  
**Foundry apiName:** `FunnelboxVideoTracking`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `email` (link: "[Funnelbox] Contact v2")
- has many **FunnelboxVideo** (link: "[Funnelbox] Video")
- belongs to **IdMatch** via `email` (link: "ID Match")
- belongs to **GhlContactV2** via `ghl_contact_id` (link: "[Funnelbox] Contact")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `ghl_contact_id` | Ghl Contact Id | STRING |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING | PK | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `video` | Video | STRING |  | datasourceColumn |  |
| `watchtime` | Watchtime | DOUBLE |  | datasourceColumn |  |
| `watchtime_string` | Watchtime String | STRING |  | datasourceColumn |  |
| `workflow_id` | Workflow Id | STRING |  | datasourceColumn |  |
| `workflow_name` | Workflow Name | STRING |  | datasourceColumn |  |

---

## [GHL] Form

**Table:** `ghl_form`  
**Foundry apiName:** `GhlForm`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **GhlFormQA** (link: "[GHL] Form Q&A")
- belongs to **GhlFormQuestion** via `question_ids` (link: "[GHL] Form Question")
- belongs to **GhlFormSubmission** via `submission_ids` (link: "[GHL] Form Submission")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `count_submissions` | #Submissions | LONG |  | redacted |  |
| `event_datadocument_url` | Event Datadocument URL | STRING |  | redacted |  |
| `form_id` | Form Id | STRING | PK | redacted |  |
| `form_name` | Form Name | STRING |  | redacted |  |
| `question_ids` | Question Ids | ARRAY |  | redacted |  |
| `submission_contact_ids` | Submission Contact Ids | ARRAY |  | redacted |  |
| `submission_ids` | Submission Ids | ARRAY |  | redacted |  |

---

## [GHL] Form Q&A

**Table:** `ghl_form_qa`  
**Foundry apiName:** `GhlFormQA`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `e_mail` (link: "ID Match")
- belongs to **GhlForm** via `form_id_1` (link: "[GHL] Form")
- belongs to **FunnelboxContactV2** via `ghl_id` (link: "[Funnelbox] Contact v2")
- belongs to **GhlFormQuestion** via `question_id` (link: "[GHL] Form Question")
- belongs to **GhlContactV2** via `ghl_id` (link: "[Funnelbox] Contact")
- belongs to **GhlFormSubmission** via `submission_id` (link: "[GHL] Form Submission")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | redacted |  |
| `answer_options` | Answer Options | ARRAY |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `e_mail` | eMail | STRING |  | redacted |  |
| `form_id` | Form ID | STRING |  | redacted |  |
| `form_name` | Form Name | STRING |  | redacted |  |
| `ghl_id` | GHL ID | STRING |  | redacted |  |
| `id` | Id | STRING |  | redacted |  |
| `q_aid` | Q&A ID | STRING | PK | redacted |  |
| `question` | Question | STRING |  | redacted |  |
| `question_id` | Question ID | STRING |  | redacted |  |
| `submission_id` | Submission Id | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## [GHL] Form Question

**Table:** `ghl_form_question`  
**Foundry apiName:** `GhlFormQuestion`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **GhlFormQA** (link: "[GHL] Form Q&A")
- has many **GhlForm** (link: "[GHL] Form")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `data_type` | Data Type | STRING |  | redacted |  |
| `meaning` | Meaning | STRING |  | redacted |  |
| `question_answer_options` | Question Answer Options | ARRAY |  | redacted |  |
| `question_field_key` | Question Field Key | STRING |  | redacted |  |
| `question_id` | Question Id | STRING | PK | redacted |  |
| `question_name` | Question Name | STRING |  | redacted |  |

---

## [GHL] Form Submission

**Table:** `ghl_form_submission`  
**Foundry apiName:** `GhlFormSubmission`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **GhlFormQA** (link: "[GHL] Form Q&A")
- has many **GhlForm** (link: "[GHL] Form")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `affid` | Affid | STRING |  | redacted |  |
| `calendar_name` | Calendar Name | STRING |  | redacted |  |
| `contact_id` | Contact Id | STRING |  | redacted |  |
| `created_at` | Submitted on | TIMESTAMP |  | redacted |  |
| `date_field_details` | Date Field Details | STRING |  | redacted |  |
| `domain_name` | Domain Name | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `event_ad_source` | Event Ad Source | STRING |  | redacted |  |
| `event_contact_session_ids` | Event Contact Session Ids | STRING |  | redacted |  |
| `event_document_url` | Event Document URL | STRING |  | redacted |  |
| `event_domain` | Event Domain | STRING |  | redacted |  |
| `event_fb_event_id` | Event Fb Event Id | STRING |  | redacted |  |
| `event_fbc` | Event Fbc | STRING |  | redacted |  |
| `event_fbp` | Event Fbp | STRING |  | redacted |  |
| `event_fingerprint` | Event Fingerprint | STRING |  | redacted |  |
| `event_medium` | Event Medium | STRING |  | redacted |  |
| `event_medium_id` | Event Medium Id | STRING |  | redacted |  |
| `event_page_title` | Event Page Title | STRING |  | redacted |  |
| `event_page_url` | Event Page Url | STRING |  | redacted |  |
| `event_page_visit_type` | Event Page Visit Type | STRING |  | redacted |  |
| `event_parent_id` | Event Parent Id | STRING |  | redacted |  |
| `event_parent_name` | Event Parent Name | STRING |  | redacted |  |
| `event_referrer` | Event Referrer | STRING |  | redacted |  |
| `event_source` | Event Source | STRING |  | redacted |  |
| `event_timestamp` | Event Timestamp | TIMESTAMP |  | redacted |  |
| `event_type` | Event Type Optin | STRING |  | redacted |  |
| `event_type_1` | Event Type | STRING |  | redacted |  |
| `event_version` | Event Version | STRING |  | redacted |  |
| `fields_ori_sequance` | Fields Ori Sequance | STRING |  | redacted |  |
| `first_name` | First Name | STRING |  | redacted |  |
| `form_id` | Form Id | STRING |  | redacted |  |
| `form_name` | Form Name | STRING |  | redacted |  |
| `full_name` | Full Name | STRING |  | redacted |  |
| `funnel_id` | Funnel Id | STRING |  | redacted |  |
| `funnel_step_id` | Funnel Step Id | STRING |  | redacted |  |
| `id` | Id | STRING |  | redacted |  |
| `internal_source` | Internal Source | STRING |  | redacted |  |
| `ip` | Ip | STRING |  | redacted |  |
| `last_name` | Last Name | STRING |  | redacted |  |
| `location_id` | Location Id | STRING |  | redacted |  |
| `page_id` | Page Id | STRING |  | redacted |  |
| `page_url` | Page Url | STRING |  | redacted |  |
| `phone` | Phone | STRING |  | redacted |  |
| `qa_ids` | Qa Ids | ARRAY |  | redacted |  |
| `selected_slot` | Selected Slot | STRING |  | redacted |  |
| `selected_timezone` | Selected Timezone | STRING |  | redacted |  |
| `session_fingerprint` | Session Fingerprint | STRING |  | redacted |  |
| `session_id` | Session Id | STRING |  | redacted |  |
| `signature_hash` | Signature Hash | STRING |  | redacted |  |
| `source` | Source | STRING |  | redacted |  |
| `source_url` | Source Url | STRING |  | redacted |  |
| `submission_id` | Submission ID | STRING | PK | redacted |  |
| `terms_and_conditions` | Terms And Conditions | STRING |  | redacted |  |
| `timezone` | Timezone | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |
| `user_id` | User Id | STRING |  | redacted |  |

---

## [Funnelbox] eMail

**Table:** `ghl_message_v2`  
**Foundry apiName:** `GhlMessageV2`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `contact_id_1` (link: "[Funnelbox] Contact v2")
- belongs to **GhlContactV2** via `contact_id_1` (link: "GHL Contact")
- belongs to **FunnelboxEmailThread** via `thread_id` (link: "[Funnelbox] EMail Thread")
- has many **JanaDraft** (link: "Jana Draft")
- belongs to **Customer** via `contact_email` (link: "Customer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `body` | Body | STRING |  | datasourceColumn |  |
| `clicked_count` | Clicked Count | LONG |  | datasourceColumn |  |
| `clicked_timestamp` | Clicked Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `contact_email` | Contact Email | STRING |  | datasourceColumn |  |
| `contact_id` | Contact ID | STRING |  | datasourceColumn |  |
| `context` | Context | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation ID | STRING |  | datasourceColumn |  |
| `delivered_count` | Delivered Count | LONG |  | datasourceColumn |  |
| `delivered_timestamp` | Delivered Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `direction` | Direction | STRING |  | datasourceColumn |  |
| `from` | From | STRING |  | datasourceColumn |  |
| `is_thread_unanswered` | Is Thread Unanswered | BOOLEAN |  | datasourceColumn |  |
| `is_unanswered` | Is Unanswered | BOOLEAN |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING | PK | datasourceColumn |  |
| `message_id` | Message Id | STRING |  | datasourceColumn |  |
| `opened_count` | Opened Count | LONG |  | datasourceColumn |  |
| `opened_timestamp` | Opened Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `subject` | Subject | STRING |  | datasourceColumn |  |
| `thread_id` | Thread Id | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `to` | To | STRING |  | datasourceColumn |  |

---

## [Funnelbox] Schmerzfrei Umfrage temp

**Table:** `ghl_schmerzfrei_umfrage_v2`  
**Foundry apiName:** `GhlSchmerzfreiUmfrageV2`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **GhlContactV2** via `ghl_contact_id` (link: "GHL Contact")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `auf_einer_skala_von_1_10_wo_w_rdest_du_deine_schmerzen_einordnen_1_kaum_schmerzen_10_sehr_starke_schmerzen` | Auf Einer Skala Von 1 10 Wo Wurdest Du Deine Schmerzen Einordnen 1 Kaum Schmerzen 10 Sehr Starke Schmerzen | STRING |  | datasourceColumn |  |
| `bist_du_bereit_dir_aktiv_zeit_zu_nehmen_und_mit_uns_gemeinsam_an_deiner_schmerzfreiheit_zu_arbeiten` | Bist Du Bereit Dir Aktiv Zeit Zu Nehmen Und Mit Uns Gemeinsam An Deiner Schmerzfreiheit Zu Arbeiten | STRING |  | datasourceColumn |  |
| `e_mail_adresse` | E Mail Adresse | STRING |  | datasourceColumn |  |
| `ghl_contact_id` | GHL Contact ID | STRING |  | datasourceColumn |  |
| `ghl_tob_id` | GHL TOB ID | STRING |  | datasourceColumn |  |
| `gibt_es_etwas_das_du_in_deinem_leben_vermisst_was_du_gerne_wieder_machen_w_rdest_wenn_du_schmerzfrei_w_rst_wenn_ja_was_nenne_3_dinge` | Gibt Es Etwas Das Du In Deinem Leben Vermisst Was Du Gerne Wieder Machen Wurdest Wenn Du Schmerzfrei Warst Wenn Ja Was Nenne 3 Dinge | STRING |  | datasourceColumn |  |
| `hast_du_hoffnung_dass_es_doch_noch_etwas_geben_k_nnte_das_dir_hilft_wirklich_schmerzfrei_zu_werden` | Hast Du Hoffnung Dass Es Doch Noch Etwas Geben Konnte Das Dir Hilft Wirklich Schmerzfrei Zu Werden | STRING |  | datasourceColumn |  |
| `in_welchen_positionen_machen_sich_deine_schmerzen_bemerkbar` | In Welchen Positionen Machen Sich Deine Schmerzen Bemerkbar | STRING |  | datasourceColumn |  |
| `nachname` | Nachname | STRING |  | datasourceColumn |  |
| `submission_date` | Submission Date | STRING |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `url` | URL | STRING |  | datasourceColumn |  |
| `uuid` | UUID | STRING | PK | datasourceColumn |  |
| `vervollst_ndige_den_satz_wenn_ich_schmerzfrei_bin_muss_ich_nicht_mehr_nenne_3_dinge` | Vervollstandige Den Satz Wenn Ich Schmerzfrei Bin Muss Ich Nicht Mehr Nenne 3 Dinge | STRING |  | datasourceColumn |  |
| `vorname` | Vorname | STRING |  | datasourceColumn |  |
| `was_hast_du_bisher_alles_unternommen_um_deine_schmerzen_loszuwerden` | Was Hast Du Bisher Alles Unternommen Um Deine Schmerzen Loszuwerden | STRING |  | datasourceColumn |  |
| `was_hat_aus_deiner_sicht_bislang_bei_diesen_methoden_gefehlt_oder_nicht_funktioniert_warum_bist_du_noch_nicht_schmerzfrei` | Was Hat Aus Deiner Sicht Bislang Bei Diesen Methoden Gefehlt Oder Nicht Funktioniert Warum Bist Du Noch Nicht Schmerzfrei | STRING |  | datasourceColumn |  |
| `was_sind_weitere_beschwerden_die_du_mitbringst` | Was Sind Weitere Beschwerden Die Du Mitbringst | STRING |  | datasourceColumn |  |
| `welche_beschwerden_hast_du` | Welche Beschwerden Hast Du | STRING |  | datasourceColumn |  |
| `wie_lange_leidest_du_schon_unter_deinen_schmerzen` | Wie Lange Leidest Du Schon Unter Deinen Schmerzen | STRING |  | datasourceColumn |  |
| `wie_sehr_willst_du_wieder_schmerzfrei_werden_10_ich_m_chte_unbedingt_schmerzfrei_werden` | Wie Sehr Willst Du Wieder Schmerzfrei Werden 10 Ich Mochte Unbedingt Schmerzfrei Werden | STRING |  | datasourceColumn |  |
| `wo_schr_nken_dich_deine_schmerzen_aktuell_am_meisten_ein` | Wo Schranken Dich Deine Schmerzen Aktuell Am Meisten Ein | STRING |  | datasourceColumn |  |

---

## [GHL] Survey

**Table:** `ghl_survey`  
**Foundry apiName:** `GhlSurvey`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **GhlSurveyQuestion** via `question_ids` (link: "[GHL] Survey Question")
- has many **GhlSurveyQA** (link: "[GHL] Survey Q&A")
- has many **GhlSurveySubmission** (link: "[GHL] Survey Submission")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `form_id` | Form Id | STRING | PK | redacted |  |
| `form_url` | Form Url | STRING |  | redacted |  |
| `num_submissions` | Num Submissions | LONG |  | redacted |  |
| `question_ids` | Question Ids | ARRAY |  | redacted |  |
| `submission_contact_ids` | Submission Contact Ids | ARRAY |  | redacted |  |
| `submission_ids` | Submission Ids | ARRAY |  | redacted |  |
| `survey_name` | Survey Name | STRING |  | redacted |  |

---

## [GHL] Survey Q&A

**Table:** `ghl_survey_qa`  
**Foundry apiName:** `GhlSurveyQA`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **GhlSurveyQuestion** via `question_id` (link: "[GHL] Survey Question")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- has many **GhlSurveySubmission** (link: "[GHL] Survey Submission")
- belongs to **GhlSurvey** via `form_id` (link: "[GHL] Survey")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | redacted |  |
| `contact_id` | Contact Id | STRING |  | redacted |  |
| `created_at` | Created At | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `form_id` | Form Id | STRING |  | redacted |  |
| `id` | Id | STRING |  | redacted |  |
| `qa_id` | Qa Id | STRING | PK | redacted |  |
| `question_id` | Question Id | STRING |  | redacted |  |
| `question_name` | Question Name | STRING |  | redacted |  |
| `question_options` | Question Options | ARRAY |  | redacted |  |
| `submission_id` | Submission Id | STRING |  | redacted |  |
| `survey_name` | Survey Name | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## [GHL] Survey Question

**Table:** `ghl_survey_question`  
**Foundry apiName:** `GhlSurveyQuestion`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **GhlSurvey** (link: "[GHL] Survey")
- has many **GhlSurveyQA** (link: "[GHL] Survey Q&A")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `data_type` | Data Type | STRING |  | redacted |  |
| `meaning` | Meaning | STRING |  | redacted |  |
| `question_answer_options` | Question Answer Options | ARRAY |  | redacted |  |
| `question_field_key` | Question Field Key | STRING |  | redacted |  |
| `question_id` | Question Id | STRING | PK | redacted |  |
| `question_name` | Question Name | STRING |  | redacted |  |

---

## [GHL] Survey Submission

**Table:** `ghl_survey_submission`  
**Foundry apiName:** `GhlSurveySubmission`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **GhlSurveyQA** via `qa_ids` (link: "[GHL] Survey Q&A")
- belongs to **GhlSurvey** via `form_id` (link: "[GHL] Survey")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | redacted |  |
| `created_at` | Created At | STRING |  | redacted |  |
| `document_url` | Document URL | STRING |  | redacted |  |
| `domain_name` | Domain Name | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `event_ad_source` | Event Ad Source | STRING |  | redacted |  |
| `event_contact_session_ids` | Event Contact Session Ids | STRING |  | redacted |  |
| `event_document_url` | Event Document URL | STRING |  | redacted |  |
| `event_domain` | Event Domain | STRING |  | redacted |  |
| `event_fb_event_id` | Event Fb Event Id | STRING |  | redacted |  |
| `event_fbc` | Event Fbc | STRING |  | redacted |  |
| `event_fbp` | Event Fbp | STRING |  | redacted |  |
| `event_fingerprint` | Event Fingerprint | STRING |  | redacted |  |
| `event_medium` | Event Medium | STRING |  | redacted |  |
| `event_medium_id` | Event Medium Id | STRING |  | redacted |  |
| `event_page_title` | Event Page Title | STRING |  | redacted |  |
| `event_page_url` | Event Page Url | STRING |  | redacted |  |
| `event_page_visit_type` | Event Page Visit Type | STRING |  | redacted |  |
| `event_parent_id` | Event Parent Id | STRING |  | redacted |  |
| `event_parent_name` | Event Parent Name | STRING |  | redacted |  |
| `event_referrer` | Event Referrer | STRING |  | redacted |  |
| `event_source` | Event Source | STRING |  | redacted |  |
| `event_timestamp` | Event Timestamp | TIMESTAMP |  | redacted |  |
| `event_type` | Event Type | STRING |  | redacted |  |
| `event_type_optin` | Event Type Optin | STRING |  | redacted |  |
| `event_version` | Event Version | STRING |  | redacted |  |
| `fields_ori_sequance` | Fields Ori Sequance | STRING |  | redacted |  |
| `first_name` | First Name | STRING |  | redacted |  |
| `form_id` | Form Id | STRING |  | redacted |  |
| `funnel_id` | Funnel Id | STRING |  | redacted |  |
| `funnel_step_id` | Funnel Step Id | STRING |  | redacted |  |
| `id` | Id | STRING |  | redacted |  |
| `ip` | Ip | STRING |  | redacted |  |
| `last_name` | Last Name | STRING |  | redacted |  |
| `location_id` | Location Id | STRING |  | redacted |  |
| `page_id` | Page Id | STRING |  | redacted |  |
| `page_url` | Page Url | STRING |  | redacted |  |
| `phone` | Phone | STRING |  | redacted |  |
| `qa_ids` | Qa Ids | ARRAY |  | redacted |  |
| `session_fingerprint` | Session Fingerprint | STRING |  | redacted |  |
| `signature_hash` | Signature Hash | STRING |  | redacted |  |
| `submission_id` | Submission Id | STRING | PK | redacted |  |
| `survey_name` | Survey Name | STRING |  | redacted |  |
| `timezone` | Timezone | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## [Funnelbox] TOB Member v2

**Table:** `ghl_tob_user_v2`  
**Foundry apiName:** `GhlTobUserV2`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **GhlContactV2** (link: "GHL Contact")
- has many **WhatsAppChatV2** (link: "WhatsApp Chat")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `first_name` | First Name | STRING |  | datasourceColumn |  |
| `id` | ID | STRING | PK | datasourceColumn |  |
| `last_name` | Last Name | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `team` | Team | STRING |  | datasourceColumn |  |

---

## TOB Member [Funnelbox]

**Table:** `ghl_user`  
**Foundry apiName:** `GhlUser`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `first_name` | First Name | STRING |  | datasourceColumn |  |
| `id` | ID | STRING | PK | datasourceColumn |  |
| `last_name` | Last Name | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |

---

## [TOB] ID Matcher

**Table:** `id_match`  
**Foundry apiName:** `IdMatch`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Central identity resolution entity that links a person's email address to all their identifiers across multiple systems. Acts as the master key for cross-system data matching.

**Linked System IDs:**
- Close CRM: Lead IDs, Contact IDs
- Funnelbox/GHL: Contact IDs
- Zoom: Meeting IDs, Instance IDs, Ticket IDs, Participant UUIDs, User IDs
- PandaDoc: Document IDs

**Key Relationships (hub entity with 33 link types):**
- ONE-to-ONE with [Funnelbox] Contact v2 (primary contact record)
- ONE-to-ONE with Leads (typed facts)
- ONE-to-ONE with Short Lead Profile
- ONE-to-ONE with Lead Profile
- ONE-to-MANY with Leads [Close], [Close] Leads via API
- ONE-to-MANY with Zoom Meeting Attendees, Chat Messages, Tickets
- ONE-to-MANY with Call Insight Answers
- ONE-to-MANY with WhatsApp Classifications, Zoom Classifications
- MANY-to-ONE with Summit Profile, GHL Contact v2
- ...and 20+ more link types

**Use Cases:**
- Cross-system identity resolution
- Lead deduplication and matching
- Customer journey aggregation across touchpoints
- Summit Profile generation triggering
- Unified analytics across CRM, Zoom, and marketing systems

**Actions Available:**
- Trigger Summit Profile Creation
- Add/Remove Tags
- Create Email Offer Cohorts
- Bulk profile operations

**Relevant Properties:**
- Email: Primary key and unique identifier
- Close Lead/Contact IDs: CRM identifiers
- GHL Contact IDs: GoHighLevel contact references
- Zoom IDs: Various Zoom-related identifiers (meetings, tickets, participants)
- Tags: Custom tags for segmentation and workflows  

**Relationships:**
- has many **GhlFormQA** (link: "[GHL] Form Q&A")
- has many **ZoomEventSessionAttendance** (link: "[Zoom] Event Session Attendance")
- has many **CallInsightAnswer** (link: "Call Insight Answer")
- has many **ClassifiedSchmerzfreiUmfrageUnpivotiert** (link: "[Classified] Schmerzfrei Umfrage Unpivotiert")
- has many **LeadClose** (link: "Leads [Close]")
- has many **BulkContractCreation** (link: "Bulk Contracts Creation")
- has many **ZoomStreamChatMessage** (link: "[Zoom][Stream] Chat Message")
- has many **BulkCreatedSubmissions** (link: "Bulk Created Submission")
- has many **InsightKickscale** (link: "Insight [Kickscale]")
- belongs to **FunnelboxContactV2** via `ghl_contact_ids` (link: "[Funnelbox] Contact v2")
- belongs to **SummitProfile** via `email` (link: "Summit Profile")
- has many **ClassifiedZoomChats** (link: "[Classified] Zoom Chat")
- has many **ZoomChatInsight** (link: "[Zoom] Chat Insight")
- belongs to **MetricsZoom_1** via `email` (link: "[Zoom] Metric")
- has many **GhlUser** (link: "GHL User")
- has many **ZoomSurveyQA** (link: "[Zoom] Survey Q&A")
- has many **ClassifiedZoomSurveys** (link: "[Classified] Zoom Survey")
- has many **ClassifiedWhatsApp** (link: "[Classified] WhatsApp")
- has many **CloseLeadViaApi** (link: "[Close] Leads via API")
- has many **ZoomTicketsZoom** (link: "[Zoom] Ticket")
- has many **LeadTypedFacts** (link: "Leads (typed facts)")
- has many **EmailOfferCohort** (link: "Email Offer Cohort")
- has many **SchmerzfreiUmfrageFuBo** (link: "Schmerzfrei Umfragen [FuBo]")
- has many **ZoomMeetingCurrentAttende** (link: "Zoom Meeting Current Attendee")
- has many **ShortLeadProfile** (link: "Short Lead Profile")
- has many **FunnelboxVideoTracking** (link: "[Funnelbox] Video Tracking")
- has many **ParticipantZoom_1** (link: "Participant [Zoom]")
- has many **KiJanaEmailOfferDraft** (link: "KI-Jana Email Offer Draft")
- has many **LogTriggerSummitProfileCreation** (link: "[Log] Trigger Summit Profile Creation")
- has many **ChatMessageZoom** (link: "Chat Message")
- belongs to **GhlContactV2** via `ghl_contact_ids` (link: "GHL Contacts v2")
- has many **ZoomLightChatMessage** (link: "[Zoom][Light] Chat Message")
- belongs to **leadProfilev2** via `ghl_contact_ids` (link: "Lead Profile")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `close_contact_id` | Close Contact Id | ARRAY |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | ARRAY |  | datasourceColumn |  |
| `email` | Email | STRING | PK | datasourceColumn |  |
| `exported_summit_profile` | Exported Summit Profile | TIMESTAMP |  | datasourceColumn |  |
| `ghl_contact_ids` | Ghl Contact Ids | ARRAY |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `num_tickets` | Num Tickets | LONG |  | datasourceColumn |  |
| `num_zoom_meetings` | Num Zoom Meetings | LONG |  | datasourceColumn |  |
| `pandadoc_ids` | Pandadoc Ids | ARRAY |  | datasourceColumn |  |
| `summit_profile_triggered` | Summit Profile triggered | TIMESTAMP |  | datasourceColumn |  |
| `tags` | Tags | ARRAY |  | datasourceColumn |  |
| `tags_zoom_keywords` | Tags Zoom Keywords | ARRAY |  | datasourceColumn |  |
| `uuid_foundry` | UUID Foundry | STRING |  | datasourceColumn |  |
| `zoom_meeting_ids` | Zoom Meeting Ids | ARRAY |  | datasourceColumn |  |
| `zoom_meeting_instance_ids` | Zoom Meeting Instance Ids | ARRAY |  | datasourceColumn |  |
| `zoom_participant_uuids` | Zoom Participant Uuids | ARRAY |  | datasourceColumn |  |
| `zoom_ticket_ids` | Zoom Ticket Ids | ARRAY |  | datasourceColumn |  |
| `zoom_user_ids` | Zoom User Ids | ARRAY |  | datasourceColumn |  |

---

## Inbox [AST]

**Table:** `inbox_ast`  
**Foundry apiName:** `InboxAst`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `clarification` | Clarification | STRING |  | redacted | Informationen, die hinzugefügt wurden, um das Inbox Item zu klären. |
| `description` | Description | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## Initiative [AST]

**Table:** `initiative_ast`  
**Foundry apiName:** `InitiativeAst`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ArminsTasks** (link: "Task [AST]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `completed_at` | Completed At | DATE |  | redacted |  |
| `created_at` | Created At | DATE |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `titel` | Titel | STRING |  | redacted |  |

---

## [Insight] Call

**Table:** `insight_call`  
**Foundry apiName:** `InsightCall`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Unified call records combining Close.io CRM calls and ElevenLabs AI phone calls, providing a consolidated view for call transcript analysis and insight extraction.

**Source Systems:**
- Close.io: CRM-initiated sales calls
- ElevenLabs: AI-powered phone calls

**Call Type Classifications:**
- Connecting Call: Initial outreach
- Sales Follow Up Call: Post-initial contact follow-ups
- Client Follow Up Call: Existing client touchpoints
- Closing Call: Deal closure attempts
- Closing Call with Contract Sent: Final closing stages

**Key Relationships:**
- ONE-to-ONE with [11 Labs] Phone Call Information
- ONE-to-ONE with [Close] Transcript
- ONE-to-ONE with [Insight] Scope Call (for batch insight extraction)
- MANY-to-ONE with [Close] User (sales rep)
- MANY-to-ONE with Leads [Close] (lead record)
- MANY-to-ONE with [11 Labs] Agent
- MANY-to-ONE with [Funnelbox] Contact v2
- MANY-to-ONE with Close IO Smart View Creation Job (campaign)

**Use Cases:**
- Unified call analytics across CRM and AI phone systems
- Insight extraction pipeline input
- Sales performance analysis by rep and call type
- Lead engagement tracking and journey analysis

**Relevant Properties:**
- Conversation Id: Unique call identifier
- Source: Origin system (closeio or eleven_labs)
- Type Of Call: Call classification
- Call Start Date: When the call occurred
- Call Duration: Length of the call
- Sales Representative Full Name: Rep who handled the call
- Lead Email: Contact identifier
- Full Transcript Text: Complete call transcript  

**Relationships:**
- belongs to **LeadClose** via `closeio_lead_id` (link: "Leads [Close]")
- belongs to **CloseUser** via `closeio_user_id` (link: "[Close] User")
- belongs to **_11LabsPhoneCallInformation** via `conversation_id` (link: "[11 Labs] Phone Call Information")
- belongs to **FunnelboxContactV2** via `contactv2_uuid_foundry` (link: "[Funnelbox] Contact v2")
- belongs to **CloseIoSmartViewCreationJob** via `campaign` (link: "Close IO Smart View Creation Job")
- belongs to **CloseTranscript** via `conversation_id` (link: "[Close] Transcript")
- belongs to **_11LabsAgent** via `elevenlabs_agent_id` (link: "[11 Labs] Agent")
- has many **InsightScopeCall** (link: "[Insight] Scope Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_start_date` | Call Start Date | TIMESTAMP |  | datasourceColumn | Timestamp when the call started |
| `call_status` | Call Status | STRING |  | datasourceColumn | Current status of the call record |
| `campaign` | Campaign | STRING |  | editOnly | Close IO Smart View Creation Job foreign key - identifies the campaign context |
| `closeio_call_duration` | Closeio Call Duration | INTEGER |  | datasourceColumn | Duration of the call in seconds (from Close.io) |
| `closeio_custom_activity_type_id` | Closeio Custom Activity Type Id | STRING |  | datasourceColumn | Close.io custom activity type identifier |
| `closeio_lead_id` | Closeio Lead Id | STRING |  | datasourceColumn | Foreign key to Close.io Lead record |
| `closeio_user_id` | Closeio User Id | STRING |  | datasourceColumn | Foreign key to Close.io User (sales rep) |
| `contactv2_uuid_foundry` | contactv2 Uuid Foundry | STRING |  | datasourceColumn | Foreign key to Funnelbox Contact v2 |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn | Unique identifier for the call/conversation (ElevenLabs conversation ID or Close.io call ID) |
| `elevenlabs_agent_id` | Elevenlabs Agent Id | STRING |  | datasourceColumn | Foreign key to ElevenLabs AI Agent |
| `full_transcript_text` | Full Transcript Text | STRING |  | datasourceColumn | Complete text transcript of the call |
| `lead_cockpit_tag` | Lead Cockpit TAG | ARRAY |  | editOnly | TAG call using lead cockpit to identify that selected lead's call belong to a specific cohort |
| `lead_email` | Lead Email | STRING |  | datasourceColumn | Email address of the lead involved in the call |
| `marketing_offer_days_from_start` | Marketing Offer Days From Start | LONG |  | datasourceColumn | Number of days since the marketing offer started when the call occurred |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn | Foreign key to associated Marketing Offer |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `user_full_name` | Sales Representative Full Name | STRING |  | datasourceColumn | Full name of the sales representative who made/received the call |
| `source` | Source | STRING |  | datasourceColumn | Origin system of the call (closeio or eleven_labs) |
| `type_of_call` | Type Of Call | STRING |  | datasourceColumn | Classification of the call type (Connecting Call, Sales Follow Up Call, Closing Call, etc.) |

---

## Insight [Kickscale]

**Table:** `insight_kickscale`  
**Foundry apiName:** `InsightKickscale`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **CallKickscale** via `call_id` (link: "Call [Kickscale]")
- belongs to **IdMatch** via `email` (link: "Leads - ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_date` | Call Date | TIMESTAMP |  | datasourceColumn |  |
| `call_date_string` | Call Date String | STRING |  | datasourceColumn |  |
| `call_id` | Call ID | STRING |  | datasourceColumn |  |
| `call_name` | Call Name | STRING |  | datasourceColumn |  |
| `call_origin` | Call Origin | STRING |  | datasourceColumn |  |
| `call_type_description` | Call Type Description | STRING |  | datasourceColumn |  |
| `call_type_name` | Call Type Name | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `insight` | Insight | STRING |  | datasourceColumn |  |
| `insight_id` | Insight ID | STRING | PK | datasourceColumn |  |
| `insight_event_type` | Insight Event Type | STRING |  | datasourceColumn |  |
| `insight_event_description` | Insight Event Description | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `quote` | Quote | STRING |  | datasourceColumn |  |
| `insight_result_evaluation` | Insight Result Evaluation | STRING |  | datasourceColumn |  |
| `speaker` | Speaker | STRING |  | datasourceColumn |  |
| `insight_type_class` | Insight Type Class | STRING |  | datasourceColumn |  |
| `utterance_id` | Utterance ID | STRING |  | datasourceColumn |  |

---

## Calls Insight Queue

**Table:** `insight_queue`  
**Foundry apiName:** `InsightQueue`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsPhoneCallInformation** via `call_foreign_key` (link: "[11 Labs] Phone Call Information")
- belongs to **MarketingCampaign** via `campaign_foreign_key` (link: "Marketing Campaign")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_foreign_key` | Call Foreign Key | STRING |  | editOnly |  |
| `campaign_foreign_key` | Campaign Foreign Key | STRING |  | editOnly |  |
| `created_at` | Created At | TIMESTAMP |  | editOnly |  |
| `created_by` | Created By | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `status` | Status | STRING |  | editOnly |  |
| `transcript` | Transcript | STRING |  | editOnly |  |

---

## Insight Relevance Determinator System Prompt

**Table:** `insight_relevance_determinator_system_prompt_dataset`  
**Foundry apiName:** `InsightRelevanceDeterminatorSystemPromptDataset`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `draft` | Draft | BOOLEAN |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `prompt` | Prompt | STRING |  | editOnly |  |
| `reason_for_update_user_feedback` | Reason for Update (User Feedback) | STRING |  | editOnly |  |
| `timestamp_created` | Timestamp Created | TIMESTAMP |  | editOnly |  |
| `update_reasoning_provided_by_llm` | Update Reasoning (provided by LLM) | STRING |  | editOnly |  |

---

## [Insight] Scope Call

**Table:** `insight_scope_call`  
**Foundry apiName:** `InsightScopeCall`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **CallInsightAnswer** (link: "Call Insight Answer")
- belongs to **InsightScopeRun** via `scope_run_id` (link: "[Insight] Scope Run")
- belongs to **InsightCall** via `conversation_id` (link: "[Insight] Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `conversation_id` | Conversation Id | STRING |  | editOnly |  |
| `primary_key` | Scope Call Pk | STRING | PK | datasourceColumn |  |
| `scope_run_id` | Scope Run Id | STRING |  | editOnly |  |
| `source` | Source | STRING |  | editOnly |  |
| `transcript` | Transcript | STRING |  | editOnly |  |

---

## [Insight] Scope Run

**Table:** `insight_scope_run`  
**Foundry apiName:** `InsightScopeRun`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **CallInsightAnswer** (link: "Call Insight Answer")
- has many **InsightScopeCall** (link: "[Insight] Scope Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `created_at` | Created At | TIMESTAMP |  | editOnly |  |
| `created_by` | Created By | STRING |  | editOnly |  |
| `description` | Description | STRING |  | editOnly |  |
| `markdown_report` | Markdown Report | STRING |  | editOnly |  |
| `primary_key` | Run Id | STRING | PK | datasourceColumn |  |
| `status` | Status | STRING |  | editOnly |  |

---

## Insight Type

**Table:** `insight_type`  
**Foundry apiName:** `InsightType`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **InsightTypeResponseV2** (link: "Insight Type Response Aggregated")
- has many **InsightTypeResponse** (link: "Insight Type Response")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `date_created` | Date created | TIMESTAMP |  | datasourceColumn |  |
| `description` | Description | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `lead_temperature_stage` | Lead Temperature Stage | STRING |  | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |
| `question_embedding` | Question Embedding | VECTOR |  | datasourceColumn |  |
| `question_type` | Question type | STRING |  | datasourceColumn |  |
| `tag` | Tag | ARRAY |  | datasourceColumn |  |

---

## Insight Type Response

**Table:** `insight_type_response`  
**Foundry apiName:** `InsightTypeResponse`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **Touchpoint** via `touchpoint_id` (link: "Touchpoint")
- belongs to **InsightType** via `insight_type_id` (link: "Insight Type")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answers` | Answers | ARRAY |  | editOnly |  |
| `applicability_reason` | Applicability Reason | STRING |  | editOnly |  |
| `insight_type_id` | Insight Type ID | STRING |  | editOnly |  |
| `is_applicable` | Is Applicable | BOOLEAN |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `reviewed_by_humam` | Reviewed by humam | BOOLEAN |  | editOnly |  |
| `touchpoint_id` | Touchpoint ID | STRING |  | editOnly |  |

---

## Insight Type Response v2

**Table:** `insight_type_response_v2`  
**Foundry apiName:** `InsightTypeResponseV2`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `email` (link: "[Funnelbox] Contact v2")
- belongs to **GhlContactV2** via `contact_id` (link: "[Funnelbox] Contact")
- belongs to **InsightType** via `insight_type_id` (link: "Insight Type")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answers` | Answers | ARRAY |  | editOnly |  |
| `applicability_reason` | Applicability Reason | STRING |  | editOnly |  |
| `contact_id` | Contact Id | STRING |  | editOnly |  |
| `email` | email | STRING |  | editOnly |  |
| `insight_decay_timeline` | Insight Decay Timeline | STRING |  | editOnly |  |
| `insight_decay_timeline_applicability_reason` | Insight Decay Timeline Applicability Reason | STRING |  | editOnly |  |
| `insight_type_id` | Insight Type Id | STRING |  | editOnly |  |
| `is_applicable` | Is Applicable | BOOLEAN |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `source_context` | Source Context | STRING |  | editOnly |  |
| `timestamp_from` | Timestamp from | TIMESTAMP |  | editOnly |  |
| `timestamp_processed` | Timestamp processed | TIMESTAMP |  | editOnly |  |
| `touchpoint_ids` | Touchpoint IDs | ARRAY |  | editOnly |  |

---

## Insights Summary

**Table:** `insights_summary_download_for_funnelbox_parquet_format`  
**Foundry apiName:** `InsightsSummaryDownloadForFunnelboxParquetFormat`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING | PK | datasourceColumn |  |
| `insight_summary` | Insight Summary | STRING |  | datasourceColumn |  |

---

## [Internal] Resource Tracking

**Table:** `internal_resource_tracking`  
**Foundry apiName:** `InternalResourceTracking`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `authors` | Authors | ARRAY |  | datasourceColumn | original developer(s) |
| `departments` | Departments | ARRAY |  | datasourceColumn |  |
| `description` | Description | STRING |  | datasourceColumn | Description of the product |
| `dev_docs` | Dev Docs | ARRAY |  | datasourceColumn |  |
| `dev_docs_rids` | Dev Docs Rids | ARRAY |  | datasourceColumn |  |
| `documentation_walkthrough_media_item_rid` | Documentation Walkthrough Media Item Rid | STRING |  | datasourceColumn |  |
| `external_urls` | External Urls | ARRAY |  | datasourceColumn |  |
| `extra_links` | Extra Links | STRING |  | datasourceColumn |  |
| `foundry_rids` | Foundry Rids | ARRAY |  | datasourceColumn |  |
| `is_valid` | Is Valid | BOOLEAN |  | datasourceColumn |  |
| `maintainers` | Maintainers | ARRAY |  | datasourceColumn | can support owner on change request / bug fix |
| `maturity` | Maturity | STRING |  | datasourceColumn |  |
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `new_property1` | New property 1 | STRING |  | editOnly |  |
| `owners` | Owners | ARRAY |  | datasourceColumn | current solution owner(s), go-to-person for change request / bug fix |
| `path` | Path | STRING |  | datasourceColumn |  |
| `pocs` | Pocs | ARRAY |  | datasourceColumn | go-to-people to provide business context around the solution |
| `product_type` | Product Type | STRING |  | datasourceColumn | Feature - a key capability that can be used across use cases (e.g., KI-Jana CS agent, Close.io campaigns via lead cockpit, StrukturAnalyse pipeine)  Data - major data products (e.g., TypedFacts, MOP daily, original moments)  App - main workshop apps supporting across departments (e.g., zoom event planner, campaign monitoring, bulk contract creation)  Dashboard - data analyses done in Contour  (e.g., Sales KPIs, liquidity analysis, cash in KPIs) |
| `resources` | Resources | ARRAY |  | datasourceColumn |  |
| `roadmap` | Roadmap | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `use_case_id` | Use Case Id | STRING | PK | datasourceColumn |  |
| `use_case_name` | Use Case Name | STRING |  | datasourceColumn |  |

---

## Invoice

**Table:** `invoice`  
**Foundry apiName:** `Invoice`  
**Status:** experimental  
**Datasources:** 2  

**Relationships:**
- belongs to **Order** via `order_id` (link: "Order")
- has many **InvoiceDebtCollectionActions** (link: "Invoice Debt Collection Action")
- has many **InvoiceComment** (link: "Invoice Comment")
- belongs to **Customer** via `customer_id` (link: "Customer")
- has many **InvoiceReminder** (link: "Invoice Reminder")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answered_outbound_call_last_7_days` | Answered Outbound Call Last 7 Days | BOOLEAN |  | datasourceColumn |  |
| `anticipated_amount_gross` | Anticipated Amount Gross | DOUBLE |  | datasourceColumn |  |
| `anticipated_date_of_payment` | Anticipated Date Of Payment | DATE |  | datasourceColumn |  |
| `close_display_name` | Close Display Name | STRING |  | datasourceColumn |  |
| `close_html_url` | Close Html Url | STRING |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | STRING |  | datasourceColumn |  |
| `close_lead_owner_email` | Close Lead Owner Email | STRING |  | datasourceColumn |  |
| `close_lead_owner_full_name` | Close Lead Owner Full Name | STRING |  | datasourceColumn |  |
| `close_lead_phone_processed` | Close Lead Phone Processed | STRING |  | datasourceColumn |  |
| `collection_assignee` | Collection Assignee | STRING |  | editOnly | Agent assigned for possible debt collection from TOB CRM app in Foundry. |
| `contact_id` | Contact Id | INTEGER |  | datasourceColumn |  |
| `contract_tob_email_closer` | Contract Tob Email Closer | STRING |  | datasourceColumn |  |
| `currency_description` | Currency Description | STRING |  | datasourceColumn |  |
| `customer_id` | Customer Id | STRING |  | datasourceColumn |  |
| `due_date` | Due Date | DATE |  | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `invoice_id` | Invoice Id | STRING | PK | datasourceColumn |  |
| `invoice_status` | Invoice Status | STRING |  | datasourceColumn |  |
| `is_overdue` | Is Overdue | BOOLEAN |  | datasourceColumn |  |
| `latest_outbound_answered_call` | Latest Outbound Answered Call | TIMESTAMP |  | datasourceColumn |  |
| `mail` | Mail | STRING |  | datasourceColumn |  |
| `next_check_in_date` | Next Check In Date | DATE |  | editOnly |  |
| `order_id` | Order Id | STRING |  | datasourceColumn |  |
| `overdue_days` | Overdue Days | LONG |  | datasourceColumn |  |
| `overdue_days_buckets` | Overdue Days Buckets | STRING |  | datasourceColumn |  |
| `phone` | Phone | STRING |  | datasourceColumn |  |
| `product_name` | Product Name | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `total_gross` | Total Gross | DECIMAL |  | datasourceColumn |  |
| `updated_at` | Updated At | TIMESTAMP |  | datasourceColumn |  |

---

## Invoice Comment

**Table:** `invoice_comment`  
**Foundry apiName:** `InvoiceComment`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Invoice Comments  

**Relationships:**
- belongs to **Invoice** via `invoice_id` (link: "Invoice")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `comment_id` | Comment Id | STRING | PK | datasourceColumn |  |
| `created_at_ts` | Created At Ts | TIMESTAMP |  | datasourceColumn |  |
| `image` | Image | STRING |  | datasourceColumn |  |
| `image_path` | Image Path | STRING |  | datasourceColumn |  |
| `invoice_id` | Invoice Id | STRING |  | datasourceColumn |  |
| `is_public` | Is Public | BOOLEAN |  | datasourceColumn |  |
| `text` | Text | STRING |  | datasourceColumn |  |
| `user_email` | User Email | STRING |  | datasourceColumn |  |
| `user_id` | User Id | INTEGER |  | datasourceColumn |  |
| `user_name` | User Name | STRING |  | datasourceColumn |  |

---

## Invoice Debt Collection Actions

**Table:** `invoice_debt_collection_actions`  
**Foundry apiName:** `InvoiceDebtCollectionActions`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Invoice Debt Collection Actions  

**Relationships:**
- belongs to **Invoice** via `invoice_id` (link: "Invoice")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_type` | action_type | STRING |  | redacted |  |
| `create_at_dt` | create_at_ts | TIMESTAMP |  | redacted |  |
| `created_by` | created_by | STRING |  | redacted |  |
| `has_customer_responded` | has_customer_responded | BOOLEAN |  | redacted |  |
| `invoice_id` | invoice_id | STRING |  | redacted |  |
| `notes` | notes | STRING |  | redacted |  |
| `outcome_selector` | Outcome Selector | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `promised_payment_date` | promised_payment_date | DATE |  | redacted |  |

---

## Invoice Reminder

**Table:** `invoice_reminder`  
**Foundry apiName:** `InvoiceReminder`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Invoice Reminders  

**Relationships:**
- belongs to **Invoice** via `kb_invoice_id` (link: "Invoice")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `footer` | Footer | STRING |  | datasourceColumn |  |
| `header` | Header | STRING |  | datasourceColumn |  |
| `is_sent` | Is Sent | BOOLEAN |  | datasourceColumn |  |
| `is_valid_from` | Is Valid From | DATE |  | datasourceColumn |  |
| `is_valid_to` | Is Valid To | DATE |  | datasourceColumn |  |
| `kb_invoice_id` | Kb Invoice Id | STRING |  | datasourceColumn |  |
| `received_total` | Received Total | FLOAT |  | datasourceColumn |  |
| `remaining_price` | Remaining Price | FLOAT |  | datasourceColumn |  |
| `reminder_id` | Reminder Id | STRING | PK | datasourceColumn |  |
| `reminder_level` | Reminder Level | INTEGER |  | datasourceColumn |  |
| `reminder_period_in_days` | Reminder Period In Days | INTEGER |  | datasourceColumn |  |
| `show_positions` | Show Positions | BOOLEAN |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |

---

## Ki-Jana Draft

**Table:** `jana_draft`  
**Foundry apiName:** `JanaDraft`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Drafts of messages generated by Ki-Jana  

**Relationships:**
- belongs to **FunnelboxContactV2** via `target` (link: "[Funnelbox] Contact v2")
- belongs to **GhlMessageV2** via `foreign_key` (link: "[Funnelbox] eMail")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `content` | Content | STRING |  | editOnly | Draft Message Content |
| `context` | Context | STRING |  | editOnly | Past context as a response reference. |
| `drafted_at` | Drafted At | TIMESTAMP |  | editOnly |  |
| `drafted_by` | Drafted By | STRING |  | editOnly | NOT A USER but rather version of the model/prompt used. |
| `drafted_for` | Drafted For | STRING |  | editOnly | Foundry User ID |
| `foreign_key` | Foreign Key | STRING |  | editOnly | Mongo DB ID of the message the draft is written as a response to. Currently refers to funnelbox emails and whatsapp messages. can be null. |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `reply_message_id` | Reply Message ID | STRING |  | editOnly | In the reply mode, this is the ID of the message to which reply is done, as per specs https://marketplace.gohighlevel.com/docs/ghl/conversations/send-a-new-message/index.html |
| `sender_email` | Sender Email | STRING |  | editOnly | for emails Sender Email will be used as email send from |
| `sender_name` | Sender Name | STRING |  | editOnly | for emails Sender Name will be displayed in the inbox before email address |
| `status` | Status | STRING |  | editOnly | Categorical: Drafted, Sent |
| `target` | Target Contact ID | STRING |  | editOnly | Contact v2 ID for whom the message is intended to |
| `thread_id` | Thread ID  | STRING |  | editOnly | ID of message thread. For email messages, this is the message ID that contains multiple email messages in the thread. Unsure yet for WhatsApp messages if that exists |
| `title` | Title | STRING |  | editOnly | Either a Email Subject or 'dummy' (unused) WhatsApp subject |
| `type` | Type | STRING |  | editOnly | Categorical; WhatsApp or Email for now |

---

## Jana Static Data Unioned

**Table:** `jana_static_data`  
**Foundry apiName:** `JanaStaticData`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `json_data` | Json Data | STRING |  | datasourceColumn |  |
| `static_info_id` | Static Info Id | STRING | PK | datasourceColumn |  |
| `static_info_type` | Static Info Type | STRING |  | datasourceColumn |  |

---

## [KB] Document

**Table:** `kb_document`  
**Foundry apiName:** `KbDocument`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Knowledge Base documents containing structured information about pain relief, exercises, symptoms, and training methodologies for The Original Body health program.

**Document Categories:**
- Grundlagen: Foundational knowledge
- Analyse: Analysis methodologies
- Programmlogik: Program logic and workflows
- Symptom: Symptom-specific content
- Glossar: Terminology definitions
- FAQ: Frequently asked questions
- Inhalte: General content

**AI-Enhanced Features:**
- AI-generated summaries for quick comprehension
- Semantic tags for improved discoverability
- Extracted symptoms and exercises for cross-referencing
- Primary concepts identification

**Key Relationships:**
- Links to [KB] Document Chunk for RAG-suitable text segments

**Use Cases:**
- RAG (Retrieval-Augmented Generation) for AI assistants
- Customer support knowledge retrieval
- Training material organization
- Symptom-to-exercise mapping
- Health coaching content management

**Actions Available:**
- Create [KB] Document
- Edit [KB] Document
- Delete [KB] Document

**Relevant Properties:**
- Title: Document title for display and search
- Document Category: High-level classification
- Topic: Specific subject addressed
- AI Summary: Auto-generated content summary
- Semantic Tags: AI-extracted categorization tags
- Full Text Content: Complete document text
- Mentioned Symptoms/Exercises: Cross-reference data  

**Relationships:**
- has many **KbDocumentChunk** (link: "[KB] Document Chunk")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `ai_summary` | Ai Summary | STRING |  | datasourceColumn | AI-generated summary of the document content |
| `document_category` | Document Category | STRING |  | datasourceColumn | High-level classification (Grundlagen, Analyse, Programmlogik, Symptom, FAQ, etc.) |
| `document_id` | Document Id | STRING | PK | datasourceColumn |  |
| `document_status` | Document Status | STRING |  | datasourceColumn | Current publication/review status of the document |
| `document_type` | Document Type | STRING |  | datasourceColumn | Format/type classification of the document |
| `full_text_content` | Full Text Content | STRING |  | datasourceColumn | Complete text content of the document |
| `imported_datetime` | Imported Datetime | TIMESTAMP |  | datasourceColumn | Timestamp when the document was imported into the knowledge base |
| `mentioned_exercises` | Mentioned Exercises | ARRAY |  | datasourceColumn | List of exercises/techniques mentioned in the document |
| `mentioned_symptoms` | Mentioned Symptoms | ARRAY |  | datasourceColumn | List of symptoms mentioned in the document content |
| `primary_concepts` | Primary Concepts | ARRAY |  | datasourceColumn | Key concepts extracted from the document |
| `semantic_tags` | Semantic Tags | ARRAY |  | datasourceColumn | AI-extracted semantic tags for categorization and search |
| `source_media_item_rid` | Source Media Item Rid | STRING |  | datasourceColumn | RID of the original media item (PDF, etc.) the document was extracted from |
| `title` | Title | STRING |  | datasourceColumn | Document title for display and search |
| `topic` | Topic | STRING |  | datasourceColumn | Specific topic addressed by the document |
| `version` | Version | STRING |  | datasourceColumn | Version identifier for the document |

---

## [KB] Document Chunk

**Table:** `kb_document_chunk`  
**Foundry apiName:** `KbDocumentChunk`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Knowledge Base Document Chunk  

**Relationships:**
- belongs to **KbDocument** via `document_id` (link: "[KB] Document")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `chunk_id` | Chunk Id | STRING | PK | datasourceColumn |  |
| `chunk_index` | Chunk Index | INTEGER |  | datasourceColumn |  |
| `chunk_text` | Chunk Text | STRING |  | datasourceColumn |  |
| `chunk_type` | Chunk Type | STRING |  | datasourceColumn |  |
| `created_datetime` | Created Datetime | TIMESTAMP |  | datasourceColumn |  |
| `document_id` | Document Id | STRING |  | datasourceColumn |  |
| `embedding_vector` | Embedding Vector | VECTOR |  | datasourceColumn |  |
| `has_code_or_list` | Has Code Or List | BOOLEAN |  | datasourceColumn |  |
| `is_rag_suitable` | Is Rag Suitable | BOOLEAN |  | datasourceColumn |  |
| `is_table_content` | Is Table Content | BOOLEAN |  | datasourceColumn |  |
| `parent_category` | Parent Category | STRING |  | datasourceColumn |  |
| `parent_semantic_tags` | Parent Semantic Tags | ARRAY |  | datasourceColumn |  |
| `parent_title` | Parent Title | STRING |  | datasourceColumn |  |
| `relevance_keywords` | Relevance Keywords | ARRAY |  | datasourceColumn |  |
| `section_heading` | Section Heading | STRING |  | datasourceColumn |  |

---

## KI-Jana Email Offer Draft

**Table:** `ki_jana_email_offer_draft`  
**Foundry apiName:** `KiJanaEmailOfferDraft`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `email_address` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `brand_damage_risk` | Brand Damage Risk | STRING |  | editOnly |  |
| `cohort_name` | Cohort Names | STRING |  | editOnly |  |
| `contact_id` | Contact Id | STRING |  | editOnly |  |
| `email_address` | Email Address | STRING |  | editOnly |  |
| `email_content` | Email Content | STRING |  | editOnly |  |
| `judge_reasoning` | Judge Reasoning | STRING |  | editOnly |  |
| `lead_name` | Lead Name | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | editOnly |  |
| `sender_name` | Sender Name | STRING |  | editOnly |  |
| `should_be_reviewed` | Should be Reviewed | BOOLEAN |  | editOnly |  |
| `status` | Status | STRING |  | editOnly |  |
| `subject` | Subject | STRING |  | editOnly |  |
| `triggered_at` | Triggered At | TIMESTAMP |  | editOnly |  |
| `triggered_by` | Triggered By | STRING |  | editOnly |  |

---

## [KB] Knowledge Base Q&A

**Table:** `knowledge_base_qa`  
**Foundry apiName:** `KnowledgeBaseQA`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IssueFluent** via `created_from_issue_link` (link: "Issues [Fluent]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `access_level` | Access Level | STRING |  | editOnly |  |
| `answer` | Answer | STRING |  | editOnly |  |
| `bounty` | Bounty | INTEGER |  | editOnly |  |
| `created_from_issue_link` | Created from Issue [Link] | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `question` | Question | STRING |  | editOnly |  |
| `time_created` | Time created | TIMESTAMP |  | editOnly |  |

---

## Lascha Orders

**Table:** `lascha_orders`  
**Foundry apiName:** `LaschaOrders`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `assignee` | Assignee | STRING |  | datasourceColumn |  |
| `consolidated_customer_id` | Consolidated Customer Id | STRING |  | datasourceColumn |  |
| `customer_id` | Customer Id | STRING |  | datasourceColumn |  |
| `customer_name` | Customer Name | STRING |  | datasourceColumn |  |
| `days_until_due` | Days Until Due | INTEGER |  | datasourceColumn |  |
| `item_name` | Item Name | STRING |  | datasourceColumn |  |
| `order_due_date` | Order Due Date | TIMESTAMP |  | datasourceColumn |  |
| `order_id` | Order Id | STRING | PK | datasourceColumn |  |
| `quantity` | Quantity | INTEGER |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `unit_price` | Unit Price | INTEGER |  | datasourceColumn |  |

---

## Latest Connecting Call Transcript

**Table:** `latest_connecting_call_transcript`  
**Foundry apiName:** `LatestConnectingCallTranscript`  
**Status:** experimental  
**Datasources:** 1  
**Description:** for the current summit  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `activity_at` | Activity At | TIMESTAMP |  | datasourceColumn |  |
| `activity_call_id` | Activity Call Id | STRING | PK | datasourceColumn |  |
| `activity_contact_id` | Activity Contact Id | STRING |  | datasourceColumn |  |
| `activity_conversation` | Activity Conversation | STRING |  | datasourceColumn |  |
| `activity_lead_id` | Activity Lead Id | STRING |  | datasourceColumn |  |
| `activity_summary_text` | Activity Summary Text | STRING |  | datasourceColumn |  |
| `activity_user_id` | Activity User Id | STRING |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | STRING |  | datasourceColumn |  |
| `close_lead_phone` | Close Lead Phone | STRING |  | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `contact_mo_primary_key` | Contact Mo Primary Key | STRING |  | datasourceColumn |  |
| `custom_field_call_id` | Custom Field Call Id | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `ghl_contact_ids` | Ghl Contact Ids | STRING |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `primary_pain` | Primary Pain | ARRAY |  | datasourceColumn |  |
| `sales_agent_close_user_id` | Sales Agent Close User Id | STRING |  | datasourceColumn |  |
| `sales_agent_email` | Sales Agent Email | STRING |  | datasourceColumn |  |
| `sales_agent_first_name` | Sales Agent First Name | STRING |  | datasourceColumn |  |
| `sales_agent_full_name` | Sales Agent Full Name | STRING |  | datasourceColumn |  |
| `sales_agent_funnelbox_user_id` | Sales Agent Funnelbox User Id | STRING |  | datasourceColumn |  |
| `sales_agent_last_name` | Sales Agent Last Name | STRING |  | datasourceColumn |  |
| `sales_agent_phone` | Sales Agent Phone | STRING |  | datasourceColumn |  |
| `sales_agent_waha_id` | Sales Agent Waha Id | STRING |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |

---

## Lead [Close]

**Table:** `lead_close`  
**Foundry apiName:** `LeadClose`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Aggregated lead records from Close CRM with call activity statistics. Each record summarizes a lead's engagement history including call counts, durations, and outcomes from the Close sales platform.

**Lead Status Values:**
- Unklar (unclear)
- Interessiert (interested)
- Disqualifiziert (disqualified)
- Aktiver Kunde (active customer)
- Aktuell nicht interessiert (currently not interested)
- Nummer ungültig (invalid number)
- Generell nicht Interessiert (generally not interested)

**Key Relationships:**
- Links to [Insight] Call (ONE-to-MANY) - call insights/transcripts
- Links to [Close] Transcript (ONE-to-MANY) - call transcripts
- Links to Customer (ONE-to-MANY) - converted customers
- Links to Call [Close] (ONE-to-MANY) - individual call records
- Links to ID Match (MANY-to-ONE) - identity resolution

**Primary Use Cases:**
- Sales activity tracking and reporting
- Lead prioritization by engagement metrics
- Call quality analysis (talk time, completion rate)
- Status-based lead segmentation

**Relevant Properties:**
- Name: Contact name
- Lead Status: Current CRM status
- Num Calls: Total call count
- Sum Call Durations: Total talk time in minutes
- Percentage Calls Talked: Conversation rate
- Num Calls Over Minute: Meaningful conversations
- Last Call: Most recent activity timestamp
- Last Call Over 20 Minutes: Deep conversation indicator
- Emails: Associated email addresses

**Data Freshness:** Aggregated from Close CRM call data  

**Relationships:**
- has many **InsightCall** (link: "[Insight] Call")
- has many **CloseTranscript** (link: "[Close] Transcript")
- has many **Customer** (link: "Customer")
- has many **CallClose** (link: "Call [Close]")
- belongs to **IdMatch** via `emails` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_duration_summit` | Call Duration Summit | DOUBLE |  | datasourceColumn | Total call duration related to summit events |
| `count_status_busy` | Count Status Busy | LONG |  | datasourceColumn |  |
| `count_status_cancel` | Count Status Cancel | LONG |  | datasourceColumn |  |
| `count_status_completed` | Count Status Completed | LONG |  | datasourceColumn | Number of calls with completed status |
| `count_status_failed` | Count Status Failed | LONG |  | datasourceColumn |  |
| `count_status_no_answer` | Count Status No Answer | LONG |  | datasourceColumn | Number of calls with no answer |
| `count_status_timeout` | Count Status Timeout | LONG |  | datasourceColumn |  |
| `emails` | Emails | ARRAY |  | datasourceColumn | Array of email addresses associated with the lead |
| `last_call` | Last Call | TIMESTAMP |  | datasourceColumn | Timestamp of the most recent call |
| `last_call_over_10_minutes` | Last Call Over 10 Minutes | TIMESTAMP |  | datasourceColumn |  |
| `last_call_over_20_minutes` | Last Call Over 20 Minutes | TIMESTAMP |  | datasourceColumn | Timestamp of the last call over 20 minutes (deep conversation) |
| `last_call_over_3_minutes` | Last Call Over 3 Minutes | TIMESTAMP |  | datasourceColumn |  |
| `last_call_over_minute` | Last Call Over Minute | TIMESTAMP |  | datasourceColumn |  |
| `last_call_string` | Last Call String | STRING |  | datasourceColumn |  |
| `close_lead_id` | Lead ID | STRING | PK | datasourceColumn | Close CRM lead identifier (primary key) |
| `lead_status` | Lead Status | STRING |  | datasourceColumn | Current status in Close CRM (e.g., Unklar, Interessiert, Disqualifiziert, Aktiver Kunde) |
| `contact_name` | Name | STRING |  | datasourceColumn | Contact name of the lead |
| `num_calls` | Num Calls | LONG |  | datasourceColumn | Total number of calls with this lead |
| `num_calls_over_minute` | Num Calls Over Minute | LONG |  | datasourceColumn | Number of calls longer than 1 minute (indicates meaningful conversations) |
| `num_close_email_adresses` | Num Close Emails | LONG |  | datasourceColumn | Number of email addresses in Close CRM |
| `percentage_calls_over_minute` | Percentage Calls Over Minute | DOUBLE |  | datasourceColumn |  |
| `percentage_calls_talked` | Percentage Calls Talked | DOUBLE |  | datasourceColumn | Percentage of calls where actual conversation occurred |
| `sum_call_durations` | Sum Call Durations | DOUBLE |  | datasourceColumn | Total duration of all calls in minutes |

---

## Lead [Kickscale]

**Table:** `lead_kickscale`  
**Foundry apiName:** `LeadKickscale`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **CallKickscale** via `call_ids` (link: "Call [Kickscale]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_ids` | Call Ids | ARRAY |  | datasourceColumn |  |
| `email` | Email | STRING | PK | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |

---

## Mindset Stages

**Table:** `lead_mindset_stages`  
**Foundry apiName:** `LeadMindsetStages`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Set of mindset stages a lead goes through before purchasing a program  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `lead_mindset_description` | Lead Mindset Description | STRING |  | datasourceColumn |  |
| `lead_mindset_id` | Lead Mindset ID | STRING | PK | datasourceColumn |  |
| `lead_mindset_stage` | Lead Mindset Stage | STRING |  | datasourceColumn |  |

---

## Lead Mindset Stages

**Table:** `lead_mindset_stagesv2`  
**Foundry apiName:** `LeadMindsetStagesv2`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `confidence` | Confidence | STRING |  | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `evidences` | Evidences | ARRAY |  | datasourceColumn |  |
| `example` | Example | STRING |  | datasourceColumn |  |
| `explanation` | Explanation | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `stage_id` | Stage Id | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |

---

## Lead Metric

**Table:** `lead_profile`  
**Foundry apiName:** `LeadProfile`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `id` (link: "[Funnelbox] Contact v2")
- belongs to **WhatsAppChatV2** via `id` (link: "[Funnelbox] WhatsApp Chat")
- has many **MarketingOfferParticipation** (link: "Marketing Offer Participation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_duration_minutes` | Call Duration Minutes | DOUBLE |  | datasourceColumn |  |
| `clicked_email_count` | Clicked Email Count | LONG |  | datasourceColumn |  |
| `created_at_timestamp` | Created At Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `curated_email` | Curated Email | LONG |  | datasourceColumn |  |
| `curated_kickscale_insight` | Curated Kickscale Insight | LONG |  | datasourceColumn |  |
| `curated_skool_comments` | Curated Skool Comments | LONG |  | datasourceColumn |  |
| `curated_skool_posts` | Curated Skool Posts | LONG |  | datasourceColumn |  |
| `curated_whatsapp` | Curated Whatsapp | LONG |  | datasourceColumn |  |
| `curated_zoom_qa` | Curated Zoom Qa | LONG |  | datasourceColumn |  |
| `curated_zoom_session_attendance` | Curated Zoom Session Attendance | LONG |  | datasourceColumn |  |
| `curated_zoom_survey` | Curated Zoom Survey | LONG |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `foundry_tags` | Foundry Tags | ARRAY |  | editOnly |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `inbound_email_count` | Inbound Email Count | LONG |  | datasourceColumn |  |
| `lead_score` | Lead Score | DOUBLE |  | datasourceColumn |  |
| `news` | News | BOOLEAN |  | editOnly |  |
| `opened_email_count` | Opened Email Count | LONG |  | datasourceColumn |  |
| `snoozed` | Snoozed | TIMESTAMP |  | editOnly |  |
| `stared` | Stared | BOOLEAN |  | editOnly |  |
| `total_curated_touchpoints` | Total Curated Touchpoints | LONG |  | datasourceColumn |  |
| `call_longer_one_minute` | Vapi Call Longer Than One Minute | BOOLEAN |  | datasourceColumn |  |
| `videos_percentage_watched_aggregated` | Videos Percentage Watched Aggregated | DOUBLE |  | datasourceColumn |  |
| `whatsapp_hours_since_last_message` | Whatsapp Hours Past | LONG |  | datasourceColumn |  |
| `whatsapp_inbound_messages_sent_count` | Whatsapp Inbound Messages Sent Count | LONG |  | datasourceColumn |  |
| `whatsapp_inbound_msg_count` | Whatsapp Inbound Msg Count | LONG |  | datasourceColumn |  |
| `whatsapp_inbound_words_written_count` | Whatsapp Inbound Words Written Count | LONG |  | datasourceColumn |  |
| `whatsapp_last_inboud_message_timestamp` | Whatsapp Last Inboud Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `whatsapp_last_message_direction` | Whatsapp Last Message Direction | STRING |  | datasourceColumn |  |
| `whatsapp_last_message_timestamp` | Whatsapp Last Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `whatsapp_last_outbound_message_timestamp` | Whatsapp Last Outbound Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `whatsapp_needs_response` | Whatsapp Needs Response | BOOLEAN |  | datasourceColumn |  |
| `whatsapp_outbound_messages_sent_count` | Whatsapp Outbound Messages Sent Count | LONG |  | datasourceColumn |  |
| `whatsapp_outbound_words_written_count` | Whatsapp Outbound Words Written Count | LONG |  | datasourceColumn |  |

---

## [Typed Facts] Lead

**Table:** `lead_typed_facts`  
**Foundry apiName:** `LeadTypedFacts`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Consolidated lead profiles built from structured facts extracted from touchpoint interactions. Each lead aggregates typed information including pain levels, health issues, objections, and demographic data derived from surveys, calls, and other customer interactions.

**Pain Improvement Categories:**
- Pain Free
- More than 50% reduction
- 30-50% reduction
- 10-30% reduction
- No Change
- Worse

**Key Relationships:**
- Links to [Funnelbox] Contact v2 (ONE-to-MANY) - multiple contacts per lead
- Links to Short Lead Profile (ONE-to-ONE) - AI-generated summary
- Links to Marketing Offer Participation (ONE-to-MANY)
- Links to [Close] Transcript (ONE-to-MANY)
- Links to Touchpoint v2 Embedding (ONE-to-MANY)
- Links to ID Match (ONE-to-ONE)

**Primary Use Cases:**
- Lead qualification based on extracted health data
- Pain improvement tracking before/after summit
- Sales team briefing with structured lead insights
- Segmentation by health issues, objections, or demographics

**Relevant Properties:**
- Email: Primary identifier
- Pain Before Summit / Latest Pain Level: Pain tracking (1-10 scale)
- Pain Improvement Category: Categorized improvement status
- Health Issues: Array of mentioned health issues
- Objections: Array of concerns raised
- Past Treatments: Array of previously tried treatments
- Gender: Identified gender of the lead

**Data Freshness:** Built incrementally from touchpoint extraction pipeline  

**Relationships:**
- has many **TypedFact** (link: "Typed Fact")
- has many **FunnelboxContactV2** (link: "[Funnelbox] Contact v2")
- belongs to **IdMatch** via `email` (link: "ID Match")
- has many **CloseTranscript** (link: "[Close] Transcript")
- has many **ShortLeadProfile** (link: "Short Lead Profile")
- has many **MarketingOfferParticipation** (link: "Marketing Offer Participation")
- has many **SalesCrmAusbildungLeadEnriched** (link: "[Sales CRM] Ausbildung Leads Enriched")
- has many **TouchpointV2Embeddings** (link: "Touchpoint v2 Embedding")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `all_typed_facts_from_lead` | All Typed Facts from Lead | STRING |  | redacted | Concatenated string of all extracted typed facts for full-text search |
| `ausbildung_interest` | Ausbildung Interest | STRING |  | redacted | Interest level in the training/certification program |
| `best_improvement_category` | Best Improvement Category | STRING |  | redacted | Best pain improvement category achieved by the lead |
| `build_timestamp` | Build Timestamp | TIMESTAMP |  | redacted | Timestamp when this lead record was last built/updated |
| `email` | Email | STRING | PK | redacted | Primary email address (primary key) identifying the lead |
| `gender` | Gender | STRING |  | redacted | Identified gender of the lead (frau/mann) |
| `health_issues` | Health Issues | ARRAY |  | redacted | Array of health issues mentioned by the lead |
| `latest_pain_level` | Latest Pain Level | INTEGER |  | redacted | Most recently reported pain level (1-10 scale) |
| `life_situation_and_dreams` | Life Situation And Dreams | ARRAY |  | redacted | Array of life situation details and aspirations mentioned by the lead |
| `lowest_pain_level_felt` | Lowest Pain Level Felt | INTEGER |  | redacted | Lowest pain level ever reported by the lead |
| `objections` | Objections | ARRAY |  | redacted | Array of objections or concerns raised by the lead |
| `pain_before_summit` | Pain Before Summit | INTEGER |  | redacted | Pain level reported before attending the summit (1-10 scale) |
| `pain_duration` | Pain Duration | ARRAY |  | redacted | Array describing how long the lead has experienced pain |
| `pain_improvement_category` | Pain Improvement Category | STRING |  | redacted | Categorized pain improvement (e.g., 'Pain Free', 'More than 50% reduction', 'No Change', 'Worse') |
| `pain_level_delta` | Pain Level Delta | DOUBLE |  | redacted | Change in pain level (positive = improvement, negative = worsening) |
| `past_treatments` | Past Treatments | ARRAY |  | redacted | Array of past treatments tried by the lead |
| `relatives` | Relatives | ARRAY |  | redacted | Array of relatives mentioned who may also have pain issues |

---

## [Log] Assign Lead to Conversation

**Table:** `log_assign_lead_to_waha_conversation`  
**Foundry apiName:** `LogAssignLeadToWahaConversation`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Assign Lead to Conversation  

**Relationships:**
- belongs to **SalesCrmAusbildungLeadEnriched** via `id-41658b15-33ed-995a-9db2-7a094b251336` (link: "[Sales CRM] Ausbildung Lead Enriched")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | datasourceColumn |  |
| `action_summary` | Action summary | STRING |  | datasourceColumn |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | datasourceColumn |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | datasourceColumn |  |
| `action_type_rid` | Action type RID | STRING |  | datasourceColumn |  |
| `action_type_version` | Action type version | STRING |  | datasourceColumn |  |
| `assigned_to_1` | Assigned To | STRING |  | datasourceColumn |  |
| `lead_temperature_1` | Lead WhatsApp Status | STRING |  | datasourceColumn |  |
| `id_41658b15_33ed_995a_9db2_7a094b251336` | [Sales CRM] Ausbildung Lead Enriched | ARRAY |  | datasourceColumn |  |
| `sales_notes_1` | Sales Notes | STRING |  | datasourceColumn |  |

---

## [Log] Create Fluent Support Ticket via Webhook

**Table:** `log_create_fluent_support_ticket_via_webhook`  
**Foundry apiName:** `LogCreateFluentSupportTicketViaWebhook`  
**Status:** experimental  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Action log tracking all executions of the "Create Fluent Support Ticket via Webhook" action type. Automatically created when action logging was enabled.

**Logged Action Parameters:**
- Title: Ticket title
- Content: Ticket body content
- Customer Id: Fluent Support customer ID
- Mailbox Id: Target mailbox for the ticket
- Client Priority: Priority level assigned
- Product Id: Associated product ID

**Standard Log Fields:**
- Action timestamp: When the action was executed
- Action triggerer: User who triggered the action
- Action summary: Auto-generated summary
- Was action reverted: Reversal tracking
- Action reverter/timestamp: Reversal details

**Use Cases:**
- Audit trail for automated ticket creation
- Debugging webhook integrations
- Monitoring support ticket automation
- Compliance and accountability tracking

**Note:** This is a system-generated log object type for action auditing.  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `client_priority_2` | Client Priority | STRING |  | redacted |  |
| `content_2` | Content | STRING |  | redacted |  |
| `customer_id_2` | Customer Id | INTEGER |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `mailbox_id_2` | Mailbox Id | INTEGER |  | redacted |  |
| `product_id_2` | Product Id | INTEGER |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |
| `title_2` | Title | STRING |  | redacted |  |

---

## [Log] Create Subscription Pause

**Table:** `log_create_subscription_pause`  
**Foundry apiName:** `LogCreateSubscriptionPause`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Create Subscription Pause  

**Relationships:**
- belongs to **Subscription** via `subscription` (link: "Subscription")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `end_date` | End Date | DATE |  | redacted | Pause end date |
| `reason` | Reason | STRING |  | redacted | Pause reason |
| `start_date` | Start Date | DATE |  | redacted | Pause start date |
| `subscription` | Subscription | STRING |  | redacted | Subscription parameter from action |

---

## [Log] Create Summit Profile FULL

**Table:** `log_create_summit_profile_from_id`  
**Foundry apiName:** `LogCreateSummitProfileFromId`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Create Summit Profile FULL  

**Relationships:**
- belongs to **SummitProfile** via `cvkdqgky-summit-profile` (link: "Summit Profile")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |
| `summit_profile` | Summit Profile | ARRAY |  | redacted |  |

---

## [Log] Delete multiple Summit Profiles

**Table:** `log_delete_multiple_summit_profile`  
**Foundry apiName:** `LogDeleteMultipleSummitProfile`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Delete multiple Summit Profiles  

**Relationships:**
- belongs to **SummitProfile** via `cvkdqgky-summit-profile` (link: "Summit Profile")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |
| `summit_profile` | Summit Profile | ARRAY |  | redacted |  |

---

## [Log] Delete Subscription Pause

**Table:** `log_delete_subscription_pause`  
**Foundry apiName:** `LogDeleteSubscriptionPause`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Delete Subscription Pause  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `subscription` | Subscription | STRING |  | redacted | Subscription parameter from action (for filtering) |
| `subscription_pause` | Subscription Pause | STRING |  | redacted | The subscription pause that was deleted |

---

## [Log] [DEV] Crete Fluent Support Ticket

**Table:** `log_dev_crete_fluent_support_ticket`  
**Foundry apiName:** `LogDevCreteFluentSupportTicket`  
**Status:** experimental  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Development action log tracking all executions of the "[DEV] Crete Fluent Support Ticket" action type. Used for testing and development of support ticket automation.

**Logged Action Parameters:**
- Title: Ticket title for testing
- Content: Ticket body content
- Customer Id: Fluent Support customer ID
- Mailbox Id: Target mailbox for the ticket

**Standard Log Fields:**
- Action timestamp: When the action was executed
- Action triggerer: Developer who triggered the action
- Action summary: Auto-generated summary
- Was action reverted: Reversal tracking
- Action reverter/timestamp: Reversal details

**Use Cases:**
- Development testing of ticket creation workflows
- Debugging support integrations before production
- Developer audit trail

**Note:** This is a development/testing action log. The typo "Crete" in the name is intentional (original action name).  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `content_3` | Content | STRING |  | redacted |  |
| `customer_id_3` | Customer Id | INTEGER |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `mailbox_id_3` | Mailbox Id | INTEGER |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |
| `title_3` | Title | STRING |  | redacted |  |

---

## [Log] Edit Subscription's program & cohort

**Table:** `log_edit_subscription_program_cohort`  
**Foundry apiName:** `LogEditSubscriptionProgramCohort`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Edit Subscription's program & cohort  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `cohort_slug` | Cohort Slug | STRING |  | redacted |  |
| `program_id` | Program Id | STRING |  | redacted |  |
| `subscription` | Subscription | ARRAY |  | redacted | Subscription parameter from action (array of subscription IDs) |

---

## [Log] [Fluent] API Respond Ticket

**Table:** `log_fluent_api_respond_ticket`  
**Foundry apiName:** `LogFluentApiRespondTicket`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: [Fluent] API Respond Ticket  

**Relationships:**
- belongs to **TicketActivityFluent** via `ticket-response-fluent` (link: "Ticket Message [Fluent]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | datasourceColumn |  |
| `action_summary` | Action summary | STRING |  | datasourceColumn |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | datasourceColumn |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | datasourceColumn |  |
| `action_type_rid` | Action type RID | STRING |  | datasourceColumn |  |
| `action_type_version` | Action type version | STRING |  | datasourceColumn |  |
| `auth_token_3` | Auth Token | STRING |  | datasourceColumn |  |
| `close_yes_no_3` | Close | STRING |  | datasourceColumn |  |
| `content_3` | Content | STRING |  | datasourceColumn |  |
| `ticket_id_3` | Ticket ID | STRING |  | datasourceColumn |  |
| `ticket_response_fluent` | Ticket Message [Fluent] | ARRAY |  | datasourceColumn |  |
| `type_3` | Type | STRING |  | datasourceColumn |  |

---

## [Log] [Fluent] Create New LLM Cluster for Ticket

**Table:** `log_fluent_create_new_cluster_for_ticket`  
**Foundry apiName:** `LogFluentCreateNewClusterForTicket`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: [Fluent] Create New LLM Cluster for Ticket  

**Relationships:**
- belongs to **ClusterLlmFluent** via `cluster-llm-fluent` (link: "Cluster LLM [Fluent]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | datasourceColumn |  |
| `action_summary` | Action summary | STRING |  | datasourceColumn |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | datasourceColumn |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | datasourceColumn |  |
| `action_type_rid` | Action type RID | STRING |  | datasourceColumn |  |
| `action_type_version` | Action type version | STRING |  | datasourceColumn |  |
| `cluster_llm_fluent` | Cluster LLM [Fluent] | ARRAY |  | datasourceColumn |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | datasourceColumn |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | datasourceColumn |  |
| `revert_user` | Action reverter | STRING |  | datasourceColumn |  |
| `ticket_id_6` | Ticket ID | STRING |  | datasourceColumn |  |

---

## [Log] GHLWASendMessage

**Table:** `log_ghlwasend_message`  
**Foundry apiName:** `LogGhlwasendMessage`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: GHLWASendMessage  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `message_content_1` | Message Content | STRING |  | redacted |  |

---

## [Log] Set Completed - WhatsApp Chat

**Table:** `log_modify_whats_app_chat`  
**Foundry apiName:** `LogModifyWhatsAppChat`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Set Completed - WhatsApp Chat  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | datasourceColumn |  |
| `action_summary` | Action summary | STRING |  | datasourceColumn |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | datasourceColumn |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | datasourceColumn |  |
| `action_type_rid` | Action type RID | STRING |  | datasourceColumn |  |
| `action_type_version` | Action type version | STRING |  | datasourceColumn |  |
| `completed_1` | Completed | BOOLEAN |  | datasourceColumn |  |
| `whats_app_chat` | WhatsApp Chat | ARRAY |  | datasourceColumn |  |

---

## [Log] Name and eMail Update

**Table:** `log_name_and_e_mail_update`  
**Foundry apiName:** `LogNameAndEMailUpdate`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Name and eMail Update  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | datasourceColumn |  |
| `action_summary` | Action summary | STRING |  | datasourceColumn |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | datasourceColumn |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | datasourceColumn |  |
| `action_type_rid` | Action type RID | STRING |  | datasourceColumn |  |
| `action_type_version` | Action type version | STRING |  | datasourceColumn |  |
| `email_1` | Email | STRING |  | datasourceColumn |  |
| `first_name_1` | First Name | STRING |  | datasourceColumn |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | datasourceColumn |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | datasourceColumn |  |
| `revert_user` | Action reverter | STRING |  | datasourceColumn |  |
| `cvkdqgky_zoom_participant` | Zoom Participant | ARRAY |  | datasourceColumn |  |

---

## [Log] Enzo Mailsend run function Bulk

**Table:** `log_send_to_enzo_side_effect_and_mark_as_sent`  
**Foundry apiName:** `LogSendToEnzoSideEffectAndMarkAsSent`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Enzo Mailsend run function Bulk  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |
| `set_sp_3` | Set Sp | STRING |  | redacted |  |

---

## [Log] [Webhook][App] Setup Multiple Web App Users

**Table:** `log_setup_multiple_web_app_users`  
**Foundry apiName:** `LogSetupMultipleWebAppUsers`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: [Webhook][App] Setup Multiple Web App Users  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `assign_program` | Assign Program | BOOLEAN |  | redacted |  |
| `cohort_slug` | Cohort Slug | STRING |  | redacted |  |
| `program` | Program | STRING |  | redacted |  |
| `subscriptions` | Subscriptions | ARRAY |  | redacted | Subscriptions parameter from action (array of subscription IDs) |

---

## [Log] [Webhook][App] Setup Web App User

**Table:** `log_setup_web_app_user`  
**Foundry apiName:** `LogSetupWebAppUser`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: [Webhook][App] Setup Web App User  

**Relationships:**
- belongs to **Subscription** via `subscription` (link: "Subscription")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `assign_program` | Assign Program | BOOLEAN |  | redacted |  |
| `cohort_slug` | Cohort Slug | STRING |  | redacted |  |
| `customer` | Customer | STRING |  | redacted | Customer parameter from action |
| `end_date` | End Date | DATE |  | redacted |  |
| `program` | Program | STRING |  | redacted |  |
| `start_date` | Start Date | DATE |  | redacted |  |
| `subscription` | Subscription | STRING |  | redacted | Subscription parameter from action |
| `user_mail` | User Mail | STRING |  | redacted |  |

---

## [Log] Trigger Summit Profile Creation

**Table:** `log_trigger_summit_profile_creation`  
**Foundry apiName:** `LogTriggerSummitProfileCreation`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Trigger Summit Profile Creation  

**Relationships:**
- belongs to **IdMatch** via `id-match` (link: "ID Matcher")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `id_match` | ID Matcher | ARRAY |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |

---

## [Log] Update Opportunity

**Table:** `log_update_opportunity`  
**Foundry apiName:** `LogUpdateOpportunity`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Update Opportunity  

**Relationships:**
- belongs to **Opportunity** via `opportunity-53828221` (link: "Opportunity")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `context_notes_1` | Context Notes | STRING |  | redacted |  |
| `contract_id_1` | Contract ID | STRING |  | redacted |  |
| `current_stage_1` | Current Stage | STRING |  | redacted |  |
| `hypothesis_1` | Hypothesis | STRING |  | redacted |  |
| `opportunity` | Opportunity | ARRAY |  | redacted |  |
| `owner_1` | Owner | STRING |  | redacted |  |
| `potential_value_1` | Potential Value | DOUBLE |  | redacted |  |
| `subscription_id_1` | Subscription ID | STRING |  | redacted |  |

---

## [Log] Update Subscription Start Date

**Table:** `log_update_subscription_start_date`  
**Foundry apiName:** `LogUpdateSubscriptionStartDate`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: Update Subscription Start Date  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `new_start_date` | New Start Date | DATE |  | redacted | The new start date for the subscription |
| `subscription` | Subscription | STRING |  | redacted | Subscription parameter from action |

---

## [Log] [Webhook][App] Update User Subscription Statuses

**Table:** `log_update_subscription_status`  
**Foundry apiName:** `LogUpdateSubscriptionStatus`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: [Webhook][App] Update User Subscription Statuses  

**Relationships:**
- belongs to **Subscription** via `subscription` (link: "Subscription")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `is_reverted` | Was action reverted | BOOLEAN |  | redacted |  |
| `revert_timestamp` | Action revert timestamp | TIMESTAMP |  | redacted |  |
| `revert_user` | Action reverter | STRING |  | redacted |  |
| `status_9` | Status | STRING |  | redacted |  |
| `subscription` | Subscription | ARRAY |  | redacted |  |

---

## [Log] [Webhook][App] Update Subscription Statuses

**Table:** `log_webhook_app_update_subscription_statuses`  
**Foundry apiName:** `LogWebhookAppUpdateSubscriptionStatuses`  
**Status:** experimental  
**Datasources:** 1  
**Description:** This object type was automatically created when logging was enabled for the Action type: [Webhook][App] Update Subscription Statuses  

**Relationships:**
- belongs to **Subscription** via `subscription` (link: "Subscription")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_rid` | Action RID | STRING | PK | redacted |  |
| `action_summary` | Action summary | STRING |  | redacted |  |
| `action_timestamp` | Action timestamp | TIMESTAMP |  | redacted |  |
| `action_triggerer_user_id` | Action triggerer | STRING |  | redacted |  |
| `action_type_rid` | Action type RID | STRING |  | redacted |  |
| `action_type_version` | Action type version | STRING |  | redacted |  |
| `status_1` | Status | STRING |  | redacted |  |
| `subscription` | Subscription | ARRAY |  | redacted |  |

---

## Marketing Campaign

**Table:** `marketing_campaign`  
**Foundry apiName:** `MarketingCampaign`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **InsightQueue** (link: "Insight Queue")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `campaign_description` | Campaign Description | STRING |  | editOnly |  |
| `campaign_name` | Campaign Name | STRING |  | editOnly |  |
| `created_at` | Created At | TIMESTAMP |  | editOnly |  |
| `created_by` | Created By | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |

---

## Marketing Offer

**Table:** `marketing_offer`  
**Foundry apiName:** `MarketingOffer`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Master reference for marketing events and offers including Summits, Workshops, Webinars, and training programs. Acts as the parent entity for all Marketing Offer Participations.

**Event Types:**
- Schmerzfrei-Summit: Multi-week online summit events
- Schmerzfrei-Workshop: Shorter workshop format
- Arthrose-Workshop: Specialized arthritis-focused workshop
- Original Ausbildung: Training/certification programs
- Deep Dive sessions: Intensive focused programs

**Key Relationships:**
- Links to [MOP] Marketing Offer Participation (parent entity for all lead engagement analytics)

**Use Cases:**
- Marketing campaign organization
- Event attendance tracking
- Participation analytics aggregation
- Conversion funnel analysis by event
- Lead engagement journey mapping

**Relevant Properties:**
- Name: Marketing offer name
- Event Type: Type of marketing event (CONFERENCE, WORKSHOP, WEBINAR, etc.)
- Status: Publication status (PUBLISHED, DRAFT, ARCHIVED)
- Start/End Time: Event date range
- Attendance Type: How attendees participate (virtual, in-person, hybrid)  

**Relationships:**
- has many **MarketingOfferParticipation** (link: "Marketing Offer Participation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `attendance_type` | Attendance Type | STRING |  | datasourceColumn | How attendees participate (virtual, in-person, hybrid) |
| `description` | Description | STRING |  | datasourceColumn | Detailed description of the marketing offer/event |
| `end_time` | End Time | TIMESTAMP |  | datasourceColumn | Event end date and time |
| `event_type` | Event Type | STRING |  | datasourceColumn | Type of marketing event (CONFERENCE, WORKSHOP, WEBINAR, etc.) |
| `marketing_offer_id` | Marketing Offer Id | STRING | PK | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn | Marketing offer name (e.g., 'Schmerzfrei-Summit mit Justus Hirt', 'Arthrose-Workshop') |
| `start_time` | Start Time | TIMESTAMP |  | datasourceColumn | Event start date and time |
| `status` | Status | STRING |  | datasourceColumn | Publication status of the offer (PUBLISHED, DRAFT, ARCHIVED) |

---

## [MOP] Marketing Offer Participation

**Table:** `marketing_offer_participation`  
**Foundry apiName:** `MarketingOfferParticipation`  
**Status:** active  
**Datasources:** 1  
**Description:** **Object documentation last updated**: February 3rd, 2026 at 13:09 CET — Statistics may be outdated; refresh if needed.

Tracks individual lead/contact participation in marketing events (Summits, Workshops, Webinars). This is the central engagement analytics object aggregating ~110K records across 16 different marketing offers.

**Data Freshness:** Builds twice daily (12:45 and 20:45 UTC), ~20 min build time. Last build: 2026-02-02.

**Data Sources (28 inputs):** Aggregates from Funnelbox Contacts, Zoom Sessions, WhatsApp, Close CRM, PandaDoc, Docuseal, Skool, VAPI AI calls, GHL Forms, and more.

**Key Statistics:**
- Total Records: ~110K participations
- Conversion Rate: 0.8% (883 converted)
- Session Attendance: 15% (16,952 attended at least 1 session)
- Avg Watch Time: 10.8 hours (max 518h)
- Avg Sessions: 7.7 (max 160)

**Filtering Patterns for OSDK/LLM:**
- By event: `marketingOfferName` (e.g., 'Schmerzfrei-Summit', 'Arthrose-Workshop')
- By engagement: `typeOfParticipation` = 'Joined Session' | 'Ticket Only' | 'Lobby Only'
- By quality: `preleadScoreSegment` = 'TIER 1' (best) to 'TIER 5' (lowest)
- By conversion: `hasConverted` = true for paying customers
- By signing: `isSigned` (PandaDoc) or `docusealIsSigned` (Docuseal)

**Property Prefixes:**
- `MOP_` / `mop`: Marketing Offer Participation-specific calculated metrics (time deltas, session breakdowns)
- `docuseal_`: Docuseal document signing platform data
- `watched_more_*` / `watched_total_more_*`: Boolean threshold flags for watch time

**Relationships:** Links to MarketingOffer, FunnelboxContactV2, LeadTypedFacts, and Lead Metric objects.  

**Relationships:**
- belongs to **FunnelboxContactV2** via `id` (link: "[Funnelbox] Contact v2")
- belongs to **LeadProfile** via `id` (link: "Lead Metric")
- belongs to **MarketingOffer** via `marketing_offer_id` (link: "Marketing Offer")
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")
- belongs to **SalesCrmAusbildungLeadEnriched** via `email` (link: "[Sales CRM] Ausbildung Leads Enriched")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `n3days_live_time_watched` | 3days Live Time Watched | DOUBLE |  | datasourceColumn |  |
| `n3days_recording_time_watched` | 3days Recording Time Watched | DOUBLE |  | datasourceColumn |  |
| `n7days_live_time_watched` | 7days Live Time Watched | DOUBLE |  | datasourceColumn |  |
| `n7days_recording_time_watched` | 7days Recording Time Watched | DOUBLE |  | datasourceColumn |  |
| `agent_false_calls` | Agent False Calls | ARRAY |  | datasourceColumn |  |
| `agent_true_calls` | Agent True Calls | ARRAY |  | datasourceColumn |  |
| `assistant_id` | Assistant Id | ARRAY |  | datasourceColumn |  |
| `attendance_ratio` | Attendance Ratio | DOUBLE |  | datasourceColumn | Ratio of sessions attended vs. total available sessions (0-1). Higher = more consistent attendee. |
| `attended_session` | Attended Session | BOOLEAN |  | datasourceColumn | TRUE if attended at least one session (simplified boolean). Same logic as has_lead_attended_session. |
| `average_call_duration` | Average Call Duration | DOUBLE |  | datasourceColumn |  |
| `avg_daily_recording_view_time` | Avg Daily Recording View Time | DOUBLE |  | datasourceColumn |  |
| `avg_open_lag_minutes_all` | Avg Open Lag Minutes All | DOUBLE |  | datasourceColumn |  |
| `chat_message_count` | Chat Message Count | LONG |  | datasourceColumn | Zoom webinar chat messages sent by lead. High count = actively engaged during live sessions. |
| `chat_message_count_words` | Chat Message Count Words | LONG |  | datasourceColumn | Total words in Zoom chat messages. Higher word count = more substantive engagement. |
| `clicked_email_count` | Clicked Email Count | LONG |  | datasourceColumn | Total email link clicks during the MOP period. Stronger engagement signal than opens. |
| `clicked_timestamp_mop` | Clicked Timestamp Mop | ARRAY |  | datasourceColumn |  |
| `completed_call` | Completed Call | LONG |  | datasourceColumn |  |
| `completed_strukturanalyse` | Completed Strukturanalyse | BOOLEAN |  | datasourceColumn | TRUE if completed the structure analysis assessment (1,222 total). Key qualification milestone in the lead journey. |
| `contact_id` | Contact Id | STRING |  | datasourceColumn | Funnelbox contact identifier. Never null (100% populated). Use for linking to FunnelboxContactV2 and cross-event analysis. |
| `contact_mo_primary_key` | Contact Mo Primary Key | STRING | PK | datasourceColumn | Composite primary key: SHA256 hash of contact_id + marketing_offer_id. Ensures one record per contact per event. Use contact_id or email for cross-event lookups. |
| `count_free_form_questions` | Count Free Form Questions | LONG |  | datasourceColumn |  |
| `count_long_answer_question` | Count Long Answer Question | LONG |  | datasourceColumn |  |
| `count_questions_answered` | Count Questions Answered | LONG |  | datasourceColumn | Total survey questions answered across all Zoom surveys. Depth of feedback engagement. |
| `count_sessions` | Count Sessions | LONG |  | datasourceColumn | Number of Zoom sessions attended. Avg: 7.7, Max: 160. Conditional formatting: Red (0-3), Orange (4-10), Green (11+). Null if never attended. |
| `count_short_answer_question` | Count Short Answer Question | LONG |  | datasourceColumn |  |
| `count_skool_comment_after_event` | Count Skool Comment After Event | LONG |  | datasourceColumn | Skool comments by lead AFTER the event. More comments = higher community engagement. |
| `count_skool_post_after_event` | Count Skool Post After Event | LONG |  | datasourceColumn | Skool community posts created by lead AFTER the event. Indicates ongoing community engagement. |
| `count_surveys_submitted` | Count Surveys Submitted | LONG |  | datasourceColumn | Number of Zoom surveys completed by lead. Higher count = more engaged with feedback. |
| `count_words_long_answer_questions` | Count Words Long Answer Questions | LONG |  | datasourceColumn |  |
| `count_words_short_answer_questions` | Count Words Short Answer Questions | LONG |  | datasourceColumn |  |
| `days_between_ticket_first_session` | Days Between Ticket First Session | LONG |  | datasourceColumn | Days from registration to first session (rounded). Simpler version of hours_between_ticket_first_session. |
| `docuseal_click_email_count` | Docuseal Click Email Count | LONG |  | datasourceColumn |  |
| `docuseal_completed_at` | Docuseal Completed At | TIMESTAMP |  | datasourceColumn | Timestamp when Docuseal document was signed/completed. Final conversion milestone. |
| `docuseal_email_clicked_at` | Docuseal Email Clicked At | TIMESTAMP |  | datasourceColumn |  |
| `docuseal_is_opened` | Docuseal Is Opened | BOOLEAN |  | datasourceColumn | TRUE if lead opened the Docuseal document. Second stage of Docuseal funnel. |
| `docuseal_is_sent` | Docuseal Is Sent | BOOLEAN |  | datasourceColumn | TRUE if a Docuseal document has been sent to lead. First stage of Docuseal contract funnel. |
| `docuseal_is_signed` | Docuseal Is Signed | BOOLEAN |  | datasourceColumn | TRUE if signed via Docuseal platform (416 total). Alternative to PandaDoc. Combined with is_signed covers all contract signings. |
| `docuseal_opened_at` | Docuseal Opened At | TIMESTAMP |  | datasourceColumn |  |
| `docuseal_program` | Docuseal Program | STRING |  | datasourceColumn | Program type for Docuseal contracts. Values: 'Basisausbildung' (3K), 'Arthrose-Blueprint' (1.3K), 'Schmerzfrei-Coaching' (1K), 'Schmerzfrei-Ausbildung' (957). Only populated when Docuseal document sent. |
| `docuseal_sent_at` | Docuseal Sent At | TIMESTAMP |  | datasourceColumn | Timestamp when Docuseal document was sent. Contract pipeline tracking. |
| `docuseal_template` | Docuseal Template | ARRAY |  | datasourceColumn |  |
| `docuseal_template_signed` | Docuseal Template Signed | ARRAY |  | datasourceColumn |  |
| `docuseal_view_form_count` | Docuseal View Form Count | LONG |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn | Lead's email address. Title property - displayed as object name. Never null (100% populated). Use for lookups and display. |
| `email_open_consistency` | Email Open Consistency | DOUBLE |  | datasourceColumn | Consistency of email opening behavior (0-4 scale). Avg: 0.42, Max: 4. Higher = more reliable email opener. |
| `email_responsiveness_score` | Email Responsiveness Score | DOUBLE |  | datasourceColumn | Email engagement quality score (0-100). Avg: 20.5, Max: 100. Based on open timing, click-through rates, and response patterns. Higher = more responsive to emails. |
| `email_word_count` | Email Word Count | LONG |  | datasourceColumn |  |
| `ended_reason` | Ended Reason | ARRAY |  | datasourceColumn |  |
| `event_activity_days` | Event Activity Days | LONG |  | datasourceColumn | Number of unique days with activity during the event. Engagement consistency metric. |
| `false_calls` | False Calls | LONG |  | datasourceColumn | Count of unsuccessful VAPI calls (no answer, voicemail, etc.). High count may indicate bad contact info or disinterest. |
| `first_chat_message` | First Chat Message | TIMESTAMP |  | datasourceColumn | Timestamp of first Zoom chat message sent by lead. Milestone for active engagement. |
| `first_close_call_attempt_ts` | First Close Call Attempt Ts | TIMESTAMP |  | datasourceColumn | Timestamp of first sales call attempt. Sales engagement milestone. |
| `first_close_call_over_3_minute` | First Close Call Over 3 Minute | TIMESTAMP |  | datasourceColumn |  |
| `first_close_call_over_minute` | First Close Call Over Minute | TIMESTAMP |  | datasourceColumn |  |
| `first_original_moments_published` | First Original Moments Published | TIMESTAMP |  | datasourceColumn |  |
| `first_ts_document_draft` | First Ts Document Draft | TIMESTAMP |  | datasourceColumn |  |
| `first_ts_document_signed` | First Ts Document Signed | TIMESTAMP |  | datasourceColumn | Timestamp when first PandaDoc was signed. Conversion milestone. |
| `first_ts_document_viewed` | First Ts Document Viewed | TIMESTAMP |  | datasourceColumn | Timestamp when first PandaDoc was viewed. Contract consideration milestone. |
| `has_converted` | Has Converted | BOOLEAN |  | datasourceColumn | TRUE if lead became a paying customer (883 total, 0.8% conversion rate). Primary conversion flag - use for ROI analysis and conversion funnel reporting. |
| `has_lead_attended_session` | Has Lead Attended Session | BOOLEAN |  | datasourceColumn | TRUE if attended at least one live Zoom session (16,952 total, 15%). Use to segment show-rate analysis. More accurate than type_of_participation for attendance tracking. |
| `has_not_received_any_pandadoc` | Has Not Received Any Pandadoc | BOOLEAN |  | datasourceColumn | TRUE if no PandaDoc has been sent to this lead. Identifies leads not yet in contract pipeline. |
| `has_skool_account` | Has Skool Account | BOOLEAN |  | datasourceColumn | TRUE if created Skool community account (2,628 total). Community engagement indicator. Conditional formatting: Green (true), Red (false). |
| `has_skool_account_after_event` | Has Skool Account After Event | BOOLEAN |  | datasourceColumn | TRUE if Skool account created AFTER event start. Post-event community adoption. |
| `hours_between_registration_call_activation` | Hours Between Registration Call Activation | LONG |  | datasourceColumn |  |
| `hours_between_registration_email_activation` | Hours Between Registration Email Activation | LONG |  | datasourceColumn |  |
| `hours_between_registration_sms_activation` | Hours Between Registration Sms Activation | LONG |  | datasourceColumn |  |
| `hours_between_registration_whatsapp_activation` | Hours Between Registration Whatsapp Activation | LONG |  | datasourceColumn |  |
| `hours_between_ticket_first_session` | Hours Between Ticket First Session | LONG |  | datasourceColumn | Hours from registration to first session attendance. Key metric for registration-to-show conversion timing. |
| `hours_between_ticket_skool` | Hours Between Ticket Skool | DOUBLE |  | datasourceColumn | Hours from registration to Skool account creation. Lower = faster community adoption. |
| `id` | Id | STRING |  | datasourceColumn | Legacy Funnelbox ID for the contact. Use contact_id for modern integrations. |
| `inbound_email_count` | Inbound Email Count | LONG |  | datasourceColumn | Number of emails sent BY the lead (replies). Indicates proactive engagement. |
| `inbound_timestamp_mop` | Inbound Timestamp Mop | ARRAY |  | datasourceColumn |  |
| `inbound_touchpoints_content_tokens` | Inbound Touchpoints Content Tokens | DOUBLE |  | datasourceColumn |  |
| `inbound_touchpoints_count` | Inbound Touchpoints Count | LONG |  | datasourceColumn | Total inbound communications from lead across all channels. Higher = more proactively engaged lead. |
| `inbound_touchpoints_latest_timestamp` | Inbound Touchpoints Latest Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `inbound_touchpoints_sources` | Inbound Touchpoints Sources | ARRAY |  | datasourceColumn | Array of channels used for inbound communication. Values: 'Email', 'WhatsApp', 'Zoom Chat Message', 'Zoom Survey', 'Close Call', 'Skool posts', etc. Use to understand channel preferences. |
| `is_call_dnd_activated_after_registration` | Is Call Dnd Activated After Registration | BOOLEAN |  | datasourceColumn | TRUE if call DND was activated AFTER registration. May indicate over-contact. |
| `is_call_dnd_active` | Is Call Dnd Active | BOOLEAN |  | datasourceColumn | TRUE if Do Not Disturb active for PHONE (6,772 total, 6%). EXCLUDE from call campaigns. |
| `is_email_dnd_activated_after_registration` | Is Email Dnd Activated After Registration | BOOLEAN |  | datasourceColumn | TRUE if email DND was activated AFTER registration. May indicate negative experience. |
| `is_email_dnd_active` | Is Email Dnd Active | BOOLEAN |  | datasourceColumn | TRUE if Do Not Disturb active for EMAIL (22,402 total, 20%). EXCLUDE from email campaigns. Check before any email outreach. |
| `is_signed` | Is Signed | BOOLEAN |  | datasourceColumn | TRUE if signed a PandaDoc contract (883 total). Indicates conversion completion. Check together with docuseal_is_signed for complete signing status. |
| `is_sms_dnd_activated_after_registration` | Is Sms Dnd Activated After Registration | BOOLEAN |  | datasourceColumn |  |
| `is_sms_dnd_active` | Is Sms Dnd Active | BOOLEAN |  | datasourceColumn | TRUE if Do Not Disturb active for SMS (8,762 total, 8%). EXCLUDE from SMS campaigns. |
| `is_viewed` | Is Viewed | BOOLEAN |  | datasourceColumn | TRUE if viewed a PandaDoc document. Contract funnel stage indicator. |
| `is_whatsapp_dnd_activated_after_registration` | Is Whatsapp Dnd Activated After Registration | BOOLEAN |  | datasourceColumn | TRUE if WhatsApp DND was activated AFTER registration. |
| `is_whatsapp_dnd_active` | Is Whatsapp Dnd Active | BOOLEAN |  | datasourceColumn | TRUE if Do Not Disturb active for WHATSAPP (6,600 total, 6%). EXCLUDE from WhatsApp outreach. |
| `joined_date` | Joined Date | TIMESTAMP |  | datasourceColumn |  |
| `joined_first_session` | Joined First Session | TIMESTAMP |  | datasourceColumn | Timestamp of first live session attendance. Key milestone - indicates show-up. Null if never joined a session. |
| `joined_last_session` | Joined Last Session | TIMESTAMP |  | datasourceColumn | Timestamp of most recent session attendance. Use to identify recently active vs. dormant leads. |
| `last_3_days_total_watchtime` | Last 3 Days Total Watchtime | DOUBLE |  | datasourceColumn | Watch time in the last 3 days (hours). Very recent engagement indicator. Updated daily. |
| `last_7_days_total_watchtime` | Last 7 Days Total Watchtime | DOUBLE |  | datasourceColumn | Watch time in the last 7 days (hours). Recent engagement indicator. Updated daily. |
| `last_active` | Last Active | DATE |  | datasourceColumn |  |
| `last_attempt` | Last Attempt | TIMESTAMP |  | datasourceColumn |  |
| `last_clicked_email` | Last Clicked Email | TIMESTAMP |  | datasourceColumn |  |
| `last_day_watched_recording` | Last Day Watched Recording | DATE |  | datasourceColumn |  |
| `last_dnd_timestamp` | Last Dnd Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `last_email_timestamp` | Last Email Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `last_online` | Last Online | TIMESTAMP |  | datasourceColumn | Last Skool community activity timestamp. Indicates community engagement recency. |
| `last_opened_email` | Last Opened Email | TIMESTAMP |  | datasourceColumn |  |
| `last_original_moments_published` | Last Original Moments Published | TIMESTAMP |  | datasourceColumn |  |
| `last_pageview_timestamp` | Last Pageview Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `last_pandadoc_ts` | Last Pandadoc Ts | TIMESTAMP |  | datasourceColumn |  |
| `last_survey_timestamp` | Last Survey Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `last_vapi_call_1_sec` | Last Vapi Call 1 Sec | TIMESTAMP |  | datasourceColumn |  |
| `last_vapi_call_60_sec` | Last Vapi Call 60 Sec | TIMESTAMP |  | datasourceColumn |  |
| `last_video_timestamp` | Last Video Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `lead_age` | Lead Age | DOUBLE |  | datasourceColumn | Lead's age in years from intake form. Null for ~99% of records - only from completed forms. |
| `lead_bmi` | Lead BMI | DOUBLE |  | datasourceColumn | Body Mass Index calculated from lead_height_cm and lead_weight_kg. Health context metric. |
| `lead_gender` | Lead Gender | STRING |  | datasourceColumn | Gender from intake forms. Values: 'Weiblich' (1.1K), 'Männlich' (260), 'Andere' (3). 99% null - only available when form submitted. |
| `lead_height_cm` | Lead Height Cm | DOUBLE |  | datasourceColumn | Lead's height in centimeters from intake form. |
| `lead_opening_session_watchtime` | Lead Opening Session Watchtime | LONG |  | datasourceColumn | Watch time during opening/kickoff session in seconds. First impression engagement. |
| `lead_weight_kg` | Lead Weight Kg | DOUBLE |  | datasourceColumn | Lead's weight in kilograms from intake form. |
| `marketing_offer_end_timestamp` | Marketing Offer End Timestamp | TIMESTAMP |  | datasourceColumn | Event end date/time. Used to calculate if engagement occurred during or after the event period. |
| `marketing_offer_followup_end` | Marketing Offer Followup End | TIMESTAMP |  | datasourceColumn | End of follow-up period after event. Defines when post-event engagement tracking stops. |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn | Unique identifier for the marketing event (e.g., 'jPzFgIasS5ajjAQv7wBjBA'). Foreign key to Marketing Offer object. 16 unique events in current data. |
| `marketing_offer_name` | Marketing Offer Name | STRING |  | datasourceColumn | Event name with ID prefix (e.g., 'jPzFgIasS5ajjAQv7wBjBA - Schmerzfrei-Summit mit Justus Hirt - 14.11 - 07.12.2025'). Use for filtering. Top events: Schmerzfrei-Summit (22K, 18K), Arthrose-Workshop (17K, 10K). |
| `marketing_offer_registration_timestamp` | Marketing Offer Registration Timestamp | TIMESTAMP |  | datasourceColumn | When the lead registered/got their ticket for the event. Use for lead aging and pre-event engagement timing analysis. |
| `marketing_offer_start_timestamp` | Marketing Offer Start Timestamp | TIMESTAMP |  | datasourceColumn | Event start date/time. Use with registration timestamp to calculate days_between_ticket_first_session. |
| `mop_active_session_count` | MOP Active Session Count | LONG |  | datasourceColumn | Number of active/interactive sessions attended. |
| `mop_active_session_watch_time` | MOP Active Session Watch Time | DOUBLE |  | datasourceColumn | Hours watched in active/interactive sessions. Engagement depth metric. |
| `mop_confirmation_email_clicks` | MOP Confirmation Email Clicks | LONG |  | datasourceColumn |  |
| `mop_confirmation_email_opens` | MOP Confirmation Email Opens | LONG |  | datasourceColumn |  |
| `mop_days_since_ticket_issue` | MOP Days Since Ticket Issue | LONG |  | datasourceColumn | Days since registration (ticket issued). Updates daily. Use for lead aging analysis and follow-up timing. |
| `mop_days_ticket_issue_to_event_start` | MOP Days Ticket Issue To Event Start | LONG |  | datasourceColumn | Days between registration and event start. Positive = registered before event. Measures lead time. |
| `mop_days_until_event_start` | MOP Days Until Event Start | LONG |  | datasourceColumn | Days until event starts (negative = event has started). Use for pre-event engagement analysis. Updates daily. |
| `mop_during_summit_count_email_clicks` | MOP During Summit Count Email Clicks | LONG |  | datasourceColumn |  |
| `mop_during_summit_count_email_opens` | MOP During Summit Count Email Opens | LONG |  | datasourceColumn | Email opens DURING the event period. Active engagement during event. |
| `mop_first_active_session_joined` | MOP First Active Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_created_pandadoc_id` | MOP First Created Pandadoc ID | STRING |  | datasourceColumn |  |
| `mop_first_created_template_id` | MOP First Created Template ID | STRING |  | datasourceColumn |  |
| `mop_first_inbound_email` | MOP First Inbound Email | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_inbound_whatsapp` | MOP First Inbound Whatsapp | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_mechanic_session_joined` | MOP First Mechanic Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_original_release_evening_session_joined` | MOP First Original Release Evening Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_original_release_morning_session_joined` | MOP First Original Release Morning Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_original_release_session_joined` | MOP First Original Release Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_other_session_joined` | MOP First Other Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_outbound_whatsapp` | MOP First Outbound Whatsapp | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_prime_time_late_night_joined` | MOP First Prime Time Late Night Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_first_signed_pandadoc_id` | MOP First Signed Pandadoc ID | STRING |  | datasourceColumn |  |
| `mop_first_signed_template_id` | MOP First Signed Template ID | STRING |  | datasourceColumn |  |
| `mop_first_viewed_pandadoc_id` | MOP First Viewed Pandadoc ID | STRING |  | datasourceColumn |  |
| `mop_first_viewed_template_id` | MOP First Viewed Template ID | STRING |  | datasourceColumn |  |
| `mop_hours_since_ticket_creation` | MOP Hours Since Ticket Creation | LONG |  | datasourceColumn | Hours elapsed since registration. Updated each build. Use for lead aging analysis. |
| `mop_last_active_session_joined` | MOP Last Active Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_mechanic_session_joined` | MOP Last Mechanic Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_original_release_evening_session_joined` | MOP Last Original Release Evening Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_original_release_morning_session_joined` | MOP Last Original Release Morning Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_original_release_session_joined` | MOP Last Original Release Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_other_session_joined` | MOP Last Other Session Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_prime_time_late_night_joined` | MOP Last Prime Time Late Night Joined | TIMESTAMP |  | datasourceColumn |  |
| `mop_mechanic_session_count` | MOP Mechanic Session Count | LONG |  | datasourceColumn |  |
| `mop_mechanic_session_watch_time` | MOP Mechanic Session Watch Time | DOUBLE |  | datasourceColumn | Hours watched in Mechanic (how-to/practical) sessions. |
| `mop_original_release_evening_session_count` | MOP Original Release Evening Session Count | LONG |  | datasourceColumn |  |
| `mop_original_release_evening_session_watch_time` | MOP Original Release Evening Session Watch Time | DOUBLE |  | datasourceColumn |  |
| `mop_original_release_morning_session_count` | MOP Original Release Morning Session Count | LONG |  | datasourceColumn |  |
| `mop_original_release_morning_session_watch_time` | MOP Original Release Morning Session Watch Time | DOUBLE |  | datasourceColumn |  |
| `mop_original_release_total_session_count` | MOP Original Release Total Session Count | LONG |  | datasourceColumn | Number of Original Release sessions attended. Session type breakdown metric. |
| `mop_original_release_total_session_watch_time` | MOP Original Release Total Session Watch Time | DOUBLE |  | datasourceColumn | Hours watched during Original Release sessions (morning + evening). Premium content engagement metric. |
| `mop_other_session_count` | MOP Other Session Count | LONG |  | datasourceColumn |  |
| `mop_other_session_watch_time` | MOP Other Session Watch Time | DOUBLE |  | datasourceColumn |  |
| `mop_pre_summit_count_email_clicks` | MOP Pre Summit Count Email Clicks | LONG |  | datasourceColumn |  |
| `mop_pre_summit_count_email_opens` | MOP Pre Summit Count Email Opens | LONG |  | datasourceColumn | Email opens BEFORE event started. Pre-event engagement indicator. |
| `mop_prime_time_late_night_count` | MOP Prime Time Late Night Count | LONG |  | datasourceColumn |  |
| `mop_prime_time_late_night_watch_time` | MOP Prime Time Late Night Watch Time | DOUBLE |  | datasourceColumn | Hours watched during prime time/late night sessions. |
| `mop_seconds_ticket_issue_to_event_start` | MOP Seconds Ticket Issue To Event Start | LONG |  | datasourceColumn |  |
| `mop_time_between_event_start_first_chat_message` | MOP Time Between Event Start First Chat Message | LONG |  | datasourceColumn |  |
| `mop_time_between_event_start_first_session_joined` | MOP Time Between Event Start First Session Joined | LONG |  | datasourceColumn | Seconds from event start to first session joined. Negative = joined before official start. Positive = delayed join. |
| `mop_time_between_event_start_pandadoc_created` | MOP Time Between Event Start Pandadoc Created | LONG |  | datasourceColumn |  |
| `mop_time_between_event_start_pandadoc_signed` | MOP Time Between Event Start Pandadoc Signed | LONG |  | datasourceColumn | Seconds from event start to contract signing. Measures conversion speed relative to event timeline. |
| `mop_time_between_event_start_pandadoc_viewed` | MOP Time Between Event Start Pandadoc Viewed | LONG |  | datasourceColumn |  |
| `mop_time_between_first_email_response_event_start` | MOP Time Between First Email Response Event Start | LONG |  | datasourceColumn |  |
| `mop_time_between_first_email_response_first_close_call1_minute` | MOP Time Between First Email Response First Close Call1Minute | LONG |  | datasourceColumn |  |
| `mop_time_between_first_email_response_first_close_call3_minute` | MOP Time Between First Email Response First Close Call3Minute | LONG |  | datasourceColumn |  |
| `mop_time_between_first_email_response_first_close_call_attempt` | MOP Time Between First Email Response First Close Call Attempt | LONG |  | datasourceColumn |  |
| `mop_time_between_first_email_response_first_session_joined` | MOP Time Between First Email Response First Session Joined | LONG |  | datasourceColumn |  |
| `mop_time_between_first_inbound_whatsapp_event_start` | MOP Time Between First Inbound Whatsapp Event Start | LONG |  | datasourceColumn |  |
| `mop_time_between_first_inbound_whatsapp_first_session_joined` | MOP Time Between First Inbound Whatsapp First Session Joined | LONG |  | datasourceColumn |  |
| `mop_time_between_first_outbound_whatsapp_event_start` | MOP Time Between First Outbound Whatsapp Event Start | LONG |  | datasourceColumn |  |
| `mop_time_between_first_outbound_whatsapp_first_session_joined` | MOP Time Between First Outbound Whatsapp First Session Joined | LONG |  | datasourceColumn |  |
| `mop_time_between_first_session_joined_first_chat_message` | MOP Time Between First Session Joined First Chat Message | LONG |  | datasourceColumn |  |
| `mop_time_between_first_session_joined_pandadoc_created` | MOP Time Between First Session Joined Pandadoc Created | LONG |  | datasourceColumn |  |
| `mop_time_between_first_session_joined_pandadoc_signed` | MOP Time Between First Session Joined Pandadoc Signed | LONG |  | datasourceColumn | Seconds from first session attendance to signing. Measures post-attendance conversion time. |
| `mop_time_between_first_session_joined_pandadoc_viewed` | MOP Time Between First Session Joined Pandadoc Viewed | LONG |  | datasourceColumn |  |
| `mop_time_between_ticket_first_chat_message` | MOP Time Between Ticket First Chat Message | LONG |  | datasourceColumn | Seconds from registration to first Zoom chat message. Measures time to active engagement. |
| `mop_time_between_ticket_first_close_call_attempt` | MOP Time Between Ticket First Close Call Attempt | LONG |  | datasourceColumn | Seconds from registration to first sales call attempt. Measures sales outreach timing. |
| `mop_time_between_ticket_first_email_response` | MOP Time Between Ticket First Email Response | LONG |  | datasourceColumn |  |
| `mop_time_between_ticket_first_inbound_whatsapp` | MOP Time Between Ticket First Inbound Whatsapp | LONG |  | datasourceColumn | Seconds from registration to first WhatsApp FROM lead. Measures lead response time. |
| `mop_time_between_ticket_first_outbound_whatsapp` | MOP Time Between Ticket First Outbound Whatsapp | LONG |  | datasourceColumn | Seconds from registration to first WhatsApp sent TO lead. Measures outreach speed. |
| `mop_time_between_ticket_first_session_joined` | MOP Time Between Ticket First Session Joined | LONG |  | datasourceColumn | Seconds from registration (ticket) to first session joined. Measures speed-to-engagement. Lower = more eager lead. |
| `mop_time_between_ticket_pandadoc_created` | MOP Time Between Ticket Pandadoc Created | LONG |  | datasourceColumn | Seconds from registration to first PandaDoc creation. Measures time to sales engagement. |
| `mop_time_between_ticket_pandadoc_signed` | MOP Time Between Ticket Pandadoc Signed | LONG |  | datasourceColumn | Seconds from registration to contract signing. Total conversion time metric. |
| `mop_time_between_ticket_pandadoc_viewed` | MOP Time Between Ticket Pandadoc Viewed | LONG |  | datasourceColumn |  |
| `mop_time_first_email_click_to_event_start` | MOP Time First Email Click To Event Start | LONG |  | datasourceColumn |  |
| `mop_time_first_email_open_to_event_start` | MOP Time First Email Open To Event Start | LONG |  | datasourceColumn |  |
| `mop_time_first_email_sent_after_ticket` | MOP Time First Email Sent After Ticket | LONG |  | datasourceColumn |  |
| `mop_time_ticket_issue_to_first_email_click` | MOP Time Ticket Issue To First Email Click | LONG |  | datasourceColumn |  |
| `mop_time_ticket_issue_to_first_email_open` | MOP Time Ticket Issue To First Email Open | LONG |  | datasourceColumn |  |
| `mop_time_to_first_confirmation_email_click` | MOP Time To First Confirmation Email Click | LONG |  | datasourceColumn |  |
| `mop_time_to_first_confirmation_email_open` | MOP Time To First Confirmation Email Open | LONG |  | datasourceColumn |  |
| `mop_total_email_clicks_per_days_since_ticket_issue` | MOP Total Email Clicks Per Days Since Ticket Issue | DOUBLE |  | datasourceColumn |  |
| `mop_total_email_opens_per_days_since_ticket_issue` | MOP Total Email Opens Per Days Since Ticket Issue | DOUBLE |  | datasourceColumn |  |
| `mop_total_summit_count_email_clicks` | MOP Total Summit Count Email Clicks | LONG |  | datasourceColumn |  |
| `mop_total_summit_count_email_opens` | MOP Total Summit Count Email Opens | LONG |  | datasourceColumn | Total email opens during pre + during summit periods. Overall email engagement. |
| `mop_zoom_last_active` | MOP Zoom Last Active | TIMESTAMP |  | datasourceColumn | Timestamp of last Zoom activity (session or recording view). Indicates recent platform engagement. |
| `num_segments` | Num Segments | DOUBLE |  | datasourceColumn |  |
| `opened_email_count` | Opened Email Count | LONG |  | datasourceColumn | Total emails opened during the MOP period. Higher = more engaged with email content. |
| `opened_timestamp_mop` | Opened Timestamp Mop | ARRAY |  | datasourceColumn |  |
| `original_moments_uploaded` | Original Moments Uploaded | LONG |  | datasourceColumn |  |
| `original_moments_words_produced` | Original Moments Words Produced | LONG |  | datasourceColumn |  |
| `overall_email_open_rate` | Overall Email Open Rate | DOUBLE |  | datasourceColumn | Percentage of emails opened (0-100+). Values >100 possible due to multiple opens. Key email engagement KPI. |
| `page_views_after_registration` | Page Views After Registration | LONG |  | datasourceColumn |  |
| `pain_duration` | Pain Duration | STRING |  | datasourceColumn | How long the lead has experienced pain. Values: 'Mehr als 10 Jahre' (1.3K), '1–5 Jahre' (412), 'Unter 1 Jahr' (224), '6–10 Jahre' (76). ~78% null - only from intake forms. |
| `past_treatments` | Past Treatments | ARRAY |  | datasourceColumn | Array of treatments the lead has previously tried. Useful for understanding their pain journey. |
| `percentage_watched` | Percentage Watched | DOUBLE |  | datasourceColumn | Percentage of available session content watched (0-100). Session completeness metric. |
| `pre_summit_close_call_duration` | Pre Summit Close Call Duration | DOUBLE |  | datasourceColumn |  |
| `prelead_score` | Prelead Score | DOUBLE |  | datasourceColumn | Numeric engagement score (0-100). Avg: 1.88, Max: 100. Higher = more engaged lead. Calculated from watch time, session attendance, chat activity, email engagement, and community participation. |
| `prelead_score_segment` | Prelead Score Segment | STRING |  | datasourceColumn | Quality tier based on engagement scoring. Values: 'TIER 1' (1.3K - highest quality), 'TIER 2' (21.8K), 'TIER 3' (11.8K), 'TIER 4' (48K), 'TIER 5' (26.8K - lowest). Filter by TIER 1-2 for high-quality leads. |
| `prepercent_rank` | Prepercent Rank | DOUBLE |  | datasourceColumn | Percentile rank of prelead_score (0-100). 99 = top 1%, 50 = median. Use for relative comparison. |
| `primary_pain` | Primary Pain | STRING |  | datasourceColumn | Self-reported main pain condition (lowercase, hyphenated). Top values: 'rückenschmerzen' (12.8K), 'arthrose' (12K), 'knieschmerzen' (8.9K), 'verspannungen' (8.9K), 'hüftschmerzen' (6.9K), 'fibromyalgie' (2.9K). From intake forms. |
| `recording_view_duration` | Recording View Duration | DOUBLE |  | datasourceColumn | RECORDING watch time in hours. High recording + low live may indicate timezone issues. total_watch_time = total_live_watchtime + recording_view_duration. |
| `share_emails_opened_within_1h` | Share Emails Opened Within 1h | DOUBLE |  | datasourceColumn | Fraction of emails opened within 1 hour of receipt (0-1). Higher = more responsive lead. |
| `share_emails_opened_within_24h` | Share Emails Opened Within 24h | DOUBLE |  | datasourceColumn | Fraction of emails opened within 24 hours (0-1). Good indicator of email attention. |
| `skool_comment_word_count_after_event` | Skool Comment Word Count After Event | LONG |  | datasourceColumn |  |
| `skool_post_word_count_after_event` | Skool Post Word Count After Event | LONG |  | datasourceColumn |  |
| `skool_total_words_produced_after_event` | Skool Total Words Produced After Event | LONG |  | datasourceColumn |  |
| `smart_view_name` | Smart View Name | ARRAY |  | datasourceColumn | Array of Close CRM Smart View memberships. Used for sales team segmentation. Examples: '>5h Watchtime', 'TIER 1', 'Last 48h not joined'. Dynamic - updated based on lead behavior. |
| `submitted_ghl_forms` | Submitted Ghl Forms | ARRAY |  | datasourceColumn | Array of GoHighLevel form names submitted by lead. Examples: 'Celebration-Call Formular', 'Schmerzfrei-Umfrage Summit 2025-08'. |
| `summit_close_call_duration` | Summit Close Call Duration | DOUBLE |  | datasourceColumn |  |
| `symptoms` | Symptoms | ARRAY |  | datasourceColumn | Array of self-reported symptoms from intake form. Use for health condition segmentation. |
| `template` | Template | ARRAY |  | datasourceColumn |  |
| `template_id` | Template Id | ARRAY |  | datasourceColumn |  |
| `template_name` | Template Name | ARRAY |  | datasourceColumn | Array of PandaDoc template names sent to lead (contract versions). |
| `template_signed` | Template Signed | ARRAY |  | datasourceColumn | Array of signed PandaDoc template names. Conversion tracking at template level. |
| `time_joined_first` | Time Joined First | TIMESTAMP |  | datasourceColumn |  |
| `time_left_last` | Time Left Last | TIMESTAMP |  | datasourceColumn |  |
| `title` | Title | ARRAY |  | datasourceColumn |  |
| `title_higher_60_percent` | Title Higher 60 Percent | ARRAY |  | datasourceColumn |  |
| `total_call_duration` | Total Call Duration | LONG |  | datasourceColumn | Total duration of all VAPI AI calls in seconds. Indicates interest via phone channel. |
| `total_close_call_duration` | Total Close Call Duration | DOUBLE |  | datasourceColumn | Total duration of Close CRM sales calls in seconds. Key metric for sales team engagement. |
| `total_event_activity_count` | Total Event Activity Count | LONG |  | datasourceColumn | Aggregate count of all event-related activities (sessions, chats, emails, etc.). Overall engagement metric. |
| `total_live_time_missed` | Total Live Time Missed | LONG |  | datasourceColumn |  |
| `total_live_watchtime` | Total Live Watchtime | DOUBLE |  | datasourceColumn | LIVE session watch time in hours. Indicates real-time engagement (higher value than recordings). Compare with recording_view_duration for preference analysis. |
| `total_watch_time` | Total Watch Time | DOUBLE |  | datasourceColumn | Combined live + recording watch time in HOURS. Avg: 10.8h, Max: 518h. Key engagement metric. Use thresholds: <1h (low), 1-5h (medium), 5-25h (high), 25h+ (very high). See watched_more_* boolean flags for filtering. |
| `total_words_free_form_questions` | Total Words Free Form Questions | LONG |  | datasourceColumn |  |
| `touchpoints_sources_count` | Touchpoints Sources Count | INTEGER |  | datasourceColumn |  |
| `tp_latest` | Tp Latest | TIMESTAMP |  | datasourceColumn |  |
| `true_calls` | True Calls | LONG |  | datasourceColumn | Count of successful/completed VAPI calls (lead answered). Use with false_calls for reach rate. |
| `ts_document_sent` | Ts Document Sent | ARRAY |  | datasourceColumn |  |
| `ts_document_signed` | Ts Document Signed | TIMESTAMP |  | datasourceColumn |  |
| `ts_document_viewed` | Ts Document Viewed | ARRAY |  | datasourceColumn |  |
| `type_of_participation` | Type Of Participation | STRING |  | datasourceColumn | Engagement level classification. Values: 'Joined Session' (31K - attended live), 'Ticket Only' (78K - registered but never joined), 'Lobby Only' (594 - entered lobby but didn't attend). Use to segment by engagement depth. |
| `videos_percentage_watched_aggregated` | Videos Percentage Watched Aggregated | DOUBLE |  | datasourceColumn |  |
| `videos_started_count` | Videos Started Count | LONG |  | datasourceColumn |  |
| `watched_more_100_hours` | Watched More 100 Hours | BOOLEAN |  | datasourceColumn |  |
| `watched_more_10_hours` | Watched More 10 Hours | BOOLEAN |  | datasourceColumn | TRUE if total_watch_time > 10 hours (live only). High engagement threshold. |
| `watched_more_150_hours` | Watched More 150 Hours | BOOLEAN |  | datasourceColumn |  |
| `watched_more_1_hour` | Watched More 1 Hour | BOOLEAN |  | datasourceColumn | TRUE if live watch time > 1 hour. Minimum engagement threshold (live sessions only). |
| `watched_more_1_minute` | Watched More 1 Minute | BOOLEAN |  | datasourceColumn | TRUE if live watch time > 1 minute. Basic attendance threshold (live sessions only). |
| `watched_more_200_hours` | Watched More 200 Hours | BOOLEAN |  | datasourceColumn |  |
| `watched_more_25_hours` | Watched More 25 Hours | BOOLEAN |  | datasourceColumn | TRUE if live watch time > 25 hours. High engagement (live sessions only). |
| `watched_more_3_hours` | Watched More 3 Hours | BOOLEAN |  | datasourceColumn | TRUE if live watch time > 3 hours (live sessions only). |
| `watched_more_50_hours` | Watched More 50 Hours | BOOLEAN |  | datasourceColumn | TRUE if live watch time > 50 hours. Very high engagement (live sessions only). |
| `watched_more_5_hours` | Watched More 5 Hours | BOOLEAN |  | datasourceColumn | TRUE if total_watch_time > 5 hours (live only). Boolean flag for quick filtering of engaged leads. |
| `watched_total_more_100_hours` | Watched Total More 100 Hours | BOOLEAN |  | datasourceColumn | TRUE if total watch time (live + recordings) > 100 hours. Exceptional engagement. |
| `watched_total_more_10_hours` | Watched Total More 10 Hours | BOOLEAN |  | datasourceColumn | TRUE if total_watch_time > 10 hours (live + recordings). Prefer this over watched_more_10_hours for inclusive engagement filtering. |
| `watched_total_more_150_hours` | Watched Total More 150 Hours | BOOLEAN |  | datasourceColumn |  |
| `watched_total_more_1_hour` | Watched Total More 1 Hour | BOOLEAN |  | datasourceColumn | TRUE if total watch time (live + recordings) > 1 hour. Minimum engagement. |
| `watched_total_more_1_minute` | Watched Total More 1 Minute | BOOLEAN |  | datasourceColumn | TRUE if total watch time (live + recordings) > 1 minute. Basic attendance indicator. |
| `watched_total_more_200_hours` | Watched Total More 200 Hours | BOOLEAN |  | datasourceColumn |  |
| `watched_total_more_25_hours` | Watched Total More 25 Hours | BOOLEAN |  | datasourceColumn | TRUE if total watch time (live + recordings) > 25 hours. High engagement. |
| `watched_total_more_3_hours` | Watched Total More 3 Hours | BOOLEAN |  | datasourceColumn | TRUE if total watch time (live + recordings) > 3 hours. |
| `watched_total_more_50_hours` | Watched Total More 50 Hours | BOOLEAN |  | datasourceColumn | TRUE if total watch time (live + recordings) > 50 hours. Very high engagement. |
| `watched_total_more_5_hours` | Watched Total More 5 Hours | BOOLEAN |  | datasourceColumn | TRUE if total_watch_time > 5 hours (live + recordings). Prefer this over watched_more_5_hours for inclusive engagement filtering. |
| `whatsapp_date` | Whatsapp Date | TIMESTAMP |  | datasourceColumn |  |
| `whatsapp_inbound_msg_count` | Whatsapp Inbound Msg Count | LONG |  | datasourceColumn | WhatsApp messages received FROM the lead. Higher = more engaged/responsive via WhatsApp. |
| `whatsapp_inbound_word_count` | Whatsapp Inbound Word Count | LONG |  | datasourceColumn |  |
| `whatsapp_outbound_msg_count` | Whatsapp Outbound Msg Count | LONG |  | datasourceColumn | WhatsApp messages sent TO the lead. Use with inbound count for response rate analysis. |
| `whatsapp_outbound_word_count` | Whatsapp Outbound Word Count | LONG |  | datasourceColumn |  |
| `whatsapp_total_words_produced` | Whatsapp Total Words Produced | LONG |  | datasourceColumn |  |
| `yesterday_live_time_watched` | Yesterday Live Time Watched | DOUBLE |  | datasourceColumn |  |
| `yesterday_recording_time_watched` | Yesterday Recording Time Watched | DOUBLE |  | datasourceColumn |  |
| `yesterday_total_watchtime` | Yesterday Total Watchtime | DOUBLE |  | datasourceColumn | Watch time yesterday (hours). Most recent engagement indicator. Updated daily. |

---

## Marketing Offer Participation Daily

**Table:** `marketing_offer_participation_daily`  
**Foundry apiName:** `MarketingOfferParticipationDaily`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `id` (link: "[Funnelbox] Contact v2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `avg_open_lag_minutes_d_all` | Avg Open Lag Minutes D All | DOUBLE |  | datasourceColumn |  |
| `chat_message_count` | Chat Message Count | LONG |  | datasourceColumn |  |
| `chat_message_count_words` | Chat Message Count Words | LONG |  | datasourceColumn |  |
| `date_session` | Date Session | DATE |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `email_open_rate_d` | Email Open Rate D | DOUBLE |  | datasourceColumn |  |
| `email_responsiveness_score_d` | Email Responsiveness Score D | DOUBLE |  | datasourceColumn |  |
| `id` | Id | STRING |  | datasourceColumn |  |
| `joined_last_session` | Joined Last Session | TIMESTAMP |  | datasourceColumn |  |
| `marketing_offer_end_timestamp` | Marketing Offer End Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `marketing_offer_followup_end` | Marketing Offer Followup End | TIMESTAMP |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `marketing_offer_name` | Marketing Offer Name | STRING |  | datasourceColumn |  |
| `marketing_offer_registration_timestamp` | Marketing Offer Registration Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `marketing_offer_start_timestamp` | Marketing Offer Start Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `recording_view_duration` | Recording View Duration | DOUBLE |  | datasourceColumn |  |
| `session_day` | Session Day | STRING |  | datasourceColumn |  |
| `sessions_joined` | Sessions Joined | LONG |  | datasourceColumn |  |
| `share_emails_opened_within_1h_d` | Share Emails Opened Within 1h D | DOUBLE |  | datasourceColumn |  |
| `total_live_watchtime` | Total Live Watchtime | DOUBLE |  | datasourceColumn |  |

---

## Meeting For Knowledge Base

**Table:** `meeting_for_knowledge_base`  
**Foundry apiName:** `MeetingForKnowledgeBase`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `description` | Description | STRING |  | editOnly |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `tags` | Tags | ARRAY |  | editOnly |  |

---

## [Zoom] Meeting Participation Segment

**Table:** `meeting_participation_segment_zoom_1`  
**Foundry apiName:** `MeetingParticipationSegmentZoom_1`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- has many **MeetingParticipationZoom_1** (link: "[Zoom] Meeting Participant")
- belongs to **MeetingParticipationZoom_1** via `participant_primary_key` (link: "Meeting Participation [Zoom]")
- belongs to **ParticipantZoom_1** via `participant_primary_key` (link: "Participant [Zoom]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `diff_start_joined` | Diff Start Joined | LONG |  | datasourceColumn |  |
| `diff_start_left` | Diff Start Left | LONG |  | datasourceColumn |  |
| `duration_segment_minutes` | Duration Segment Minutes | LONG |  | datasourceColumn |  |
| `email` | eMail | STRING |  | datasourceColumn |  |
| `event_scheduled_ts` | Event Scheduled Ts | TIMESTAMP |  | datasourceColumn |  |
| `left_earlier_minutes` | Left Earlier Minutes | LONG |  | datasourceColumn |  |
| `length_meeting` | Length Meeting | LONG |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting UUID | STRING |  | datasourceColumn |  |
| `participant_id` | Participant ID | STRING |  | datasourceColumn |  |
| `participant_primary_key` | Participant Primary Key | STRING | PK | datasourceColumn |  |
| `participant_uuid` | Participant UUID | STRING |  | datasourceColumn |  |
| `percentage_joined` | Percentage Joined | INTEGER |  | datasourceColumn |  |
| `percentage_left` | Percentage Left | INTEGER |  | datasourceColumn |  |
| `time_event_created` | Time Event Created | TIMESTAMP |  | datasourceColumn |  |
| `time_event_ended` | Time Event Ended | TIMESTAMP |  | datasourceColumn |  |
| `time_event_started` | Time Event Started | TIMESTAMP |  | datasourceColumn |  |
| `time_joined` | Time Joined | TIMESTAMP |  | datasourceColumn |  |
| `time_left` | Time Left | TIMESTAMP |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `total_minutes_meeting` | Total Minutes Meeting | LONG |  | datasourceColumn |  |
| `user_name` | User Name | STRING |  | datasourceColumn |  |

---

## [Zoom] Meeting Participant

**Table:** `meeting_participation_zoom_1`  
**Foundry apiName:** `MeetingParticipationZoom_1`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid_1` (link: "[Zoom] Meeting")
- belongs to **ParticipantZoom_1** via `email` (link: "Participant [Zoom]")
- has many **ChatMessageZoom** (link: "[Zoom] Chat Message")
- belongs to **MeetingParticipationSegmentZoom_1** via `participant_primary_keys` (link: "[Zoom] Meeting Participation Segment")
- has many **MeetingParticipationSegmentZoom_1** (link: "Meeting Participation Segment [Zoom]")
- has many **TranscriptSegmentZoom_1** (link: "[Zoom] Transcript Segment")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `event_scheduled_ts` | Event Scheduled Ts | TIMESTAMP |  | datasourceColumn |  |
| `length_meeting` | Length Meeting | LONG |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting UUID | STRING |  | datasourceColumn |  |
| `num_participant_uuid` | Num Participant Uuid | LONG |  | datasourceColumn |  |
| `num_segments` | Num Segments | LONG |  | datasourceColumn |  |
| `participant_ids` | Participant IDs | ARRAY |  | datasourceColumn |  |
| `meetinguuid_partuuids` | Participant PK | STRING | PK | datasourceColumn |  |
| `participant_primary_keys` | Participant Primary Keys | ARRAY |  | datasourceColumn |  |
| `participant_uuids` | Participant UUID | ARRAY |  | datasourceColumn |  |
| `percentage_watched` | Percentage Watched | DOUBLE |  | datasourceColumn |  |
| `time_event_created` | Time Event Created | TIMESTAMP |  | datasourceColumn |  |
| `time_event_ended` | Time Event Ended | TIMESTAMP |  | datasourceColumn |  |
| `time_event_started` | Time Event Started | TIMESTAMP |  | datasourceColumn |  |
| `time_joined_first` | Time Joined First | TIMESTAMP |  | datasourceColumn |  |
| `time_left_last` | Time Left Last | TIMESTAMP |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `total_live_time_missed` | Total Time Missed | LONG |  | datasourceColumn |  |
| `total_live_watchtime` | Total Watch Time | LONG |  | datasourceColumn |  |
| `user_name` | User Name | STRING |  | datasourceColumn |  |

---

## [Zoom] Meeting

**Table:** `meeting_zoom`  
**Foundry apiName:** `MeetingZoom`  
**Status:** active  
**Datasources:** 7  
**Description:** **Last time documentation was updated: 2026-02-04**

Core Zoom meeting records containing meeting metadata, participant counts, chat history, transcripts, and AI-generated summaries. Represents both scheduled meetings and instant meetings, capturing the full lifecycle from creation to completion.

**Meeting Types:**
- Type 1: Instant meetings
- Type 2: Scheduled meetings
- Type 3: Recurring meetings with fixed time
- Type 4: Personal Meeting ID (PMI) meetings
- Type 8: Recurring meetings with no fixed time

**Key Relationships:**
- Links to [Zoom] Recording (meeting recordings)
- Links to [Zoom] Transcript (speech-to-text content)
- Links to [Zoom] Meeting Participation (attendee details)
- Links to [Zoom] Chat Message (chat content)
- Links to [Zoom] Event Session (event session metadata)
- Links to [Zoom] Summit Transcript (AI summaries)
- Links to [Zoom] CTA Search (call-to-action insights)

**Primary Use Cases:**
- Meeting history and scheduling analysis
- Participant tracking and attendance reporting
- Content searchability through transcripts
- AI-powered meeting insights and Q&A
- Chat engagement analysis
- Survey and feedback collection

**Relevant Properties:**
- Meeting UUID: Unique identifier
- Topic: Meeting title
- Type: Meeting type code
- Duration: Length in minutes
- Host Email / Host ID: Host identification
- Num Participants: Attendance count
- Num Chat Messages: Chat engagement
- Transcript: Full text content
- Zusammenfassung / Summary English: AI summaries
- Survey Results / QA Results: Feedback data
- Event Lifecycle Complete: Completion flag
- Event timestamps (created, scheduled, started, ended)  

**Relationships:**
- has many **ZoomSummitTranscipt** (link: "[Zoom] Summit Transcript")
- has many **ZoomVideoMedia** (link: "[Zoom] Video Media")
- has many **ZoomLightChatMessage** (link: "[Zoom][Light] Chat Message")
- has many **TranscriptZoom** (link: "Transcript [Zoom]")
- has many **RecordingZoom** (link: "Recording [Zoom]")
- has many **ZoomCtaSearch** (link: "[Zoom] CTA Search")
- has many **MeetingForKnowledgeBase** (link: "Meetings For Knowledge Base")
- has many **SummitSessionChatParticipation** (link: "[Summit] Session Chat Participation")
- has many **CompleteSurveyText** (link: "Complete Survey Text")
- has many **ZoomChatInsight** (link: "[Zoom] Chat Insight")
- has many **ZoomAudioMedia** (link: "[Zoom] Audio Media")
- has many **MeetingParticipationZoom_1** (link: "[Zoom] Meeting Participation")
- has many **ZoomStreamChatMessage** (link: "[Zoom][Stream] Chat Message")
- has many **ZoomEventSession_2** (link: "[Zoom] Event Session")
- has many **ZoomTranscriptBlock** (link: "[Zoom] Transcript Block")
- has many **TranscriptZoom** (link: "[Zoom] Transcript")
- has many **ChatMessageZoom** (link: "Chat Message")
- has many **ZoomTranscriptsRaw** (link: "[Zoom] Transcripts raw")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `chat` | Chat | STRING |  | datasourceColumn |  |
| `creation_source` | Creation Source | STRING |  | datasourceColumn |  |
| `duration` | Duration | DOUBLE |  | datasourceColumn |  |
| `event_created_ts` | Event Created Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_ended_ts` | Event Ended Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_ended_ts_string` | Event Ended Ts String | STRING |  | datasourceColumn |  |
| `event_lifecycle_complete` | Event Lifecycle Complete | BOOLEAN |  | datasourceColumn |  |
| `event_scheduled_ts` | Event Scheduled Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_started_ts` | Event Started Ts | TIMESTAMP |  | datasourceColumn |  |
| `zusammenfassung_lang` | Executive Summary | STRING |  | datasourceColumn |  |
| `host_email` | Host Email | STRING |  | datasourceColumn |  |
| `host_id` | Host Id | STRING |  | datasourceColumn |  |
| `join_url` | Join Url | STRING |  | datasourceColumn |  |
| `mariadb_id` | MariaDB ID | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING | PK | datasourceColumn |  |
| `num_chat_messages` | Num Chat Messages | LONG |  | datasourceColumn |  |
| `num_participants` | Num Participants | LONG |  | datasourceColumn |  |
| `password` | Password | STRING |  | datasourceColumn |  |
| `qa_results` | Qa Results | STRING |  | datasourceColumn |  |
| `summary_eng` | Summary English | STRING |  | datasourceColumn |  |
| `survey_results` | Survey Results | STRING |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `topic_cleaned` | Topic Cleaned | STRING |  | datasourceColumn |  |
| `transcript` | Transcript | STRING |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `zusammenfassung` | Zusammenfassung | STRING |  | datasourceColumn |  |

---

## Note For High Quality Close Leads

**Table:** `note_for_high_quality_close_leads`  
**Foundry apiName:** `NoteForHighQualityCloseLeads`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Sales briefing notes for high-quality leads in Close CRM. Each note contains AI-generated summaries, extracted insights, engagement metrics, and formatted content ready to sync with Close for sales team reference.

**Key Data Fields:**
- **AI Summaries**: LLM-generated lead summary, short profile, reasons to buy
- **Extracted Facts**: Health issues, objections, pain duration, past treatments
- **Engagement Metrics**: Total live watchtime, 5+ hours watched flag
- **Contract Status**: PandaDoc signed indicator
- **HTML Content**: Pre-formatted notes ready for Close CRM sync

**Key Relationships:**
- Links to [Close] Lead via API (ONE-to-ONE) - the Close lead record

**Primary Use Cases:**
- Pre-call sales briefing with AI insights
- Syncing enriched lead data to Close CRM
- Identifying high-engagement leads (5+ hours watched)
- Preparing personalized sales pitches with "reasons to buy"
- Quick objection handling with extracted objections

**Relevant Properties:**
- Short Lead Profile: Concise AI-generated summary
- LLM Lead Summary: Full AI-generated briefing
- Watched Total More 5 Hours: High engagement flag
- Total Live Watchtime: Hours of content watched
- Pandadoc Is Signed: Contract status
- Health Issues, Objections, Past Treatments: Extracted facts

**Data Freshness:** Built from typed facts and engagement data pipelines  

**Relationships:**
- belongs to **CloseLeadViaApi** via `close_lead_id` (link: "[Close] Leads via API")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `build_timestamp` | Build Timestamp | TIMESTAMP |  | redacted | When this note record was last built |
| `clean_extraction_string` | Clean Extraction String | STRING |  | redacted | Raw extracted facts for full-text search |
| `close_lead_id` | Close Lead Id | STRING | PK | redacted | Close CRM lead identifier (primary key) |
| `close_lead_id_len` | Close Lead Id Len | INTEGER |  | redacted | Length of Close lead ID (validation field) |
| `close_note_title` | Close Note Title | STRING |  | redacted | Title of the note to sync to Close CRM |
| `email` | Email | STRING |  | redacted | Lead email address |
| `health_issues` | Health Issues | ARRAY |  | redacted | Array of health issues mentioned by the lead |
| `html_close_note` | Html Close Note | STRING |  | redacted | HTML-formatted note content for Close CRM |
| `html_lead_profile_foundry_url` | Html Lead Profile Foundry Url | STRING |  | redacted | HTML link to the lead profile in Foundry |
| `html_reasons_to_buy` | Html Reasons To Buy | STRING |  | redacted | HTML-formatted list of reasons why this lead might buy |
| `html_short_lead_profile` | Html Short Lead Profile | STRING |  | redacted | HTML-formatted short lead profile |
| `lead_profile_foundry_url` | Lead Profile Foundry Url | STRING |  | redacted | Direct URL to the lead profile in Foundry |
| `life_situation_and_dreams` | Life Situation And Dreams | ARRAY |  | redacted | Life context and aspirations mentioned |
| `llm_lead_summary` | LLM Lead Summary | STRING |  | redacted | Full AI-generated summary of the lead for sales briefing |
| `objections` | Objections | ARRAY |  | redacted | Array of objections or concerns raised |
| `pain_duration` | Pain Duration | ARRAY |  | redacted | How long the lead has experienced pain |
| `pandadoc_is_signed` | Pandadoc Is Signed | BOOLEAN |  | redacted | Whether the lead has signed a contract via PandaDoc |
| `past_treatments` | Past Treatments | ARRAY |  | redacted | Array of past treatments tried |
| `relatives` | Relatives | ARRAY |  | redacted | Family members mentioned who may also need help |
| `short_lead_profile` | Short Lead Profile | STRING |  | redacted | Concise AI-generated lead profile summary |
| `total_live_watchtime` | Total Live Watchtime | DOUBLE |  | redacted | Total hours of live summit content watched |
| `watched_total_more5_hours` | Watched Total More 5 Hours | BOOLEAN |  | redacted | Flag indicating high engagement (>5 hours watched) |

---

## Objection

**Table:** `objection`  
**Foundry apiName:** `Objection`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `comment` | Comment | STRING |  | datasourceColumn |  |
| `objection_category` | Objection Category | STRING |  | datasourceColumn |  |
| `objection_id` | Objection Id | STRING | PK | datasourceColumn |  |
| `objection_text` | Objection Text | STRING |  | datasourceColumn |  |
| `recommended_response` | Recommended Response | STRING |  | datasourceColumn |  |
| `supporting_proof` | Supporting Proof | STRING |  | datasourceColumn |  |

---

## [Onboarding Tracker] Action Item

**Table:** `onboarding_tracker_action_item`  
**Foundry apiName:** `OnboardingTrackerActionItem`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **OnboardingTrackerActionItemProgress** (link: "[Onboarding Tracker] Action Item Progress")
- has many **OnboardingTrackerUserActionMatrix** (link: "[Onboarding Tracker] User Action Matrix")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_id` | Action ID | STRING | PK | redacted |  |
| `action_type` | Action Type | STRING |  | redacted |  |
| `description` | Description | STRING |  | redacted |  |
| `role_type` | Role Type | ARRAY |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## [Onboarding Tracker] Action Item Progress

**Table:** `onboarding_tracker_action_item_progress`  
**Foundry apiName:** `OnboardingTrackerActionItemProgress`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **OnboardingTrackerActionItem** via `action_id` (link: "[Onboarding Tracker] Action Item")
- belongs to **OnboardingTrackerUser** via `email` (link: "[Onboarding Tracker] User")
- belongs to **OnboardingTrackerUserActionMatrix** via `progress_id` (link: "[Onboarding Tracker] User Action Matrix")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_id` | Action ID | STRING |  | redacted |  |
| `comment` | Comment | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `progress_id` | Progress Id | STRING | PK | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `timestamp` | Timestamp | TIMESTAMP |  | redacted |  |

---

## [Onboarding Tracker] User

**Table:** `onboarding_tracker_user`  
**Foundry apiName:** `OnboardingTrackerUser`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **OnboardingTrackerActionItemProgress** (link: "[Onboarding Tracker] Action Item Progress")
- has many **OnboardingTrackerUserActionMatrix** (link: "[Onboarding Tracker] User Action Matrix")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING | PK | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `role_type` | Role Type | ARRAY |  | redacted |  |

---

## [Onboarding Tracker] User Action Matrix

**Table:** `onboarding_tracker_user_action_matrix`  
**Foundry apiName:** `OnboardingTrackerUserActionMatrix`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **OnboardingTrackerActionItemProgress** (link: "[Onboarding Tracker] Action Item Progress")
- belongs to **OnboardingTrackerUser** via `email` (link: "[Onboarding Tracker] User")
- belongs to **OnboardingTrackerActionItem** via `action_id` (link: "[Onboarding Tracker] Action Item")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `action_id` | Action ID | STRING |  | redacted |  |
| `action_type` | Action Type | STRING |  | redacted |  |
| `comment` | Comment | STRING |  | redacted |  |
| `description` | Description | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `progress_id` | Progress ID | STRING | PK | redacted |  |
| `role_type` | Role Type | STRING |  | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `timestamp` | Timestamp | TIMESTAMP |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## Opportunity

**Table:** `opportunity`  
**Foundry apiName:** `Opportunity`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Expansion opportunities tracking for upsell, cross-sell, and renewal scenarios. Enables multi-user persistent storage of opportunities with stage tracking, owner assignment, and multi-opportunity support per customer.  

**Relationships:**
- belongs to **Subscription** via `subscription-id` (link: "Subscription")
- has many **OpportunityNote** (link: "Opportunity Note")
- belongs to **Customer** via `customer-id` (link: "Customer")
- belongs to **Contract** via `contract-id` (link: "Contract")
- has many **LogUpdateOpportunity** (link: "[Log] Update Opportunity")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `assigned_at` | Assigned At | TIMESTAMP |  | redacted | Timestamp when opportunity was assigned to owner |
| `closed_at` | Closed At | TIMESTAMP |  | redacted | Timestamp when opportunity reached Won or Lost stage |
| `context_notes` | Context Notes | STRING |  | redacted | Additional context - attendance, interactions, app activity - markdown supported |
| `contract_id` | Contract ID | STRING |  | redacted | Foreign key to Contract object (nullable) |
| `created_at` | Created At | TIMESTAMP |  | redacted | Timestamp when opportunity was created |
| `created_by` | Created By | STRING |  | redacted | Palantir user ID of creator |
| `current_stage` | Current Stage | STRING |  | redacted | Enum: Identified, Upcoming Expire, Validated, Outreach Attempted, Conversation in Progress, Won, Lost |
| `customer_id` | Customer ID | STRING |  | redacted | Foreign key to Customer object |
| `hypothesis` | Hypothesis | STRING |  | redacted | Why now reasoning - markdown supported |
| `last_modified_at` | Last Modified At | TIMESTAMP |  | redacted | Timestamp of last modification |
| `last_modified_by` | Last Modified By | STRING |  | redacted | Palantir user ID of last modifier |
| `opportunity_id` | Opportunity ID | STRING | PK | redacted | Unique identifier (UUID) for the opportunity |
| `opportunity_type` | Opportunity Type | STRING |  | redacted | Enum: upsell, cross-sell, extend |
| `owner` | Owner | STRING |  | redacted | Palantir user ID of opportunity owner |
| `potential_value` | Potential Value | DOUBLE |  | redacted | Potential revenue value in CHF |
| `subscription_id` | Subscription ID | STRING |  | redacted | Foreign key to Subscription object (nullable) |

---

## Opportunity Note

**Table:** `opportunity_note`  
**Foundry apiName:** `OpportunityNote`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Notes taken on 'Opportunities'  

**Relationships:**
- belongs to **Opportunity** via `opportunity_id` (link: "Opportunity")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `author` | Author | STRING |  | redacted |  |
| `content` | Content | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `note_id` | Note Id | STRING | PK | redacted |  |
| `opportunity_id` | Opportunity Id | STRING |  | redacted |  |

---

## Order

**Table:** `order`  
**Foundry apiName:** `Order`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **Contract** via `contract_id` (link: "Contract")
- belongs to **Customer** via `customer_id` (link: "Customer")
- has many **Invoice** (link: "Invoice")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contract_date_end` | Contract Date End | DATE |  | datasourceColumn |  |
| `contract_date_start` | Contract Date Start | DATE |  | datasourceColumn |  |
| `contract_id` | Contract Id | STRING |  | datasourceColumn |  |
| `customer_id` | Customer Id | STRING |  | datasourceColumn |  |
| `is_valid_from` | Is Valid From | DATE |  | datasourceColumn | Order Date |
| `order_id` | Order Id | STRING | PK | datasourceColumn |  |
| `order_status_description` | Order Status Description | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `total_gross` | Total Gross | DOUBLE |  | datasourceColumn |  |
| `updated_at` | Updated At | TIMESTAMP |  | datasourceColumn |  |

---

## Part

**Table:** `part`  
**Foundry apiName:** `Part`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Parts object for CSS Quiver deepdive  

**Relationships:**
- belongs to **Equipment** via `eq_id` (link: "Equipment")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `eq_id` | Eq Id | STRING |  | redacted |  |
| `part_color` | Part Color | STRING |  | redacted |  |
| `part_cost` | Part Cost | DOUBLE |  | redacted |  |
| `part_dimensions` | Part Dimensions | STRING |  | redacted |  |
| `part_id` | Part Id | STRING | PK | redacted |  |
| `part_material` | Part Material | STRING |  | redacted |  |
| `part_production_date` | Part Production Date | DATE |  | redacted |  |
| `part_purity` | Part Purity | STRING |  | redacted |  |
| `part_quality_grade` | Part Quality Grade | STRING |  | redacted |  |
| `part_type` | Part Type | STRING |  | redacted |  |
| `part_weight` | Part Weight | DOUBLE |  | redacted |  |

---

## [Zoom] Participation Metrics

**Table:** `participant_zoom_1`  
**Foundry apiName:** `ParticipantZoom_1`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- has many **ZoomQA_2** (link: "[Zoom] Q&A")
- belongs to **IdMatch** via `email` (link: "Contacts [TOB]")
- has many **MeetingParticipationZoom_1** (link: "Meeting Participation [Zoom]")
- has many **MeetingParticipationSegmentZoom_1** (link: "Meeting Participation Segment [Zoom]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `average_percentage_watched` | Average Percentage Watched | DOUBLE |  | datasourceColumn |  |
| `average_segments_per_meeting` | Average Segments Per Meeting | DOUBLE |  | datasourceColumn |  |
| `num_user_names` | # unique User Names | LONG |  | datasourceColumn |  |
| `email` | Email | STRING | PK | datasourceColumn |  |
| `event_names` | Event Names | ARRAY |  | datasourceColumn |  |
| `joined_since` | Joined Since | TIMESTAMP |  | datasourceColumn |  |
| `joined_until` | Joined Until | TIMESTAMP |  | datasourceColumn |  |
| `live_watch_time` | Live Watch Time | LONG |  | datasourceColumn |  |
| `user_name` | Longest User Name | STRING |  | datasourceColumn |  |
| `meeting_ids` | Meeting Ids | ARRAY |  | datasourceColumn |  |
| `meeting_topics` | Meeting Topics | ARRAY |  | datasourceColumn |  |
| `meeting_uuids` | Meeting Uuids | ARRAY |  | datasourceColumn |  |
| `num_meetings` | Num Meetings | LONG |  | datasourceColumn |  |
| `num_segments` | Num Segments | LONG |  | datasourceColumn |  |
| `num_zoom_meetings` | Num Zoom Meetings | LONG |  | datasourceColumn |  |
| `participant_ids` | Participant Ids | ARRAY |  | datasourceColumn |  |
| `participant_primary_keys` | Participant Primary Keys | ARRAY |  | datasourceColumn |  |
| `participant_uuids` | Participant Uuids | ARRAY |  | datasourceColumn |  |
| `recording_watch_time` | Recording Watch Time | LONG |  | datasourceColumn |  |
| `ticket_attendance_types` | Ticket Attendance Types | ARRAY |  | datasourceColumn |  |
| `ticket_role_types` | Ticket Role Types | ARRAY |  | datasourceColumn |  |
| `ticket_type_ids` | Ticket Type Ids | ARRAY |  | datasourceColumn |  |
| `ticket_type_names` | Ticket Type Names | ARRAY |  | datasourceColumn |  |
| `topics` | Topics | ARRAY |  | datasourceColumn |  |
| `total_time_dropped_out` | Total Time Dropped Out | LONG |  | datasourceColumn |  |
| `total_watch_time` | Total Watch Time | LONG |  | datasourceColumn |  |
| `user_names` | User Names | ARRAY |  | datasourceColumn |  |
| `zoom_chat_messages_sent` | Zoom Chat Messages Sent | LONG |  | datasourceColumn |  |
| `zoom_chat_words_written` | Zoom Chat Words Written | LONG |  | datasourceColumn |  |
| `zoom_meeting_ids` | Zoom Meeting Ids | ARRAY |  | datasourceColumn |  |
| `zoom_meeting_instance_ids` | Zoom Meeting Instance Ids | ARRAY |  | datasourceColumn |  |
| `zoom_meetings_with_chat_participation` | Zoom Meetings With Chat Participation | LONG |  | datasourceColumn |  |

---

## [Pierrejean] Location

**Table:** `pierrejean_location`  
**Foundry apiName:** `PierrejeanLocation`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `geohash` | Geohash | GEOHASH |  | datasourceColumn |  |
| `location_id` | Location Id | STRING | PK | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |

---

## [PMF] App Question

**Table:** `pmf_app_question`  
**Foundry apiName:** `PmfAppQuestion`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Questions to generate insights for marketing purposes  

**Relationships:**
- has many **PmfInsight** (link: "[PMF] Insight")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `id` | Id | STRING | PK | redacted |  |
| `question` | Question | STRING |  | redacted |  |

---

## [PMF] Insight

**Table:** `pmf_insight`  
**Foundry apiName:** `PmfInsight`  
**Status:** experimental  
**Datasources:** 1  
**Description:** output from LLM based on PMF inputs (questions+context)  

**Relationships:**
- belongs to **PmfAppQuestion** via `question_id` (link: "PMF App Question")
- belongs to **PmfInsightGenerator** via `insight_generator_id` (link: "[PMF] Insights Generator")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answered` | Answered | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `id` | id | STRING | PK | redacted |  |
| `insight_generator_id` | Insight Generator ID | STRING |  | redacted |  |
| `insight_text` | Insight Text | STRING |  | redacted |  |
| `question_id` | Question ID | STRING |  | redacted |  |
| `question_text` | Question Text | STRING |  | redacted |  |
| `quote` | Quote | STRING |  | redacted |  |
| `recording_id` | Meeting ID | STRING |  | redacted |  |
| `sentiment` | Sentiment | STRING |  | redacted |  |

---

## [PMF] Insight Generator

**Table:** `pmf_insight_generator`  
**Foundry apiName:** `PmfInsightGenerator`  
**Status:** experimental  
**Datasources:** 1  
**Description:** queue to generate insights by question  

**Relationships:**
- has many **PmfInsight** (link: "[PMF] Insight")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `id` | id | STRING | PK | redacted |  |
| `question_ids` | Question IDs | ARRAY |  | redacted |  |
| `recording_id` | Meeting ID | STRING |  | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `user_id` | User ID | STRING |  | redacted |  |

---

## Processed Strukturanalyse Image 

**Table:** `processed_strukturanalyse_image`  
**Foundry apiName:** `ProcessedStrukturanalyseImage`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `uuid` | Uuid | STRING | PK | datasourceColumn |  |

---

## [Product] Lecture

**Table:** `product_lecture`  
**Foundry apiName:** `ProductLecture`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **ProductModule** via `zuordnung_modul_id` (link: "[Product] Module")
- has many **ProductSessionType** (link: "[Product] Session-Type")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `lektion_beschreibung` | Lektion Beschreibung | STRING |  | datasourceColumn |  |
| `lektion_id` | Lektion ID | STRING | PK | datasourceColumn |  |
| `lektion_name` | Lektion Name | STRING |  | datasourceColumn |  |
| `lektion_url` | Lektion URL | STRING |  | datasourceColumn |  |
| `zuordnung_modul_id` | Zuordnung Modul ID | STRING |  | datasourceColumn |  |

---

## [Product] Module

**Table:** `product_module`  
**Foundry apiName:** `ProductModule`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ProductLecture** (link: "[Product] Lecture")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `modul_beschreibung` | Modul Beschreibung | STRING |  | datasourceColumn |  |
| `modul_id` | Modul ID | STRING | PK | datasourceColumn |  |
| `modul_name` | Modul Name | STRING |  | datasourceColumn |  |
| `modul_url` | Modul URL | STRING |  | datasourceColumn |  |
| `zuordnung_programm_id` | Zuordnung Programm ID | STRING |  | datasourceColumn |  |

---

## [Product] Session-Type

**Table:** `product_session_type`  
**Foundry apiName:** `ProductSessionType`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **ProductLecture** via `session_id` (link: "[Product] Lecture")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `session_description` | Session Description | STRING |  | datasourceColumn |  |
| `session_id` | Session ID | STRING | PK | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `zuordnung_lekture_id` | Zuordnung Lekture ID | STRING |  | datasourceColumn |  |

---

## Program

**Table:** `program`  
**Foundry apiName:** `Program`  
**Status:** active  
**Datasources:** 1  
**Description:** What users access via subscription (e.g., "Schmerzfrei 4.0", "Original Ausbildung"). Contains modules with educational content and exercises.  

**Relationships:**
- has many **Subscription** (link: "Subscription")
- has many **ProgramAppModuleLink** (link: "Program App Module Link")
- has many **Contract** (link: "Contract")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `description` | Description | STRING |  | redacted |  |
| `duration` | Duration | STRING |  | redacted |  |
| `format` | Format | STRING |  | redacted | Delivery format: Online-Coaching with Live-Sessions, Online + Präsenz (hybrid), or Online (Zoom-Events). Most programs have format not specified (null). |
| `price` | Price | STRING |  | redacted |  |
| `program_id` | Program Id | STRING | PK | redacted | Primary key - unique identifier for each program. |
| `program_name` | Program Name | STRING |  | redacted | Human-readable name of the program. Examples: Schmerzfrei Summit, Blueprint: Arthrose, RESET 5.0, Biomechanik - Jahr 1, TOB-Facilitator I. |
| `requires_celebration_call` | Requires Celebration Call | BOOLEAN |  | redacted | Flag indicating if this program requires a celebration call milestone. |
| `target_audience` | Target Audience | STRING |  | redacted |  |

---

## Program App Module Link

**Table:** `program_app_module_link`  
**Foundry apiName:** `ProgramAppModuleLink`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **AppModule** via `app_module_id` (link: "App Module")
- belongs to **Program** via `program_id` (link: "Program")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_module_id` | App Module Id | STRING |  | redacted |  |
| `position` | Position | LONG |  | redacted |  |
| `program_app_module_link_id` | Program App Module Link Id | STRING | PK | redacted |  |
| `program_id` | Program Id | STRING |  | redacted |  |

---

## Prompts [AST]

**Table:** `prompts_ast`  
**Foundry apiName:** `PromptsAst`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `prompt` | Prompt | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## Prompts Rule Engine

**Table:** `prompts_rule_engine`  
**Foundry apiName:** `PromptsRuleEngine`  
**Status:** experimental  
**Datasources:** 1  
**Description:** TOBs set of guardrail rules to apply to the prompt generation  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `added_at` | Added At | DATE |  | datasourceColumn |  |
| `added_by` | Added By | STRING |  | datasourceColumn |  |
| `channels` | Channels | ARRAY |  | datasourceColumn |  |
| `if` | If | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `then` | Then | STRING |  | datasourceColumn |  |

---

## Raw Strukturanalyse Image

**Table:** `raw_strukturanalyse_image`  
**Foundry apiName:** `RawStrukturanalyseImage`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `uuid` | Uuid | STRING | PK | datasourceColumn |  |

---

## Reason To Call Per Touchpoint

**Table:** `reason_to_call_per_touchpoint`  
**Foundry apiName:** `ReasonToCallPerTouchpoint`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **TouchpointsV2Curated** via `touchpoint_id` (link: "Touchpoints v2 Curated")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `category` | Category | STRING |  | editOnly |  |
| `contact_id` | Contact ID | STRING |  | editOnly |  |
| `created_at` | Created At | TIMESTAMP |  | editOnly |  |
| `mean_of_communication` | Mean of Communication | STRING |  | editOnly |  |
| `mean_of_communication_reasoning` | Mean of Communication Reasoning | STRING |  | editOnly |  |
| `reason_to_call` | Reason to Call | STRING |  | editOnly |  |
| `primary_key` | Touchpoint Id | STRING | PK | datasourceColumn |  |

---

## [Zoom] Recording

**Table:** `recording_zoom`  
**Foundry apiName:** `RecordingZoom`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid_1` (link: "Meeting [Zoom]")
- has many **TranscriptZoom** (link: "Transcript")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account ID | STRING |  | datasourceColumn |  |
| `auto_delete` | Auto Delete | BOOLEAN |  | datasourceColumn |  |
| `auto_delete_date` | Auto Delete Date | STRING |  | datasourceColumn |  |
| `download_token` | Download Token | STRING |  | datasourceColumn |  |
| `duration` | Duration | DOUBLE |  | datasourceColumn |  |
| `event_timestamp` | Event Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `event_type` | Event Type | STRING |  | datasourceColumn |  |
| `host_email` | Host Email | STRING |  | datasourceColumn |  |
| `host_id` | Host ID | STRING |  | datasourceColumn |  |
| `mariadb_id` | MariaDB ID | STRING |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | TIMESTAMP |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting UUID | STRING | PK | datasourceColumn |  |
| `object_account_id` | Object Account ID | STRING |  | datasourceColumn |  |
| `on_prem` | On Prem | BOOLEAN |  | datasourceColumn |  |
| `participant_audio_files` | Participant Audio Files | ARRAY |  | datasourceColumn |  |
| `recording_count` | Recording Count | INTEGER |  | datasourceColumn |  |
| `recording_files` | Recording Files | ARRAY |  | datasourceColumn |  |
| `share_url` | Share Url | STRING |  | datasourceColumn |  |
| `start_time` | Start Time | TIMESTAMP |  | datasourceColumn |  |
| `strategy` | Strategy | STRING |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `total_size` | Total Size | DOUBLE |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |

---

## Review Response

**Table:** `review_response`  
**Foundry apiName:** `ReviewResponse`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Stores answers for each reviewed image (valid, rejection reasons, warnings)  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `item_id` | Item Id | STRING | PK | datasourceColumn |  |
| `media_rid` | Media Rid | STRING |  | datasourceColumn |  |
| `rejection_reasons` | Rejection Reasons | STRING |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | DATE |  | datasourceColumn |  |
| `reviewer` | Reviewer | STRING |  | datasourceColumn |  |
| `valid` | Valid | BOOLEAN |  | datasourceColumn |  |
| `warnings` | Warnings | STRING |  | datasourceColumn |  |

---

## Removed - Review Response Processedss

**Table:** `review_response_processe`  
**Foundry apiName:** `ReviewResponseProcesse`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Stores answers for each reviewed image (valid, rejection reasons, warnings)  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `item_id` | Item Id | STRING | PK | datasourceColumn |  |
| `media_rid` | Media Rid | STRING |  | datasourceColumn |  |
| `rejection_reasons` | Rejection Reasons | ARRAY |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | DATE |  | datasourceColumn |  |
| `reviewer` | Reviewer | STRING |  | datasourceColumn |  |
| `valid` | Valid | BOOLEAN |  | datasourceColumn |  |
| `warnings` | Warnings | STRING |  | datasourceColumn |  |

---

## Review Response Processed

**Table:** `review_response_processed`  
**Foundry apiName:** `ReviewResponseProcessed`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Stores answers for each reviewed image (valid, rejection reasons, warnings)  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `item_id` | Item Id | STRING | PK | datasourceColumn |  |
| `media_rid` | Media Rid | STRING |  | datasourceColumn |  |
| `rejection_reasons` | Rejection Reasons | ARRAY |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | DATE |  | datasourceColumn |  |
| `reviewer` | Reviewer | STRING |  | datasourceColumn |  |
| `valid` | Valid | BOOLEAN |  | datasourceColumn |  |
| `warnings` | Warnings | STRING |  | datasourceColumn |  |

---

## Review Response Raw

**Table:** `review_response_raw`  
**Foundry apiName:** `ReviewResponseRaw`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Stores answers for each reviewed image (valid, rejection reasons, warnings)  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `item_id` | Item Id | STRING | PK | datasourceColumn |  |
| `media_rid` | Media Rid | STRING |  | datasourceColumn |  |
| `rejection_reasons` | Rejection Reasons | ARRAY |  | datasourceColumn |  |
| `reviewed_at` | Reviewed At | DATE |  | datasourceColumn |  |
| `reviewer` | Reviewer | STRING |  | datasourceColumn |  |
| `valid` | Valid | BOOLEAN |  | datasourceColumn |  |
| `warnings` | Warnings | STRING |  | datasourceColumn |  |

---

## Sales Agent

**Table:** `sales_agent`  
**Foundry apiName:** `SalesAgent`  
**Status:** experimental  
**Datasources:** 1  
**Description:** List of users who belong to the sales team  

**Relationships:**
- has many **CloseConnectingCall2** (link: "[Close] Connecting Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `close_user_id` | Close User Id | STRING | PK | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `first_name` | First Name | STRING |  | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `funnelbox_user_id` | Funnelbox User Id | STRING |  | datasourceColumn |  |
| `last_name` | Last Name | STRING |  | datasourceColumn |  |
| `phone` | Phone | STRING |  | datasourceColumn |  |
| `waha_id` | Waha Id | STRING |  | datasourceColumn |  |

---

## Sales Alerts

**Table:** `sales_alerts`  
**Foundry apiName:** `SalesAlerts`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `alert_id` | Alert Id | STRING | PK | datasourceColumn |  |
| `alert_json` | Alert Json | STRING |  | datasourceColumn |  |
| `alert_priority` | Alert Priority | STRING |  | datasourceColumn |  |
| `alert_raised_at` | Alert Raised At | TIMESTAMP |  | datasourceColumn |  |
| `alert_remediation_object_fkey` | Alert Remediation Object Fkey | STRING |  | datasourceColumn |  |
| `alert_source_object_fkey` | Alert Source Object Fkey | STRING |  | datasourceColumn |  |
| `alert_status` | Alert Status | STRING |  | datasourceColumn |  |
| `alert_status_updated_at` | Alert Status Updated At | TIMESTAMP |  | datasourceColumn |  |
| `alert_title` | Alert Title | STRING |  | datasourceColumn |  |
| `alert_to_be_resolved_until` | Alert To Be Resolved Until | TIMESTAMP |  | datasourceColumn |  |
| `alert_type` | Alert Type | STRING |  | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |

---

## [Sales CRM] Ausbildung Lead Enriched

**Table:** `sales_crm_ausbildung_lead_enriched`  
**Foundry apiName:** `SalesCrmAusbildungLeadEnriched`  
**Status:** experimental  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-05**

Unified Ausbildung Leads dataset combining multiple data sources to identify sales opportunities. A lead is included if they are EITHER a marketing offer registrant OR have shown ausbildung interest via typed facts (or both).

**Opportunity Sources (opportunity_source array):**
- "Has Shown Typed Facts Interest" - AI classified interest from typed facts
- "Ticket in Feb.2026 Ausbildung MO" - Registered for current Ausbildung offer
- "Ticket in Previous Ausbildung MOs" - Registered for past Ausbildung offers

**Key Relationships:**
- Links to Marketing Offer Participation (ONE-to-MANY) - registration data
- Links to Typed Fact (ONE-to-MANY) - AI-extracted interest signals
- Links to Leads (typed facts) (MANY-to-ONE) - interest classification
- Links to [Funnelbox] Contact v2 (ONE-to-MANY) - contact details

**Data Sources:**
- Funnelbox Contact V2: email, full_name, phone, tob_assigned_name, contract/signing flags, bexio flags
- Marketing Offer Participation: reg_current_ausbildung, reg_past_ausbildung, mop_* engagement flags
- Typed Facts Leads: interest_level (INTERESTED, POTENTIALLY INTERESTED, VERY INTERESTED)
- Typed Fact + Touchpoints v2 Curated: detected_date (message timestamp), reason_to_call, message_content, source
- Close Transcripts: close_lead_id

**Important Notes:**
- detected_date, reason_to_call, message_content, source are ONLY populated for leads with "Has Shown Typed Facts Interest" source
- Leads with bexio_is_training_cert_client = TRUE are excluded
- detected_date is the actual message timestamp, not the AI extraction timestamp

**Data Freshness:** Built from upstream pipeline transforms  

**Relationships:**
- has many **TypedFact** (link: "Typed Fact")
- has many **FunnelboxContactV2** (link: "[Funnelbox] Contact v2")
- belongs to **WahaConversation** via `waha-conversation-id` (link: "WhatsApp Conversation")
- has many **MarketingOfferParticipation** (link: "Marketing Offer Participation")
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")
- has many **LogAssignLeadToWahaConversation** (link: "[Log] Assign Lead to Conversation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `assigned_to` | Assigned To | STRING |  | editOnly | The name of the sales representative currently handling this lead. |
| `bexio_is_client` | Bexio Is Client | BOOLEAN |  | datasourceColumn |  |
| `bexio_is_training_cert_client` | Bexio Is Training Cert Client | BOOLEAN |  | datasourceColumn |  |
| `close_last_call` | Close Last Call | TIMESTAMP |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | STRING |  | datasourceColumn |  |
| `close_lead_status` | Close Lead Status | STRING |  | datasourceColumn |  |
| `contract_is_signed` | Contract Is Signed | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_has_whatsapp_conversation` | Current Ausbildung Has WhatsApp Conversation | BOOLEAN |  | datasourceColumn | Indicates whether this lead has a WhatsApp conversation related to the current Ausbildung offer. |
| `current_ausbildung_mop_chat_messages` | Current Ausbildung Mop Chat Messages | LONG |  | datasourceColumn |  |
| `current_ausbildung_mop_close_call_duration` | Current Ausbildung Mop Close Call Duration | DOUBLE |  | datasourceColumn |  |
| `current_ausbildung_mop_completed_strukturanalyse` | Current Ausbildung Mop Completed Strukturanalyse | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_docuseal_is_sent` | Current Ausbildung Mop Docuseal Is Sent | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_docuseal_is_signed` | Current Ausbildung Mop Docuseal Is Signed | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_docuseal_is_viewed` | Current Ausbildung Mop Docuseal Is Viewed | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_has_attended_session` | Current Ausbildung Mop Has Attended Session | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_has_converted` | Current Ausbildung Mop Has Converted | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_has_skool` | Current Ausbildung Mop Has Skool | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_inbound_emails` | Current Ausbildung Mop Inbound Emails | LONG |  | datasourceColumn |  |
| `current_ausbildung_mop_is_signed` | Current Ausbildung Mop Is Signed | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_last_call_attempt` | Current Ausbildung Mop Last Call Attempt | TIMESTAMP |  | datasourceColumn |  |
| `current_ausbildung_mop_live_watch_time` | Current Ausbildung Mop Live Watch Time | DOUBLE |  | datasourceColumn |  |
| `current_ausbildung_mop_pandadoc_is_sent` | Current Ausbildung Mop Pandadoc Is Sent | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_pandadoc_is_viewed` | Current Ausbildung Mop Pandadoc Is Viewed | BOOLEAN |  | datasourceColumn |  |
| `current_ausbildung_mop_prelead_score` | Current Ausbildung Mop Prelead Score | DOUBLE |  | datasourceColumn |  |
| `current_ausbildung_mop_registration_timestamp` | Current Ausbildung Mop Registration Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `current_ausbildung_mop_sessions` | Current Ausbildung Mop Sessions | LONG |  | datasourceColumn |  |
| `current_ausbildung_mop_watch_time` | Current Ausbildung Mop Watch Time | DOUBLE |  | datasourceColumn |  |
| `current_ausbildung_mop_whatsapp_responded` | Current Ausbildung Mop Whatsapp Responded | BOOLEAN |  | datasourceColumn |  |
| `detected_date` | Detected Date | TIMESTAMP |  | datasourceColumn |  |
| `docuseal_is_signed` | Docuseal Is Signed | BOOLEAN |  | datasourceColumn |  |
| `email` | Email | STRING | PK | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `has_whatsapp_conversation` | Has WhatsApp Conversation | BOOLEAN |  | datasourceColumn | Indicates whether this lead has an active WhatsApp conversation. |
| `interest_level` | Interest Level | STRING |  | datasourceColumn |  |
| `lead_opportunity_status` | Lead Opportunity Status | STRING |  | editOnly | Identified Validated Outreach Attempted Contract Sent Won Lost |
| `lead_whatsapp_status` | Lead WhatsApp Flag | STRING |  | editOnly | The sales readiness level of this lead based on WhatsApp interactions. Select Warm (showing interest), Hot (actively engaged), or Ready to Buy (high intent to purchase). |
| `llm_generated_is_interested` | Llm Generated Is Interested | BOOLEAN |  | datasourceColumn |  |
| `llm_generated_key_message_body` | Llm Generated Key Message Body | STRING |  | datasourceColumn |  |
| `llm_generated_key_message_id` | Llm Generated Key Message Id | STRING |  | datasourceColumn |  |
| `llm_generated_key_sentence` | Llm Generated Key Sentence | STRING |  | datasourceColumn |  |
| `llm_generated_summary` | Llm Generated Summary | STRING |  | datasourceColumn |  |
| `message_content` | Message Content | STRING |  | datasourceColumn |  |
| `mop_ausbildung_count` | Mop Ausbildung Count | LONG |  | datasourceColumn |  |
| `mop_chat_message_count` | Mop Chat Message Count | LONG |  | datasourceColumn |  |
| `mop_completed_strukturanalyse` | Mop Completed Strukturanalyse | BOOLEAN |  | datasourceColumn |  |
| `mop_count_sessions` | Mop Count Sessions | LONG |  | datasourceColumn |  |
| `mop_docuseal_is_sent` | Mop Docuseal Is Sent | BOOLEAN |  | datasourceColumn |  |
| `mop_docuseal_is_viewed` | Mop Docuseal Is Viewed | BOOLEAN |  | datasourceColumn |  |
| `mop_has_attended_session` | Mop Has Attended Session | BOOLEAN |  | datasourceColumn |  |
| `mop_has_skool_account` | Mop Has Skool Account | BOOLEAN |  | datasourceColumn |  |
| `mop_inbound_email_count` | Mop Inbound Email Count | LONG |  | datasourceColumn |  |
| `mop_pandadoc_is_sent` | Mop Pandadoc Is Sent | BOOLEAN |  | datasourceColumn |  |
| `mop_pandadoc_is_viewed` | Mop Pandadoc Is Viewed | BOOLEAN |  | datasourceColumn |  |
| `mop_prelead_score` | Mop Prelead Score | DOUBLE |  | datasourceColumn |  |
| `mop_total_close_call_duration` | Mop Total Close Call Duration | DOUBLE |  | datasourceColumn |  |
| `mop_total_live_watch_time` | Mop Total Live Watch Time | DOUBLE |  | datasourceColumn |  |
| `mop_total_watch_time` | Mop Total Watch Time | DOUBLE |  | datasourceColumn |  |
| `mop_whatsapp_responded` | Mop Whatsapp Responded | BOOLEAN |  | datasourceColumn |  |
| `open_in_whatsapp_links` | Open In Whatsapp Links | ARRAY |  | datasourceColumn |  |
| `opportunity_created_at` | Opportunity Created At | TIMESTAMP |  | editOnly | The date and time when this opportunity was created or last updated. |
| `opportunity_created_by` | Opportunity Created By | STRING |  | editOnly | The user who created or last updated this opportunity via the action. |
| `opportunity_source` | Opportunity Source | ARRAY |  | datasourceColumn |  |
| `pandadoc_is_signed` | Pandadoc Is Signed | BOOLEAN |  | datasourceColumn |  |
| `phone` | Phone | STRING |  | datasourceColumn |  |
| `reason_to_call` | Reason To Call | STRING |  | datasourceColumn |  |
| `reg_current_ausbildung` | Reg Current Ausbildung | BOOLEAN |  | datasourceColumn |  |
| `reg_past_ausbildung` | Reg Past Ausbildung | BOOLEAN |  | datasourceColumn |  |
| `sales_notes` | Sales Notes | STRING |  | editOnly | Add context about this lead: why they have this temperature, key insights from conversations, or next steps for follow-up. |
| `source` | Source | STRING |  | datasourceColumn |  |
| `tob_assigned_name` | Tob Assigned Name | STRING |  | datasourceColumn |  |
| `waha_conversation_id` | WhatsApp Conversation ID | STRING |  | editOnly | The Waha conversation ID linking this lead to their WhatsApp conversation. Set when assigning a conversation to this lead. |
| `whatsapp_message_count` | Whatsapp Message Count | LONG |  | datasourceColumn |  |

---

## Sales CRM Usage Log

**Table:** `sales_crm_usage_log`  
**Foundry apiName:** `SalesCrmUsageLog`  
**Status:** experimental  
**Datasources:** 1  
**Description:** App Activity logs  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `active_seconds` | Active Seconds | INTEGER |  | editOnly |  |
| `app_version` | App Version | STRING |  | editOnly |  |
| `date` | Date | DATE |  | editOnly |  |
| `error_count` | Error Count | INTEGER |  | editOnly |  |
| `feature_counts` | Feature Counts | STRING |  | editOnly | JSON |
| `last_updated` | Last Updated | TIMESTAMP |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `route_visits` | Route Visits | STRING |  | editOnly | json |
| `user_email` | User Email | STRING |  | editOnly |  |
| `user_id` | User Id | STRING |  | editOnly |  |

---

## [Waha] Sales Representative

**Table:** `sales_representative`  
**Foundry apiName:** `SalesRepresentative`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Sales representatives who communicate with leads via WhatsApp. Synced from Waha Sessions Status with additional editable metadata.  

**Relationships:**
- has many **WahaConversation** (link: "[Waha] Conversation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `avatar_url` | Avatar Url | STRING |  | datasourceColumn |  |
| `display_name` | Display Name | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `ghl_id` | Ghl Id | STRING |  | datasourceColumn |  |
| `is_active` | Is Active | BOOLEAN |  | datasourceColumn |  |
| `is_test_user` | Is Test User | BOOLEAN |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |
| `user_name` | User Name | STRING | PK | datasourceColumn |  |

---

## [Funnelbox] Schmerzfrei Umfrage

**Table:** `schmerzfrei_umfrage_fu_bo`  
**Foundry apiName:** `SchmerzfreiUmfrageFuBo`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `e_mail` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `bist_du_bereit_dir_aktiv_zeit_zu_nehmen_und_mit_uns_gemeinsam_an_deiner_schmerzfreiheit_zu_arbeiten` | Bereitschaft / Invest | STRING |  | datasourceColumn |  |
| `welche_beschwerden_hast_du` | Beschwerden | STRING |  | datasourceColumn |  |
| `was_hast_du_bisher_alles_unternommen_um_deine_schmerzen_loszuwerden` | Bisherige Maßnahmen | ARRAY |  | datasourceColumn |  |
| `ghl_contact_id` | Contact ID FuBo | STRING |  | datasourceColumn |  |
| `e_mail_adresse` | eMail | STRING |  | datasourceColumn |  |
| `auf_einer_skala_von_1_10_wo_w_rdest_du_deine_schmerzen_einordnen_1_kaum_schmerzen_10_sehr_starke_schmerzen` | Einordnung Schmerzen (Max 10) | ARRAY |  | datasourceColumn |  |
| `wo_schr_nken_dich_deine_schmerzen_aktuell_am_meisten_ein` | Einschränkungen durch Schmerzen | ARRAY |  | datasourceColumn |  |
| `wie_lange_leidest_du_schon_unter_deinen_schmerzen` | Leidens-Zeitraum  Schmerzen | STRING |  | datasourceColumn |  |
| `in_welchen_positionen_machen_sich_deine_schmerzen_bemerkbar` | Schmerzpositionen | ARRAY |  | datasourceColumn |  |
| `submission_date` | Submission Date | STRING |  | datasourceColumn |  |
| `ghl_tob_id` | TOB ID | STRING |  | datasourceColumn |  |
| `uuid` | UUID | STRING | PK | datasourceColumn |  |
| `wie_sehr_willst_du_wieder_schmerzfrei_werden_10_ich_m_chte_unbedingt_schmerzfrei_werden` | Wunsch Schmerzfrei werden (Max 10) | ARRAY |  | datasourceColumn |  |

---

## Session Info

**Table:** `session_info`  
**Foundry apiName:** `SessionInfo`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **AppEvent** (link: "App Event")
- has many **Sessions** (link: "Session  Happened")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `category_id` | Category Id | STRING |  | datasourceColumn |  |
| `date_of_session` | Date Of Session | DATE |  | datasourceColumn |  |
| `session_id` | Session Id | STRING | PK | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `session_title` | Session Title | STRING |  | datasourceColumn |  |
| `time_of_session` | Time Of Session | STRING |  | datasourceColumn |  |
| `zoom_meeting_id` | Zoom Meeting Id | STRING |  | datasourceColumn |  |

---

## App Session Participation

**Table:** `session_participation`  
**Foundry apiName:** `SessionParticipation`  
**Status:** active  
**Datasources:** 1  
**Description:** Record of user participating in a workout session (live or recording). One row per user/session/day.  

**Relationships:**
- belongs to **AppSessionCategory** via `category_id` (link: "App Session Category")
- has many **SessionParticipationSubscription** (link: "Session Participation Subscription")
- belongs to **AppSession** via `session_id` (link: "App Session")
- belongs to **AppUser** via `user_id` (link: "App User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `body_position_id` | Body Position Id | STRING |  | redacted |  |
| `category_id` | Category Id | STRING |  | redacted |  |
| `date_of_session` | Date Of Session | DATE |  | redacted |  |
| `equipment_id` | Equipment Id | STRING |  | redacted |  |
| `first_time_user_opened_session_at` | First Time User Opened Session At | TIMESTAMP |  | redacted | Timestamp when the user first opened/accessed this session. |
| `session_duration` | Session Duration | INTEGER |  | redacted |  |
| `session_end_timestamp` | Session End Timestamp | TIMESTAMP |  | redacted | Timestamp when the session ended. |
| `session_id` | Session Id | STRING |  | redacted |  |
| `session_live_or_recording` | Session Live Or Recording | STRING |  | redacted |  |
| `session_participation_id` | Session Participation Id | STRING | PK | redacted | Primary key - unique identifier for each user-session participation record. |
| `session_start_timestamp` | Session Start Timestamp | TIMESTAMP |  | redacted | Timestamp when the session started. |
| `session_title` | Session Title | STRING |  | redacted |  |
| `user_booked_session_at` | User Booked Session At | TIMESTAMP |  | redacted |  |
| `user_id` | User Id | STRING |  | redacted |  |
| `vector_id` | Vector Id | STRING |  | redacted |  |

---

## Session Participation Subscription

**Table:** `session_participation_subscription`  
**Foundry apiName:** `SessionParticipationSubscription`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **Subscription** via `subscription_id` (link: "Subscription")
- belongs to **AppSession** via `session_id` (link: "App Session")
- belongs to **SessionParticipation** via `session_participation_id` (link: "Session Participation")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `pk` | Pk | STRING | PK | redacted |  |
| `session_id` | Session Id | STRING |  | redacted |  |
| `session_participation_id` | Session Participation Id | STRING |  | redacted |  |
| `subscription_id` | Subscription Id | STRING |  | redacted |  |
| `subscription_week` | Subscription Week | LONG |  | redacted |  |

---

## Session  Happened

**Table:** `sessions`  
**Foundry apiName:** `Sessions`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SessionInfo** via `unique_session_id` (link: "Session Info")
- has many **AppEvent** (link: "App Event")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `category_id` | Category Id | STRING |  | datasourceColumn |  |
| `date_of_session` | Date Of Session | DATE |  | datasourceColumn |  |
| `session_id` | Session Id | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `session_title` | Session Title | STRING |  | datasourceColumn |  |
| `time_of_session` | Time Of Session | STRING |  | datasourceColumn |  |
| `unique_session_id` | Unique Session Id | STRING | PK | datasourceColumn |  |
| `zoom_meeting_id` | Zoom Meeting Id | STRING |  | datasourceColumn |  |

---

## Short Lead Profile

**Table:** `short_lead_profile`  
**Foundry apiName:** `ShortLeadProfile`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

AI-generated concise summaries of lead profiles. Each profile provides a brief, actionable overview of a lead's key characteristics, pain points, and engagement history for quick sales team reference.

**Key Relationships:**
- Links to [Typed Facts] Lead (ONE-to-ONE) - source lead data
- Links to ID Match (ONE-to-ONE) - cross-system identity resolution

**Primary Use Cases:**
- Quick lead overview for sales calls
- Pre-call briefing summaries
- Lead prioritization dashboards
- CRM enrichment with AI summaries

**Relevant Properties:**
- Email: Primary identifier
- Short Lead Profile: AI-generated concise summary

**Data Freshness:** Generated incrementally from typed facts pipeline  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING | PK | redacted | Primary email address (primary key) identifying the lead |
| `short_lead_profile` | Short Lead Profile | STRING |  | redacted | AI-generated concise summary of the lead's key characteristics and engagement |

---

## Signed Marketing Offer Participation

**Table:** `signed_marketing_offer_participation`  
**Foundry apiName:** `SignedMarketingOfferParticipation`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `chat_message_count_until_signed` | Chat Message Count Until Signed | LONG |  | datasourceColumn |  |
| `chat_message_count_words_until_signed` | Chat Message Count Words Until Signed | LONG |  | datasourceColumn |  |
| `count_clicked_email_until_sign` | Count Clicked Email Until Sign | LONG |  | datasourceColumn |  |
| `count_inbound_email_until_sign` | Count Inbound Email Until Sign | LONG |  | datasourceColumn |  |
| `count_opened_email_until_sign` | Count Opened Email Until Sign | LONG |  | datasourceColumn |  |
| `count_questions_answered_until_sign` | Count Questions Answered Until Sign | LONG |  | datasourceColumn |  |
| `count_sessions_until_signed` | Count Sessions Until Signed | LONG |  | datasourceColumn |  |
| `count_skool_comment_until_sign` | Count Skool Comment Until Sign | LONG |  | datasourceColumn |  |
| `count_skool_post_until_sign` | Count Skool Post Until Sign | LONG |  | datasourceColumn |  |
| `count_surveys_submitted_until_sign` | Count Surveys Submitted Until Sign | LONG |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `inbound_touchpoints_content_tokens` | Inbound Touchpoints Content Tokens | DOUBLE |  | datasourceColumn |  |
| `inbound_touchpoints_count` | Inbound Touchpoints Count | LONG |  | datasourceColumn |  |
| `marketing_offer_name` | Marketing Offer Name | STRING |  | datasourceColumn |  |
| `marketing_offer_registration_timestamp` | Marketing Offer Registration Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `pre_summit_close_call_duration_until_sign` | Pre Summit Close Call Duration Until Sign | DOUBLE |  | datasourceColumn |  |
| `summit_close_call_duration_until_sign` | Summit Close Call Duration Until Sign | DOUBLE |  | datasourceColumn |  |
| `template` | Template | STRING |  | datasourceColumn |  |
| `total_close_call_duration_until_sign` | Total Close Call Duration Until Sign | DOUBLE |  | datasourceColumn |  |
| `total_live_watchtime_until_signed` | Total Live Watchtime Until Signed | DOUBLE |  | datasourceColumn |  |
| `touchpoints_sources_count` | Touchpoints Sources Count | INTEGER |  | datasourceColumn |  |
| `ts_document_signed` | Ts Document Signed | TIMESTAMP |  | datasourceColumn |  |
| `whatsapp_inbound_msg_count_until_sign` | Whatsapp Inbound Msg Count Until Sign | LONG |  | datasourceColumn |  |
| `whatsapp_inbound_word_count_until_sign` | Whatsapp Inbound Word Count Until Sign | LONG |  | datasourceColumn |  |
| `whatsapp_outbound_msg_count_until_sign` | Whatsapp Outbound Msg Count Until Sign | LONG |  | datasourceColumn |  |
| `whatsapp_outbound_word_count_until_sign` | Whatsapp Outbound Word Count Until Sign | LONG |  | datasourceColumn |  |
| `whatsapp_total_words_produced_until_sign` | Whatsapp Total Words Produced Until Sign | LONG |  | datasourceColumn |  |

---

## [Skool] Community

**Table:** `skool_community`  
**Foundry apiName:** `SkoolCommunity`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **SkoolPost** (link: "[Skool] Post")
- has many **SkoolMember** (link: "[Skool] Member")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `author_ids` | Author Ids | ARRAY |  | datasourceColumn |  |
| `categories` | Categories | ARRAY |  | datasourceColumn |  |
| `community` | Community | STRING | PK | datasourceColumn |  |
| `community_id` | Community Id | STRING |  | datasourceColumn |  |
| `num_comments` | Num Comments | LONG |  | datasourceColumn |  |
| `num_post_authors` | Num Post Authors | LONG |  | datasourceColumn |  |
| `num_posts` | Num Posts | LONG |  | datasourceColumn |  |
| `post_ids` | Post Ids | ARRAY |  | datasourceColumn |  |
| `total_likes_count` | Total Likes Count | LONG |  | datasourceColumn |  |

---

## [Skool] Member

**Table:** `skool_member`  
**Foundry apiName:** `SkoolMember`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **SkoolPost** (link: "[Skool] Post")
- belongs to **SkoolCommunity** via `communities` (link: "[Skool] Community")
- has many **SkoolPostComment** (link: "[Skool] Post Comment")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `communities` | Communities | ARRAY |  | datasourceColumn |  |
| `email_first` | Email First | STRING |  | datasourceColumn |  |
| `emails` | Emails | ARRAY |  | datasourceColumn |  |
| `first_name` | First Name | STRING |  | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `invited_by` | Invited By | ARRAY |  | datasourceColumn |  |
| `joined_date` | Joined Date | TIMESTAMP |  | datasourceColumn |  |
| `last_name` | Last Name | STRING |  | datasourceColumn |  |
| `user_id_skool` | User Id Skool | STRING | PK | datasourceColumn |  |

---

## [Skool] Post

**Table:** `skool_post`  
**Foundry apiName:** `SkoolPost`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **SkoolPostComment** (link: "[Skool] Post Comment")
- belongs to **SkoolMember** via `post_author_user_id_skool` (link: "[Skool] Member")
- belongs to **SkoolCommunity** via `community` (link: "[Skool] Community")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `author_name` | Author Name | STRING |  | datasourceColumn |  |
| `author_profile_image` | Author Profile Image | STRING |  | datasourceColumn |  |
| `category` | Category | STRING |  | datasourceColumn |  |
| `community` | Community | STRING |  | datasourceColumn |  |
| `likes_count` | Likes Count | INTEGER |  | datasourceColumn |  |
| `post_author_user_id_skool` | Post Author User Id Skool | STRING |  | datasourceColumn |  |
| `post_content` | Post Content | STRING |  | datasourceColumn |  |
| `post_date` | Post Date | DATE |  | datasourceColumn |  |
| `post_id` | Post Id | STRING | PK | datasourceColumn |  |
| `post_title` | Post Title | STRING |  | datasourceColumn |  |
| `post_url` | Post URL | STRING |  | datasourceColumn |  |

---

## [Skool] Post Comment

**Table:** `skool_post_comment`  
**Foundry apiName:** `SkoolPostComment`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SkoolPost** via `post_id` (link: "[Skool] Post")
- belongs to **SkoolMember** via `comment_author_user_id_skool` (link: "[Skool] Member")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `comment_author_name` | Comment Author Name | STRING |  | datasourceColumn |  |
| `comment_author_profile_image` | Comment Author Profile Image | STRING |  | datasourceColumn |  |
| `comment_author_user_id_skool` | Comment Author User Id Skool | STRING |  | datasourceColumn |  |
| `comment_content` | Comment Content | STRING |  | datasourceColumn |  |
| `comment_date` | Comment Date | DATE |  | datasourceColumn |  |
| `comment_id` | Comment Id | STRING | PK | datasourceColumn |  |
| `comment_likes_count` | Comment Likes Count | STRING |  | datasourceColumn |  |
| `comments_count` | Comments Count | INTEGER |  | datasourceColumn |  |
| `community` | Community | STRING |  | datasourceColumn |  |
| `post_id` | Post Id | STRING |  | datasourceColumn |  |

---

## Speaker [Kickscale]

**Table:** `speaker_kickscale`  
**Foundry apiName:** `SpeakerKickscale`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **CallKickscale** via `meeting_id` (link: "Call [Kickscale]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `hash` | Hash | STRING | PK | datasourceColumn |  |
| `is_seller` | Is Seller | BOOLEAN |  | datasourceColumn |  |
| `call_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `speaker` | Speaker | STRING |  | datasourceColumn |  |

---

## Structure Analysis Element

**Table:** `structure_analysis_element`  
**Foundry apiName:** `StructureAnalysisElement`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **StructureAnalysisInstance** via `analysis_id` (link: "Structure Analysis Instance")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- belongs to **Customer** via `user_email` (link: "Customer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `analysis_id` | Analysis Id | STRING |  | redacted |  |
| `analysis_name` | Analysis Name | STRING |  | redacted |  |
| `analysis_reason` | Analysis Reason | STRING |  | redacted |  |
| `analyzed_image_url` | Analyzed Image Url | STRING |  | redacted |  |
| `contact_id` | Contact Id | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `is_archived` | Is Archived | BOOLEAN |  | redacted |  |
| `is_for_self` | Is For Self | BOOLEAN |  | redacted |  |
| `sa_element_id` | Sa Element Id | STRING | PK | redacted |  |
| `side` | Side | STRING |  | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `structure_analysis_text` | Structure Analysis Text | STRING |  | redacted |  |
| `subject_name` | Subject Name | STRING |  | redacted |  |
| `subject_relationship` | Subject Relationship | STRING |  | redacted |  |
| `updated_at` | Updated At | TIMESTAMP |  | redacted |  |
| `user_age_at_sa_time` | User Age At SA Time | INTEGER |  | redacted |  |
| `user_email` | User Email | STRING |  | redacted |  |
| `user_gender` | User Gender | STRING |  | redacted |  |
| `user_height_cm_at_sa_time` | User Height Cm At SA Time | INTEGER |  | redacted |  |
| `user_id` | User Id | STRING |  | redacted |  |
| `user_weight_kg_at_sa_time` | User Weight Kg At Sa Time | INTEGER |  | redacted |  |

---

## Structure Analysis Instance

**Table:** `structure_analysis_instance`  
**Foundry apiName:** `StructureAnalysisInstance`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- belongs to **Customer** via `user_email` (link: "Customer")
- has many **StructureAnalysisElement** (link: "Structure Analysis Element")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `analysis_id` | Analysis Id | STRING | PK | redacted |  |
| `analysis_name` | Analysis Name | STRING |  | redacted |  |
| `analysis_reason` | Analysis Reason | STRING |  | redacted |  |
| `contact_id` | Contact Id | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `is_archived` | Is Archived | BOOLEAN |  | redacted |  |
| `is_for_self` | Is For Self | BOOLEAN |  | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `subject_name` | Subject Name | STRING |  | redacted |  |
| `subject_relationship` | Subject Relationship | STRING |  | redacted |  |
| `updated_at` | Updated At | TIMESTAMP |  | redacted |  |
| `user_age_at_sa_time` | User Age At SA Time | INTEGER |  | redacted |  |
| `user_email` | User Email | STRING |  | redacted |  |
| `user_gender` | User Gender | STRING |  | redacted |  |
| `user_height_cm_at_sa_time` | User Height Cm At SA Time | INTEGER |  | redacted |  |
| `user_id` | User Id | STRING |  | redacted |  |
| `user_weight_kg_at_sa_time` | User Weight Kg At SA Time | INTEGER |  | redacted |  |

---

## [Summit App] Struktur Analyse With Consent

**Table:** `struktur_analyse_with_consent`  
**Foundry apiName:** `StrukturAnalyseWithConsent`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Body structure analysis images submitted through the Summit App with explicit user consent tracking. Used for posture analysis and health coaching personalization.

**Consent Tracking:**
Tracks three types of image usage consent:
- Marketing: Permission to use in promotional materials
- Summit: Permission to display in Summit events
- Training: Permission to use for AI model training

**Image Processing:**
- Input images are processed for structural analysis
- Output images include analysis overlays
- Blurred versions available for privacy-preserved sharing

**User Demographics Captured:**
- Age, Gender
- Height (cm), Weight (kg)
- Body view perspective (front, back, side)

**Privacy Features:**
- Explicit consent required for processing
- Self-appearance confirmation
- Blurred output images for privacy preservation

**Use Cases:**
- Personalized posture analysis for health coaching
- Progress tracking for pain relief programs
- Training data collection (with consent)
- Summit presentations with user permission

**Relevant Properties:**
- Email: Contact identifier for the submitter
- View: Body perspective (front, back, side)
- Processing Status: Current state of image analysis
- Consent flags: Marketing, Summit, and Training permissions
- Image URLs/RIDs: References to original and processed images  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `age` | Age | INTEGER |  | datasourceColumn | Age of the person in years |
| `author_name` | Author Name | STRING |  | datasourceColumn | Name of the person who submitted the image |
| `blurred_output_image_rid` | Blurred Output Image Rid | STRING |  | datasourceColumn | RID of the privacy-preserved blurred output image |
| `consent_to_processing` | Consent To Processing | BOOLEAN |  | datasourceColumn | Whether user has consented to image processing |
| `contact_id` | Contact Id | STRING |  | datasourceColumn | Foreign key to Funnelbox Contact |
| `email` | Email | STRING |  | datasourceColumn | Email address of the person who submitted the structural analysis image |
| `gender` | Gender | STRING |  | datasourceColumn | Gender of the person |
| `height_cm` | Height Cm | INTEGER |  | datasourceColumn | Person's height in centimeters |
| `image_count` | Image Count | INTEGER |  | datasourceColumn |  |
| `image_name` | Image Name | STRING |  | datasourceColumn |  |
| `image_url` | Image Url | STRING |  | datasourceColumn | URL to access the original uploaded image |
| `image_urls` | Image Urls | STRING |  | datasourceColumn |  |
| `image_use_marketing` | Image Use Marketing | BOOLEAN |  | datasourceColumn | Consent to use the image for marketing purposes |
| `image_use_summit` | Image Use Summit | BOOLEAN |  | datasourceColumn | Consent to use the image in Summit events |
| `image_use_training` | Image Use Training | BOOLEAN |  | datasourceColumn | Consent to use the image for AI training |
| `input_image_rid` | Input Image Rid | STRING |  | datasourceColumn | RID of the original input image in media storage |
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn | RID of the associated media item |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `output_image_rid` | Output Image Rid | STRING |  | datasourceColumn | RID of the processed output image with analysis overlay |
| `pk` | Pk | STRING | PK | datasourceColumn |  |
| `processing_status` | Processing Status | STRING |  | datasourceColumn | Current status of image processing (e.g., success, pending, failed) |
| `self_appearance` | Self Appearance | BOOLEAN |  | datasourceColumn |  |
| `slot_label` | Slot Label | STRING |  | datasourceColumn |  |
| `slot_number` | Slot Number | INTEGER |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `uid` | Uid | STRING |  | datasourceColumn |  |
| `unique_id` | Unique Id | STRING |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |
| `view` | View | STRING |  | datasourceColumn | Body view perspective of the image (front, back, side, etc.) |
| `weight_kg` | Weight Kg | DOUBLE |  | datasourceColumn | Person's weight in kilograms |

---

## Strukturanalyse

**Table:** `strukturanalyse`  
**Foundry apiName:** `Strukturanalyse`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `author_name` | Author Name | STRING |  | datasourceColumn |  |
| `author_profile_image` | Author Profile Image | STRING |  | datasourceColumn |  |
| `author_profile_url` | Author Profile Url | STRING |  | datasourceColumn |  |
| `category` | Category | STRING |  | datasourceColumn |  |
| `comments_count` | Comments Count | INTEGER |  | datasourceColumn |  |
| `community` | Community | STRING |  | datasourceColumn |  |
| `created_ts` | Created Ts | TIMESTAMP |  | datasourceColumn |  |
| `image_url` | Image Url | STRING |  | datasourceColumn |  |
| `likes_count` | Likes Count | INTEGER |  | datasourceColumn |  |
| `media_item_rid` | Media Item rID | STRING | PK | datasourceColumn |  |
| `media_item_rid2` | Media Item Rid 2 | ARRAY |  | datasourceColumn |  |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `medie_reference_string` | Medie Reference String | ARRAY |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `post_author_user_id_skool` | Post Author User Id Skool | STRING |  | datasourceColumn |  |
| `post_content` | Post Content | STRING |  | datasourceColumn |  |
| `post_date` | Post Date | TIMESTAMP |  | datasourceColumn |  |
| `post_files_url` | Post Files Url | ARRAY |  | datasourceColumn |  |
| `post_id` | Post Id | STRING |  | datasourceColumn |  |
| `post_images_url` | Post Images Url | ARRAY |  | datasourceColumn |  |
| `post_title` | Post Title | STRING |  | datasourceColumn |  |
| `post_url` | Post Url | STRING |  | datasourceColumn |  |
| `post_videos_url` | Post Videos Url | ARRAY |  | datasourceColumn |  |
| `sa_feedback_de` | Sa Feedback De | STRING |  | datasourceColumn |  |

---

## Strukturanalyse for OSDK

**Table:** `strukturanalyse_for_osdk`  
**Foundry apiName:** `StrukturanalyseForOsdk`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `all_landmarks` | All Landmarks | STRING |  | datasourceColumn |  |
| `filename_in_final` | Filename In Final | STRING |  | datasourceColumn |  |
| `filename_in_raw` | Filename In Raw | STRING |  | datasourceColumn |  |
| `formatted_timestamp` | Formatted Timestamp | STRING |  | datasourceColumn |  |
| `image_name` | Image Name | STRING |  | datasourceColumn |  |
| `landmarks` | Landmarks | STRING |  | datasourceColumn |  |
| `measurements` | Measurements | STRING |  | datasourceColumn |  |
| `model` | Model | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `processed_media_item_rid` | Processed Media Item Rid | STRING |  | datasourceColumn |  |
| `processed_media_reference` | Processed Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `processing_status` | Processing Status | STRING |  | datasourceColumn |  |
| `prompt_version` | Prompt Version | STRING |  | datasourceColumn |  |
| `raw_media_reference` | Raw Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `raw_media_rid` | Raw Media Rid | STRING |  | datasourceColumn |  |
| `segmentation` | Segmentation | STRING |  | datasourceColumn |  |
| `standardization` | Standardization | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `strukturanalyse_text` | Strukturanalyse Text | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `validation` | Validation | STRING |  | datasourceColumn |  |

---

## Subscription

**Table:** `subscription`  
**Foundry apiName:** `Subscription`  
**Status:** active  
**Datasources:** 1  
**Description:** User's access to a program. Derived from contracts and/or app assignments. Extensions grouped under first contract ID with summed duration.  

**Relationships:**
- has many **LogSetupWebAppUser** (link: "Log Entry")
- has many **SubscriptionPause** (link: "Subscription Pause")
- belongs to **Cohort** via `cohort_slug` (link: "Cohort")
- belongs to **Program** via `program_id` (link: "Program")
- has many **SessionParticipationSubscription** (link: "Session Participation Subscription")
- has many **Opportunity** (link: "Opportunity")
- belongs to **AppUser** via `app_user_id` (link: "App User")
- has many **LogWebhookAppUpdateSubscriptionStatuses** (link: "[Log] [Webhook][App] Update Subscription Statuses")
- has many **SubscriptionModuleProgress** (link: "Subscription Module Progress")
- belongs to **Customer** via `customer_id` (link: "Customer")
- has many **LogUpdateSubscriptionStatus** (link: "[Log] [Webhook][App] Update User Subscription Statuses")
- has many **LogCreateSubscriptionPause** (link: "Log Entry")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_user_id` | App User Id | STRING |  | redacted |  |
| `cohort_slug` | Cohort Slug | STRING |  | redacted | Identifier for the cohort/batch the subscriber belongs to. |
| `customer_id` | Customer Id | STRING |  | redacted |  |
| `days_since_start` | Days Since Start | INTEGER |  | redacted | DOES NOT CONSIDER CHANGES OF START DATE ON ONTOLOGY SIDE! |
| `days_until_end` | Days Until End | INTEGER |  | redacted | DOES NOT CONSIDER CHANGES OF START DATE ON ONTOLOGY SIDE! |
| `duration_days` | Duration Days | INTEGER |  | redacted |  |
| `end_date` | End Date | DATE |  | redacted | Subscription end date. Conditional formatting highlights null values in red. |
| `program_assigned_in_web_app` | Is Program assigned In Web App | BOOLEAN |  | redacted | Whether the user can access program content in the app. True = access granted. |
| `program_id` | Program Id | STRING |  | redacted |  |
| `start_date` | Start Date | DATE |  | redacted | Subscription start date. Conditional formatting highlights null values in red. |
| `subscription_app_status` | Subscription App Status | STRING |  | redacted |  |
| `subscription_app_updated_at` | Subscription App Updated At | TIMESTAMP |  | redacted | Timestamp of last update from the web app. Used to determine which update to keep for a subscription. |
| `subscription_id` | Subscription Id | STRING | PK | redacted | Primary key - unique identifier for each subscription record. |
| `subscription_name` | Subscription Name | STRING |  | redacted | Human-readable name of the subscription, typically derived from the program name. |
| `subscription_pause_days` | Subscription Pause Days | LONG |  | redacted | Total days the subscription has been paused. |

---

## Subscription Lecture Progress

**Table:** `subscription_lecture_progress`  
**Foundry apiName:** `SubscriptionLectureProgress`  
**Status:** experimental  
**Datasources:** 1  
**Description:** User's completion status for lectures in their program. Same lecture may appear multiple times within a module.  

**Relationships:**
- belongs to **AppLecture** via `app_lecture_id` (link: "App Lecture")
- belongs to **SubscriptionModuleProgress** via `subscription_module_progress_id` (link: "Subscription Module Progress")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_lecture_id` | App Lecture Id | STRING |  | redacted |  |
| `end_timestamp` | End Timestamp | TIMESTAMP |  | redacted |  |
| `lecture_name` | Lecture Name | STRING |  | redacted |  |
| `lecture_progress_status` | Lecture Progress Status | STRING |  | redacted |  |
| `position` | Position | LONG |  | redacted |  |
| `subscription_lecture_progress_id` | Subscription Lecture Progress Id | STRING | PK | redacted |  |
| `subscription_module_progress_id` | Subscription Module Progress Id | STRING |  | redacted |  |

---

## Subscription Module Progress

**Table:** `subscription_module_progress`  
**Foundry apiName:** `SubscriptionModuleProgress`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **Subscription** via `subscription_id` (link: "Subscription")
- belongs to **AppModule** via `app_module_id` (link: "App Module")
- has many **SubscriptionLectureProgress** (link: "Subscription Lecture Progress")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_module_id` | App Module Id | STRING |  | redacted |  |
| `app_user_id` | App User Id | STRING |  | redacted |  |
| `end_timestamp` | End Timestamp | TIMESTAMP |  | redacted |  |
| `module_description` | Module Description | STRING |  | redacted |  |
| `module_name` | Module Name | STRING |  | redacted |  |
| `module_progress_status` | Module Progress Status | STRING |  | redacted |  |
| `module_url` | Module Url | STRING |  | redacted |  |
| `start_timestamp` | Start Timestamp | TIMESTAMP |  | redacted |  |
| `subscription_id` | Subscription Id | STRING |  | redacted |  |
| `subscription_module_progress_id` | Subscription Module Progress Id | STRING | PK | redacted |  |

---

## Subscription Pause

**Table:** `subscription_pause`  
**Foundry apiName:** `SubscriptionPause`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **Subscription** via `subscription_id` (link: "Subscription")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `pause_days` | Pause Days | INTEGER |  | redacted |  |
| `pause_end` | Pause End | DATE |  | redacted |  |
| `pause_id` | Pause Id | STRING | PK | redacted |  |
| `pause_start` | Pause Start | DATE |  | redacted |  |
| `pause_title` | Pause Title | STRING |  | redacted |  |
| `reason` | Reason | STRING |  | redacted |  |
| `subscription_id` | Subscription Id | STRING |  | redacted |  |

---

## [Summit App] Daily Survey Answer

**Table:** `summit_app_daily_survey_answer`  
**Foundry apiName:** `SummitAppDailySurveyAnswer`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SummitAppUser** via `user_id` (link: "[Summit App] User")
- belongs to **SummitAppDailySurveyQuestion** via `question_id` (link: "[Summit App] Daily Survey Question")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | datasourceColumn |  |
| `answer_id` | Answer Id | STRING | PK | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `display_name` | Display Name | STRING |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `question_id` | Question Id | STRING |  | datasourceColumn |  |
| `survey_id` | Survey Id | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |

---

## [Summit App] Daily Survey Question

**Table:** `summit_app_daily_survey_question`  
**Foundry apiName:** `SummitAppDailySurveyQuestion`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **SummitAppDailySurveyAnswer** (link: "[Summit App] Daily Survey Answer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer_options` | Answer Options | ARRAY |  | datasourceColumn |  |
| `comment` | Comment | STRING |  | datasourceColumn |  |
| `date` | Date | DATE |  | datasourceColumn |  |
| `date_string` | Date String | STRING |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |
| `question_id` | Question Id | STRING | PK | datasourceColumn |  |
| `question_order` | Question Order | INTEGER |  | datasourceColumn |  |
| `question_type` | Question Type | STRING |  | datasourceColumn |  |
| `required` | Required | BOOLEAN |  | datasourceColumn |  |
| `survey_id` | Survey Id | STRING |  | datasourceColumn |  |

---

## [Summit App] Mindset

**Table:** `summit_app_mindset`  
**Foundry apiName:** `SummitAppMindset`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SummitAppUser** via `uid` (link: "[Summit App] User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `image_url` | Image Url | STRING |  | datasourceColumn |  |
| `q1` | q1 | STRING |  | datasourceColumn |  |
| `q2` | q2 | STRING |  | datasourceColumn |  |
| `q3` | q3 | STRING |  | datasourceColumn |  |
| `session_id` | Session Id | STRING | PK | datasourceColumn |  |
| `session_number` | Session Number | INTEGER |  | datasourceColumn |  |
| `session_title` | Session Title | STRING |  | datasourceColumn |  |
| `uid` | Uid | STRING |  | datasourceColumn |  |

---

## [Summit App] Moment

**Table:** `summit_app_moment`  
**Foundry apiName:** `SummitAppMoment`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SummitAppUser** via `uid` (link: "[Summit App] User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `created_at_us` | Created At Us | TIMESTAMP |  | datasourceColumn |  |
| `display_name` | Display Name | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `is_shared` | Is Shared | BOOLEAN |  | datasourceColumn |  |
| `marketing_offer_days_from_start` | Marketing Offer Days From Start | LONG |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `number_of_characters` | Number Of Characters | INTEGER |  | datasourceColumn |  |
| `number_of_words` | Number Of Words | INTEGER |  | datasourceColumn |  |
| `o_count` | O Count | INTEGER |  | datasourceColumn |  |
| `primary_emotion` | Primary Emotion | STRING |  | datasourceColumn |  |
| `shared_at_us` | Shared At Us | TIMESTAMP |  | datasourceColumn |  |
| `shared_with_sales_rep` | Shared With Sales Rep | BOOLEAN |  | datasourceColumn |  |
| `summit_day_string` | Summit Day String | STRING |  | datasourceColumn |  |
| `symptoms` | Symptoms | ARRAY |  | datasourceColumn |  |
| `synced_at_us` | Synced At Us | TIMESTAMP |  | datasourceColumn |  |
| `tags` | Tags | STRING |  | datasourceColumn |  |
| `tags_array` | Tags Array | ARRAY |  | datasourceColumn |  |
| `text` | Text | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `uid` | Uid | STRING |  | datasourceColumn |  |
| `user_name` | User Name | STRING |  | datasourceColumn |  |
| `wow_factor_justification` | Wow Factor Justification | STRING |  | datasourceColumn |  |
| `wow_factor_score` | Wow Factor Score | INTEGER |  | datasourceColumn |  |

---

## Summit app Strukturanalyse

**Table:** `summit_app_strukturanalyse`  
**Foundry apiName:** `SummitAppStrukturanalyse`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `confidence` | Confidence | FLOAT |  | datasourceColumn |  |
| `directory` | Directory | STRING |  | datasourceColumn |  |
| `error` | Error | STRING |  | datasourceColumn |  |
| `extension` | Extension | STRING |  | datasourceColumn |  |
| `filename` | Filename | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `is_valid` | Is Valid | BOOLEAN |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING |  | datasourceColumn |  |
| `rejection_reasons` | Rejection Reasons | ARRAY |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | STRING |  | datasourceColumn |  |
| `warnings` | Warnings | ARRAY |  | datasourceColumn |  |

---

## [Summit App] User

**Table:** `summit_app_user`  
**Foundry apiName:** `SummitAppUser`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **SummitAppMoment** (link: "[Summit App] Moment")
- has many **SummitAppVideoWatchData** (link: "[Summit App] Video Watch Datum")
- has many **SummitAppMindset** (link: "[Summit App] Mindset")
- has many **SummitAppDailySurveyAnswer** (link: "[Summit App] Daily Survey Answer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `display_name` | Display Name | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `phone_number` | Phone Number | STRING |  | datasourceColumn |  |
| `uid` | Uid | STRING | PK | datasourceColumn |  |

---

## [Summit App] Video Watch Data

**Table:** `summit_app_video_watch_data`  
**Foundry apiName:** `SummitAppVideoWatchData`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **SummitAppUser** via `uid` (link: "[Summit App] User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `completed` | Completed | BOOLEAN |  | datasourceColumn |  |
| `completed_at` | Completed At | STRING |  | datasourceColumn |  |
| `completion_percentage` | Completion Percentage | DOUBLE |  | datasourceColumn |  |
| `display_name` | Display Name | STRING |  | datasourceColumn |  |
| `duration` | Duration | INTEGER |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `first_watched_at` | First Watched At | STRING |  | datasourceColumn |  |
| `last_pos` | Last Pos | INTEGER |  | datasourceColumn |  |
| `last_watched_at` | Last Watched At | STRING |  | datasourceColumn |  |
| `synced_at` | Synced At | STRING |  | datasourceColumn |  |
| `total_watch_time` | Total Watch Time | INTEGER |  | datasourceColumn |  |
| `uid` | Uid | STRING |  | datasourceColumn |  |
| `updated_at` | Updated At | TIMESTAMP |  | datasourceColumn |  |
| `video_id` | Video Id | STRING |  | datasourceColumn |  |
| `video_title` | Video Title | STRING |  | datasourceColumn |  |
| `video_watch_id` | Video Watch Id | STRING | PK | datasourceColumn |  |
| `watch_count` | Watch Count | INTEGER |  | datasourceColumn |  |
| `watched_ranges` | Watched Ranges | STRING |  | datasourceColumn |  |

---

## Summit App Zoom Recordings

**Table:** `summit_app_zoom_recordings`  
**Foundry apiName:** `SummitAppZoomRecordings`  
**Status:** active  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `download_url` | Download Url | STRING |  | datasourceColumn |  |
| `duration` | Duration | INTEGER |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `recording_type` | Recording Type | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `start_time_session` | Start Time Session | TIMESTAMP |  | datasourceColumn |  |
| `test_recording_time` | Test Recording Time | TIMESTAMP |  | datasourceColumn |  |
| `transcript_download_url` | Transcript Download Url | STRING |  | datasourceColumn |  |
| `unique_id` | Unique Id | STRING | PK | datasourceColumn |  |

---

## Summit Profile

**Table:** `summit_profile`  
**Foundry apiName:** `SummitProfile`  
**Status:** experimental  
**Datasources:** 2  

**Relationships:**
- has many **LogDeleteMultipleSummitProfile** (link: "[Log] Delete multiple Summit Profiles")
- has many **LogCreateSummitProfileFromId** (link: "[Log] Create Summit Profile FULL")
- has many **IdMatch** (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `approved` | Approved | BOOLEAN |  | datasourceColumn |  |
| `auto_freigabe` | Auto Freigabe | STRING |  | datasourceColumn |  |
| `brief_justus` | Brief Justus | STRING |  | editOnly |  |
| `brief_justus_betreff` | Brief Justus - Betreff | STRING |  | editOnly |  |
| `brief_justus_exported` | Brief Justus - Exported | BOOLEAN |  | editOnly |  |
| `brief_justus_testimonials` | Brief Justus Testimonials | STRING |  | editOnly |  |
| `brief_justus_testimonials_betreff` | Brief Justus  Testimonials - Betreff | STRING |  | editOnly |  |
| `brief_justus_testimonials_exported` | Brief Justus Testimonials - Exported | STRING |  | editOnly |  |
| `close_contact_id` | Close Contact Id | ARRAY |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | ARRAY |  | datasourceColumn |  |
| `edited` | Edited | BOOLEAN |  | datasourceColumn |  |
| `einwaende_kauf` | Einwaende Kauf | STRING |  | datasourceColumn |  |
| `einwaende_schmerzfrei` | Einwaende Schmerzfrei | STRING |  | datasourceColumn |  |
| `email` | Email | STRING | PK | datasourceColumn |  |
| `exported` | Exported | BOOLEAN |  | datasourceColumn |  |
| `exported_summit_profile` | Exported Summit Profile | TIMESTAMP |  | datasourceColumn |  |
| `feedback` | Feedback | STRING |  | datasourceColumn |  |
| `freigabe_grund` | Freigabe Grund | STRING |  | datasourceColumn |  |
| `freigabe_tag` | Freigabe Tag | STRING |  | datasourceColumn |  |
| `total_text` | Gesamt Text | STRING |  | datasourceColumn |  |
| `ghl_contact_ids` | Ghl Contact Ids | ARRAY |  | datasourceColumn |  |
| `ghl_id` | Ghl Id | STRING |  | datasourceColumn |  |
| `kaufeinwand_begruendung` | KaufeinwandBegruendung | STRING |  | editOnly |  |
| `kaufeinwand_typ` | KaufeinwandTyp | STRING |  | editOnly |  |
| `last_rerun_triggered` | Last Rerun Triggered | TIMESTAMP |  | datasourceColumn |  |
| `leidensdruck` | Leidensdruck | STRING |  | datasourceColumn |  |
| `link_doc` | Link Doc | STRING |  | datasourceColumn |  |
| `mindset_positiv` | Mindset Positiv | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `new_property1` | PandaDoc Sent | BOOLEAN |  | editOnly |  |
| `num_tickets` | Num Tickets | LONG |  | datasourceColumn |  |
| `num_zoom_meetings` | Num Zoom Meetings | LONG |  | datasourceColumn |  |
| `pandadoc_ids` | Pandadoc Ids | ARRAY |  | datasourceColumn |  |
| `postlink` | Postlink | STRING |  | datasourceColumn |  |
| `prelink` | Prelink | STRING |  | datasourceColumn |  |
| `prompt_verbesserung` | Prompt Verbesserung | STRING |  | datasourceColumn |  |
| `psychologisches_profil` | Psychologisches Profil | STRING |  | datasourceColumn |  |
| `sales_blockaden_stichpunkte` | Sales Blockaden Stichpunkte | STRING |  | editOnly |  |
| `sales_rep` | SalesRep | STRING |  | editOnly |  |
| `subject` | Subject | STRING |  | datasourceColumn |  |
| `subject_backup` | Subject Backup | STRING |  | datasourceColumn |  |
| `summit_profile_triggered` | Summit Profile Triggered | TIMESTAMP |  | datasourceColumn |  |
| `tags` | Tags | ARRAY |  | datasourceColumn |  |
| `tags_zoom_keywords` | Tags Zoom Keywords | ARRAY |  | datasourceColumn |  |
| `total_text_backup` | Total Text Backup | STRING |  | datasourceColumn |  |
| `wuensche_und_traeume` | Wuensche Und Traeume | STRING |  | datasourceColumn |  |
| `zoom_meeting_ids` | Zoom Meeting Ids | ARRAY |  | datasourceColumn |  |
| `zoom_meeting_instance_ids` | Zoom Meeting Instance Ids | ARRAY |  | datasourceColumn |  |
| `zoom_participant_uuids` | Zoom Participant Uuids | ARRAY |  | datasourceColumn |  |
| `zoom_ticket_ids` | Zoom Ticket Ids | ARRAY |  | datasourceColumn |  |
| `zoom_user_ids` | Zoom User Ids | ARRAY |  | datasourceColumn |  |

---

## [Summit] Session Chat Participation

**Table:** `summit_session_chat_participation`  
**Foundry apiName:** `SummitSessionChatParticipation`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_instance_id_1` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `end_time` | End Time | TIMESTAMP |  | redacted |  |
| `event_id` | Event ID | STRING |  | redacted |  |
| `latest_message` | Latest Message | TIMESTAMP |  | redacted |  |
| `meeting_id` | Meeting ID | STRING |  | redacted |  |
| `meeting_instance_id` | Meeting Instance ID | STRING |  | redacted |  |
| `num_messages_sent` | Num Messages Sent | LONG |  | redacted |  |
| `num_words_written` | Num Words Written | LONG |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `sender_email` | Sender Email | STRING |  | redacted |  |
| `sender_name` | Sender Name | STRING |  | redacted |  |
| `session_id` | Session ID | STRING |  | redacted |  |
| `session_topic` | Session Topic | STRING |  | redacted |  |
| `start_time` | Start Time | TIMESTAMP |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## Summit  Strukturanalyse WA

**Table:** `summit_strukturanalyse_wa`  
**Foundry apiName:** `SummitStrukturanalyseWa`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `all_landmarks` | All Landmarks | ARRAY |  | datasourceColumn |  |
| `analysis_text` | Analysis Text | STRUCT |  | datasourceColumn |  |
| `analysis_text_only` | analysis_text_only | STRING |  | datasourceColumn |  |
| `clean_path` | Clean Path | STRING |  | datasourceColumn |  |
| `confidence` | Confidence | FLOAT |  | datasourceColumn |  |
| `directory` | Directory | STRING |  | datasourceColumn |  |
| `error` | Error | STRING |  | datasourceColumn |  |
| `extension` | Extension | STRING |  | datasourceColumn |  |
| `file_extension` | File Extension | STRING |  | datasourceColumn |  |
| `filename` | Filename | STRING |  | datasourceColumn |  |
| `formatted_timestamp` | Formatted Timestamp | STRING |  | datasourceColumn |  |
| `id` | Id | STRING |  | datasourceColumn |  |
| `image_name` | Image Name | STRING |  | datasourceColumn |  |
| `input_error` | Input Error | STRING |  | datasourceColumn |  |
| `input_image_rid` | Input Image Rid | STRING |  | datasourceColumn |  |
| `input_okconfidence` | Input Okconfidence | FLOAT |  | datasourceColumn |  |
| `input_okis_valid` | Input Okis Valid | BOOLEAN |  | datasourceColumn |  |
| `input_okrejection_reasons` | Input Okrejection Reasons | ARRAY |  | datasourceColumn |  |
| `input_okwarnings` | Input Okwarnings | ARRAY |  | datasourceColumn |  |
| `is_path_valid` | Is Path Valid | BOOLEAN |  | datasourceColumn |  |
| `is_valid` | Is Valid | BOOLEAN |  | datasourceColumn |  |
| `landmarks` | Landmarks | STRING |  | datasourceColumn |  |
| `measurements` | Measurements | STRING |  | datasourceColumn |  |
| `output_image_rid` | Output Image Rid | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `processed_error` | Processed Error | STRING |  | datasourceColumn |  |
| `processed_media_reference` | Processed Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `processed_ok_confidence` | Processed Ok Confidence | FLOAT |  | datasourceColumn |  |
| `processed_ok_is_valid` | Processed Ok Is Valid | BOOLEAN |  | datasourceColumn |  |
| `processed_ok_rejection_reasons` | Processed Ok Rejection Reasons | ARRAY |  | datasourceColumn |  |
| `processed_ok_warnings` | Processed Ok Warnings | ARRAY |  | datasourceColumn |  |
| `processing_status` | Processing Status | STRING |  | datasourceColumn |  |
| `raw_media_reference` | Raw Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `record_id` | Record Id | STRING |  | datasourceColumn |  |
| `rejection_reasons` | Rejection Reasons | ARRAY |  | datasourceColumn |  |
| `standardization` | Standardization | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | STRING |  | datasourceColumn |  |
| `validation` | Validation | STRING |  | datasourceColumn |  |
| `warnings` | Warnings | ARRAY |  | datasourceColumn |  |

---

## Task-Kontext[AST]

**Table:** `task_kontext_ast`  
**Foundry apiName:** `TaskKontextAst`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ArminsTasks** (link: "Task[AST]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `description` | Description | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## [Temp] Opportunities for alerts

**Table:** `temp_opportunities_for_alerts`  
**Foundry apiName:** `TempOpportunitiesForAlerts`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Used to export all the 'subscription end dates' from the crm to ontology.  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `alert_assignee` | Alert Assignee | STRING |  | redacted |  |
| `alert_count` | Alert Count | LONG |  | redacted |  |
| `alert_issues` | Alert Issues | ARRAY |  | redacted |  |
| `alert_note` | Alert Note | STRING |  | redacted |  |
| `alert_status` | Alert Status | STRING |  | redacted | The review status of the alert (e.g., 'To Review', 'Reviewed', 'Resolved') |
| `assigned_to` | Assigned To | STRING |  | redacted |  |
| `contact_email` | Contact Email | STRING |  | redacted |  |
| `contact_first_name` | Contact First Name | STRING |  | redacted |  |
| `contact_id` | Contact Id | STRING |  | redacted |  |
| `contact_last_name` | Contact Last Name | STRING |  | redacted |  |
| `contract_count` | Contract Count | LONG |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `customer_id` | Customer ID | STRING |  | redacted | Reference to the Customer object associated with this opportunity |
| `id` | Id | STRING | PK | redacted |  |
| `last_stage_change_at` | Last Stage Change At | TIMESTAMP |  | redacted |  |
| `last_status_change_at` | Last Status Change At | TIMESTAMP |  | redacted |  |
| `lzr_end` | Lzr End | DATE |  | redacted |  |
| `lzr_ende_kulanz` | Lzr Ende Kulanz | DATE |  | redacted |  |
| `lzr_start` | Lzr Start | DATE |  | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `opportunity_calculated_program_id` | Opportunity Calculated Program Id | STRING |  | redacted |  |
| `opportunity_calculated_program_name` | Opportunity Calculated Program Name | STRING |  | redacted |  |
| `opportunity_duration_months` | Opportunity Duration Months | LONG |  | redacted |  |
| `pipeline_duration_months` | Pipeline Duration Months | LONG |  | redacted |  |
| `pipeline_duration_months_matches_contract` | Pipeline Duration Months Matches Contract | BOOLEAN |  | redacted |  |
| `pipeline_duration_months_matches_subscription` | Pipeline Duration Months Matches Subscription | BOOLEAN |  | redacted |  |
| `pipeline_id` | Pipeline Id | STRING |  | redacted |  |
| `pipeline_name` | Pipeline Name | STRING |  | redacted |  |
| `pipeline_stage_id` | Pipeline Stage Id | STRING |  | redacted |  |
| `pipeline_stage_uid` | Pipeline Stage Uid | STRING |  | redacted |  |
| `recommended_subscription_id` | Recommended Subscription ID | STRING |  | redacted | Suggested subscription match when only one subscription is linked to this opportunity (based on 7-tier matching logic) |
| `source` | Source | STRING |  | redacted |  |
| `status` | Opportunity Status | STRING |  | redacted |  |
| `subscription_count` | Subscription Count | LONG |  | redacted |  |
| `updated_at` | Updated At | TIMESTAMP |  | redacted |  |

---

## [Fluent] Ticket Activity

**Table:** `ticket_activity_fluent`  
**Foundry apiName:** `TicketActivityFluent`  
**Status:** active  
**Datasources:** 1  
**Description:** Individual messages and activities within Fluent Support tickets. Tracks all communication between customers and support agents.

**📊 Data Statistics:**
*Last updated: February 3rd, 2026 at 13:09 CET — Statistics may be outdated; refresh if needed.*

- Total Activities: 63,162 records
- Unique Tickets: 12,531
- Unique Senders: 1,035

**Sender Person Type Distribution:**
- Agent: 52,063 (82%)
- Customer: 10,298 (16%)
- Unknown: 801 (1%)

**Conversation Type Distribution:**
- Internal Info: 31,496 (50%)
- Response: 26,059 (41%)
- Note: 4,890 (8%)
- Ticket Split Activity: 369
- Ticket Merge Activity: 348

**Source Distribution:**
- Web: 56,086 (89%)
- Email: 7,024 (11%)

**Key Relationships:**
- Links to parent Ticket [Fluent]
- Links to Response Log for API tracking

**Primary Use Cases:**
- Full conversation history tracking
- Response time analysis
- Agent performance metrics
- Customer communication patterns
- Ticket resolution workflows

**Data Freshness:** Real-time sync from Fluent Support API  

**Relationships:**
- belongs to **TicketFluent** via `ticket_id` (link: "Ticket [Fluent]")
- has many **LogFluentApiRespondTicket** (link: "[Log] [Fluent] API Respond Ticket")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `conversation_type` | Conversation Type | STRING |  | redacted |  |
| `created_ts` | Created at | STRING |  | redacted |  |
| `email_message_id` | Email Message ID | STRING |  | redacted |  |
| `is_important` | Is Important | STRING |  | redacted |  |
| `message_content` | Message Content | STRING |  | redacted |  |
| `response_id` | Response ID | STRING | PK | redacted |  |
| `sender_email` | Sender Email | STRING |  | redacted |  |
| `sender_full_name` | Sender Full Name | STRING |  | redacted |  |
| `sender_id` | Sender Id | STRING |  | redacted |  |
| `sender_person_type` | Sender Person Type | STRING |  | redacted |  |
| `source` | Source | STRING |  | redacted |  |
| `ticket_id` | Ticket ID | STRING |  | redacted |  |
| `ticket_initial_message` | Ticket Initial Message | STRING |  | redacted |  |
| `ticket_response_count` | Ticket Response Count | INTEGER |  | redacted |  |
| `ticket_title` | Ticket Title | STRING |  | redacted |  |
| `timestamp` | Updated at | STRING |  | redacted |  |

---

## Ticket [Fluent]

**Table:** `ticket_fluent`  
**Foundry apiName:** `TicketFluent`  
**Status:** active  
**Datasources:** 3  
**Description:** Customer support tickets from the Fluent Support helpdesk system. Tracks customer inquiries, issues, and support interactions.

**📊 Data Statistics:**
*Last updated: February 3rd, 2026 at 13:09 CET — Statistics may be outdated; refresh if needed.*

- Total Tickets: ~12,500+ unique tickets
- Total Activities: 63,162 ticket activities
- Unique Senders: 1,035

**Activity Distribution:**
- Agent messages: 52,063 (82%)
- Customer messages: 10,298 (16%)
- Internal notes: ~4,890

**Conversation Types:**
- Internal Info: 31,496
- Responses: 26,059
- Notes: 4,890
- Ticket Splits/Merges: ~700

**Source Distribution:**
- Web: 56,086 (89%)
- Email: 7,024 (11%)

**Key Relationships:**
- Links to Customer via email
- Links to App User via customer_app_user_id  
- Links to Ticket Activities/Responses
- Links to LLM Clusters for AI categorization
- Links to Fluent Agents

**LLM Features:**
- AI-generated summaries (llmSummary)
- AI categorization (llmCategory, llmCluster)
- Embedded ticket summaries for semantic search

**Primary Use Cases:**
- Customer support management
- Issue tracking and resolution
- Support performance metrics (first response time, close time)
- AI-assisted categorization and clustering
- Customer satisfaction monitoring

**Data Freshness:** Real-time sync from Fluent Support API  

**Relationships:**
- belongs to **CustomerFluent** via `ticket_customer_id` (link: "Customer [Fluent]")
- belongs to **AgentFluent** via `agent_email` (link: "Agent [Fluent]")
- has many **TicketActivityFluent** (link: "Ticket Response [Fluent]")
- has many **IssueFluent** (link: "Issue [Fluent]")
- has many **UserMediaReference** (link: "User Media Reference")
- has many **TicketIssueStatsFluent** (link: "Ticket-Issue Stats [Fluent]")
- belongs to **AppUser** via `customer_app_user_id` (link: "Customer App User")
- belongs to **Customer** via `customer_email` (link: "Customer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_email` | Agent eMail | STRING |  | redacted |  |
| `agent_full_name` | Agent Full Name | STRING |  | redacted |  |
| `agent_id` | Agent Id | STRING |  | redacted |  |
| `assigned_to_suppor_level` | Assigned To Suppor Level | STRING |  | redacted |  |
| `closed_by` | Closed By | STRING |  | redacted |  |
| `closed_by_email` | Closed By Email | STRING |  | redacted |  |
| `closed_by_full_name` | Closed by | STRING |  | redacted |  |
| `closed_by_suppor_level` | Closed By Suppor Level | STRING |  | redacted |  |
| `customer_app_user_id` | Customer App User Id | STRING |  | redacted |  |
| `customer_email` | Customer Email | STRING |  | redacted |  |
| `customer_email_first` | Customer Email v2 | STRING |  | datasourceColumn |  |
| `customer_full_name` | Customer Name | STRING |  | redacted |  |
| `first_response_time` | First Response Time | INTEGER |  | redacted |  |
| `first_response_time_hours` | First Response Time Hours | DOUBLE |  | redacted |  |
| `initial_ticket_message` | Initial Ticket Message | STRING |  | redacted |  |
| `last_agent_response` | Last Agent Response | STRING |  | redacted |  |
| `last_customer_response` | Last Customer Response | STRING |  | redacted |  |
| `llm_category` | LLM Category | STRING |  | redacted |  |
| `llm_cluster` | LLM Cluster | STRING |  | redacted |  |
| `mailbox_email` | Mailbox Email | STRING |  | redacted |  |
| `message_id` | Message Id | STRING |  | redacted |  |
| `privacy` | Privacy | STRING |  | redacted |  |
| `product` | Product | STRING |  | redacted |  |
| `resolved_at` | Resolved At | TIMESTAMP |  | redacted |  |
| `response_count_int` | Response Count | INTEGER |  | redacted |  |
| `secret_content` | Secret Content | STRING |  | redacted |  |
| `slug` | Slug | STRING |  | redacted |  |
| `tags` | Tags | ARRAY |  | redacted |  |
| `ticket_client_priority` | Ticket Client Priority | STRING |  | redacted |  |
| `ticket_collected` | Ticket Content | STRING |  | datasourceColumn |  |
| `ticket_content_anonymised` | Ticket Content Anonymised | STRING |  | datasourceColumn |  |
| `ticket_created_at` | Ticket created at | TIMESTAMP |  | redacted |  |
| `ticket_customer_id` | Customer ID | STRING |  | redacted |  |
| `ticket_id` | Ticket ID | STRING | PK | datasourceColumn |  |
| `ticket_priority` | Ticket Priority | STRING |  | redacted |  |
| `ticket_product_source` | Ticket Product Source | STRING |  | redacted |  |
| `ticket_source` | Ticket Source | STRING |  | redacted |  |
| `ticket_status` | Ticket Status | STRING |  | redacted |  |
| `ticket_status_foundry` | Ticket Status Foundry | STRING |  | redacted |  |
| `ticket_sumary_500t` | Ticket Summary | STRING |  | datasourceColumn |  |
| `ticket_summary_anonymised` | Ticket Summary Anonymised | STRING |  | datasourceColumn |  |
| `ticket_summary_anonymised_embedding` | Ticket Summary Anonymised Embedding | VECTOR |  | datasourceColumn |  |
| `ticket_sumary_embedded` | Ticket Summary Embedded | VECTOR |  | datasourceColumn |  |
| `ticket_title` | Ticket Title | STRING |  | redacted |  |
| `ticket_title` | Ticket Title | STRING |  | datasourceColumn |  |
| `ticket_title_anonymised` | Ticket Title Anonymised | STRING |  | datasourceColumn |  |
| `ticket_url` | Ticket URL | STRING |  | redacted |  |
| `ticket_waiting_since` | Ticket Waiting Since | STRING |  | redacted |  |
| `timestamp_first` | Timestamp Anonymised | TIMESTAMP |  | datasourceColumn |  |
| `total_close_time` | Total Close Time | INTEGER |  | redacted |  |
| `total_close_time_hours` | Total Close Time Hours | DOUBLE |  | redacted |  |
| `updated_at` | Ticket updated at | TIMESTAMP |  | redacted |  |
| `updated_at_date` | Updated At Date | DATE |  | redacted |  |

---

## TOB

**Table:** `tob`  
**Foundry apiName:** `Tob`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `company_name` | Company Name | STRING | PK | datasourceColumn |  |
| `contact_email` | Contact Email | STRING |  | datasourceColumn |  |
| `contact_phone` | Contact Phone | STRING |  | datasourceColumn |  |
| `employee_count_or_revenue_bracket` | Employee Count Or Revenue Bracket | STRING |  | datasourceColumn |  |
| `founded` | Founded | STRING |  | datasourceColumn |  |
| `headquarters` | Headquarters | STRING |  | datasourceColumn |  |
| `industry` | Industry | STRING |  | datasourceColumn |  |
| `key_services` | Key Services | STRING |  | datasourceColumn |  |
| `logo_link` | Logo Link | STRING |  | datasourceColumn |  |
| `mission_statement` | Mission Statement | STRING |  | datasourceColumn |  |
| `size` | Size | STRING |  | datasourceColumn |  |
| `social_links` | Social Links | STRING |  | datasourceColumn |  |
| `target_audience` | Target Audience | STRING |  | datasourceColumn |  |
| `value_proposition` | Value Proposition | STRING |  | datasourceColumn |  |
| `website` | Website | STRING |  | datasourceColumn |  |

---

## [TOB] Youtube Analytics

**Table:** `tob_youtube_analytics`  
**Foundry apiName:** `TobYoutubeAnalytics`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `age_in_days` | Age In Days | LONG |  | datasourceColumn |  |
| `caption_fetched_at` | Caption Fetched At | STRING |  | datasourceColumn |  |
| `caption_text` | Caption Text | STRING |  | datasourceColumn |  |
| `channel_id` | Channel Id | STRING |  | datasourceColumn |  |
| `channel_title` | Channel Title | STRING |  | datasourceColumn |  |
| `comment_count` | Comment Count | LONG |  | datasourceColumn |  |
| `description` | Description | STRING |  | datasourceColumn |  |
| `duration_seconds` | Duration Seconds | LONG |  | datasourceColumn |  |
| `engagement_rate` | Engagement Rate | DOUBLE |  | datasourceColumn |  |
| `fetched_at` | Fetched At | STRING |  | datasourceColumn |  |
| `hooks` | Hooks | STRING |  | datasourceColumn |  |
| `lang_code` | Lang Code | STRING |  | datasourceColumn |  |
| `like_count` | Like Count | LONG |  | datasourceColumn |  |
| `published_at` | Published At | TIMESTAMP |  | datasourceColumn |  |
| `summary` | Summary | STRING |  | datasourceColumn |  |
| `thumbnail_high` | Thumbnail High | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `video_id` | Video Id | STRING | PK | datasourceColumn |  |
| `video_url` | Video Url | STRING |  | datasourceColumn |  |
| `view_count` | View Count | LONG |  | datasourceColumn |  |
| `views_per_day` | Views Per Day | DOUBLE |  | datasourceColumn |  |

---

## Touchpoint

**Table:** `touchpoint`  
**Foundry apiName:** `Touchpoint`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **InsightTypeResponse** (link: "Insight Type Response")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `context` | Context | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `foreign_key` | Foreign Key | STRING | PK | redacted |  |
| `source` | Source | STRING |  | redacted |  |
| `timestamp` | Timestamp | TIMESTAMP |  | redacted |  |
| `touchpoint_data` | Touchpoint Data | STRING |  | redacted |  |

---

## Touchpoint Utility Determinator Prompt

**Table:** `touchpoint_utility_determinator_prompt`  
**Foundry apiName:** `TouchpointUtilityDeterminatorPrompt`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `date_created` | Date created | TIMESTAMP |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `prompt` | Prompt | STRING |  | redacted |  |

---

## Touchpoint v2

**Table:** `touchpoint_v2`  
**Foundry apiName:** `TouchpointV2`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Representation of an individual touch point with a client  

**Relationships:**
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `content` | Content | STRING |  | datasourceColumn |  |
| `content_characters_count` | Content Characters Count | INTEGER |  | datasourceColumn |  |
| `content_context` | Content Context | STRING |  | datasourceColumn |  |
| `content_context_embeddings` | Content Context Embeddings | VECTOR |  | datasourceColumn |  |
| `content_tokens` | Content Tokens | DOUBLE |  | datasourceColumn |  |
| `context` | Context | STRING |  | datasourceColumn |  |
| `context_characters_count` | Context Characters Count | INTEGER |  | datasourceColumn |  |
| `context_tokens` | Context Tokens | DOUBLE |  | datasourceColumn |  |
| `direction` | Direction | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `is_curated` | Is Curated | INTEGER |  | datasourceColumn |  |
| `marketing_offer_days_from_start` | Marketing Offer Days From Start | LONG |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `reference_foreign_key_id` | Reference Foreign Key Id | STRING |  | datasourceColumn |  |
| `reference_foreign_key_name` | Reference Foreign Key Name | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `total_characters_count` | Total Characters Count | INTEGER |  | datasourceColumn |  |
| `total_tokens` | Total Tokens | DOUBLE |  | datasourceColumn |  |
| `zoom_attendance_max_total_live_watchtime` | Zoom Attendance Max Total Live Watchtime | LONG |  | datasourceColumn |  |

---

## Touchpoint v2 Embeddings

**Table:** `touchpoint_v2_embeddings`  
**Foundry apiName:** `TouchpointV2Embeddings`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **TypedFact** (link: "Typed Fact")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")
- has many **TouchpointsV2Curated** (link: "Touchpoints v2 Curated")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `content` | Content | STRING |  | datasourceColumn |  |
| `content_characters_count` | Content Characters Count | INTEGER |  | datasourceColumn |  |
| `content_embeddings` | Content Embeddings | VECTOR |  | datasourceColumn |  |
| `content_tokens` | Content Tokens | DOUBLE |  | datasourceColumn |  |
| `content_whitelisted` | Content Whitelisted | STRING |  | datasourceColumn |  |
| `context` | Context | STRING |  | datasourceColumn |  |
| `context_characters_count` | Context Characters Count | INTEGER |  | datasourceColumn |  |
| `context_tokens` | Context Tokens | DOUBLE |  | datasourceColumn |  |
| `direction` | Direction | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `is_curated` | Is Curated | INTEGER |  | datasourceColumn |  |
| `marketing_offer_days_from_start` | Marketing Offer Days From Start | LONG |  | datasourceColumn |  |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `reference_foreign_key_id` | Reference Foreign Key Id | STRING |  | datasourceColumn |  |
| `reference_foreign_key_name` | Reference Foreign Key Name | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `total_characters_count` | Total Characters Count | INTEGER |  | datasourceColumn |  |
| `total_tokens` | Total Tokens | DOUBLE |  | datasourceColumn |  |

---

## Touchpoints v2 Curated

**Table:** `touchpoints_v2_curated`  
**Foundry apiName:** `TouchpointsV2Curated`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Curated customer touchpoints aggregated from multiple communication channels. Each touchpoint represents a meaningful interaction (call, email, chat, survey response, etc.) that has been filtered and enriched for analysis and AI processing.

**Source Channels:**
- Kickscale Insight
- Zoom Chat Message
- Zoom session attendance
- Zoom Survey
- Call Insight
- Close Call
- WhatsApp
- Skool (comments and posts)
- Email

**Direction Types:**
- Inbound: From customer
- Outbound: To customer

**Key Relationships:**
- Links to [Funnelbox] Contact v2 (MANY-to-ONE) - parent contact
- Links to Touchpoint v2 Embedding (ONE-to-ONE) - vector embeddings
- Links to Typed Fact (ONE-to-MANY) - extracted facts
- Links to Reason To Call Per Touchpoint (ONE-to-ONE)

**Primary Use Cases:**
- Customer interaction timeline analysis
- Engagement scoring by touchpoint volume
- Source channel performance analysis
- AI fact extraction input (typed facts pipeline)
- Marketing offer response tracking

**Relevant Properties:**
- Content: Main message/content of the touchpoint
- Source: Channel where touchpoint originated
- Direction: Inbound or outbound
- Timestamp: When the interaction occurred
- Context: Additional context (meeting topic, email subject)
- Email: Associated email address
- Marketing Offer Days From Start: Timing relative to campaign

**Data Freshness:** Incrementally curated from raw touchpoint sources  

**Relationships:**
- has many **TypedFact** (link: "Typed Fact")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- has many **ReasonToCallPerTouchpoint** (link: "Reason To Call Per Touchpoint")
- belongs to **TouchpointV2Embeddings** via `primary_key` (link: "Touchpoint v2 Embedding")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | datasourceColumn | Funnelbox contact ID this touchpoint belongs to |
| `content` | Content | STRING |  | datasourceColumn | Main content/message of the touchpoint (title property) |
| `content_characters_count` | Content Characters Count | INTEGER |  | datasourceColumn | Character count for the content field |
| `content_tokens` | Content Tokens | DOUBLE |  | datasourceColumn | Token count for the content field |
| `context` | Context | STRING |  | datasourceColumn | Additional context for the touchpoint (e.g., meeting topic, email subject) |
| `context_characters_count` | Context Characters Count | INTEGER |  | datasourceColumn | Character count for the context field |
| `context_tokens` | Context Tokens | DOUBLE |  | datasourceColumn | Token count for the context field |
| `direction` | Direction | STRING |  | datasourceColumn | Whether inbound (from customer) or outbound (to customer) |
| `email` | Email | STRING |  | datasourceColumn | Email address associated with this touchpoint |
| `is_curated` | Is Curated | INTEGER |  | datasourceColumn | Flag indicating if this touchpoint has been curated (1=curated) |
| `marketing_offer_days_from_start` | Marketing Offer Days From Start | LONG |  | datasourceColumn | Days since the start of the marketing offer when this touchpoint occurred |
| `marketing_offer_id` | Marketing Offer Id | STRING |  | datasourceColumn | Associated marketing offer/campaign ID |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn | Unique identifier for the touchpoint (composite key) |
| `reference_foreign_key_id` | Reference Foreign Key Id | STRING |  | datasourceColumn | Foreign key to the source record (e.g., Zoom chat ID, call ID) |
| `reference_foreign_key_name` | Reference Foreign Key Name | STRING |  | datasourceColumn | Name/type of the foreign key reference |
| `source` | Source | STRING |  | datasourceColumn | Channel/system where the touchpoint originated (e.g., Kickscale Insight, Zoom Chat, WhatsApp, Email, Skool) |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn | When the touchpoint occurred |
| `total_characters_count` | Total Characters Count | INTEGER |  | datasourceColumn | Total character count of the touchpoint |
| `total_tokens` | Total Tokens | DOUBLE |  | datasourceColumn | Total token count (content + context) for LLM processing estimation |

---

## [Zoom] Transcript Segment

**Table:** `transcript_segment_zoom_1`  
**Foundry apiName:** `TranscriptSegmentZoom_1`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingParticipationZoom_1** via `primary_key` (link: "[Zoom] User Meeting Participant")
- belongs to **TranscriptZoom** via `recording_id` (link: "[Zoom] Transcript")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `content` | Content | STRING |  | datasourceColumn |  |
| `download_id` | Download Id | STRING |  | datasourceColumn |  |
| `participant_id` | Participant ID | STRING |  | datasourceColumn |  |
| `participant_uuid` | Participant UUID | STRING |  | datasourceColumn |  |
| `meeting_duration` | Payload Object Duration | DOUBLE |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_start_time` | Payload Object Start Time | TIMESTAMP |  | datasourceColumn |  |
| `meeting_topic` | Payload Object Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting UUID | STRING |  | datasourceColumn |  |
| `primary_key_speaker` | Primary Key Speaker | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `recording_id` | Recording Id | STRING |  | datasourceColumn |  |
| `section_end_timestamp` | Section End Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `section_start_timestamp` | Section Start Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `segment_number` | Segment Number | STRING |  | datasourceColumn |  |
| `speaker` | Speaker | STRING |  | datasourceColumn |  |
| `speaker_email` | Speaker Email | STRING |  | datasourceColumn |  |

---

## [Zoom] Transcript

**Table:** `transcript_zoom`  
**Foundry apiName:** `TranscriptZoom`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Stores transcript recordings and AI-generated summaries from Zoom meetings and webinars. Each transcript contains the full text of spoken content from a recording, along with metadata about the meeting, host, and processing status. Used for content analysis, searchability, and AI-powered summarization.

**Key Relationships:**
- Links to [Zoom] Meeting (parent meeting)
- Links to [Zoom] Recording (source recording file)
- Links to [Zoom] Transcript Segment (speaker-segmented content)
- Links to [Zoom] Transcript Chunks Embedding (vector embeddings for semantic search)

**Primary Use Cases:**
- Full-text search across meeting content
- AI-powered meeting summarization (German and English)
- Speaker attribution and conversation analysis
- Building searchable knowledge bases from meetings
- Training data preparation for AI models
- Compliance and record-keeping requirements

**Relevant Properties:**
- Recording ID: Primary identifier
- Meeting Topic: Meeting title
- Transcript / Transcript Text: Full text content
- Zusammenfassung / Zusammenfassung Lang: German summaries
- Summary Eng: English summary
- Host eMail: Host identifier
- Duration: Recording length
- Recording Start/End: Timestamps
- Has Summary / Has Transcript: Processing status flags
- Process Status: Current processing state  

**Relationships:**
- belongs to **MeetingZoom** via `recording_id` (link: "Meeting")
- belongs to **MeetingZoom** via `meeting_instance_id_1` (link: "[Zoom] Meeting")
- belongs to **RecordingZoom** via `meeting_instance_id_1` (link: "Recording [Zoom]")
- has many **ZoomTranscriptChunksEmbedding** (link: "[Zoom] Transcript Chunks Embedding")
- has many **TranscriptSegmentZoom_1** (link: "[Zoom] Transcript Segment")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `payload_object_auto_delete` | Auto Delete | BOOLEAN |  | datasourceColumn |  |
| `payload_object_auto_delete_date` | Auto Delete Date | STRING |  | datasourceColumn |  |
| `download_datetime_created` | Datetime Created | TIMESTAMP |  | datasourceColumn |  |
| `download_datetime_finished` | Datetime Finished | TIMESTAMP |  | datasourceColumn |  |
| `download_datetime_updated` | Datetime Updated | TIMESTAMP |  | datasourceColumn |  |
| `download_id` | Download Id | STRING |  | datasourceColumn |  |
| `download_meeting_uuid` | Download Meeting Uuid | STRING |  | datasourceColumn |  |
| `download_recording_start` | Download Recording Start | TIMESTAMP |  | datasourceColumn |  |
| `download_download_url` | Download URL | STRING |  | datasourceColumn |  |
| `meeting_duration` | Duration | DOUBLE |  | datasourceColumn |  |
| `event` | Event Label | STRING |  | datasourceColumn |  |
| `download_file_extension` | File Extension | STRING |  | datasourceColumn |  |
| `download_file_size` | File Size | LONG |  | datasourceColumn |  |
| `download_file_type` | File Type | STRING |  | datasourceColumn |  |
| `has_summary` | Has Summary | BOOLEAN |  | datasourceColumn |  |
| `has_transcript` | Has Transcript | BOOLEAN |  | datasourceColumn |  |
| `payload_object_host_email` | Host eMail | STRING |  | datasourceColumn |  |
| `payload_object_host_id` | Host ID | STRING |  | datasourceColumn |  |
| `mariadb_id` | MariaDB ID | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Instance ID | STRING |  | datasourceColumn |  |
| `meeting_text` | Meeting Text | STRING |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `download_play_url` | Play URL | STRING |  | datasourceColumn |  |
| `download_process_status` | Process Status | STRING |  | datasourceColumn |  |
| `payload_object_recording_count` | Recording Count | DOUBLE |  | datasourceColumn |  |
| `download_recording_end` | Recording End | TIMESTAMP |  | datasourceColumn |  |
| `download_recording_id` | Recording ID | STRING | PK | datasourceColumn |  |
| `meeting_start_time` | Recording Start | TIMESTAMP |  | datasourceColumn |  |
| `download_recording_type` | Recording Type | STRING |  | datasourceColumn |  |
| `download_retry` | Retry | SHORT |  | datasourceColumn |  |
| `payload_object_share_url` | Share URL | STRING |  | datasourceColumn |  |
| `download_status` | Status | STRING |  | datasourceColumn |  |
| `summary_eng` | Summary Eng | STRING |  | datasourceColumn |  |
| `payload_object_timezone` | Timezone | STRING |  | datasourceColumn |  |
| `payload_object_total_size` | Total Size | DOUBLE |  | datasourceColumn |  |
| `transcript` | Transcript | STRING |  | datasourceColumn |  |
| `transcript_text` | Transcript Text | STRING |  | datasourceColumn |  |
| `zusammenfassung` | Zusammenfassung | STRING |  | datasourceColumn |  |
| `zusammenfassung_lang` | Zusammenfassung Lang | STRING |  | datasourceColumn |  |

---

## Typed Fact

**Table:** `typed_fact`  
**Foundry apiName:** `TypedFact`  
**Status:** experimental  
**Datasources:** 1  
**Description:** LLM typed facts extracted from Touchpoints  

**Relationships:**
- belongs to **LeadTypedFacts** via `email` (link: "Leads (typed facts)")
- belongs to **TouchpointV2Embeddings** via `source_touchpoint_id` (link: "Touchpoint v2 Embedding")
- belongs to **SalesCrmAusbildungLeadEnriched** via `email` (link: "[Sales CRM] Ausbildung Leads Enriched")
- belongs to **TouchpointsV2Curated** via `source_touchpoint_id` (link: "Touchpoints v2 Curated")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `clean_extraction` | Clean Extraction | STRING |  | redacted |  |
| `email` | Email | STRING |  | redacted |  |
| `extraction_id` | Extraction Id | STRING |  | redacted |  |
| `extraction_job_id` | Extraction Job Id | STRING |  | redacted |  |
| `extraction_key` | Extraction Key | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `source_touchpoint_id` | Source Touchpoint Id | STRING |  | redacted |  |
| `timestamp_extraction` | Timestamp Extraction | TIMESTAMP |  | redacted |  |
| `touchpoint_in_job_earliest_timestanp` | Touchpoint In Job Earliest Timestanp | TIMESTAMP |  | redacted |  |

---

## Uploaded User Picture

**Table:** `uploaded_user_picture`  
**Foundry apiName:** `UploadedUserPicture`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | email | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `processing_request_ts` | Processing Request Ts | TIMESTAMP |  | redacted |  |
| `uploaded_picture_rid` | Uploaded Picture Rid | STRING |  | redacted |  |

---

## User Media Reference

**Table:** `user_media_reference`  
**Foundry apiName:** `UserMediaReference`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Photos uploaded by users for posture/structure analysis (Strukturanalyse) to identify pain sources based on how they stand, sit, etc. Origin: CW Form Tool submission or Fluent Support ticket.  

**Relationships:**
- belongs to **TicketFluent** via `ticket_id` (link: "Tickets [Fluent]")
- belongs to **AppUser** via `app_user_id` (link: "App User")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_user_id` | App User Id | STRING |  | redacted |  |
| `id` | Id | STRING | PK | redacted |  |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | redacted |  |
| `origin` | Origin | STRING |  | redacted | Source system. Currently: CWFormTool. May include fluent-support for ticket attachments. |
| `ticket_id` | Ticket Id | STRING |  | redacted |  |
| `upload_date` | Upload Date | TIMESTAMP |  | redacted |  |

---

## User Upload

**Table:** `user_upload`  
**Foundry apiName:** `UserUpload`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `image` | image | MEDIA_REFERENCE |  | datasourceColumn |  |
| `timestamp` | timestamp | TIMESTAMP |  | datasourceColumn |  |
| `upload_id` | upload_id | STRING | PK | datasourceColumn |  |
| `uploader` | uploader | STRING |  | datasourceColumn |  |

---

## [VAPI] Assistants History

**Table:** `vapi_assistants_history`  
**Foundry apiName:** `VapiAssistantsHistory`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Historization of all VAPI assitants  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `analysis_plan_min_messages_threshold` | Analysis Plan Min Messages Threshold | DOUBLE |  | datasourceColumn |  |
| `background_denoising_enabled` | Background Denoising Enabled | BOOLEAN |  | datasourceColumn |  |
| `background_sound` | Background Sound | STRING |  | datasourceColumn |  |
| `client_messages` | Client Messages | ARRAY |  | datasourceColumn |  |
| `created_at` | Created At | STRING |  | datasourceColumn |  |
| `end_call_function_enabled` | End Call Function Enabled | BOOLEAN |  | datasourceColumn |  |
| `end_call_message` | End Call Message | STRING |  | datasourceColumn |  |
| `end_call_phrases` | End Call Phrases | ARRAY |  | datasourceColumn |  |
| `first_message` | First Message | STRING |  | datasourceColumn |  |
| `first_message_mode` | First Message Mode | STRING |  | datasourceColumn |  |
| `hipaa_enabled` | Hipaa Enabled | BOOLEAN |  | datasourceColumn |  |
| `id` | Id | STRING |  | datasourceColumn |  |
| `is_server_url_secret_set` | Is Server Url Secret Set | BOOLEAN |  | datasourceColumn |  |
| `max_duration_seconds` | Max Duration Seconds | DOUBLE |  | datasourceColumn |  |
| `model_first_message_content` | First Model Prompt | STRING |  | datasourceColumn |  |
| `model_first_message_role` | First Model Prompt Role | STRING |  | datasourceColumn |  |
| `model_max_tokens` | Model Max Tokens | DOUBLE |  | datasourceColumn |  |
| `model_messages` | Model Messages | ARRAY |  | datasourceColumn |  |
| `model_model` | Model Model | STRING |  | datasourceColumn |  |
| `model_provider` | Model Provider | STRING |  | datasourceColumn |  |
| `model_temperature` | Model Temperature | DOUBLE |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `new_property1` | New property 1 | STRING |  | editOnly |  |
| `ontology_id` | Ontology Id | STRING | PK | datasourceColumn |  |
| `org_id` | Org Id | STRING |  | datasourceColumn |  |
| `server_messages` | Server Messages | ARRAY |  | datasourceColumn |  |
| `server_timeout_seconds` | Server Timeout Seconds | DOUBLE |  | datasourceColumn |  |
| `server_url` | Server Url | STRING |  | datasourceColumn |  |
| `silence_timeout_seconds` | Silence Timeout Seconds | DOUBLE |  | datasourceColumn |  |
| `start_speaking_plan_smart_endpointing_enabled` | Start Speaking Plan Smart Endpointing Enabled | STRING |  | datasourceColumn |  |
| `start_speaking_plan_wait_seconds` | Start Speaking Plan Wait Seconds | DOUBLE |  | datasourceColumn |  |
| `stop_speaking_plan_backoff_seconds` | Stop Speaking Plan Backoff Seconds | DOUBLE |  | datasourceColumn |  |
| `stop_speaking_plan_num_words` | Stop Speaking Plan Num Words | DOUBLE |  | datasourceColumn |  |
| `stop_speaking_plan_voice_seconds` | Stop Speaking Plan Voice Seconds | DOUBLE |  | datasourceColumn |  |
| `transcriber_endpointing` | Transcriber Endpointing | DOUBLE |  | datasourceColumn |  |
| `transcriber_language` | Transcriber Language | STRING |  | datasourceColumn |  |
| `transcriber_model` | Transcriber Model | STRING |  | datasourceColumn |  |
| `transcriber_numerals` | Transcriber Numerals | BOOLEAN |  | datasourceColumn |  |
| `transcriber_provider` | Transcriber Provider | STRING |  | datasourceColumn |  |
| `updated_at` | Updated At | STRING |  | datasourceColumn |  |
| `voice_auto_mode` | Voice Auto Mode | BOOLEAN |  | datasourceColumn |  |
| `voice_input_min_characters` | Voice Input Min Characters | DOUBLE |  | datasourceColumn |  |
| `voice_input_punctuation_boundaries` | Voice Input Punctuation Boundaries | ARRAY |  | datasourceColumn |  |
| `voice_model` | Voice Model | STRING |  | datasourceColumn |  |
| `voice_optimize_streaming_latency` | Voice Optimize Streaming Latency | DOUBLE |  | datasourceColumn |  |
| `voice_provider` | Voice Provider | STRING |  | datasourceColumn |  |
| `voice_similarity_boost` | Voice Similarity Boost | DOUBLE |  | datasourceColumn |  |
| `voice_speed` | Voice Speed | DOUBLE |  | datasourceColumn |  |
| `voice_stability` | Voice Stability | DOUBLE |  | datasourceColumn |  |
| `voice_style` | Voice Style | DOUBLE |  | datasourceColumn |  |
| `voice_use_speaker_boost` | Voice Use Speaker Boost | BOOLEAN |  | datasourceColumn |  |
| `voice_voice_id` | Voice Voice Id | STRING |  | datasourceColumn |  |
| `voicemail_detection_backoff_plan_frequency_seconds` | Voicemail Detection Backoff Plan Frequency Seconds | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_backoff_plan_max_retries` | Voicemail Detection Backoff Plan Max Retries | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_backoff_plan_start_at_seconds` | Voicemail Detection Backoff Plan Start At Seconds | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_beep_max_await_seconds` | Voicemail Detection Beep Max Await Seconds | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_provider` | Voicemail Detection Provider | STRING |  | datasourceColumn |  |
| `voicemail_message` | Voicemail Message | STRING |  | datasourceColumn |  |

---

## [VAPI] Assistants Latest

**Table:** `vapi_assistants_latest`  
**Foundry apiName:** `VapiAssistantsLatest`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Currently used VAPI Assistants  

**Relationships:**
- has many **VapiCalls** (link: "VAPI Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `analysis_plan_min_messages_threshold` | Analysis Plan Min Messages Threshold | DOUBLE |  | datasourceColumn |  |
| `background_denoising_enabled` | Background Denoising Enabled | BOOLEAN |  | datasourceColumn |  |
| `background_sound` | Background Sound | STRING |  | datasourceColumn |  |
| `client_messages` | Client Messages | ARRAY |  | datasourceColumn |  |
| `created_at` | Created At | STRING |  | datasourceColumn |  |
| `end_call_function_enabled` | End Call Function Enabled | BOOLEAN |  | datasourceColumn |  |
| `end_call_message` | End Call Message | STRING |  | datasourceColumn |  |
| `end_call_phrases` | End Call Phrases | ARRAY |  | datasourceColumn |  |
| `first_message` | First Message | STRING |  | datasourceColumn |  |
| `first_message_mode` | First Message Mode | STRING |  | datasourceColumn |  |
| `model_first_message_content` | First Model Prompt | STRING |  | datasourceColumn |  |
| `model_first_message_role` | First Model Prompt Role | STRING |  | datasourceColumn |  |
| `hipaa_enabled` | Hipaa Enabled | BOOLEAN |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `is_server_url_secret_set` | Is Server Url Secret Set | BOOLEAN |  | datasourceColumn |  |
| `max_duration_seconds` | Max Duration Seconds | DOUBLE |  | datasourceColumn |  |
| `model_max_tokens` | Model Max Tokens | DOUBLE |  | datasourceColumn |  |
| `model_messages` | Model Messages | ARRAY |  | datasourceColumn |  |
| `model_model` | Model Model | STRING |  | datasourceColumn |  |
| `model_provider` | Model Provider | STRING |  | datasourceColumn |  |
| `model_temperature` | Model Temperature | DOUBLE |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `org_id` | Org Id | STRING |  | datasourceColumn |  |
| `server_messages` | Server Messages | ARRAY |  | datasourceColumn |  |
| `server_timeout_seconds` | Server Timeout Seconds | DOUBLE |  | datasourceColumn |  |
| `server_url` | Server Url | STRING |  | datasourceColumn |  |
| `silence_timeout_seconds` | Silence Timeout Seconds | DOUBLE |  | datasourceColumn |  |
| `start_speaking_plan_smart_endpointing_enabled` | Start Speaking Plan Smart Endpointing Enabled | STRING |  | datasourceColumn |  |
| `start_speaking_plan_wait_seconds` | Start Speaking Plan Wait Seconds | DOUBLE |  | datasourceColumn |  |
| `stop_speaking_plan_backoff_seconds` | Stop Speaking Plan Backoff Seconds | DOUBLE |  | datasourceColumn |  |
| `stop_speaking_plan_num_words` | Stop Speaking Plan Num Words | DOUBLE |  | datasourceColumn |  |
| `stop_speaking_plan_voice_seconds` | Stop Speaking Plan Voice Seconds | DOUBLE |  | datasourceColumn |  |
| `transcriber_endpointing` | Transcriber Endpointing | DOUBLE |  | datasourceColumn |  |
| `transcriber_language` | Transcriber Language | STRING |  | datasourceColumn |  |
| `transcriber_model` | Transcriber Model | STRING |  | datasourceColumn |  |
| `transcriber_numerals` | Transcriber Numerals | BOOLEAN |  | datasourceColumn |  |
| `transcriber_provider` | Transcriber Provider | STRING |  | datasourceColumn |  |
| `updated_at` | Updated At | STRING |  | datasourceColumn |  |
| `voice_auto_mode` | Voice Auto Mode | BOOLEAN |  | datasourceColumn |  |
| `voice_input_min_characters` | Voice Input Min Characters | DOUBLE |  | datasourceColumn |  |
| `voice_input_punctuation_boundaries` | Voice Input Punctuation Boundaries | ARRAY |  | datasourceColumn |  |
| `voice_model` | Voice Model | STRING |  | datasourceColumn |  |
| `voice_optimize_streaming_latency` | Voice Optimize Streaming Latency | DOUBLE |  | datasourceColumn |  |
| `voice_provider` | Voice Provider | STRING |  | datasourceColumn |  |
| `voice_similarity_boost` | Voice Similarity Boost | DOUBLE |  | datasourceColumn |  |
| `voice_speed` | Voice Speed | DOUBLE |  | datasourceColumn |  |
| `voice_stability` | Voice Stability | DOUBLE |  | datasourceColumn |  |
| `voice_style` | Voice Style | DOUBLE |  | datasourceColumn |  |
| `voice_use_speaker_boost` | Voice Use Speaker Boost | BOOLEAN |  | datasourceColumn |  |
| `voice_voice_id` | Voice Voice Id | STRING |  | datasourceColumn |  |
| `voicemail_detection_backoff_plan_frequency_seconds` | Voicemail Detection Backoff Plan Frequency Seconds | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_backoff_plan_max_retries` | Voicemail Detection Backoff Plan Max Retries | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_backoff_plan_start_at_seconds` | Voicemail Detection Backoff Plan Start At Seconds | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_beep_max_await_seconds` | Voicemail Detection Beep Max Await Seconds | DOUBLE |  | datasourceColumn |  |
| `voicemail_detection_provider` | Voicemail Detection Provider | STRING |  | datasourceColumn |  |
| `voicemail_message` | Voicemail Message | STRING |  | datasourceColumn |  |

---

## [VAPI] Call Review

**Table:** `vapi_call_review`  
**Foundry apiName:** `VapiCallReview`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Reviews of a VAPI call  

**Relationships:**
- belongs to **VapiCalls** via `call_id` (link: "VAPI Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_id` | call_id | STRING |  | editOnly |  |
| `comment` | comment | STRING |  | editOnly |  |
| `primary_key` | id | STRING | PK | datasourceColumn |  |
| `reviewed` | reviewed | BOOLEAN |  | editOnly |  |
| `reviewed_at` | reviewed_at | TIMESTAMP |  | editOnly |  |
| `reviewed_by` | reviewed_ by | STRING |  | editOnly | Author of the review |
| `status` | status | STRING |  | editOnly |  |

---

## [VAPI] Call Transcript Reference

**Table:** `vapi_call_transcript_reference`  
**Foundry apiName:** `VapiCallTranscriptReference`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **VapiCalls** via `call_id` (link: "VAPI Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_id` | Call Id | STRING |  | datasourceColumn |  |
| `media_item_rid` | Media Item Rid | STRING | PK | datasourceColumn |  |
| `media_preview_string` | Media Preview String | STRING |  | datasourceColumn |  |
| `media_set_rid` | Media Set Rid | STRING |  | datasourceColumn |  |
| `media_set_view_rid` | Media Set View Rid | STRING |  | datasourceColumn |  |
| `recording_url` | Recording Url | STRING |  | datasourceColumn |  |

---

## [VAPI] Calls

**Table:** `vapi_calls`  
**Foundry apiName:** `VapiCalls`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Historized VAPI calls  

**Relationships:**
- has many **VapiCallReview** (link: "VAPI Call Review")
- has many **VapiCallTranscriptReference** (link: "[VAPI] Call Transcript Reference")
- belongs to **VapiAssistantsLatest** via `assistant_id` (link: "VAPI Assistants Latest")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `analysis_success_evaluation` | Analysis Success Evaluation | STRING |  | datasourceColumn |  |
| `analysis_summary` | Analysis Summary | STRING |  | datasourceColumn |  |
| `artifact_log_url` | Artifact Log Url | STRING |  | datasourceColumn |  |
| `artifact_recording_mono_assistant_url` | Artifact Recording Mono Assistant Url | STRING |  | datasourceColumn |  |
| `artifact_recording_mono_combined_url` | Artifact Recording Mono Combined Url | STRING |  | datasourceColumn |  |
| `artifact_recording_mono_customer_url` | Artifact Recording Mono Customer Url | STRING |  | datasourceColumn |  |
| `artifact_recording_stereo_url` | Artifact Recording Stereo Url | STRING |  | datasourceColumn |  |
| `artifact_recording_url` | Artifact Recording Url | STRING |  | datasourceColumn |  |
| `artifact_stereo_recording_url` | Artifact Stereo Recording Url | STRING |  | datasourceColumn |  |
| `artifact_transcript` | Artifact Transcript | STRING |  | datasourceColumn |  |
| `artifact_variable_values_customer_name` | Artifact Variable Values Customer Name | STRING |  | datasourceColumn |  |
| `artifact_variable_values_customer_number` | Artifact Variable Values Customer Number | STRING |  | datasourceColumn |  |
| `artifact_variable_values_date` | Artifact Variable Values Date | STRING |  | datasourceColumn |  |
| `artifact_variable_values_day` | Artifact Variable Values Day | STRING |  | datasourceColumn |  |
| `artifact_variable_values_email` | Artifact Variable Values Email | STRING |  | datasourceColumn |  |
| `artifact_variable_values_first_name` | Artifact Variable Values First Name | STRING |  | datasourceColumn |  |
| `artifact_variable_values_month` | Artifact Variable Values Month | STRING |  | datasourceColumn |  |
| `artifact_variable_values_name` | Artifact Variable Values Name | STRING |  | datasourceColumn |  |
| `artifact_variable_values_now` | Artifact Variable Values Now | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_created_at` | Artifact Variable Values Phone Number Created At | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_id` | Artifact Variable Values Phone Number Id | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_name` | Artifact Variable Values Phone Number Name | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_number` | Artifact Variable Values Phone Number Number | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_org_id` | Artifact Variable Values Phone Number Org Id | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_provider` | Artifact Variable Values Phone Number Provider | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_status` | Artifact Variable Values Phone Number Status | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_twilio_account_sid` | Artifact Variable Values Phone Number Twilio Account Sid | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_twilio_auth_token` | Artifact Variable Values Phone Number Twilio Auth Token | STRING |  | datasourceColumn |  |
| `artifact_variable_values_phone_number_updated_at` | Artifact Variable Values Phone Number Updated At | STRING |  | datasourceColumn |  |
| `artifact_variable_values_primaerschmerz` | Artifact Variable Values Primaerschmerz | STRING |  | datasourceColumn |  |
| `artifact_variable_values_time` | Artifact Variable Values Time | STRING |  | datasourceColumn |  |
| `artifact_variable_values_year` | Artifact Variable Values Year | STRING |  | datasourceColumn |  |
| `artifact_variables_customer_name` | Artifact Variables Customer Name | STRING |  | datasourceColumn |  |
| `artifact_variables_customer_number` | Artifact Variables Customer Number | STRING |  | datasourceColumn |  |
| `artifact_variables_date` | Artifact Variables Date | STRING |  | datasourceColumn |  |
| `artifact_variables_day` | Artifact Variables Day | STRING |  | datasourceColumn |  |
| `artifact_variables_email` | Artifact Variables Email | STRING |  | datasourceColumn |  |
| `artifact_variables_first_name` | Artifact Variables First Name | STRING |  | datasourceColumn |  |
| `artifact_variables_month` | Artifact Variables Month | STRING |  | datasourceColumn |  |
| `artifact_variables_name` | Artifact Variables Name | STRING |  | datasourceColumn |  |
| `artifact_variables_now` | Artifact Variables Now | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_created_at` | Artifact Variables Phone Number Created At | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_id` | Artifact Variables Phone Number Id | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_name` | Artifact Variables Phone Number Name | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_number` | Artifact Variables Phone Number Number | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_org_id` | Artifact Variables Phone Number Org Id | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_provider` | Artifact Variables Phone Number Provider | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_status` | Artifact Variables Phone Number Status | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_twilio_account_sid` | Artifact Variables Phone Number Twilio Account Sid | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_twilio_auth_token` | Artifact Variables Phone Number Twilio Auth Token | STRING |  | datasourceColumn |  |
| `artifact_variables_phone_number_updated_at` | Artifact Variables Phone Number Updated At | STRING |  | datasourceColumn |  |
| `artifact_variables_primaerschmerz` | Artifact Variables Primaerschmerz | STRING |  | datasourceColumn |  |
| `artifact_variables_time` | Artifact Variables Time | STRING |  | datasourceColumn |  |
| `artifact_variables_year` | Artifact Variables Year | STRING |  | datasourceColumn |  |
| `assistant_id` | Assistant Id | STRING |  | datasourceColumn |  |
| `assistant_overrides_background_sound` | Assistant Overrides Background Sound | STRING |  | datasourceColumn |  |
| `assistant_overrides_client_messages` | Assistant Overrides Client Messages | STRING |  | datasourceColumn |  |
| `assistant_overrides_end_call_function_enabled` | Assistant Overrides End Call Function Enabled | BOOLEAN |  | datasourceColumn |  |
| `assistant_overrides_end_call_message` | Assistant Overrides End Call Message | STRING |  | datasourceColumn |  |
| `assistant_overrides_first_message` | Assistant Overrides First Message | STRING |  | datasourceColumn |  |
| `assistant_overrides_first_message_mode` | Assistant Overrides First Message Mode | STRING |  | datasourceColumn |  |
| `assistant_overrides_max_duration_seconds` | Assistant Overrides Max Duration Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_model_messages` | Assistant Overrides Model Messages | STRING |  | datasourceColumn |  |
| `assistant_overrides_model_model` | Assistant Overrides Model Model | STRING |  | datasourceColumn |  |
| `assistant_overrides_model_provider` | Assistant Overrides Model Provider | STRING |  | datasourceColumn |  |
| `assistant_overrides_model_temperature` | Assistant Overrides Model Temperature | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_name` | Assistant Overrides Name | STRING |  | datasourceColumn |  |
| `assistant_overrides_server_messages` | Assistant Overrides Server Messages | ARRAY |  | datasourceColumn |  |
| `assistant_overrides_server_timeout_seconds` | Assistant Overrides Server Timeout Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_server_url` | Assistant Overrides Server Url | STRING |  | datasourceColumn |  |
| `assistant_overrides_silence_timeout_seconds` | Assistant Overrides Silence Timeout Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_start_speaking_plan_transcription_endpointing_plan_on_number_seconds` | Assistant Overrides Start Speaking Plan Transcription Endpointing Plan On Number Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_start_speaking_plan_transcription_endpointing_plan_on_punctuation_seconds` | Assistant Overrides Start Speaking Plan Transcription Endpointing Plan On Punctuation Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_start_speaking_plan_wait_seconds` | Assistant Overrides Start Speaking Plan Wait Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_stop_speaking_plan_num_words` | Assistant Overrides Stop Speaking Plan Num Words | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_stop_speaking_plan_voice_seconds` | Assistant Overrides Stop Speaking Plan Voice Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_transcriber_language` | Assistant Overrides Transcriber Language | STRING |  | datasourceColumn |  |
| `assistant_overrides_transcriber_model` | Assistant Overrides Transcriber Model | STRING |  | datasourceColumn |  |
| `assistant_overrides_transcriber_numerals` | Assistant Overrides Transcriber Numerals | BOOLEAN |  | datasourceColumn |  |
| `assistant_overrides_transcriber_provider` | Assistant Overrides Transcriber Provider | STRING |  | datasourceColumn |  |
| `assistant_overrides_variable_values_email` | Assistant Overrides Variable Values Email | STRING |  | datasourceColumn |  |
| `assistant_overrides_variable_values_first_name` | Assistant Overrides Variable Values First Name | STRING |  | datasourceColumn |  |
| `assistant_overrides_variable_values_name` | Assistant Overrides Variable Values Name | STRING |  | datasourceColumn |  |
| `assistant_overrides_variable_values_primaerschmerz` | Assistant Overrides Variable Values Primaerschmerz | STRING |  | datasourceColumn |  |
| `assistant_overrides_voice_enable_ssml_parsing` | Assistant Overrides Voice Enable Ssml Parsing | BOOLEAN |  | datasourceColumn |  |
| `assistant_overrides_voice_model` | Assistant Overrides Voice Model | STRING |  | datasourceColumn |  |
| `assistant_overrides_voice_optimize_streaming_latency` | Assistant Overrides Voice Optimize Streaming Latency | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voice_provider` | Assistant Overrides Voice Provider | STRING |  | datasourceColumn |  |
| `assistant_overrides_voice_similarity_boost` | Assistant Overrides Voice Similarity Boost | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voice_speed` | Assistant Overrides Voice Speed | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voice_stability` | Assistant Overrides Voice Stability | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voice_style` | Assistant Overrides Voice Style | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voice_voice_id` | Assistant Overrides Voice Voice Id | STRING |  | datasourceColumn |  |
| `assistant_overrides_voicemail_detection_backoff_plan_frequency_seconds` | Assistant Overrides Voicemail Detection Backoff Plan Frequency Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voicemail_detection_backoff_plan_max_retries` | Assistant Overrides Voicemail Detection Backoff Plan Max Retries | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voicemail_detection_backoff_plan_start_at_seconds` | Assistant Overrides Voicemail Detection Backoff Plan Start At Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voicemail_detection_beep_max_await_seconds` | Assistant Overrides Voicemail Detection Beep Max Await Seconds | DOUBLE |  | datasourceColumn |  |
| `assistant_overrides_voicemail_detection_provider` | Assistant Overrides Voicemail Detection Provider | STRING |  | datasourceColumn |  |
| `assistant_overrides_voicemail_message` | Assistant Overrides Voicemail Message | STRING |  | datasourceColumn |  |
| `call_duration` | Call Duration | LONG |  | datasourceColumn |  |
| `call_duration_bucket` | Call Duration Bucket | STRING |  | datasourceColumn |  |
| `cost` | Cost | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_structured_data` | Cost Breakdown Analysis Cost Breakdown Structured Data | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_structured_data_completion_tokens` | Cost Breakdown Analysis Cost Breakdown Structured Data Completion Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_structured_data_prompt_tokens` | Cost Breakdown Analysis Cost Breakdown Structured Data Prompt Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_structured_output` | Cost Breakdown Analysis Cost Breakdown Structured Output | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_structured_output_completion_tokens` | Cost Breakdown Analysis Cost Breakdown Structured Output Completion Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_structured_output_prompt_tokens` | Cost Breakdown Analysis Cost Breakdown Structured Output Prompt Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_success_evaluation` | Cost Breakdown Analysis Cost Breakdown Success Evaluation | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_success_evaluation_completion_tokens` | Cost Breakdown Analysis Cost Breakdown Success Evaluation Completion Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_success_evaluation_prompt_tokens` | Cost Breakdown Analysis Cost Breakdown Success Evaluation Prompt Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_summary` | Cost Breakdown Analysis Cost Breakdown Summary | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_summary_completion_tokens` | Cost Breakdown Analysis Cost Breakdown Summary Completion Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_analysis_cost_breakdown_summary_prompt_tokens` | Cost Breakdown Analysis Cost Breakdown Summary Prompt Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_chat` | Cost Breakdown Chat | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_knowledge_base_cost` | Cost Breakdown Knowledge Base Cost | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_llm` | Cost Breakdown Llm | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_llm_completion_tokens` | Cost Breakdown Llm Completion Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_llm_prompt_tokens` | Cost Breakdown Llm Prompt Tokens | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_stt` | Cost Breakdown Stt | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_total` | Cost Breakdown Total | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_transport` | Cost Breakdown Transport | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_tts` | Cost Breakdown Tts | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_tts_characters` | Cost Breakdown Tts Characters | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_vapi` | Cost Breakdown Vapi | DOUBLE |  | datasourceColumn |  |
| `cost_breakdown_voicemail_detection_cost` | Cost Breakdown Voicemail Detection Cost | DOUBLE |  | datasourceColumn |  |
| `created_at` | Created At | TIMESTAMP |  | datasourceColumn |  |
| `customer_name` | Customer Name | STRING |  | datasourceColumn |  |
| `customer_number` | Customer Number | STRING |  | datasourceColumn |  |
| `ended_at` | Ended At | TIMESTAMP |  | datasourceColumn |  |
| `ended_reason` | Ended Reason | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `monitor_control_url` | Monitor Control Url | STRING |  | datasourceColumn |  |
| `monitor_listen_url` | Monitor Listen Url | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `org_id` | Org Id | STRING |  | datasourceColumn |  |
| `phone_call_provider` | Phone Call Provider | STRING |  | datasourceColumn |  |
| `phone_call_provider_id` | Phone Call Provider Id | STRING |  | datasourceColumn |  |
| `phone_call_transport` | Phone Call Transport | STRING |  | datasourceColumn |  |
| `phone_number_id` | Phone Number Id | STRING |  | datasourceColumn |  |
| `recording_url` | Recording Url | STRING |  | datasourceColumn |  |
| `started_at` | Started At | TIMESTAMP |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `stereo_recording_url` | Stereo Recording Url | STRING |  | datasourceColumn |  |
| `summary` | Summary | STRING |  | datasourceColumn |  |
| `transcript` | Transcript | STRING |  | datasourceColumn |  |
| `transport_account_sid` | Transport Account Sid | STRING |  | datasourceColumn |  |
| `transport_assistant_video_enabled` | Transport Assistant Video Enabled | BOOLEAN |  | datasourceColumn |  |
| `transport_call_sid` | Transport Call Sid | STRING |  | datasourceColumn |  |
| `transport_call_url` | Transport Call Url | STRING |  | datasourceColumn |  |
| `transport_provider` | Transport Provider | STRING |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `updated_at` | Updated At | TIMESTAMP |  | datasourceColumn |  |
| `web_call_url` | Web Call Url | STRING |  | datasourceColumn |  |

---

## [Vimeo] Video

**Table:** `vimeo_video`  
**Foundry apiName:** `VimeoVideo`  
**Status:** experimental  
**Datasources:** 1  
**Description:** TOB video assets metadata  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `categories` | Categories | ARRAY |  | redacted |  |
| `created_time` | Created Time | STRING |  | redacted |  |
| `description` | Description | STRING |  | redacted |  |
| `download_url` | Download Url | STRING |  | redacted |  |
| `duration` | Duration | LONG |  | redacted |  |
| `embed_html` | Embed Html | STRING |  | redacted |  |
| `folder_name` | Folder Name | STRING |  | redacted |  |
| `folder_uri` | Folder Uri | STRING |  | redacted |  |
| `height` | Height | LONG |  | redacted |  |
| `ingestion_timestamp` | Ingestion Timestamp | STRING |  | redacted |  |
| `link` | Link | STRING |  | redacted |  |
| `modified_time` | Modified Time | STRING |  | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `privacy_view` | Privacy View | STRING |  | redacted |  |
| `tags` | Tags | ARRAY |  | redacted |  |
| `thumbnail_url` | Thumbnail Url | STRING |  | redacted |  |
| `tob_video_app_link` | Tob Video App Link | STRING |  | redacted |  |
| `tob_video_category` | Tob Video Category | STRING |  | redacted |  |
| `uri` | Uri | STRING |  | redacted |  |
| `video_id` | Video Id | STRING | PK | redacted |  |
| `views` | Views | LONG |  | redacted |  |
| `width` | Width | LONG |  | redacted |  |

---

## [SalesCRM] [Waha] WA Conversation

**Table:** `waha_conversation`  
**Foundry apiName:** `WahaConversation`  
**Status:** experimental  
**Datasources:** 1  
**Description:** previously [Waha] Conversation  

**Relationships:**
- has many **WahaMessageNoRv** (link: "[Waha] Messages (no RV)")
- has many **SalesCrmAusbildungLeadEnriched** (link: "Ausbildung Lead")
- belongs to **SalesRepresentative** via `session_name` (link: "Sales Representative")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `assigned_at` | Assigned At | TIMESTAMP |  | editOnly | When the conversation was assigned |
| `assigned_by` | Assigned By | STRING |  | editOnly | Email/name of user who made the assignment |
| `assigned_to_email` | Assigned To Email | STRING |  | editOnly | Email of the user this conversation is assigned to |
| `assigned_to_name` | Assigned To Name | STRING |  | editOnly | Display name of assigned user (for UI display) |
| `coach_lead_owner_email` | Coach Lead Owner Email | STRING |  | editOnly | Email of the coach assigned to this lead/conversation |
| `coach_lead_owner_name` | Coach Lead Owner Name | STRING |  | editOnly | Display name of the coach assigned to this lead/conversation |
| `completed_strukturanalyse` | Completed Strukturanalyse | BOOLEAN |  | datasourceColumn |  |
| `contactv2_email` | contactv2 Email | STRING |  | datasourceColumn |  |
| `contactv2_pk` | contactv2 Pk | STRING |  | datasourceColumn |  |
| `contract_is_signed` | Contract Is Signed | BOOLEAN |  | datasourceColumn |  |
| `contract_sent` | Contract Sent | BOOLEAN |  | datasourceColumn |  |
| `contract_viewed` | Contract Viewed | BOOLEAN |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING | PK | datasourceColumn |  |
| `customer_program` | Customer Program | STRING |  | datasourceColumn |  |
| `has_ticket_for_current_mop` | Has Ticket For Current Mop | BOOLEAN |  | datasourceColumn |  |
| `is_archived` | Is Archived | BOOLEAN |  | datasourceColumn |  |
| `is_client` | Is Client | BOOLEAN |  | datasourceColumn |  |
| `is_group_conversation` | Is Group Conversation | BOOLEAN |  | datasourceColumn |  |
| `is_pinned` | isPinned | BOOLEAN |  | editOnly | pin to top on display of chats for users |
| `is_training_cert_client` | Is Training Cert Client | BOOLEAN |  | datasourceColumn |  |
| `is_unread` | Is Unread | BOOLEAN |  | editOnly | True when conversation has unread messages. Set to true by pipeline when new lead message arrives. Set to false when user opens conversation. Can be manually set to true via 'Mark as unread'. |
| `justus_labels` | Justus Labels | ARRAY |  | datasourceColumn |  |
| `label_ids` | Label Ids | ARRAY |  | datasourceColumn |  |
| `lead_chat_id` | Lead Chat Id | STRING |  | datasourceColumn |  |
| `lead_full_name` | Lead Full Name | STRING |  | datasourceColumn |  |
| `lead_phone_number` | Lead Phone Number | STRING |  | datasourceColumn |  |
| `mop_count` | Mop Count | LONG |  | datasourceColumn |  |
| `mop_first_signup_date` | Mop First Signup Date | TIMESTAMP |  | datasourceColumn |  |
| `mop_ids` | Mop Ids | ARRAY |  | datasourceColumn |  |
| `mop_last_activity_date` | Mop Last Activity Date | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_call_date` | Mop Last Call Date | TIMESTAMP |  | datasourceColumn |  |
| `mop_last_call_duration_seconds` | Mop Last Call Duration Seconds | DOUBLE |  | datasourceColumn |  |
| `mop_latest_offer_name` | Mop Latest Offer Name | STRING |  | datasourceColumn |  |
| `mop_names` | Mop Names | ARRAY |  | datasourceColumn |  |
| `mop_total_call_duration_seconds` | Mop Total Call Duration Seconds | DOUBLE |  | datasourceColumn |  |
| `mop_total_watch_time_minutes` | Mop Total Watch Time Minutes | DOUBLE |  | datasourceColumn |  |
| `sales_rep_email` | Sales Rep Email | STRING |  | datasourceColumn |  |
| `sales_rep_number` | Sales Rep Number | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `whatsapp_name` | Whatsapp Name | STRING |  | datasourceColumn |  |

---

## [WAHA] Conversation Label

**Table:** `waha_conversation_label`  
**Foundry apiName:** `WahaConversationLabel`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `colour` | Colour | STRING |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |

---

## [WAHA] Message Edit (no RV)

**Table:** `waha_edits_no_rv`  
**Foundry apiName:** `WahaEditsNoRv`  
**Status:** experimental  
**Datasources:** 1  
**Description:** [WAHA] Message Edits (no RV)  

**Relationships:**
- belongs to **WahaMessageNoRv** via `original_message_id` (link: "[Waha] Messages (no RV)")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contactv2_id` | contactv2 Id | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn |  |
| `edit_event_id` | Edit Event Id | STRING | PK | datasourceColumn |  |
| `edited_at` | Edited At | TIMESTAMP |  | datasourceColumn |  |
| `lead_full_name` | Lead Full Name | STRING |  | datasourceColumn |  |
| `new_message_body` | New Message Body | STRING |  | datasourceColumn |  |
| `original_message_id` | Original Message Id | STRING |  | datasourceColumn |  |

---

## [Waha] Image

**Table:** `waha_image`  
**Foundry apiName:** `WahaImage`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **WahaMessageNoRv** (link: "[Waha] Message (no RV)")
- belongs to **WahaMessage** via `id` (link: "[Waha] Message")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `id` | Id | STRING | PK | datasourceColumn |  |
| `image_url` | Image Url | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `media_rid` | Media Rid | STRING |  | datasourceColumn |  |
| `sales_rep_email` | Sales Rep Email | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |

---

## [Waha] Label Sync Log

**Table:** `waha_label_sync_log`  
**Foundry apiName:** `WahaLabelSyncLog`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Log entries tracking Waha label synchronization API calls. Records success/failure status, mapped labels, and response details for debugging and monitoring.  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `chat_id` | Chat Id | STRING |  | editOnly | The WhatsApp chat ID |
| `error_message` | Error Message | STRING |  | editOnly | Error details if the sync failed |
| `http_status` | HTTP Status | INTEGER |  | editOnly | HTTP response status code |
| `primary_key` | Log Id | STRING | PK | datasourceColumn | Unique identifier for the log entry (UUID) |
| `mapped_label_ids` | Mapped Label Ids | ARRAY |  | editOnly | Label IDs that were successfully mapped |
| `requested_labels` | Requested Labels | ARRAY |  | editOnly | Label names that were requested to sync |
| `response_time_ms` | Response Time (ms) | DOUBLE |  | editOnly | How long the API call took in milliseconds |
| `session_id` | Session Id | STRING |  | editOnly | The Waha session used |
| `success` | Success | BOOLEAN |  | editOnly | Whether the API call succeeded |
| `timestamp` | Timestamp | TIMESTAMP |  | editOnly | When the sync was attempted |
| `unmapped_labels` | Unmapped Labels | ARRAY |  | editOnly | Labels that could not be mapped to IDs |

---

## WAHA Lead

**Table:** `waha_lead`  
**Foundry apiName:** `WahaLead`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `close_activity_at` | Close Activity At | TIMESTAMP |  | datasourceColumn |  |
| `close_activity_conversation` | Close Activity Conversation | STRING |  | datasourceColumn |  |
| `close_activity_date_created` | Close Activity Date Created | TIMESTAMP |  | datasourceColumn |  |
| `close_activity_summary_text` | Close Activity Summary Text | STRING |  | datasourceColumn |  |
| `close_call_duration` | Close Call Duration | INTEGER |  | datasourceColumn |  |
| `close_custom_field_call_id` | Close Custom Field Call Id | STRING |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | STRING |  | datasourceColumn |  |
| `close_lead_phone` | Close Lead Phone | STRING |  | datasourceColumn |  |
| `close_tob_user_id` | Close Tob User Id | STRING |  | datasourceColumn |  |
| `count_inbount_per_lead` | Count Inbount Per Lead | LONG |  | datasourceColumn |  |
| `count_outbound_per_lead` | Count Outbound Per Lead | LONG |  | datasourceColumn |  |
| `event_object_id` | Event Object Id | STRING | PK | datasourceColumn |  |
| `has_inbound` | Has Inbound | BOOLEAN |  | datasourceColumn |  |
| `has_inbound_and_outbound` | Has Inbound And Outbound | BOOLEAN |  | datasourceColumn |  |
| `has_outbound` | Has Outbound | BOOLEAN |  | datasourceColumn |  |
| `has_transcript` | Has Transcript | BOOLEAN |  | datasourceColumn |  |
| `last_message_timestamp` | Last Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `lead_phone_number` | Lead Phone Number | STRING |  | datasourceColumn |  |
| `local_phone` | Local Phone | STRING |  | datasourceColumn |  |
| `mop_lead_contact_id` | Mop Lead Contact Id | STRING |  | datasourceColumn |  |
| `mop_lead_contact_mo_primary_key` | Mop Lead Contact Mo Primary Key | STRING |  | datasourceColumn |  |
| `mop_lead_email` | Mop Lead Email | STRING |  | datasourceColumn |  |
| `mop_lead_ghl_contact_ids` | Mop Lead Ghl Contact Ids | STRING |  | datasourceColumn |  |
| `mop_lead_marketing_offer_id` | Mop Lead Marketing Offer Id | STRING |  | datasourceColumn |  |
| `mop_lead_name` | Mop Lead Name | STRING |  | datasourceColumn |  |
| `mop_lead_primary_pain` | Mop Lead Primary Pain | ARRAY |  | datasourceColumn |  |
| `sales_agent_email` | Sales Agent Email | STRING |  | datasourceColumn |  |
| `sales_agent_first_name` | Sales Agent First Name | STRING |  | datasourceColumn |  |
| `sales_agent_full_name` | Sales Agent Full Name | STRING |  | datasourceColumn |  |
| `sales_agent_funnelbox_user_id` | Sales Agent Funnelbox User Id | STRING |  | datasourceColumn |  |
| `sales_agent_last_name` | Sales Agent Last Name | STRING |  | datasourceColumn |  |
| `sales_agent_phone` | Sales Agent Phone | STRING |  | datasourceColumn |  |
| `sales_agent_waha_id` | Sales Agent Waha Id | STRING |  | datasourceColumn |  |
| `session` | Session | STRING |  | datasourceColumn |  |
| `tob_wa_number` | Tob Wa Number | STRING |  | datasourceColumn |  |

---

## WAHA Lead Draft

**Table:** `waha_lead_draft`  
**Foundry apiName:** `WahaLeadDraft`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Message Draft for the WAHA Lead  

**Relationships:**
- belongs to **WahaMopLead** via `waha_lead_id` (link: "WAHA MOP Lead")
- belongs to **CloseConnectingCall2** via `connecting_call_id` (link: "[Close] Connecting Call")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `category` | Category | STRING |  | editOnly |  |
| `connecting_call_id` | connecting_call_id | STRING |  | editOnly | ID of the connecting call used to create the draft |
| `created_at` | created_at | STRING |  | editOnly |  |
| `message_draft` | message_draft | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `status` | status | STRING |  | editOnly |  |
| `updated_at` | updated_at | STRING |  | editOnly |  |
| `waha_lead_id` | waha_lead_id | STRING |  | editOnly |  |

---

## [WAHA] Message Deleted (No RV)

**Table:** `waha_message_deleted_no_rv`  
**Foundry apiName:** `WahaMessageDeletedNoRv`  
**Status:** experimental  
**Datasources:** 1  
**Description:** [WAHA] Message Deleted (No RV)  

**Relationships:**
- belongs to **WahaMessageNoRv** via `original_message_id` (link: "[Waha] Messages (no RV)")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contactv2_id` | contactv2 Id | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn |  |
| `lead_full_name` | Lead Full Name | STRING |  | datasourceColumn |  |
| `original_message_id` | Original Message Id | STRING |  | datasourceColumn |  |
| `revoke_event_id` | Revoke Event Id | STRING | PK | datasourceColumn |  |
| `revoked_at` | Revoked At | TIMESTAMP |  | datasourceColumn |  |

---

## [Waha] Message (no RV)

**Table:** `waha_message_no_rv`  
**Foundry apiName:** `WahaMessageNoRv`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **WahaStreamAudioMessageWithTranscription** (link: "[WAHA] Stream Audio Messages With Transcription")
- has many **WahaEditsNoRv** (link: "[WAHA] Message Edits (no RV)")
- belongs to **WahaConversation** via `conversation_id` (link: "[Waha] Conversation")
- belongs to **WahaImage** via `id` (link: "[Waha] Image")
- has many **AudioMessageWithTranscription** (link: "Audio Messages With Transcription")
- has many **WahaMessageDeletedNoRv** (link: "[WAHA] Messages Deleted (No RV)")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `ack` | Ack | INTEGER |  | datasourceColumn |  |
| `ack_name` | Ack Name | STRING |  | datasourceColumn |  |
| `body` | Body | STRING |  | datasourceColumn |  |
| `contactv2_id` | contactv2 Id | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn |  |
| `created_at` | Created At | TIMESTAMP |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_id` | Event Id | STRING |  | datasourceColumn |  |
| `from` | From | STRING |  | datasourceColumn |  |
| `from_tob` | From Tob | BOOLEAN |  | datasourceColumn |  |
| `has_media` | Has Media | BOOLEAN |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `is_from_broadcast` | Is From Broadcast | BOOLEAN |  | datasourceColumn |  |
| `is_group` | Is Group | BOOLEAN |  | datasourceColumn |  |
| `key_id` | Key Id | STRING |  | datasourceColumn |  |
| `key_remote_jid` | Key Remote Jid | STRING |  | datasourceColumn |  |
| `key_remote_jid_alt` | Key Remote Jid Alt | STRING |  | datasourceColumn |  |
| `lead_full_name` | Lead Full Name | STRING |  | datasourceColumn |  |
| `lead_phone_number` | Lead Phone Number | STRING |  | datasourceColumn |  |
| `me_lid` | Me Lid | STRING |  | datasourceColumn |  |
| `media_filename` | Media Filename | STRING |  | datasourceColumn |  |
| `media_mimetype` | Media Mimetype | STRING |  | datasourceColumn |  |
| `media_url` | Media Url | STRING |  | datasourceColumn |  |
| `media_url_path` | Media Url Path | STRING |  | datasourceColumn |  |
| `message_timestamp` | Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `participant` | Participant | STRING |  | datasourceColumn |  |
| `payload_id` | Payload Id | STRING |  | datasourceColumn |  |
| `reply_body` | Reply Body | STRING |  | datasourceColumn |  |
| `reply_id` | Reply Id | STRING |  | datasourceColumn |  |
| `reply_participant` | Reply Participant | STRING |  | datasourceColumn |  |
| `sales_rep_email` | Sales Rep Email | STRING |  | datasourceColumn |  |
| `sales_rep_number` | Sales Rep Number | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `source_app_or_api` | Source App Or Api | STRING |  | datasourceColumn | if 'app' the message was sent from whatsapp mobile if 'api' the message was sent from WAHA (i.e. sales crm application) |
| `to` | To | STRING |  | datasourceColumn |  |
| `whatsapp_name` | Whatsapp Name | STRING |  | datasourceColumn |  |

---

## WAHA MOP Lead

**Table:** `waha_mop_lead`  
**Foundry apiName:** `WahaMopLead`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **WahaLeadDraft** (link: "WAHA Lead Draft")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `close_lead_id` | Close Lead Id | STRING |  | datasourceColumn |  |
| `count_inbount_per_lead` | Count Inbount Per Lead | LONG |  | datasourceColumn |  |
| `count_outbound_per_lead` | Count Outbound Per Lead | LONG |  | datasourceColumn |  |
| `has_inbound` | Has Inbound | BOOLEAN |  | datasourceColumn |  |
| `has_inbound_and_outbound` | Has Inbound And Outbound | BOOLEAN |  | datasourceColumn |  |
| `has_outbound` | Has Outbound | BOOLEAN |  | datasourceColumn |  |
| `last_message_timestamp` | Last Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `lead_phone_number` | Lead Phone Number | STRING |  | datasourceColumn |  |
| `mop_lead_contact_id` | Mop Lead Contact Id | STRING |  | datasourceColumn |  |
| `mop_lead_marketing_offer_id` | Mop Lead Marketing Offer Id | STRING |  | datasourceColumn |  |
| `mop_lead_primary_pain` | Mop Lead Primary Pain | STRING |  | datasourceColumn |  |
| `session` | Session | STRING |  | datasourceColumn |  |
| `tob_wa_number` | Tob Wa Number | STRING |  | datasourceColumn |  |
| `waha_lead_id` | Waha Lead Id | STRING | PK | datasourceColumn |  |

---

## [Waha] Sessions Status

**Table:** `waha_session_status`  
**Foundry apiName:** `WahaSessionStatus`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `current_status` | Current Status | STRING |  | datasourceColumn |  |
| `ghl_id` | Ghl Id | STRING |  | datasourceColumn |  |
| `last_3_statuses` | Last 3 Statuses | ARRAY |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |
| `user_name` | User Name | STRING | PK | datasourceColumn |  |

---

## [WAHA] Stream Audio Message With Transcription

**Table:** `waha_stream_audio_message_with_transcription`  
**Foundry apiName:** `WahaStreamAudioMessageWithTranscription`  
**Status:** experimental  
**Datasources:** 1  
**Description:** [WAHA] Stream Audio Message With Transcription  

**Relationships:**
- belongs to **WahaMessageNoRv** via `id` (link: "[Waha] Messages (no RV)")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `audio_url` | Audio Url | STRING |  | datasourceColumn |  |
| `from` | From | STRING |  | datasourceColumn |  |
| `from_tob` | From Tob | BOOLEAN |  | datasourceColumn |  |
| `id` | Id | STRING | PK | datasourceColumn |  |
| `lead_phone_number` | Lead Phone Number | STRING |  | datasourceColumn |  |
| `media_item_rid` | Media Item Rid | STRING |  | datasourceColumn |  |
| `media_mimetype` | Media Mimetype | STRING |  | datasourceColumn |  |
| `media_reference` | Media Reference | STRING |  | datasourceColumn |  |
| `media_rid` | Media Rid | STRING |  | datasourceColumn |  |
| `media_type` | Media Type | STRING |  | datasourceColumn |  |
| `path` | Path | STRING |  | datasourceColumn |  |
| `sales_rep_email` | Sales Rep Email | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `to` | To | STRING |  | datasourceColumn |  |
| `tob_wa_name` | Tob Wa Name | STRING |  | datasourceColumn |  |
| `transcript_summary` | Transcript Summary | STRING |  | datasourceColumn |  |
| `transcription` | Transcription | STRING |  | datasourceColumn |  |
| `transcription_ts` | Transcription Ts | TIMESTAMP |  | datasourceColumn |  |

---

## [WAHA] Struktur Analyse Image

**Table:** `waha_struktur_analyse_image`  
**Foundry apiName:** `WahaStrukturAnalyseImage`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `blurred_output_image_media_reference` | Blurred Output Image Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `blurred_output_image_rid` | Blurred Output Image Rid | STRING |  | datasourceColumn |  |
| `error` | Error | STRING |  | datasourceColumn |  |
| `image_name` | Image Name | STRING |  | datasourceColumn |  |
| `input_image_media_reference` | Input Image Media Reference | MEDIA_REFERENCE |  | datasourceColumn |  |
| `input_image_rid` | Input Image Rid | STRING |  | datasourceColumn |  |
| `interpretation` | Interpretation | STRING |  | datasourceColumn |  |
| `is_valid` | Is Valid | BOOLEAN |  | datasourceColumn |  |
| `issues` | Issues | ARRAY |  | datasourceColumn |  |
| `output_image_rid` | Output Image Rid | STRING |  | datasourceColumn |  |
| `processing_status` | Processing Status | STRING |  | datasourceColumn |  |
| `sales_rep_email` | Sales Rep Email | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `unique_id` | Unique Id | STRING | PK | datasourceColumn |  |

---

## [Funnelbox] WhatsApp Chat

**Table:** `whats_app_chat_v2`  
**Foundry apiName:** `WhatsAppChatV2`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- has many **FunnelboxContactV2** (link: "[Funnelbox] Contact v2")
- has many **LeadProfile** (link: "Lead Profile")
- belongs to **GhlTobUserV2** via `tob_id` (link: "GHL User")
- has many **GhlContactV2** (link: "GHL Contact")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `tob_assigned_id` | Assigned TOB ID | STRING |  | datasourceColumn |  |
| `tob_assigned_name` | Assigned TOB Name | STRING |  | datasourceColumn |  |
| `chat_dead` | Chat ☠️ | BOOLEAN |  | datasourceColumn |  |
| `completed` | Completed | BOOLEAN |  | datasourceColumn |  |
| `contact_id` | Contact ID | STRING | PK | datasourceColumn |  |
| `context` | Context | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation ID | STRING |  | datasourceColumn |  |
| `email` | eMail | STRING |  | datasourceColumn |  |
| `full_name` | Full Name | STRING |  | datasourceColumn |  |
| `hours_since_last_message` | Hours past | LONG |  | datasourceColumn |  |
| `hours_since_last_inbound` | Hours Since Last Inbound | LONG |  | datasourceColumn |  |
| `hours_since_last_outbound` | Hours Since Last Outbound | LONG |  | datasourceColumn |  |
| `inbound_latest_message` | Inbound Latest Message | TIMESTAMP |  | datasourceColumn |  |
| `inbound_num_messages_sent` | Inbound Num Messages Sent | LONG |  | datasourceColumn |  |
| `inbound_num_words_written` | Inbound Num Words Written | LONG |  | datasourceColumn |  |
| `last_direction` | Last Direction | STRING |  | datasourceColumn |  |
| `last_message_content` | Last Message Content | STRING |  | datasourceColumn |  |
| `last_message_time` | Last Message Time | TIMESTAMP |  | datasourceColumn |  |
| `last_user_id` | Last User ID | STRING |  | datasourceColumn |  |
| `needs_response` | Needs Response | BOOLEAN |  | datasourceColumn |  |
| `outbound_latest_message` | Outbound Latest Message | TIMESTAMP |  | datasourceColumn |  |
| `outbound_num_messages_sent` | Outbound Num Messages Sent | LONG |  | datasourceColumn |  |
| `outbound_num_words_written` | Outbound Num Words Written | LONG |  | datasourceColumn |  |
| `priority` | Priority | STRING |  | datasourceColumn |  |
| `status` | Sent Status | STRING |  | datasourceColumn |  |

---

## Whats App Message V4

**Table:** `whats_app_message_v4`  
**Foundry apiName:** `WhatsAppMessageV4`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **DraftWhatsappAnswer** (link: "Draft Whatsapp Answer")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- belongs to **WhatsAppThreadV4** via `conversation_id` (link: "Whats App Thread V2")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `app_id` | App Id | STRING |  | datasourceColumn |  |
| `body` | Body | STRING |  | datasourceColumn |  |
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `context_latest_messages` | Context Latest Messages | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn |  |
| `count_character` | Count Character | INTEGER |  | datasourceColumn |  |
| `count_words` | Count Words | INTEGER |  | datasourceColumn |  |
| `date_added` | Date Added | TIMESTAMP |  | datasourceColumn |  |
| `date_string` | Date String | STRING |  | datasourceColumn |  |
| `direction` | Direction | STRING |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `last_message_timestamp` | Last Message Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `latest_messages` | Latest Messages | ARRAY |  | datasourceColumn |  |
| `location_id` | Location Id | STRING |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `message_id` | Message Id | STRING | PK | datasourceColumn |  |
| `message_sentiment_analysis` | Message Sentiment Analysis | INTEGER |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `time_to_answer` | Time To Answer | LONG |  | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `tob_email` | Tob Email | STRING |  | datasourceColumn |  |
| `tob_first_name` | Tob First Name | STRING |  | datasourceColumn |  |
| `tob_last_name` | Tob Last Name | STRING |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |
| `version_id` | Version Id | STRING |  | datasourceColumn |  |
| `webhook_id` | Webhook Id | STRING |  | datasourceColumn |  |

---

## Whats App Thread V4

**Table:** `whats_app_thread_v4`  
**Foundry apiName:** `WhatsAppThreadV4`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **WhatsappDraftGeneration** (link: "Whatsapp Draft Generation")
- belongs to **FunnelboxContactV2** via `contact_id` (link: "[Funnelbox] Contact v2")
- has many **WhatsAppMessageV4** (link: "FuBo Whats App Message V2")
- has many **WhatsappGenerationJobQueue** (link: "Whatsapp Generation Job Queue")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING | PK | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `latest_timestamp` | Latest Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `started_timestamp` | Started Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `tob_email` | Tob Email | STRING |  | datasourceColumn |  |
| `user_id` | User Id | STRING |  | datasourceColumn |  |

---

## Whatsapp Draft Generation

**Table:** `whatsapp_draft_generation`  
**Foundry apiName:** `WhatsappDraftGeneration`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **DraftWhatsappAnswer** (link: "Draft Whatsapp Answer")
- belongs to **WhatsAppThreadV4** via `messages_to_answer` (link: "Whats App Thread V4")
- has many **WhatsappGenerationJobQueue** (link: "Whatsapp Generation Job Queue")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `approved_at` | Approved At | TIMESTAMP |  | datasourceColumn |  |
| `approved_by` | Approved By | STRING |  | datasourceColumn |  |
| `generated_by` | Generated By | STRING |  | datasourceColumn |  |
| `generation_id` | Generation Id | STRING | PK | datasourceColumn |  |
| `generation_name` | Generation Name | STRING |  | datasourceColumn |  |
| `messages_to_answer` | Threads To Answer | ARRAY |  | datasourceColumn |  |
| `prompt` | Prompt | STRING |  | datasourceColumn |  |
| `started_generation_at` | Started Generation At | TIMESTAMP |  | datasourceColumn |  |

---

## Whatsapp Generation Job Queue

**Table:** `whatsapp_generation_job_queue`  
**Foundry apiName:** `WhatsappGenerationJobQueue`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **WhatsappDraftGeneration** via `generation_id` (link: "Whatsapp Draft Generation")
- belongs to **WhatsAppThreadV4** via `thread_to_answer` (link: "Whats App Thread V4")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `generated_by` | Generated By | STRING |  | datasourceColumn |  |
| `generation_id` | Generation Id | STRING |  | datasourceColumn |  |
| `generation_name` | Generation Name | STRING |  | datasourceColumn |  |
| `is_deleted` | Is Deleted | BOOLEAN |  | datasourceColumn |  |
| `job_id` | Job Id | STRING | PK | datasourceColumn |  |
| `messages_to_answer` | Messages To Answer | ARRAY |  | datasourceColumn |  |
| `patch_offset` | Patch Offset | LONG |  | datasourceColumn |  |
| `prompt` | Prompt | STRING |  | datasourceColumn |  |
| `started_generation_at` | Started Generation At | TIMESTAMP |  | datasourceColumn |  |
| `thread_to_answer` | Thread To Answer | STRING |  | datasourceColumn |  |

---

## Workshop Applications

**Table:** `workshop_applications`  
**Foundry apiName:** `WorkshopApplications`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Repertoire of existing workshop applications  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `primary_key` | App ID | STRING | PK | datasourceColumn |  |
| `link` | Link | STRING |  | editOnly |  |
| `name` | Name | STRING |  | editOnly |  |
| `owner` | Owner | STRING |  | editOnly |  |
| `status` | Status | STRING |  | editOnly |  |

---

## Youtube Analytics

**Table:** `youtube_analytics`  
**Foundry apiName:** `YoutubeAnalytics`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `age_in_days` | Age In Days | LONG |  | datasourceColumn |  |
| `caption_fetched_at` | Caption Fetched At | STRING |  | datasourceColumn |  |
| `caption_text` | Caption Text | STRING |  | datasourceColumn |  |
| `channel_id` | Channel Id | STRING |  | datasourceColumn |  |
| `channel_title` | Channel Title | STRING |  | datasourceColumn |  |
| `comment_count` | Comment Count | LONG |  | datasourceColumn |  |
| `description` | Description | STRING |  | datasourceColumn |  |
| `duration_seconds` | Duration Seconds | LONG |  | datasourceColumn |  |
| `engagement_rate` | Engagement Rate | DOUBLE |  | datasourceColumn |  |
| `fetched_at` | Fetched At | STRING |  | datasourceColumn |  |
| `is_short` | Is Short | BOOLEAN |  | datasourceColumn |  |
| `lang_code` | Lang Code | STRING |  | datasourceColumn |  |
| `like_count` | Like Count | LONG |  | datasourceColumn |  |
| `published_at` | Published At | TIMESTAMP |  | datasourceColumn |  |
| `short_hooks` | Short Hooks | STRING |  | datasourceColumn |  |
| `short_summary` | Short Summary | STRING |  | datasourceColumn |  |
| `thumbnail_high` | Thumbnail High | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `video_id` | Video Id | STRING | PK | datasourceColumn |  |
| `video_url` | Video Url | STRING |  | datasourceColumn |  |
| `view_count` | View Count | LONG |  | datasourceColumn |  |
| `views_per_day` | Views Per Day | DOUBLE |  | datasourceColumn |  |

---

## [Zoom] Audio Media

**Table:** `zoom_audio_media`  
**Foundry apiName:** `ZoomAudioMedia`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `recording_meeting_id` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `created_ts` | Created Ts | TIMESTAMP |  | redacted |  |
| `event` | Event | STRING |  | redacted |  |
| `mariadb_id` | Mariadb Id | STRING |  | redacted |  |
| `mariiadb_created_ts` | Mariiadb Created Ts | LONG |  | redacted |  |
| `media_item_rid` | Media Item Rid | STRING | PK | redacted |  |
| `media_reference` | Media Reference | STRING |  | redacted |  |
| `media_reference2` | Media reference2 | MEDIA_REFERENCE |  | redacted |  |
| `object_account_id` | Object Account Id | STRING |  | redacted |  |
| `object_duration` | Object Duration | LONG |  | redacted |  |
| `object_host_email` | Object Host Email | STRING |  | redacted |  |
| `object_host_id` | Object Host Id | STRING |  | redacted |  |
| `object_id` | Object Id | LONG |  | redacted |  |
| `object_recording_count` | Object Recording Count | INTEGER |  | redacted |  |
| `object_share_url` | Object Share Url | STRING |  | redacted |  |
| `object_start_time` | Object Start Time | STRING |  | redacted |  |
| `object_timezone` | Object Timezone | STRING |  | redacted |  |
| `object_topic` | Object Topic | STRING |  | redacted |  |
| `object_total_size` | Object Total Size | LONG |  | redacted |  |
| `object_type` | Object Type | INTEGER |  | redacted |  |
| `object_uuid` | Object Uuid | STRING |  | redacted |  |
| `path` | Path | STRING |  | redacted |  |
| `recording_download_url` | Recording Download Url | STRING |  | redacted |  |
| `recording_end` | Recording End | STRING |  | redacted |  |
| `recording_file_extension` | Recording File Extension | STRING |  | redacted |  |
| `recording_file_size` | Recording File Size | STRING |  | redacted |  |
| `recording_file_type` | Recording File Type | STRING |  | redacted |  |
| `recording_id` | Recording Id | STRING |  | redacted |  |
| `recording_meeting_id` | Recording Meeting Id | STRING |  | redacted |  |
| `recording_play_url` | Recording Play Url | STRING |  | redacted |  |
| `recording_start` | Recording Start | STRING |  | redacted |  |
| `recording_status` | Recording Status | STRING |  | redacted |  |
| `recording_type` | Recording Type | STRING |  | redacted |  |
| `s3_key` | s3 Key | STRING |  | redacted |  |
| `s3_url` | s3 Url | STRING |  | redacted |  |
| `strategy` | Strategy | STRING |  | redacted |  |
| `timestamp` | Timestamp | TIMESTAMP |  | redacted |  |
| `updated_ts` | Updated Ts | TIMESTAMP |  | redacted |  |
| `upload_finished` | Upload Finished | BOOLEAN |  | redacted |  |
| `upload_finished_ts` | Upload Finished Ts | TIMESTAMP |  | redacted |  |
| `upload_started` | Upload Started | BOOLEAN |  | redacted |  |
| `upload_started_ts` | Upload Started Ts | TIMESTAMP |  | redacted |  |
| `url_media_rid` | Url Media Rid | STRING |  | redacted |  |

---

## [Zoom] Call To Action

**Table:** `zoom_call_to_action`  
**Foundry apiName:** `ZoomCallToAction`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `content` | Content | STRING |  | datasourceColumn |  |
| `ctas` | Ctas | STRING |  | datasourceColumn |  |
| `event_created_ts` | Event Created Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_ended_ts` | Event Ended Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_started_ts` | Event Started Ts | TIMESTAMP |  | datasourceColumn |  |
| `id` | Id | STRING |  | datasourceColumn |  |
| `meeting_start_time` | Meeting Start Time | TIMESTAMP |  | datasourceColumn |  |
| `participant_id` | Participant Id | STRING |  | datasourceColumn |  |
| `participant_uuid` | Participant Uuid | STRING |  | datasourceColumn |  |
| `payload_object_duration` | Payload Object Duration | DOUBLE |  | datasourceColumn |  |
| `payload_object_id` | Payload Object Id | STRING |  | datasourceColumn |  |
| `payload_object_topic` | Payload Object Topic | STRING |  | datasourceColumn |  |
| `payload_object_uuid` | Payload Object Uuid | STRING |  | datasourceColumn |  |
| `primary_key_speaker` | Primary Key Speaker | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `recording_end` | Recording End | TIMESTAMP |  | datasourceColumn |  |
| `recording_id` | Recording Id | STRING |  | datasourceColumn |  |
| `recording_start` | Recording Start | TIMESTAMP |  | datasourceColumn |  |
| `section_end_timestamp` | Section End Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `section_start_timestamp` | Section Start Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `segment_number` | Segment Number | STRING |  | datasourceColumn |  |
| `speaker` | Speaker | STRING |  | datasourceColumn |  |
| `speaker_email` | Speaker Email | STRING |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |

---

## [Zoom] Chat Insight

**Table:** `zoom_chat_insight`  
**Foundry apiName:** `ZoomChatInsight`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid` (link: "[Zoom] Meeting")
- belongs to **ZoomCtaSearch** via `call_to_action_id` (link: "[Zoom] CTA Search")
- belongs to **IdMatch** via `sender_email` (link: "ID Match")
- belongs to **ChatMessageZoom** via `chat_message_id` (link: "[Zoom] Chat Message")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_to_action_id` | Call to Action ID | STRING |  | editOnly |  |
| `chat_message_id` | Chat Message ID | STRING |  | editOnly |  |
| `cta_text` | CTA Text | STRING |  | editOnly |  |
| `insight` | Insight | STRING |  | editOnly |  |
| `insight_timestamp` | Insight Timestamp | TIMESTAMP |  | editOnly |  |
| `meeting_id` | Meeting ID | STRING |  | editOnly |  |
| `meeting_uuid` | Meeting UUID | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | editOnly |  |
| `sender_name` | Sender Name | STRING |  | editOnly |  |

---

## Zoom Chat Keywords

**Table:** `zoom_chat_keywords`  
**Foundry apiName:** `ZoomChatKeywords`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `active` | Active | BOOLEAN |  | editOnly |  |
| `end` | End | DATE |  | editOnly |  |
| `keyword` | Keyword | STRING |  | editOnly |  |
| `only_start` | Only Start | BOOLEAN |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `start` | Start | DATE |  | editOnly |  |

---

## [Zoom] CTA Search

**Table:** `zoom_cta_search`  
**Foundry apiName:** `ZoomCtaSearch`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid` (link: "[Zoom] Meeting")
- has many **ZoomChatInsight** (link: "[Zoom] Chat Insight")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `business_reason` | Business Reason | STRING |  | editOnly |  |
| `created_at` | Created at | TIMESTAMP |  | editOnly |  |
| `created_by` | Created by | STRING |  | editOnly |  |
| `cta_to_look_for` | Cta To Look For | STRING |  | datasourceColumn |  |
| `manual_or_llm` | Manual or LLM | STRING |  | editOnly |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `possible_words` | Possible Words | ARRAY |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `status` | Status | STRING |  | editOnly |  |
| `transcript_quote` | Transcript Quote | STRING |  | editOnly |  |
| `transcript_segment_number` | Transcript Segment Number | STRING |  | editOnly |  |
| `zoom_transcript_timestamp` | Zoom Transcript Timestamp | TIMESTAMP |  | editOnly |  |

---

## Zoom Download URL List

**Table:** `zoom_download_url_list`  
**Foundry apiName:** `ZoomDownloadUrlList`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account Id | STRING |  | datasourceColumn |  |
| `auto_delete` | Auto Delete | BOOLEAN |  | datasourceColumn |  |
| `auto_delete_date` | Auto Delete Date | STRING |  | datasourceColumn |  |
| `download_token` | Download Token | STRING |  | datasourceColumn |  |
| `download_url` | Download Url | STRING |  | datasourceColumn |  |
| `duration` | Duration | DOUBLE |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_timestamp` | Event Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `event_ts` | Event Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_type` | Event Type | STRING |  | datasourceColumn |  |
| `host_email` | Host Email | STRING |  | datasourceColumn |  |
| `host_id` | Host Id | STRING |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING | PK | datasourceColumn |  |
| `object_account_id` | Object Account Id | STRING |  | datasourceColumn |  |
| `on_prem` | On Prem | BOOLEAN |  | datasourceColumn |  |
| `p_audio_donwload_url` | P Audio Donwload Url | STRING |  | datasourceColumn |  |
| `participant_audio_files` | Participant Audio Files | STRUCT |  | datasourceColumn |  |
| `payload_object_share_url` | Payload Object Share Url | STRING |  | datasourceColumn |  |
| `payload_object_start_time` | Payload Object Start Time | STRING |  | datasourceColumn |  |
| `payload_object_topic` | Payload Object Topic | STRING |  | datasourceColumn |  |
| `payload_object_total_size` | Payload Object Total Size | DOUBLE |  | datasourceColumn |  |
| `payload_object_type` | Payload Object Type | STRING |  | datasourceColumn |  |
| `recording_count` | Recording Count | INTEGER |  | datasourceColumn |  |
| `share_url` | Share Url | STRING |  | datasourceColumn |  |
| `start_time` | Start Time | STRING |  | datasourceColumn |  |
| `strategy` | Strategy | STRING |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `total_size` | Total Size | DOUBLE |  | datasourceColumn |  |
| `transcript_download_url` | Transcript Download Url | STRING |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |

---

## [Zoom] Event Session Attendance

**Table:** `zoom_event_session_attendance`  
**Foundry apiName:** `ZoomEventSessionAttendance`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Tracks individual attendee participation and engagement metrics for Zoom event sessions and summit webinars. Each record represents a unique combination of a meeting UUID and participant, capturing live watch time, recording playback, chat engagement, and attendance patterns across multi-day events.

**Key Relationships:**
- Links to [Zoom] Event Session (parent session details)
- Links to [Funnelbox] Contact v2 (attendee contact information)
- Links to ID Match (unified contact identity)

**Primary Use Cases:**
- Analyzing attendee engagement across summit and event sessions
- Tracking live vs. recording watch time patterns
- Measuring session completion rates and drop-off points
- Identifying highly engaged participants for follow-up
- Monitoring chat participation and interaction levels
- Evaluating event content effectiveness by attendance metrics

**Relevant Properties:**
- Title: Session title
- Email: Attendee email address
- Event Name: Parent event name
- Session Name: Session identifier
- Date Session: Session date
- Total Watch Time: Total viewing duration
- Percentage Watched: Completion percentage
- Chat Message Count: Engagement metric
- Recording View Duration: Playback time
- Live vs Recording time breakdowns  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")
- belongs to **FunnelboxContactV2** via `fubo_first_id` (link: "[Funnelbox] Contact v2")
- belongs to **ZoomEventSession_2** via `session_id` (link: "[Zoom] Event Session")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `n3days_live_time_watched` | 3 Days Live Time Watched | LONG |  | datasourceColumn |  |
| `n3days_recording_time_watched` | 3 Days Recording Time Watched | DOUBLE |  | datasourceColumn |  |
| `n7days_live_time_watched` | 7 Days Live Time Watched | LONG |  | datasourceColumn |  |
| `n7days_recording_time_watched` | 7 Days Recording Time Watched | DOUBLE |  | datasourceColumn |  |
| `audience_labels` | Audience Labels | ARRAY |  | datasourceColumn |  |
| `avg_daily_view_time` | Avg Daily View Time | DOUBLE |  | datasourceColumn |  |
| `chat_message_count_words` | Chat Message Count Words | LONG |  | datasourceColumn |  |
| `date_session` | Date Session | DATE |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `end_time_session` | End Time Session | TIMESTAMP |  | datasourceColumn |  |
| `event_end_date` | Event End Date | DATE |  | datasourceColumn |  |
| `event_id` | Event Id | STRING |  | datasourceColumn |  |
| `event_name` | Event Name | STRING |  | datasourceColumn |  |
| `event_session_ids` | Event Session Ids | ARRAY |  | datasourceColumn |  |
| `event_start_date` | Event Start Date | DATE |  | datasourceColumn |  |
| `event_total_event_days` | Event Total Event Days | LONG |  | datasourceColumn |  |
| `fubo_first_id` | Fubo First ID | STRING |  | datasourceColumn |  |
| `last_day_watched_recording` | Last Day Watched Recording | DATE |  | datasourceColumn |  |
| `length_meeting` | Length Meeting | LONG |  | datasourceColumn |  |
| `meeting_duration_actual` | Meeting Duration Actual | LONG |  | datasourceColumn |  |
| `meeting_event_ended_ts` | Meeting Event Ended Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_started_ts` | Meeting Event Started Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `meetinguuid_partuuids` | Meetinguuid Partuuids | STRING | PK | datasourceColumn |  |
| `chat_message_count` | Chat Message Count | LONG |  | datasourceColumn |  |
| `message_datetime` | Message Datetime | TIMESTAMP |  | datasourceColumn |  |
| `num_participant_uuid` | Num Participant Uuid | LONG |  | datasourceColumn |  |
| `num_segments` | Num Segments | LONG |  | datasourceColumn |  |
| `participant_ids` | Participant Ids | ARRAY |  | datasourceColumn |  |
| `participant_primary_keys` | Participant Primary Keys | ARRAY |  | datasourceColumn |  |
| `participant_uuids` | Participant Uuids | ARRAY |  | datasourceColumn |  |
| `percentage_watched` | Percentage Watched | DOUBLE |  | datasourceColumn |  |
| `product_labels` | Product Labels | ARRAY |  | datasourceColumn |  |
| `recording_view_duration` | Recording View Duration | DOUBLE |  | datasourceColumn |  |
| `session_day` | Session Day | STRING |  | datasourceColumn |  |
| `session_description` | Session Description | STRING |  | datasourceColumn |  |
| `session_id` | Session Id | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `session_name_date` | Session Name Date | STRING |  | datasourceColumn |  |
| `start_time_session` | Start Time Session | TIMESTAMP |  | datasourceColumn |  |
| `time_event_ended` | Time Event Ended | TIMESTAMP |  | datasourceColumn |  |
| `time_event_started` | Time Event Started | TIMESTAMP |  | datasourceColumn |  |
| `time_joined_first` | Time Joined First | TIMESTAMP |  | datasourceColumn |  |
| `time_left_last` | Time Left Last | TIMESTAMP |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `total_live_time_missed` | Total Time Missed | LONG |  | datasourceColumn |  |
| `total_live_watchtime` | Total Watch Time | LONG |  | datasourceColumn |  |
| `user_name` | User Name | STRING |  | datasourceColumn |  |
| `yesterday_live_time_watched` | Yesterday Live Time Watched | LONG |  | datasourceColumn |  |
| `yesterday_recording_time_watched` | Yesterday Recording Time Watched | DOUBLE |  | datasourceColumn |  |

---

## [Zoom] Event Session

**Table:** `zoom_event_session_2`  
**Foundry apiName:** `ZoomEventSession_2`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- has many **ZoomEventSessionAttendance** (link: "[Zoom] Event Session Attendance")
- belongs to **ZoomSuggestedSessionDescription** via `meeting_uuid` (link: "[Zoom] Suggested Session Description")
- belongs to **MeetingZoom** via `meeting_uuid` (link: "[Zoom] Meeting")
- belongs to **ZoomEventsZoom_1** via `event_id` (link: "Zoom Events [Zoom]")
- has many **ZoomSurveyQuestion** (link: "[Zoom] Survey Question")
- has many **ZoomSurveyQA** (link: "[Zoom] Survey Q&A")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `alternative_host` | Alternative Host | ARRAY |  | datasourceColumn |  |
| `attendance_type` | Attendance Type | STRING |  | datasourceColumn |  |
| `audience_labels` | Audience Labels | ARRAY |  | datasourceColumn |  |
| `date_session` | Date Session | DATE |  | datasourceColumn |  |
| `end_time_session` | End Time Session | TIMESTAMP |  | datasourceColumn |  |
| `event_creation_time` | Event Creation Time | TIMESTAMP |  | datasourceColumn |  |
| `event_end_date` | Event End Date | DATE |  | datasourceColumn |  |
| `event_hub_id` | Event Hub ID | STRING |  | datasourceColumn |  |
| `event_id` | Event ID | STRING |  | datasourceColumn |  |
| `event_name` | Event Name | STRING |  | datasourceColumn |  |
| `event_session_ids` | Event Session IDs | ARRAY |  | datasourceColumn |  |
| `event_start_date` | Event Start Date | DATE |  | datasourceColumn |  |
| `event_type` | Event Type | STRING |  | datasourceColumn |  |
| `featured` | Featured | BOOLEAN |  | datasourceColumn |  |
| `featured_in_lobby` | Featured In Lobby | BOOLEAN |  | datasourceColumn |  |
| `is_simulive` | Is Simulive | BOOLEAN |  | datasourceColumn |  |
| `last_update_time` | Last Update Time | TIMESTAMP |  | datasourceColumn |  |
| `led_by_sponsor` | Led By Sponsor | BOOLEAN |  | datasourceColumn |  |
| `level` | Level | ARRAY |  | datasourceColumn |  |
| `mariadb_id` | Mariadb ID | STRING |  | datasourceColumn |  |
| `meeting_creation_source` | Meeting Creation Source | STRING |  | datasourceColumn |  |
| `meeting_duration_actual` | Meeting Duration Actual | LONG |  | datasourceColumn |  |
| `meeting_duration_scheduled` | Meeting Duration Scheduled | DOUBLE |  | datasourceColumn |  |
| `meeting_event_created_ts` | Meeting Event Created Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_ended_ts` | Meeting Event Ended Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_scheduled_ts` | Meeting Event Scheduled Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_started_ts` | Meeting Event Started Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_join_url` | Meeting Join Url | STRING |  | datasourceColumn |  |
| `meeting_num_chat_messages` | Meeting Num Chat Messages | LONG |  | datasourceColumn |  |
| `meeting_num_participants` | Meeting Num Participants | LONG |  | datasourceColumn |  |
| `meeting_occurrences` | Meeting Occurrences | ARRAY |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting UUID | STRING |  | datasourceColumn |  |
| `physical_location` | Physical Location | STRING |  | datasourceColumn |  |
| `product_labels` | Product Labels | ARRAY |  | datasourceColumn |  |
| `session_day` | Session Event Day | LONG |  | datasourceColumn |  |
| `session_description` | Session Description | STRING |  | datasourceColumn |  |
| `session_id` | Session ID | STRING | PK | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `session_reservation_allow_reservations` | Session Reservation Allow Reservations | BOOLEAN |  | datasourceColumn |  |
| `session_reservation_max_capacity` | Session Reservation Max Capacity | DOUBLE |  | datasourceColumn |  |
| `session_speakers` | Session Speakers | ARRAY |  | datasourceColumn |  |
| `start_time_session` | Start Time Session | TIMESTAMP |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `event_total_event_days` | Total Event Days | LONG |  | datasourceColumn |  |
| `track_labels` | Track Labels | ARRAY |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `visible_in_landing_page` | Visible In Landing Page | BOOLEAN |  | datasourceColumn |  |
| `visible_in_lobby` | Visible In Lobby | BOOLEAN |  | datasourceColumn |  |
| `wh_deleted` | Wh Deleted | BOOLEAN |  | datasourceColumn |  |

---

## [Zoom] Event

**Table:** `zoom_events_zoom_1`  
**Foundry apiName:** `ZoomEventsZoom_1`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- has many **ZoomEventSession_2** (link: "Zoom Event Session")
- has many **ZoomTicketsZoom** (link: "Zoom Tickets [Zoom]")
- has many **ZoomTicketsZoom** (link: "Zoom Ticket")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `attendance_type` | Attendance Type | STRING |  | datasourceColumn |  |
| `description` | Description | STRING |  | datasourceColumn |  |
| `end_time` | End Time | TIMESTAMP |  | datasourceColumn |  |
| `event_id` | Event ID | STRING | PK | datasourceColumn |  |
| `webhook_timestamp` | Event Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `event_type` | Event Type | STRING |  | datasourceColumn |  |
| `host_id` | Host ID | STRING |  | datasourceColumn |  |
| `hub_id` | Hub ID | STRING |  | datasourceColumn |  |
| `webhook_event_name` | Name | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `start_time` | Start Time | TIMESTAMP |  | datasourceColumn |  |
| `status` | Status | STRING |  | datasourceColumn |  |
| `tagline` | Tagline | STRING |  | datasourceColumn |  |

---

## [Zoom][Light] Chat Message

**Table:** `zoom_light_chat_message`  
**Foundry apiName:** `ZoomLightChatMessage`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_instance_id` (link: "[Zoom] Meeting")
- belongs to **IdMatch** via `sender_email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_ts` | Event Ts | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_instance_id` | Meeting Instance Id | STRING |  | datasourceColumn |  |
| `message_content` | Message Content | STRING |  | datasourceColumn |  |
| `message_datetime_utc` | Message Datetime | TIMESTAMP |  | datasourceColumn |  |
| `message_id` | Message Id | STRING | PK | datasourceColumn |  |
| `recipient_type` | Recipient Type | STRING |  | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | datasourceColumn |  |
| `sender_name` | Sender Name | STRING |  | datasourceColumn |  |

---

## Zoom Meeting Current Attende

**Table:** `zoom_meeting_current_attende`  
**Foundry apiName:** `ZoomMeetingCurrentAttende`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Live stream of data  

**Relationships:**
- belongs to **IdMatch** via `participant_email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `event_label` | Event Label | STRING |  | redacted |  |
| `event_reason` | Event Reason | STRING |  | redacted |  |
| `joined_but_left` | Joined But Left | BOOLEAN |  | redacted |  |
| `meeting_id` | Meeting Id | STRING |  | redacted |  |
| `meeting_start_time` | Meeting Start Time | TIMESTAMP |  | redacted |  |
| `meeting_topic` | Meeting Topic | STRING |  | redacted |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | redacted |  |
| `participant_email` | Participant Email | STRING |  | redacted |  |
| `participant_event_time` | Participant Event Time | TIMESTAMP |  | redacted |  |
| `participant_id` | Participant Id | STRING |  | redacted |  |
| `participant_left_event_label` | Participant Left Event Label | STRING |  | redacted |  |
| `participant_left_event_reason` | Participant Left Event Reason | STRING |  | redacted |  |
| `participant_left_meeting_id` | Participant Left Meeting Id | STRING |  | redacted |  |
| `participant_left_meeting_start_time` | Participant Left Meeting Start Time | TIMESTAMP |  | redacted |  |
| `participant_left_meeting_topic` | Participant Left Meeting Topic | STRING |  | redacted |  |
| `participant_left_meeting_uuid` | Participant Left Meeting Uuid | STRING |  | redacted |  |
| `participant_left_participant_email` | Participant Left Participant Email | STRING |  | redacted |  |
| `participant_left_participant_event_time` | Participant Left Participant Event Time | TIMESTAMP |  | redacted |  |
| `participant_left_participant_id` | Participant Left Participant Id | STRING |  | redacted |  |
| `participant_left_participant_user_name` | Participant Left Participant User Name | STRING |  | redacted |  |
| `participant_left_participant_uuid` | Participant Left Participant Uuid | STRING |  | redacted |  |
| `participant_user_name` | Participant User Name | STRING |  | redacted |  |
| `participant_uuid` | Participant Uuid | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |

---

## EXPERIMENTAL Zoom Meeting Started Incremental

**Table:** `zoom_meeting_started_incremental`  
**Foundry apiName:** `ZoomMeetingStartedIncremental`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ZoomMessagesIncremental** (link: "Zoom Messages Incremental")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `payload_account_id` | Account ID | STRING |  | datasourceColumn |  |
| `payload_object_duration` | Duration | DOUBLE |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_started_ts` | Event Started Ts | STRING |  | datasourceColumn |  |
| `event_ts` | Event Ts | TIMESTAMP |  | datasourceColumn |  |
| `payload_object_host_id` | Host ID | STRING |  | datasourceColumn |  |
| `mariadb_id` | MariaDB ID | STRING |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | STRING |  | datasourceColumn |  |
| `payload_object_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `payload_object_uuid` | Meeting Instance | STRING | PK | datasourceColumn |  |
| `payload_object_type` | Meeting Type | DOUBLE |  | datasourceColumn |  |
| `payload_object_timezone` | Timezone | STRING |  | datasourceColumn |  |
| `payload_object_topic` | Topic | STRING |  | datasourceColumn |  |

---

## EXPERIMENTAL Zoom Meeting Started Incremental Direct

**Table:** `zoom_meeting_started_incremental_direct`  
**Foundry apiName:** `ZoomMeetingStartedIncrementalDirect`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ZoomMessagesIncremental** (link: "Zoom Messages Incremental")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_started_ts` | Event Started Ts | STRING |  | datasourceColumn |  |
| `event_ts` | Event Ts | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `payload_account_id` | Payload Account Id | STRING |  | datasourceColumn |  |
| `payload_object_duration` | Payload Object Duration | DOUBLE |  | datasourceColumn |  |
| `payload_object_host_id` | Payload Object Host Id | STRING |  | datasourceColumn |  |
| `payload_object_id` | Payload Object Id | STRING |  | datasourceColumn |  |
| `payload_object_timezone` | Payload Object Timezone | STRING |  | datasourceColumn |  |
| `payload_object_topic` | Payload Object Topic | STRING |  | datasourceColumn |  |
| `payload_object_type` | Payload Object Type | DOUBLE |  | datasourceColumn |  |
| `payload_object_uuid` | Payload Object Uuid | STRING | PK | datasourceColumn |  |

---

## EXPERIMENTAL Zoom Messages Incremental

**Table:** `zoom_messages_incremental`  
**Foundry apiName:** `ZoomMessagesIncremental`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **ZoomMeetingStartedIncremental** via `meeting_instance_id` (link: "Zoom Meeting Started Incremental")
- belongs to **ZoomMeetingStartedIncrementalDirect** via `meeting_instance_id` (link: "Zoom Meeting Started Incremental Direct")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account Id | STRING |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_ts` | Event Ts | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | MariaDB ID | STRING | PK | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_instance_id` | Meeting Instance Id | STRING |  | datasourceColumn |  |
| `message_content` | Message Content | STRING |  | datasourceColumn |  |
| `message_datetime` | Message Datetime | TIMESTAMP |  | datasourceColumn |  |
| `message_id` | Message Id | STRING |  | datasourceColumn |  |
| `recipient_email` | Recipient Email | STRING |  | datasourceColumn |  |
| `recipient_foreign_key` | Recipient Foreign Key | STRING |  | datasourceColumn |  |
| `recipient_name` | Recipient Name | STRING |  | datasourceColumn |  |
| `recipient_session_id` | Recipient Session Id | STRING |  | datasourceColumn |  |
| `recipient_type` | Recipient Type | STRING |  | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | datasourceColumn |  |
| `sender_foreign_key` | Sender Foreign Key | STRING |  | datasourceColumn |  |
| `sender_name` | Sender Name | STRING |  | datasourceColumn |  |
| `sender_session_id` | Sender Session Id | STRING |  | datasourceColumn |  |
| `sender_type` | Sender Type | STRING |  | datasourceColumn |  |

---

## [Zoom] Meeting Polls Q&A

**Table:** `zoom_qa_2`  
**Foundry apiName:** `ZoomQA_2`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **ParticipantZoom_1** via `e_mail` (link: "[Zoom] Contact")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | datasourceColumn |  |
| `email` | eMail | STRING |  | datasourceColumn |  |
| `id` | ID | STRING | PK | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `meeting_started` | Meeting Started Time | TIMESTAMP |  | datasourceColumn |  |
| `topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `created_ts` | QA answered Time | TIMESTAMP |  | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |

---

## [Zoom] Session Recording Day Segments

**Table:** `zoom_recording_session_watchtime`  
**Foundry apiName:** `ZoomRecordingSessionWatchtime`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `daily_view_time` | Daily View Time | DOUBLE |  | datasourceColumn |  |
| `date` | Date | DATE |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `recording_view_duration` | Recording View Duration | DOUBLE |  | datasourceColumn |  |
| `session_email_id` | Session Email Id | STRING |  | datasourceColumn |  |
| `session_id` | Session Id | STRING |  | datasourceColumn |  |

---

## [Zoom][Stream] Chat Message

**Table:** `zoom_stream_chat_message`  
**Foundry apiName:** `ZoomStreamChatMessage`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `object_uuid` (link: "[Zoom] Meeting")
- belongs to **IdMatch** via `sender_email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `alternative_host` | Alternative Host | ARRAY |  | datasourceColumn |  |
| `are_there_phone_number_extracted_from_message` | Are There Phone Number Extracted From Message | BOOLEAN |  | datasourceColumn |  |
| `attendance_type` | Attendance Type | STRING |  | datasourceColumn |  |
| `audience_labels` | Audience Labels | ARRAY |  | datasourceColumn |  |
| `close_contact_id` | Close Contact Id | ARRAY |  | datasourceColumn |  |
| `close_lead_id` | Close Lead Id | ARRAY |  | datasourceColumn |  |
| `date_session` | Date Session | DATE |  | datasourceColumn |  |
| `date_time` | Date Time | TIMESTAMP |  | datasourceColumn |  |
| `end_time_session` | End Time Session | TIMESTAMP |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_creation_time` | Event Creation Time | TIMESTAMP |  | datasourceColumn |  |
| `event_end_date` | Event End Date | DATE |  | datasourceColumn |  |
| `event_hub_id` | Event Hub Id | STRING |  | datasourceColumn |  |
| `event_id` | Event Id | STRING |  | datasourceColumn |  |
| `event_name` | Event Name | STRING |  | datasourceColumn |  |
| `event_session_ids` | Event Session Ids | ARRAY |  | datasourceColumn |  |
| `event_start_date` | Event Start Date | DATE |  | datasourceColumn |  |
| `event_total_event_days` | Event Total Event Days | LONG |  | datasourceColumn |  |
| `event_type` | Event Type | STRING |  | datasourceColumn |  |
| `exported_summit_profile` | Exported Summit Profile | TIMESTAMP |  | datasourceColumn |  |
| `extracted_phone_numbers` | Extracted Phone Numbers | ARRAY |  | datasourceColumn |  |
| `featured` | Featured | BOOLEAN |  | datasourceColumn |  |
| `featured_in_lobby` | Featured In Lobby | BOOLEAN |  | datasourceColumn |  |
| `ghl_contact_ids` | Ghl Contact Ids | ARRAY |  | datasourceColumn |  |
| `is_simulive` | Is Simulive | BOOLEAN |  | datasourceColumn |  |
| `last_update_time` | Last Update Time | TIMESTAMP |  | datasourceColumn |  |
| `led_by_sponsor` | Led By Sponsor | BOOLEAN |  | datasourceColumn |  |
| `level` | Level | ARRAY |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `meeting_creation_source` | Meeting Creation Source | STRING |  | datasourceColumn |  |
| `meeting_duration_actual` | Meeting Duration Actual | LONG |  | datasourceColumn |  |
| `meeting_duration_scheduled` | Meeting Duration Scheduled | DOUBLE |  | datasourceColumn |  |
| `meeting_event_created_ts` | Meeting Event Created Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_ended_ts` | Meeting Event Ended Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_scheduled_ts` | Meeting Event Scheduled Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_event_started_ts` | Meeting Event Started Ts | TIMESTAMP |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_join_url` | Meeting Join Url | STRING |  | datasourceColumn |  |
| `meeting_num_chat_messages` | Meeting Num Chat Messages | LONG |  | datasourceColumn |  |
| `meeting_num_participants` | Meeting Num Participants | LONG |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `message_content` | Message Content | STRING |  | datasourceColumn |  |
| `message_id` | Message Id | STRING | PK | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `num_tickets` | Num Tickets | LONG |  | datasourceColumn |  |
| `num_zoom_meetings` | Num Zoom Meetings | LONG |  | datasourceColumn |  |
| `object_id` | Object Id | LONG |  | datasourceColumn |  |
| `object_uuid` | Object Uuid | STRING |  | datasourceColumn |  |
| `pandadoc_ids` | Pandadoc Ids | ARRAY |  | datasourceColumn |  |
| `payload_id` | Payload Id | STRING |  | datasourceColumn |  |
| `phone_numbers_extracted_from_message` | Phone Numbers Extracted From Message | STRING |  | datasourceColumn |  |
| `physical_location` | Physical Location | STRING |  | datasourceColumn |  |
| `product_labels` | Product Labels | ARRAY |  | datasourceColumn |  |
| `recipient_type` | Recipient Type | STRING |  | datasourceColumn |  |
| `sender_email` | Sender Email | STRING |  | datasourceColumn |  |
| `session_day` | Session Day | LONG |  | datasourceColumn |  |
| `session_description` | Session Description | STRING |  | datasourceColumn |  |
| `session_id` | Session Id | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `session_reservation_allow_reservations` | Session Reservation Allow Reservations | BOOLEAN |  | datasourceColumn |  |
| `session_reservation_max_capacity` | Session Reservation Max Capacity | DOUBLE |  | datasourceColumn |  |
| `start_time_session` | Start Time Session | TIMESTAMP |  | datasourceColumn |  |
| `summit_profile_triggered` | Summit Profile Triggered | TIMESTAMP |  | datasourceColumn |  |
| `tags` | Tags | ARRAY |  | datasourceColumn |  |
| `tags_zoom_keywords` | Tags Zoom Keywords | ARRAY |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |
| `track_labels` | Track Labels | ARRAY |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `uuid_foundry` | Uuid Foundry | STRING |  | datasourceColumn |  |
| `visible_in_landing_page` | Visible In Landing Page | BOOLEAN |  | datasourceColumn |  |
| `visible_in_lobby` | Visible In Lobby | BOOLEAN |  | datasourceColumn |  |
| `zoom_meeting_ids` | Zoom Meeting Ids | ARRAY |  | datasourceColumn |  |
| `zoom_meeting_instance_ids` | Zoom Meeting Instance Ids | ARRAY |  | datasourceColumn |  |
| `zoom_participant_uuids` | Zoom Participant Uuids | ARRAY |  | datasourceColumn |  |
| `zoom_ticket_ids` | Zoom Ticket Ids | ARRAY |  | datasourceColumn |  |
| `zoom_user_ids` | Zoom User Ids | ARRAY |  | datasourceColumn |  |

---

## [Zoom] Suggested Session Description

**Table:** `zoom_suggested_session_description`  
**Foundry apiName:** `ZoomSuggestedSessionDescription`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **ZoomEventSession_2** (link: "[Zoom] Event Session")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `download_download_file_content` | Download Download File Content | STRING |  | datasourceColumn |  |
| `end_time_session` | End Time Session | TIMESTAMP |  | datasourceColumn |  |
| `event_id` | Event Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING | PK | datasourceColumn |  |
| `session_id` | Session Id | STRING |  | datasourceColumn |  |
| `session_name` | Session Name | STRING |  | datasourceColumn |  |
| `start_time_session` | Start Time Session | TIMESTAMP |  | datasourceColumn |  |
| `suggested_description` | Suggested Description | STRING |  | datasourceColumn |  |

---

## [Zoom] Summit Session Summary

**Table:** `zoom_summit_transcipt`  
**Foundry apiName:** `ZoomSummitTranscipt`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

AI-generated German-language summaries specifically for Zoom summit and event sessions. Provides concise session overviews that capture key points and takeaways from summit presentations, making event content easily digestible and searchable.

**Key Relationships:**
- Links to [Zoom] Meeting (source meeting for summary)

**Primary Use Cases:**
- Quick session overviews for attendees who missed sessions
- Content discovery across summit archives
- Searchable summaries for knowledge retrieval
- Event content cataloging and organization
- Follow-up recommendations based on session topics

**Relevant Properties:**
- Zusammenfassung Summit Session: German session summary
- Meeting UUID: Source meeting identifier
- Meeting ID: Zoom meeting ID
- Event ID: Parent event identifier
- Session ID: Session identifier  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_meeting_uuid` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `event_id` | Event ID | STRING |  | redacted |  |
| `meeting_id` | Meeting ID | STRING |  | redacted |  |
| `meeting_uuid` | Meeting UUID | STRING |  | redacted |  |
| `pk` | Pk | STRING | PK | redacted |  |
| `session_id` | Session ID | STRING |  | redacted |  |
| `zusammenfassung_summit_session` | Zusammenfassung Summit Session | STRING |  | redacted |  |

---

## [Zoom] Survey Q&A

**Table:** `zoom_survey_qa`  
**Foundry apiName:** `ZoomSurveyQA`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **ZoomEventSession_2** via `session_id` (link: "[Zoom] Event Session")
- belongs to **ZoomSurveyQuestion** via `question_id_1` (link: "[Zoom] Survey Question")
- belongs to **IdMatch** via `email` (link: "ID Match")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `answer` | Answer | STRING |  | datasourceColumn |  |
| `date_time` | Date Time | TIMESTAMP |  | datasourceColumn |  |
| `email` | Email | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting ID | STRING |  | datasourceColumn |  |
| `topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `polling_id` | Polling ID | STRING |  | datasourceColumn |  |
| `qa_id` | Q&A ID | STRING | PK | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |
| `question_id` | Question ID | STRING |  | datasourceColumn |  |
| `session_id` | Session ID | STRING |  | datasourceColumn |  |
| `start_time` | Start Time | TIMESTAMP |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |

---

## [Zoom] Survey Question

**Table:** `zoom_survey_question`  
**Foundry apiName:** `ZoomSurveyQuestion`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **ZoomEventSession_2** via `session_ids` (link: "[Zoom] Event Session")
- has many **ZoomSurveyQA** (link: "[Zoom] Survey Q&A")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `meaning` | Meaning | STRING |  | datasourceColumn |  |
| `meeting_ids` | Meeting IDs | ARRAY |  | datasourceColumn |  |
| `topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `qa_id` | Q&A ID | ARRAY |  | datasourceColumn |  |
| `question` | Question | STRING |  | datasourceColumn |  |
| `question_id` | Question ID | STRING | PK | datasourceColumn |  |
| `question_type` | Question Type | STRING |  | datasourceColumn |  |
| `session_ids` | Session IDs | ARRAY |  | datasourceColumn |  |

---

## [Zoom] Ticket Join Link

**Table:** `zoom_ticket_join_link`  
**Foundry apiName:** `ZoomTicketJoinLink`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | datasourceColumn |  |
| `event_id` | Event Id | STRING |  | datasourceColumn |  |
| `event_join_link` | Event Join Link | STRING |  | datasourceColumn |  |
| `ticket_created_ts` | Ticket Created Ts | TIMESTAMP |  | datasourceColumn |  |
| `ticket_id` | Ticket Id | STRING | PK | datasourceColumn |  |

---

## [Zoom] Ticket

**Table:** `zoom_tickets_zoom`  
**Foundry apiName:** `ZoomTicketsZoom`  
**Status:** active  
**Datasources:** 1  

**Relationships:**
- belongs to **IdMatch** via `email` (link: "ID Match")
- belongs to **ZoomEventsZoom_1** via `event_id` (link: "Zoom Events [Zoom]")
- belongs to **ZoomEventsZoom_1** via `event_id` (link: "Zoom Events [Zoom]")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account ID | STRING |  | datasourceColumn |  |
| `authentication_method` | Authentication Method | STRING |  | datasourceColumn |  |
| `email` | eMail | STRING |  | datasourceColumn |  |
| `event_id` | Event ID | STRING |  | datasourceColumn |  |
| `webhook_event_name` | Event Name | STRING |  | datasourceColumn |  |
| `event_timestamp` | Event Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `host` | Host | STRING |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `strategy` | Strategy | STRING |  | datasourceColumn |  |
| `ticket_id` | Ticket ID | STRING | PK | datasourceColumn |  |
| `ticket_role_type` | Ticket Role Type | STRING |  | datasourceColumn |  |
| `ticket_type_attendance_type` | Ticket Type Attendance Type | STRING |  | datasourceColumn |  |
| `ticket_type_description` | Ticket Type Description | STRING |  | datasourceColumn |  |
| `ticket_type_id` | Ticket Type ID | STRING |  | datasourceColumn |  |
| `ticket_type_name` | Ticket Type Name | STRING |  | datasourceColumn |  |
| `title` | Title | STRING |  | datasourceColumn |  |

---

## Payload to Zoom

**Table:** `zoom_to_zapier_for_vimeo`  
**Foundry apiName:** `ZoomToZapierForVimeo`  
**Status:** active  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `download_url` | Download Url | STRING |  | datasourceColumn |  |
| `duration` | Duration | INTEGER |  | datasourceColumn |  |
| `host_id` | Host Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `recording_type` | Recording Type | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `test_recording_start` | Test Recording Start | TIMESTAMP |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `total_size` | Total Size | DOUBLE |  | datasourceColumn |  |
| `transcript_download_url` | Transcript Download Url | STRING |  | datasourceColumn |  |
| `unique_id` | Unique Id | STRING | PK | datasourceColumn |  |

---

## [Zoom] Transcript Block

**Table:** `zoom_transcript_block`  
**Foundry apiName:** `ZoomTranscriptBlock`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `payload_object_uuid` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `content` | Content | ARRAY |  | datasourceColumn |  |
| `content_embeddings` | Content Embeddings | VECTOR |  | datasourceColumn |  |
| `id` | Id | STRING |  | datasourceColumn |  |
| `meeting_start_time` | Meeting Start Time | TIMESTAMP |  | datasourceColumn |  |
| `participant_id` | Participant Id | STRING |  | datasourceColumn |  |
| `participant_uuid` | Participant Uuid | STRING |  | datasourceColumn |  |
| `meeting_duration` | Payload Object Duration | DOUBLE |  | datasourceColumn |  |
| `meeting_topic` | Payload Object Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `primary_key_speaker` | Primary Key Speaker | STRING |  | datasourceColumn |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `recording_id` | Recording Id | STRING |  | datasourceColumn |  |
| `section_end_timestamp` | Section End Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `section_start_timestamp` | Section Start Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `segment_number` | Segment Number | STRING |  | datasourceColumn |  |
| `speaker` | Speaker | STRING |  | datasourceColumn |  |
| `speaker_email` | Speaker Email | STRING |  | datasourceColumn |  |

---

## [Zoom] Transcript Chunks Embedding

**Table:** `zoom_transcript_chunks_embedding`  
**Foundry apiName:** `ZoomTranscriptChunksEmbedding`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Vector embeddings of Zoom transcript chunks for AI-powered semantic search and retrieval. Transcripts are split into manageable chunks, embedded using AI models, and stored with metadata to enable similarity search across meeting content, speaker identification, and context-aware Q&A systems.

**Content Classifications:**
- Summit Call Chunks
- Training Call Chunks
- Other Call Chunks

**Key Relationships:**
- Links to [Zoom] Transcript (parent transcript document)

**Primary Use Cases:**
- Semantic search across meeting content
- AI-powered Q&A on meeting archives
- Finding similar discussion topics across meetings
- Speaker-specific content retrieval
- Context building for RAG applications
- Knowledge base population from meeting content

**Relevant Properties:**
- Chunk Id: Unique chunk identifier
- Text To Embed: Text content for embedding
- Tokens: Token count for the chunk
- Chunk Order: Position within transcript
- Embedding Vector: Vector representation
- Zusammenfassung / Summary Eng: Summaries
- Is Summit Call / Is Training Call / Is Other Call: Classification flags
- Speaker distributions: Speaker attribution data
- Embedded At: Embedding timestamp  

**Relationships:**
- belongs to **TranscriptZoom** via `download_recording_id` (link: "[Zoom] Transcript")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `chunk_id` | Chunk Id | STRING | PK | datasourceColumn |  |
| `chunk_order` | Chunk Order | DOUBLE |  | datasourceColumn |  |
| `download_recording_id` | Download Recording Id | STRING |  | datasourceColumn |  |
| `embedded_at` | Embedded At | TIMESTAMP |  | datasourceColumn |  |
| `embedding_vector` | Embedding Vector | VECTOR |  | datasourceColumn |  |
| `is_other_call` | Is Other Call | BOOLEAN |  | datasourceColumn |  |
| `is_summit_call` | Is Summit Call | BOOLEAN |  | datasourceColumn |  |
| `is_training_call` | Is Training Call | BOOLEAN |  | datasourceColumn |  |
| `justus_percentage` | Justus Percentage | DOUBLE |  | datasourceColumn |  |
| `new_property1` | New property 1 | STRING |  | editOnly |  |
| `speaker_distributions` | Speaker Distributions | ARRAY |  | datasourceColumn |  |
| `speaker_text_flattened` | Speaker Text Flattened | STRING |  | datasourceColumn |  |
| `speaker_text_flattened_json` | Speaker Text Flattened Json | ARRAY |  | datasourceColumn |  |
| `summary_eng` | Summary Eng | STRING |  | datasourceColumn |  |
| `text_to_embed` | Text To Embed | STRING |  | datasourceColumn |  |
| `tokens` | Tokens | DOUBLE |  | datasourceColumn |  |
| `total_number_of_chunks` | Total Number Of Chunks | LONG |  | datasourceColumn |  |
| `transcripts_chunk_len` | Transcripts Chunk Len | INTEGER |  | datasourceColumn |  |
| `zusammenfassung` | Zusammenfassung | STRING |  | datasourceColumn |  |

---

## [Zoom] Transcripts raw

**Table:** `zoom_transcripts_raw`  
**Foundry apiName:** `ZoomTranscriptsRaw`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `meeting_uuid` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_id` | Call Id | STRING |  | datasourceColumn |  |
| `download_datetime_created` | Download Datetime Created | TIMESTAMP |  | datasourceColumn |  |
| `download_datetime_finished` | Download Datetime Finished | TIMESTAMP |  | datasourceColumn |  |
| `download_datetime_updated` | Download Datetime Updated | TIMESTAMP |  | datasourceColumn |  |
| `download_download_file_content` | Download Download File Content | STRING |  | datasourceColumn |  |
| `download_download_url` | Download Download Url | STRING |  | datasourceColumn |  |
| `download_file_extension` | Download File Extension | STRING |  | datasourceColumn |  |
| `download_file_size` | Download File Size | LONG |  | datasourceColumn |  |
| `download_file_type` | Download File Type | STRING |  | datasourceColumn |  |
| `download_id` | Download Id | STRING |  | datasourceColumn |  |
| `download_meeting_uuid` | Download Meeting Uuid | STRING |  | datasourceColumn |  |
| `download_play_url` | Download Play Url | STRING |  | datasourceColumn |  |
| `download_process_status` | Download Process Status | STRING |  | datasourceColumn |  |
| `download_recording_end` | Download Recording End | TIMESTAMP |  | datasourceColumn |  |
| `download_recording_id` | Download Recording Id | STRING | PK | datasourceColumn |  |
| `download_recording_start` | Download Recording Start | TIMESTAMP |  | datasourceColumn |  |
| `download_recording_type` | Download Recording Type | STRING |  | datasourceColumn |  |
| `download_retry` | Download Retry | SHORT |  | datasourceColumn |  |
| `download_status` | Download Status | STRING |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `has_transcript` | Has Transcript | BOOLEAN |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `meeting_duration` | Meeting Duration | DOUBLE |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_start_time` | Meeting Start Time | TIMESTAMP |  | datasourceColumn |  |
| `meeting_topic` | Meeting Topic | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING |  | datasourceColumn |  |
| `payload_object_auto_delete` | Payload Object Auto Delete | BOOLEAN |  | datasourceColumn |  |
| `payload_object_auto_delete_date` | Payload Object Auto Delete Date | STRING |  | datasourceColumn |  |
| `payload_object_host_email` | Payload Object Host Email | STRING |  | datasourceColumn |  |
| `payload_object_host_id` | Payload Object Host Id | STRING |  | datasourceColumn |  |
| `payload_object_recording_count` | Payload Object Recording Count | DOUBLE |  | datasourceColumn |  |
| `payload_object_share_url` | Payload Object Share Url | STRING |  | datasourceColumn |  |
| `payload_object_timezone` | Payload Object Timezone | STRING |  | datasourceColumn |  |
| `payload_object_total_size` | Payload Object Total Size | DOUBLE |  | datasourceColumn |  |

---

## [Zoom] Video Media

**Table:** `zoom_video_media`  
**Foundry apiName:** `ZoomVideoMedia`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **MeetingZoom** via `recording_meeting_id` (link: "[Zoom] Meeting")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `created_ts` | Created Ts | TIMESTAMP |  | redacted |  |
| `event` | Event | STRING |  | redacted |  |
| `mariadb_id` | Mariadb Id | STRING |  | redacted |  |
| `mariiadb_created_ts` | Mariiadb Created Ts | LONG |  | redacted |  |
| `media_item_rid` | Media Item Rid | STRING | PK | redacted |  |
| `media_reference` | Media Reference | STRING |  | redacted |  |
| `media_reference2` | Media reference2 | MEDIA_REFERENCE |  | redacted |  |
| `object_account_id` | Object Account Id | STRING |  | redacted |  |
| `object_duration` | Object Duration | LONG |  | redacted |  |
| `object_host_email` | Object Host Email | STRING |  | redacted |  |
| `object_host_id` | Object Host Id | STRING |  | redacted |  |
| `object_id` | Object Id | LONG |  | redacted |  |
| `object_recording_count` | Object Recording Count | INTEGER |  | redacted |  |
| `object_share_url` | Object Share Url | STRING |  | redacted |  |
| `object_start_time` | Object Start Time | STRING |  | redacted |  |
| `object_timezone` | Object Timezone | STRING |  | redacted |  |
| `object_topic` | Object Topic | STRING |  | redacted |  |
| `object_total_size` | Object Total Size | LONG |  | redacted |  |
| `object_type` | Object Type | INTEGER |  | redacted |  |
| `object_uuid` | Object Uuid | STRING |  | redacted |  |
| `path` | Path | STRING |  | redacted |  |
| `recording_download_url` | Recording Download Url | STRING |  | redacted |  |
| `recording_end` | Recording End | STRING |  | redacted |  |
| `recording_file_extension` | Recording File Extension | STRING |  | redacted |  |
| `recording_file_size` | Recording File Size | STRING |  | redacted |  |
| `recording_file_type` | Recording File Type | STRING |  | redacted |  |
| `recording_id` | Recording Id | STRING |  | redacted |  |
| `recording_meeting_id` | Recording Meeting Id | STRING |  | redacted |  |
| `recording_play_url` | Recording Play Url | STRING |  | redacted |  |
| `recording_start` | Recording Start | STRING |  | redacted |  |
| `recording_status` | Recording Status | STRING |  | redacted |  |
| `recording_type` | Recording Type | STRING |  | redacted |  |
| `s3_key` | s3 Key | STRING |  | redacted |  |
| `s3_url` | s3 Url | STRING |  | redacted |  |
| `strategy` | Strategy | STRING |  | redacted |  |
| `timestamp` | Timestamp | TIMESTAMP |  | redacted |  |
| `updated_ts` | Updated Ts | TIMESTAMP |  | redacted |  |
| `upload_finished` | Upload Finished | BOOLEAN |  | redacted |  |
| `upload_finished_ts` | Upload Finished Ts | TIMESTAMP |  | redacted |  |
| `upload_started` | Upload Started | BOOLEAN |  | redacted |  |
| `upload_started_ts` | Upload Started Ts | TIMESTAMP |  | redacted |  |
| `url_media_rid` | Url Media Rid | STRING |  | redacted |  |

---

## Zoom Recording daten fur Zoom

**Table:** `zoom_zapier_webhook`  
**Foundry apiName:** `ZoomZapierWebhook`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `account_id` | Account Id | STRING |  | datasourceColumn |  |
| `auto_delete` | Auto Delete | BOOLEAN |  | datasourceColumn |  |
| `auto_delete_date` | Auto Delete Date | STRING |  | datasourceColumn |  |
| `download_token` | Download Token | STRING |  | datasourceColumn |  |
| `duration` | Duration | INTEGER |  | datasourceColumn |  |
| `event` | Event | STRING |  | datasourceColumn |  |
| `event_timestamp` | Event Timestamp | TIMESTAMP |  | datasourceColumn |  |
| `event_ts` | Event Ts | TIMESTAMP |  | datasourceColumn |  |
| `event_type` | Event Type | STRING |  | datasourceColumn |  |
| `host_email` | Host Email | STRING |  | datasourceColumn |  |
| `host_id` | Host Id | STRING |  | datasourceColumn |  |
| `mariadb_date_created` | Mariadb Date Created | TIMESTAMP |  | datasourceColumn |  |
| `mariadb_id` | Mariadb Id | STRING |  | datasourceColumn |  |
| `meeting_id` | Meeting Id | STRING |  | datasourceColumn |  |
| `meeting_uuid` | Meeting Uuid | STRING | PK | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `object_account_id` | Object Account Id | STRING |  | datasourceColumn |  |
| `on_prem` | On Prem | BOOLEAN |  | datasourceColumn |  |
| `participant_audio_files` | Participant Audio Files | ARRAY |  | datasourceColumn |  |
| `payload_object_recording_files` | Payload Object Recording Files | STRUCT |  | datasourceColumn |  |
| `priority` | Priority | STRING |  | datasourceColumn |  |
| `recording_count` | Recording Count | INTEGER |  | datasourceColumn |  |
| `recording_files` | Recording Files | STRUCT |  | datasourceColumn |  |
| `second_download_url` | Second Download Url | STRING |  | datasourceColumn |  |
| `second_recording_type` | Second Recording Type | STRING |  | datasourceColumn |  |
| `share_url` | Share Url | STRING |  | datasourceColumn |  |
| `start_time` | Start Time | TIMESTAMP |  | datasourceColumn |  |
| `test_download_url` | Test Download Url | STRING |  | datasourceColumn |  |
| `test_file_extension` | Test File Extension | STRING |  | datasourceColumn |  |
| `test_file_size` | Test File Size | DOUBLE |  | datasourceColumn |  |
| `test_file_type` | Test File Type | STRING |  | datasourceColumn |  |
| `test_id` | Test Id | STRING |  | datasourceColumn |  |
| `test_meeting_id` | Test Meeting Id | STRING |  | datasourceColumn |  |
| `test_play_url` | Test Play Url | STRING |  | datasourceColumn |  |
| `test_recording_end` | Test Recording End | TIMESTAMP |  | datasourceColumn |  |
| `test_recording_start` | Test Recording Start | TIMESTAMP |  | datasourceColumn |  |
| `test_recording_type` | Test Recording Type | STRING |  | datasourceColumn |  |
| `timezone` | Timezone | STRING |  | datasourceColumn |  |
| `topic` | Topic | STRING |  | datasourceColumn |  |
| `total_size` | Total Size | DOUBLE |  | datasourceColumn |  |
| `transcript_download_url` | Transcript Download Url | STRING |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |
| `webhook_priority` | Webhook Priority | INTEGER |  | datasourceColumn |  |

---

## [11 Labs] Agent

**Table:** `n11_labs_agent`  
**Foundry apiName:** `_11LabsAgent`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **_11LabsAgentWorkflowNode** (link: "[11 Labs] Agent Workflow Node")
- has many **_11LabsPhoneCallInformation** (link: "[11 Labs] Phone Call Information")
- has many **_11LabsAgentHistory** (link: "[11 Labs] Agent History")
- has many **InsightCall** (link: "[Insight] Call")
- has many **_11LabsInsightAnswer** (link: "[11 Labs] Insight Answer")
- has many **_11LabsInsightAnswer** (link: "[11 Labs] Insight Answer")
- has many **_11LabsAgentWorkflowEdge** (link: "[11 Labs] Agent Workflow Edge")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_id` | Agent Id | STRING | PK | datasourceColumn |  |
| `created_at_unix_secs` | Created At Unix Secs | LONG |  | datasourceColumn |  |
| `creator_name` | Creator Name | STRING |  | datasourceColumn |  |
| `dynamic_variables_json` | Dynamic Variables Json | STRING |  | datasourceColumn |  |
| `first_message` | First Message | STRING |  | datasourceColumn |  |
| `language_code` | Language Code | STRING |  | datasourceColumn |  |
| `last_updated_at_unix_secs` | Last Updated At Unix Secs | LONG |  | datasourceColumn |  |
| `llm_model_id` | Llm Model Id | STRING |  | datasourceColumn |  |
| `llm_temperature` | Llm Temperature | DOUBLE |  | datasourceColumn |  |
| `llm_token_limit` | Llm Token Limit | LONG |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `system_prompt` | System Prompt | STRING |  | datasourceColumn |  |

---

## [11 Labs] Agent History

**Table:** `n11_labs_agent_history`  
**Foundry apiName:** `_11LabsAgentHistory`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **_11LabsPhoneCallInformation** (link: "[11 Labs] Phone Call Information")
- belongs to **_11LabsAgent** via `agent_id` (link: "[11 Labs] Agent")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_history_pk` | Agent History Pk | STRING | PK | datasourceColumn |  |
| `agent_id` | Agent Id | STRING |  | datasourceColumn |  |
| `created_at_unix_secs` | Created At Unix Secs | LONG |  | datasourceColumn |  |
| `creator_name` | Creator Name | STRING |  | datasourceColumn |  |
| `dynamic_variables_json` | Dynamic Variables Json | STRING |  | datasourceColumn |  |
| `first_message` | First Message | STRING |  | datasourceColumn |  |
| `language_code` | Language Code | STRING |  | datasourceColumn |  |
| `last_updated_at_unix_secs` | Last Updated At Unix Secs | LONG |  | datasourceColumn |  |
| `llm_model_id` | Llm Model Id | STRING |  | datasourceColumn |  |
| `llm_temperature` | Llm Temperature | DOUBLE |  | datasourceColumn |  |
| `llm_token_limit` | Llm Token Limit | LONG |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `system_prompt` | System Prompt | STRING |  | datasourceColumn |  |

---

## [11 Labs] Agent User Feedback

**Table:** `n11_labs_agent_user_feedback`  
**Foundry apiName:** `_11LabsAgentUserFeedback`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Captures customer feedback on the quality of their interactions with ElevenLabs AI voice agents. This edit-only object type allows manual collection of user satisfaction data for AI phone conversations.

**Key Relationships:**
- Can be linked to `[11 Labs] Phone Call Information` via conversation_id
- Enables feedback tracking per AI conversation

**Primary Use Cases:**
- Collect post-call satisfaction ratings from customers
- Track qualitative feedback on AI agent performance
- Support continuous improvement of voice agent quality
- Enable customer sentiment analysis for AI interactions

**Relevant Properties:**
- Feedback: Free-text customer feedback
- Conversation ID: Link to the phone call
- Created At: Submission timestamp
- Customer ID: Customer identifier  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `conversation_id` | Conversation ID | STRING |  | editOnly | Unique identifier linking feedback to a specific ElevenLabs phone call conversation. Used for joining with Phone Call Information. |
| `created_at` | Created At | STRING |  | editOnly | Timestamp when the feedback was submitted by the customer. |
| `customer_id` | Customer ID | STRING |  | editOnly | Identifier for the customer who provided the feedback. Links to customer records. |
| `feedback` | Feedback | STRING |  | editOnly | Free-text customer feedback on their AI agent interaction experience. May include comments on conversation quality, helpfulness, or issues encountered. |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |

---

## [11 Labs] Agent Workflow Edge

**Table:** `n11_labs_agent_workflow_edge`  
**Foundry apiName:** `_11LabsAgentWorkflowEdge`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsAgentWorkflowNode** via `source` (link: "[11 Labs] Agent Workflow Source Node")
- belongs to **_11LabsAgentWorkflowNode** via `target` (link: "[11 Labs] Agent Workflow Target Node")
- belongs to **_11LabsAgent** via `agent_id` (link: "[11 Labs] Agent")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_id` | Agent Id | STRING |  | datasourceColumn |  |
| `backward_condition` | Backward Condition | STRING |  | datasourceColumn |  |
| `edge_id` | Edge Id | STRING | PK | datasourceColumn |  |
| `forward_condition` | Forward Condition | STRING |  | datasourceColumn |  |
| `source` | Source | STRING |  | datasourceColumn |  |
| `target` | Target | STRING |  | datasourceColumn |  |

---

## [11 Labs] Agent Workflow Node

**Table:** `n11_labs_agent_workflow_node`  
**Foundry apiName:** `_11LabsAgentWorkflowNode`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsAgent** via `agent_id` (link: "[11 Labs] Agent")
- has many **_11LabsAgentWorkflowEdge** (link: "[11 Labs] Agent Workflow Forward Edge")
- has many **_11LabsAgentWorkflowEdge** (link: "[11 Labs] Agent Workflow Backward Edge")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `additional_knowledge_base` | Additional Knowledge Base | STRING |  | datasourceColumn |  |
| `additional_prompt` | Additional Prompt | STRING |  | datasourceColumn |  |
| `agent_id` | Agent Id | STRING |  | datasourceColumn |  |
| `eleven_labs_node_id` | Eleven Labs Node Id | STRING |  | datasourceColumn |  |
| `label` | Label | STRING |  | datasourceColumn |  |
| `name` | Name | STRING |  | datasourceColumn |  |
| `node_id` | Node Id | STRING | PK | datasourceColumn |  |
| `prompt` | Prompt | STRING |  | datasourceColumn |  |
| `type` | Type | STRING |  | datasourceColumn |  |

---

## [11 Labs] Call Review

**Table:** `n11_labs_call_review`  
**Foundry apiName:** `_11LabsCallReview`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsPhoneCallInformation** via `conversation_id` (link: "[11 Labs] Phone Call Information")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `comment` | Comment | ARRAY |  | editOnly |  |
| `conversation_id` | Conversation ID | STRING |  | editOnly |  |
| `primary_key` | Review ID | STRING | PK | datasourceColumn |  |
| `reviewed_at` | Reviewed At | TIMESTAMP |  | editOnly |  |
| `reviewed_by` | Reviewed By | STRING |  | editOnly |  |
| `status` | Status | STRING |  | editOnly |  |

---

## [11 Labs] Evaluation Criteria

**Table:** `n11_labs_evaluation_criteria`  
**Foundry apiName:** `_11LabsEvaluationCriteria`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsPhoneCallInformation** via `conversation_id` (link: "[11 Labs] Phone Call Information")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_id` | Agent Id | STRING |  | datasourceColumn |  |
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn |  |
| `criteria_id` | Criteria Id | STRING | PK | datasourceColumn |  |
| `criteria_name` | Criteria Name | STRING |  | datasourceColumn |  |
| `criteria_rationale` | Criteria Rationale | STRING |  | datasourceColumn |  |
| `criteria_result` | Criteria Result | STRING |  | datasourceColumn |  |

---

## [11 Labs] Insight Answer

**Table:** `n11_labs_insight_answer`  
**Foundry apiName:** `_11LabsInsightAnswer`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsInsightQuestion** via `question_foreign_key` (link: "[11 Labs] Insight Question")
- belongs to **_11LabsPhoneCallInformation** via `conversation_foreign_key` (link: "[11 Labs] Phone Call Information")
- belongs to **_11LabsAgent** via `agent_foreign_key` (link: "[11 Labs] Agent")
- belongs to **_11LabsAgent** via `agent_foreign_key` (link: "[11 Labs] Agent")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_foreign_key` | Agent Foreign Key | STRING |  | editOnly |  |
| `primary_key` | Answer Id | STRING | PK | datasourceColumn |  |
| `answer_text` | Answer Text | STRING |  | editOnly |  |
| `answered` | Answered | STRING |  | editOnly |  |
| `conversation_foreign_key` | Conversation Foreign Key | STRING |  | editOnly |  |
| `question_foreign_key` | Question Foreign Key | STRING |  | editOnly |  |
| `question_text` | Question Text | STRING |  | editOnly |  |
| `quote` | Quote | STRING |  | editOnly |  |
| `sentiment` | Sentiment | STRING |  | editOnly |  |

---

## [11 Labs] Insight Question

**Table:** `n11_labs_insight_question`  
**Foundry apiName:** `_11LabsInsightQuestion`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- has many **_11LabsInsightAnswer** (link: "[11 Labs] Insight Answer")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `last_modified_at` | Last Modified At | TIMESTAMP |  | editOnly |  |
| `last_modified_by` | Last Modified By | STRING |  | editOnly |  |
| `primary_key` | Question Id | STRING | PK | datasourceColumn |  |
| `question_text` | Question Text | STRING |  | editOnly |  |

---

## [11 Labs] Insight Queue

**Table:** `n11_labs_insight_queue`  
**Foundry apiName:** `_11LabsInsightQueue`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsPhoneCallInformation** via `conversation_id` (link: "[11 Labs] Phone Call Information")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_id` | Agent Id | STRING |  | editOnly |  |
| `conversation_id` | Conversation Id | STRING |  | editOnly |  |
| `creation_time` | Creation Time | TIMESTAMP |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `status` | Status | STRING |  | editOnly |  |
| `transcript` | Transcript | STRING |  | editOnly |  |

---

## [11 Labs] Phone Call

**Table:** `n11_labs_phone_call`  
**Foundry apiName:** `_11LabsPhoneCall`  
**Status:** experimental  
**Datasources:** 1  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `call_sid` | Call SID | STRING |  | editOnly |  |
| `call_title` | Call Title | STRING |  | editOnly |  |
| `conversation_id` | Conversation ID | STRING |  | editOnly |  |
| `lead_context_information` | Lead Context Information | STRING |  | editOnly |  |
| `lead_email` | Lead Email | STRING |  | editOnly |  |
| `lead_name` | Lead Name | STRING |  | editOnly |  |
| `lead_phone_number` | Lead Phone Number | STRING |  | editOnly |  |
| `primary_key` | Primary Key | STRING | PK | datasourceColumn |  |
| `success` | Success | BOOLEAN |  | editOnly |  |

---

## [11 Labs] Phone Call Information

**Table:** `n11_labs_phone_call_information`  
**Foundry apiName:** `_11LabsPhoneCallInformation`  
**Status:** active  
**Datasources:** 1  
**Description:** **Last time documentation was updated: 2026-02-04**

Comprehensive record of AI-powered phone calls made through ElevenLabs voice agents. Contains call metadata, transcripts, sentiment analysis, LLM token usage, costs, and evaluation results.

**Call Success Values:**
- success
- failure
- unknown
- null

**Call Status Values:**
- done
- failed
- initiated
- in-progress
- processing

**Sentiment Analysis (Polarity Values):**
- neutral
- positive
- negative

**Key Relationships:**
- Links to `[11 Labs] Agent` - the AI agent configuration used
- Links to `[11 Labs] Agent History` - historical agent version
- Links to `[Insight] Call` - unified call insights
- Links to `Call Insight Answer` - structured Q&A insights
- Links to `[11 Labs] Transcript Segment` - conversation segments
- Links to `[11 Labs] Call Review` - manual review data
- Links to `Marketing Campaign` - campaign attribution

**Primary Use Cases:**
- Monitor AI voice agent performance and costs
- Analyze call sentiment and success rates
- Review transcripts for quality assurance
- Track LLM token usage and optimize prompts
- Identify failed calls and error patterns

**Relevant Properties:**
- Conversation ID: Unique call identifier
- Lead Name / Lead Email / Lead Phone Number: Contact information
- Call Start Timestamp: When call initiated
- Call Duration (Seconds): Length of call
- Status: Processing status
- Call Successful: Outcome assessment
- Polarity: Sentiment classification
- Transcript / Transcript Summary: Call content
- Total USD LLM Price: Cost per call
- Input/Output Tokens: LLM usage metrics
- Agent Missed Question: Quality flag
- Voicemail Detection: Voicemail handling flag
- Termination Reason: Why call ended
- Error Code / Error Reason: Failure details  

**Relationships:**
- has many **CallInsightAnswer** (link: "Call Insight Answer")
- has many **_11LabsTranscriptSegment** (link: "[11 Labs] Transcript Segment")
- has many **_11LabsCallReview** (link: "[11 Labs] Call Review")
- has many **_11LabsInsightQueue** (link: "[11 Labs] Insight Queue")
- has many **_11LabsInsightAnswer** (link: "[11 Labs] Insight Answer")
- has many **InsightCall** (link: "[Insight] Call")
- has many **InsightQueue** (link: "Insight Queue")
- belongs to **_11LabsAgent** via `agent_id` (link: "[11 Labs] Agent")
- belongs to **_11LabsAgentHistory** via `agent_history_pk` (link: "[11 Labs] Agent History")
- has many **_11LabsEvaluationCriteria** (link: "[11 Labs] Evaluation Criterion")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `agent_history_pk` | Agent History PK | STRING |  | datasourceColumn | Foreign key to the specific agent version/history used for the call. |
| `agent_id` | Agent ID | STRING |  | datasourceColumn | Foreign key to the ElevenLabs Agent configuration used for this call. 45 unique agents. |
| `agent_missed_question` | Agent Missed Question | BOOLEAN |  | datasourceColumn | Flag indicating the AI agent failed to answer a question properly. True for 7% of calls. |
| `branch_id` | Branch ID | STRING |  | datasourceColumn | Identifier for the agent workflow branch used in this call. |
| `call_duration_secs` | Call Duration (Seconds) | INTEGER |  | datasourceColumn | Total duration of the call in seconds. Average is ~171 seconds (2.9 minutes). |
| `call_start_timestamp` | Call Start Timestamp | TIMESTAMP |  | datasourceColumn | Timestamp when the call was initiated. |
| `call_successful` | Call Successful | STRING |  | datasourceColumn | Outcome assessment of the call: 'success', 'failure', 'unknown', or null. |
| `conversation_id` | Conversation ID | STRING | PK | datasourceColumn | Unique identifier for the phone call conversation. Primary key linking to transcripts, feedback, and insights. |
| `cost` | Cost | INTEGER |  | datasourceColumn | Total cost of the call in ElevenLabs credits/units. |
| `data_freshness` | Data Freshness | TIMESTAMP |  | datasourceColumn | Timestamp indicating when the call data was last updated/synced. |
| `error_code` | Error Code | STRING |  | datasourceColumn | Error code if the call failed. |
| `error_reason` | Error Reason | STRING |  | datasourceColumn | Detailed explanation of call failure. |
| `evaluation_criteria_results_criteria_id` | Evaluation Criteria Results Criteria Id | STRING |  | datasourceColumn |  |
| `evaluation_criteria_results_rationale` | Evaluation Criteria Results Rationale | STRING |  | datasourceColumn |  |
| `evaluation_criteria_results_result` | Evaluation Criteria Results Result | STRING |  | datasourceColumn |  |
| `feedback_comment` | Feedback Comment | STRING |  | datasourceColumn | Free-text feedback from users about the call. 46 calls have comments. |
| `feedback_dislikes` | Feedback Dislikes | DOUBLE |  | datasourceColumn |  |
| `feedback_likes` | Feedback Likes | DOUBLE |  | datasourceColumn |  |
| `feedback_overall_score` | Feedback Overall Score | STRING |  | datasourceColumn |  |
| `feedback_rating` | Feedback Rating | DOUBLE |  | datasourceColumn | User-provided rating for the call quality. Average rating is 3.4/5 for rated calls. |
| `feedback_type` | Feedback Type | STRING |  | datasourceColumn |  |
| `input_cache_read_token_price_usd` | Input Cache Read Token Price Usd | DOUBLE |  | datasourceColumn |  |
| `input_cache_read_tokens` | Input Cache Read Tokens | DOUBLE |  | datasourceColumn |  |
| `input_token_price_usd` | Input Token Price Usd | DOUBLE |  | datasourceColumn |  |
| `input_tokens` | Input Tokens | DOUBLE |  | datasourceColumn | Number of input tokens processed by the LLM. Average ~76,777 per call. |
| `lead_email` | Lead Email | STRING |  | datasourceColumn | Email address of the lead. 2,338 unique leads in system. |
| `lead_name` | Lead Name | STRING |  | datasourceColumn | Name of the lead/contact being called. |
| `lead_phone_number` | Lead Phone Number | STRING |  | editOnly | Phone number dialed for the call. |
| `llm_question_answers_str` | Llm Question Answers Str | STRING |  | datasourceColumn |  |
| `output_token_price_usd` | Output Token Price Usd | DOUBLE |  | datasourceColumn |  |
| `output_tokens` | Output Tokens | DOUBLE |  | datasourceColumn | Number of output tokens generated by the LLM. Average ~723 per call. |
| `polarity` | Polarity | STRING |  | datasourceColumn | AI-analyzed sentiment of the conversation: 'neutral' (75%), 'positive' (22%), or 'negative' (3%). |
| `polarity_reasoning` | Polarity Reasoning | STRING |  | datasourceColumn | AI explanation for the sentiment/polarity classification. |
| `reviewed` | Reviewed | BOOLEAN |  | datasourceColumn | Whether the call has been manually reviewed for quality assurance. Currently 0% reviewed. |
| `start_time_unix_secs` | Start Time Unix Secs | LONG |  | datasourceColumn | Call start time as Unix timestamp in seconds. |
| `status` | Status | STRING |  | datasourceColumn | Call processing status: 'done' (70%), 'failed' (16%), 'initiated' (10%), 'in-progress' (4%), 'processing'. |
| `termination_reason` | Termination Reason | STRING |  | datasourceColumn | Why the call ended: 'end_call tool', 'client disconnected', 'voicemail_detection', 'max duration exceeded', etc. |
| `total_usd_llm_price` | Total USD LLM Price | DOUBLE |  | datasourceColumn | Total LLM cost for this call in US dollars. Average ~$0.012 per call. |
| `full_transcript_text` | Transcript | STRING |  | datasourceColumn | Full text transcript of the AI-to-human conversation. |
| `transcript_summary` | Transcript Summary | STRING |  | datasourceColumn | AI-generated summary of the conversation content and outcomes. |
| `features_usage_voicemail_detection_enabled` | Voicemail Detection Enabled | BOOLEAN |  | datasourceColumn | Whether voicemail detection feature was enabled for this call. |
| `features_usage_voicemail_detection_used` | Voicemail Detection Used | BOOLEAN |  | datasourceColumn | Whether voicemail was detected and the call handled accordingly. Triggered for 7% of calls. |

---

## [11 Labs] Transcript Segment

**Table:** `n11_labs_transcript_segment`  
**Foundry apiName:** `_11LabsTranscriptSegment`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsTranscriptSegment** via `previous_segment_pk` (link: "[11 Labs] Previous Transcript Segment")
- has many **_11LabsTranscriptSegment** (link: "[11 Labs] Transcript Segment")
- has many **_11LabsTranscriptSegmentReview** (link: "[11 Labs] Transcript Segment Review")
- belongs to **_11LabsPhoneCallInformation** via `conversation_id` (link: "[11 Labs] Phone Call Information")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `conversation_id` | Conversation Id | STRING |  | datasourceColumn |  |
| `label` | Label | STRING |  | datasourceColumn |  |
| `message` | Message | STRING |  | datasourceColumn |  |
| `message_english` | Message Translated | STRING |  | datasourceColumn | English translation of the original message |
| `next_node_id` | Next Node Id | STRING |  | datasourceColumn |  |
| `next_segment_pk` | Next Segment Pk | STRING |  | datasourceColumn |  |
| `node_id` | Node Id | STRING |  | datasourceColumn |  |
| `previous_node_id` | Previous Node Id | STRING |  | datasourceColumn |  |
| `previous_segment_pk` | Previous Segment Pk | STRING |  | datasourceColumn |  |
| `review_status` | Review Status | STRING |  | editOnly |  |
| `reviewed` | Reviewed | BOOLEAN |  | datasourceColumn |  |
| `role` | Role | STRING |  | datasourceColumn |  |
| `segment_number` | Segment Number | INTEGER |  | datasourceColumn |  |
| `segment_pk` | Segment Pk | STRING | PK | datasourceColumn |  |
| `timestamp` | Timestamp | TIMESTAMP |  | datasourceColumn |  |

---

## [11 Labs] Transcript Segment Review

**Table:** `n11_labs_transcript_segment_review`  
**Foundry apiName:** `_11LabsTranscriptSegmentReview`  
**Status:** experimental  
**Datasources:** 1  

**Relationships:**
- belongs to **_11LabsTranscriptSegment** via `segment_pk` (link: "[11 Labs] Transcript Segment")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `actions_taken` | Actions taken | ARRAY |  | editOnly |  |
| `actions_to_take` | Actions to take | ARRAY |  | editOnly |  |
| `reviewed_at` | Reviewed At | TIMESTAMP |  | editOnly |  |
| `reviewed_by` | Reviewed By | STRING |  | editOnly |  |
| `segment_pk` | Segment Pk | STRING |  | editOnly |  |
| `primary_key` | Segment Review Pk | STRING | PK | datasourceColumn |  |
| `segment_review_title` | Segment Review Title | STRING |  | editOnly |  |
| `status` | Status | STRING |  | editOnly |  |
| `wrong_agent_response` | Wrong Agent Response | BOOLEAN |  | editOnly |  |
| `wrong_node_transition` | Wrong Node Transition | BOOLEAN |  | editOnly |  |
| `wrong_rag_usage` | Wrong RAG Usage | BOOLEAN |  | editOnly |  |
| `wrong_tool_calling` | Wrong Tool Calling | BOOLEAN |  | editOnly |  |

---

## Agent Prompt [AST]

**Table:** `agent_prompt`  
**Foundry apiName:** `agentPrompt`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Prompt-Templates für AI FDE Task Management Workflows  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `content` | Content | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `prompt_type` | Prompt Type | STRING |  | redacted |  |
| `updated_at` | Updated At | TIMESTAMP |  | redacted |  |

---

## Contact [AST]

**Table:** `contact`  
**Foundry apiName:** `contact`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Kontaktpersonen für Tasks und Initiativen  

**Relationships:**
- has many **task** (link: "Task")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `email` | Email | STRING |  | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `note` | Note | STRING |  | redacted |  |
| `phone` | Phone | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |

---

## Context [AST]

**Table:** `context`  
**Foundry apiName:** `context`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Kontext einer Task (wie sie erledigt wird: Call, Meeting, Email, etc.)  

**Relationships:**
- has many **task** (link: "Task")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `description` | Description | STRING |  | redacted |  |
| `name` | Name | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |

---

## Inbox Item [AST]

**Table:** `inbox_item`  
**Foundry apiName:** `inboxItem`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Unbearbeitete Eingänge, die noch clarified werden müssen  

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `captured_at` | Captured At | TIMESTAMP |  | redacted |  |
| `context_tag` | Context Tag | STRING |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `raw_content` | Raw Content | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## Initiative [AST]

**Table:** `initiative`  
**Foundry apiName:** `initiative`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Größeres Vorhaben oder Projekt mit definierten Zielen und Terminen.  

**Relationships:**
- has many **task** (link: "Task")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `check_in_next_date` | Check In Next Date | DATE |  | redacted |  |
| `completed_at` | Completed At | TIMESTAMP |  | redacted |  |
| `context_tag` | Context Tag | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `description` | Description | STRING |  | redacted |  |
| `due_date` | Due Date | DATE |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---

## Lead Profile

**Table:** `lead_profilev2`  
**Foundry apiName:** `leadProfilev2`  
**Status:** active  
**Datasources:** 2  
**Description:** **Last time documentation was updated: 2026-02-04**

Comprehensive lead profiles with AI-enriched health insights and conversion signals. Each profile aggregates symptom data, treatment history, and AI-generated summaries to support targeted sales outreach.

**Key Relationships:**
- Links to [Funnelbox] Contact v2 (ONE-to-MANY) - source contact data
- Links to Email Offer Cohort (ONE-to-ONE)
- Links to ID Match (ONE-to-ONE) - cross-system identity resolution

**Primary Use Cases:**
- AI-powered lead qualification with warm lead flags
- Health symptom analysis for personalized outreach
- Treatment history review for objection handling
- Sales prioritization based on AI conversion signals

**Relevant Properties:**
- Contact Id: Primary identifier
- Warm Lead AI Flag: AI-determined conversion likelihood
- Profile Summary: AI-generated profile overview
- Insights Summary: Key insights for sales
- Symptoms: Array of health symptoms
- Pain Duration: How long issues have persisted
- Past Treatments: Previously tried treatments

**Data Freshness:** Built incrementally with AI flag enrichment  

**Relationships:**
- has many **FunnelboxContactV2** (link: "[Funnelbox] Contact v2")
- has many **IdMatch** (link: "ID Match")
- has many **EmailOfferCohort** (link: "Email Offer Cohort")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `contact_id` | Contact Id | STRING | PK | datasourceColumn |  |
| `all_insights_string` | Insights Summary | STRING |  | datasourceColumn |  |
| `pain_duration` | Pain Duration | STRING |  | datasourceColumn |  |
| `past_treatments` | Past Treatments | ARRAY |  | datasourceColumn |  |
| `profile_summary` | Profile Summary | STRING |  | datasourceColumn |  |
| `symptoms` | Symptoms | ARRAY |  | datasourceColumn |  |
| `warm_lead_ai_flag` | Warm Lead Ai Flag | BOOLEAN |  | datasourceColumn |  |

---

## Task [AST]

**Table:** `task`  
**Foundry apiName:** `task`  
**Status:** experimental  
**Datasources:** 1  
**Description:** Konkrete Aufgabe mit Beschreibung, Status und Kontext  

**Relationships:**
- belongs to **initiative** via `primary_key` (link: "Initiative")
- belongs to **context** via `primary_key` (link: "Context")
- belongs to **contact** via `primary_key` (link: "Contact")

| Column | Foundry Property | Type | PK | Source | Description |
|--------|-----------------|------|-----|--------|-------------|
| `assignee_user_id` | Assignee User ID | STRING |  | redacted |  |
| `check_in_date` | Check In Date | DATE |  | redacted |  |
| `completed_at` | Completed At | TIMESTAMP |  | redacted |  |
| `context_tag` | Context Tag | STRING |  | redacted |  |
| `created_at` | Created At | TIMESTAMP |  | redacted |  |
| `description` | Description | STRING |  | redacted |  |
| `due_date` | Due Date | DATE |  | redacted |  |
| `primary_key` | Primary Key | STRING | PK | redacted |  |
| `status` | Status | STRING |  | redacted |  |
| `title` | Title | STRING |  | redacted |  |

---
