-- ==========================================================================
-- Foundry Ontology -> PostgreSQL DDL
-- Generated from: ontology.json
-- Object types included: 305  |  excluded: 36
-- ==========================================================================

-- [Advertisement] Email Subject Line  (Foundry apiName: AdvertisementEmailSubjectLine)
CREATE TABLE advertisement_email_subject_line (
  email TEXT,
  email_subject_line TEXT,
  primary_key TEXT,
  review_comment TEXT,
  review_status TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  source TEXT,
  CONSTRAINT pk_advertisement_email_subject_line PRIMARY KEY (primary_key)
);

-- [Advertisement] Hook  (Foundry apiName: AdvertisementHook)
CREATE TABLE advertisement_hook (
  add_hook_text TEXT,
  email TEXT,
  primary_key TEXT,
  review_comment TEXT,
  review_status TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  source TEXT,
  CONSTRAINT pk_advertisement_hook PRIMARY KEY (primary_key)
);

-- [Advertisement] Landing Page Headline  (Foundry apiName: AdvertisementLandingPageHeadline)
CREATE TABLE advertisement_landing_page_headline (
  email TEXT,
  landing_page_headline TEXT,
  primary_key TEXT,
  review_comment TEXT,
  review_status TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  source TEXT,
  CONSTRAINT pk_advertisement_landing_page_headline PRIMARY KEY (primary_key)
);

-- Analysed User Picture (as api response)  (Foundry apiName: AnalysedUserPicture)
CREATE TABLE analysed_user_picture (
  blurred_output_image_rid TEXT,
  email TEXT,
  errors TEXT,
  full_report TEXT,
  input_image_rid TEXT,
  input_metadata_id TEXT,
  media_reference_blurred_output JSONB,
  node1_text JSONB,
  node2_text JSONB,
  node3_text JSONB,
  node4_text JSONB,
  node5_text JSONB,
  node6_text JSONB,
  node7a_text JSONB,
  node7b_text JSONB,
  output_image_rid TEXT,
  primary_key TEXT,
  processing_status TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ,
  validation TEXT,
  CONSTRAINT pk_analysed_user_picture PRIMARY KEY (primary_key)
);

-- App Discrepancy  (Foundry apiName: AppDiscrepancy)
CREATE TABLE app_discrepancy (
  app_user_id TEXT,
  context TEXT,
  discrepancy_type TEXT,
  id TEXT,
  notes TEXT,
  status TEXT,
  CONSTRAINT pk_app_discrepancy PRIMARY KEY (id)
);

-- App Event  (Foundry apiName: AppEvent)
CREATE TABLE app_event (
  action TEXT,
  date DATE,
  event TEXT,
  event_id TEXT,
  session_id TEXT,
  strategy TEXT,
  timestamp TIMESTAMPTZ,
  user_id TEXT,
  user_mail TEXT,
  CONSTRAINT pk_app_event PRIMARY KEY (event_id)
);

-- App Lecture  (Foundry apiName: AppLecture)
CREATE TABLE app_lecture (
  app_lecture_description TEXT,
  app_lecture_id TEXT,
  app_lecture_name TEXT,
  CONSTRAINT pk_app_lecture PRIMARY KEY (app_lecture_id)
);

-- App Module  (Foundry apiName: AppModule)
CREATE TABLE app_module (
  app_module_description TEXT,
  app_module_id TEXT,
  app_module_name TEXT,
  app_module_url TEXT,
  CONSTRAINT pk_app_module PRIMARY KEY (app_module_id)
);

-- App Module App Lecture Link  (Foundry apiName: AppModuleAppLectureLink)
CREATE TABLE app_module_app_lecture_link (
  app_lecture_id TEXT,
  app_module_app_lecture_link_id TEXT,
  app_module_id TEXT,
  position BIGINT,
  CONSTRAINT pk_app_module_app_lecture_link PRIMARY KEY (app_module_app_lecture_link_id)
);

-- App Session  (Foundry apiName: AppSession)
CREATE TABLE app_session (
  body_position_id TEXT,
  category_id TEXT,
  coach_name TEXT,
  created_at TIMESTAMPTZ,
  date_of_session DATE,
  duration INTEGER,
  equipment_id TEXT,
  locked BOOLEAN,
  participant_limit INTEGER,
  recording_url TEXT,
  session_description TEXT,
  session_end_timestamp TIMESTAMPTZ,
  session_id TEXT,
  session_name TEXT,
  session_start_timestamp TIMESTAMPTZ,
  session_title TEXT,
  status TEXT,
  token_cost INTEGER,
  vector_id TEXT,
  zoom_url TEXT,
  CONSTRAINT pk_app_session PRIMARY KEY (session_id)
);

-- App Session Category  (Foundry apiName: AppSessionCategory)
CREATE TABLE app_session_category (
  colour TEXT,
  name TEXT,
  session_category_id TEXT,
  slug TEXT,
  title TEXT,
  type TEXT,
  CONSTRAINT pk_app_session_category PRIMARY KEY (session_category_id)
);

-- App User  (Foundry apiName: AppUser)
CREATE TABLE app_user (
  app_display_name TEXT,
  app_user_email TEXT,
  app_user_id TEXT,
  avg_recovery_days DOUBLE PRECISION,
  avg_pause_days_recentweeks DOUBLE PRECISION,
  avg_max_sessions_oneday_prevperiod DOUBLE PRECISION,
  max_sessions_oneday_avg_recentweeks DOUBLE PRECISION,
  avg_max_sessions_oneday DOUBLE PRECISION,
  avg_sessions_perday DOUBLE PRECISION,
  avg_sessions_perday_recentweeks DOUBLE PRECISION,
  avg_sessions_perweek_prevperiod DOUBLE PRECISION,
  days_since_start BIGINT,
  end_date DATE,
  last_login_date DATE,
  registration_date DATE,
  sessions_last30_days BIGINT,
  sessions_per_day DOUBLE PRECISION,
  sessions_per_week DOUBLE PRECISION,
  sessions_per_week_previousmonth DOUBLE PRECISION,
  sessions_per_week_thismonth DOUBLE PRECISION,
  sessions_previousmonth BIGINT,
  sessions_prior30_days BIGINT,
  sessions_thismonth BIGINT,
  sessions_total BIGINT,
  start_date DATE,
  total_sessions BIGINT,
  trend30_days DOUBLE PRECISION,
  weeks_since_start INTEGER,
  CONSTRAINT pk_app_user PRIMARY KEY (app_user_id)
);

-- Appointment [Funnelbox]  (Foundry apiName: AppointmentFunnelbox)
CREATE TABLE appointment_funnelbox (
  app_id TEXT,
  appointment_address TEXT,
  appointment_appointment_status TEXT,
  appointment_assigned_user_id TEXT,
  appointment_calendar_id TEXT,
  appointment_contact_id TEXT,
  appointment_date_added TIMESTAMPTZ,
  appointment_date_updated TIMESTAMPTZ,
  appointment_end_time TIMESTAMPTZ,
  appointment_id TEXT,
  appointment_source TEXT,
  appointment_start_time TIMESTAMPTZ,
  appointment_title TEXT,
  email TEXT,
  event TEXT,
  is_active BOOLEAN,
  location_id TEXT,
  mariadb_id TEXT,
  name TEXT,
  timestamp TIMESTAMPTZ,
  type TEXT,
  version_id TEXT,
  webhook_id TEXT,
  CONSTRAINT pk_appointment_funnelbox PRIMARY KEY (appointment_id)
);

-- Tasks [AST]  (Foundry apiName: ArminsTasks)
CREATE TABLE armins_tasks (
  contact TEXT,
  context TEXT,
  context_id TEXT,
  date_created TIMESTAMPTZ,
  due_date TIMESTAMPTZ,
  task_initiative TEXT,
  primary_key TEXT,
  status TEXT,
  task_description TEXT,
  task_title TEXT,
  urgency TEXT,
  CONSTRAINT pk_armins_tasks PRIMARY KEY (primary_key)
);

-- Task-Contacts [AST]  (Foundry apiName: ArminsTasksContacts)
CREATE TABLE armins_tasks_contacts (
  contact_name TEXT,
  primary_key TEXT,
  CONSTRAINT pk_armins_tasks_contacts PRIMARY KEY (primary_key)
);

-- [WAHA] Audio Message With Transcription  (Foundry apiName: AudioMessageWithTranscription)
CREATE TABLE audio_message_with_transcription (
  audio_message_id TEXT,
  primary_key TEXT,
  transcription TEXT,
  CONSTRAINT pk_audio_message_with_transcription PRIMARY KEY (primary_key)
);

-- [Bexio] Product Article  (Foundry apiName: BexioProductArticle)
CREATE TABLE bexio_product_article (
  account_id INTEGER,
  article_code TEXT,
  article_description TEXT,
  article_id INTEGER,
  article_name TEXT,
  article_type_id INTEGER,
  currency_id INTEGER,
  data_id INTEGER,
  sale_price INTEGER,
  stock_reserved_nr INTEGER,
  tax_expense_id INTEGER,
  tax_id INTEGER,
  tax_income_id INTEGER,
  CONSTRAINT pk_bexio_product_article PRIMARY KEY (article_id)
);

-- Emails for Bulk Contract Creation  (Foundry apiName: BulkContractCreation)
CREATE TABLE bulk_contract_creation (
  added_ts TIMESTAMPTZ,
  client_submitter_link TEXT,
  client_submitter_link_cert TEXT,
  client_submitter_link_coaching_program TEXT,
  contract_id TEXT,
  contract_url TEXT,
  email TEXT,
  email_id TEXT,
  export_error TEXT,
  trigger_automate_run BOOLEAN,
  CONSTRAINT pk_bulk_contract_creation PRIMARY KEY (email_id)
);

-- Assignments for Bulk Contract Creation  (Foundry apiName: BulkCreatedSubmissions)
CREATE TABLE bulk_created_submissions (
  bulk_export_job TEXT,
  created_at TIMESTAMPTZ,
  email TEXT,
  execution_timestamp TIMESTAMPTZ,
  export_job_created_at TIMESTAMPTZ,
  mail_sent_status TEXT,
  primary_key TEXT,
  response TEXT,
  response_status_code TEXT,
  sign_url TEXT,
  status TEXT,
  submission_id TEXT,
  template_id TEXT,
  trigger_automate_run INTEGER,
  CONSTRAINT pk_bulk_created_submissions PRIMARY KEY (primary_key)
);

-- Bulk Export Details - Offers  (Foundry apiName: BulkExportDetails)
CREATE TABLE bulk_export_details (
  contract_duration INTEGER,
  contract_name TEXT,
  contract_start_date TEXT,
  expires_at TEXT,
  export_job_name TEXT,
  is_pre_signed_from_tob BOOLEAN,
  message_body TEXT,
  message_subject TEXT,
  primary_key TEXT,
  send_email TEXT,
  template_id TEXT,
  tob_email_closer TEXT,
  tob_program TEXT,
  CONSTRAINT pk_bulk_export_details PRIMARY KEY (primary_key)
);

-- Call [Close]  (Foundry apiName: CallClose)
CREATE TABLE call_close (
  event_data_is_to_group_number BOOLEAN,
  event_data_call_method TEXT,
  call_over_10_minute TIMESTAMPTZ,
  call_over_20_minute TIMESTAMPTZ,
  call_over_3_minute TIMESTAMPTZ,
  call_over_minute TIMESTAMPTZ,
  close_lead_id TEXT,
  event_data_cost TEXT,
  event_data_local_country_iso TEXT,
  created_by TEXT,
  event_data_date_answered TEXT,
  event_data_dialer_id TEXT,
  event_data_dialer_saved_search_id TEXT,
  event_data_disposition TEXT,
  event_data_duration DOUBLE PRECISION,
  event_action TEXT,
  event_data_created_by TEXT,
  event_data_direction TEXT,
  event_data_id TEXT,
  event_data_voicemail_duration DOUBLE PRECISION,
  event_id TEXT,
  event_object_id TEXT,
  event_request_id TEXT,
  event_data_has_recording BOOLEAN,
  event_data_lead_id TEXT,
  mariadb_id TEXT,
  event_data_note TEXT,
  event_data_note_date_updated TEXT,
  event_data_note_html TEXT,
  event_data_notetaker_id TEXT,
  event_data_parent_meeting_id TEXT,
  event_data_phone TEXT,
  event_data_recording_duration TEXT,
  event_data_recording_expires_at TEXT,
  event_data_recording_history JSONB,
  event_data_recording_transcript TEXT,
  event_data_recording_url TEXT,
  event_data_sequence_name TEXT,
  event_data_sequence_subscription_id TEXT,
  event_data_status TEXT,
  timestamp TIMESTAMPTZ,
  timestamp_string TEXT,
  title TEXT,
  event_data_updated_by TEXT,
  event_data_updated_by_name TEXT,
  event_data_user_name TEXT,
  event_data_voicemail_transcript TEXT,
  CONSTRAINT pk_call_close PRIMARY KEY (event_id)
);

-- Call Insight Answer  (Foundry apiName: CallInsightAnswer)
CREATE TABLE call_insight_answer (
  answer TEXT,
  answered TEXT,
  call_duration INTEGER,
  category TEXT,
  conversation_id TEXT,
  full_transcript_text TEXT,
  lead_email TEXT,
  qa_id TEXT,
  question TEXT,
  question_id TEXT,
  quote TEXT,
  sales_representative_name TEXT,
  scope_run_foreign_key TEXT,
  CONSTRAINT pk_call_insight_answer PRIMARY KEY (qa_id)
);

-- Call Insight Answer Aggregated  (Foundry apiName: CallInsightAnswerAggregated)
CREATE TABLE call_insight_answer_aggregated (
  aggregated_answers TEXT,
  answer_json_list TEXT[],
  pk TEXT,
  question_id TEXT,
  CONSTRAINT pk_call_insight_answer_aggregated PRIMARY KEY (pk)
);

-- Call Insight Question  (Foundry apiName: CallInsightQuestion)
CREATE TABLE call_insight_question (
  campaign TEXT,
  category TEXT,
  exploration TEXT[],
  possible_answers TEXT[],
  question_id TEXT,
  question_text TEXT,
  question_title TEXT,
  status TEXT,
  CONSTRAINT pk_call_insight_question PRIMARY KEY (question_id)
);

-- Call [Kickscale]  (Foundry apiName: CallKickscale)
CREATE TABLE call_kickscale (
  call_created_at TIMESTAMPTZ,
  call_created_at_string TEXT,
  call_crm_reference_lead_id TEXT,
  call_date TIMESTAMPTZ,
  call_date_string TEXT,
  call_duration DOUBLE PRECISION,
  call_email_draft TEXT,
  call_feedback_text TEXT,
  call_id TEXT,
  call_language TEXT,
  call_transcript TEXT,
  call_type_name TEXT,
  call_user_id TEXT,
  call_user_name TEXT,
  id TEXT,
  CONSTRAINT pk_call_kickscale PRIMARY KEY (call_id)
);

-- [Zoom] Chat Message  (Foundry apiName: ChatMessageZoom)
CREATE TABLE chat_message_zoom (
  account_id TEXT,
  count_characters INTEGER,
  count_words INTEGER,
  event TEXT,
  event_ts TIMESTAMPTZ,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_instance_id TEXT,
  message_content TEXT,
  message_content_vector REAL[],
  message_datetime TIMESTAMPTZ,
  message_id TEXT,
  recipient_email TEXT,
  recipient_name TEXT,
  recipient_session_id TEXT,
  recipient_type TEXT,
  sender_email TEXT,
  sender_name TEXT,
  sender_session_id TEXT,
  sender_type TEXT,
  primary_key_sender TEXT,
  recipient_foreign_key TEXT,
  sender_foreign_key TEXT,
  strategy TEXT,
  topic TEXT,
  word_list TEXT[],
  CONSTRAINT pk_chat_message_zoom PRIMARY KEY (message_id)
);

-- [Classified] Schmerzfrei Umfrage Unpivotiert  (Foundry apiName: ClassifiedSchmerzfreiUmfrageUnpivotiert)
CREATE TABLE classified_schmerzfrei_umfrage_unpivotiert (
  e_mail_adresse TEXT,
  hash TEXT,
  schmerzfrei_umfrage_answer TEXT,
  schmerzfrei_umfrage_context_info TEXT,
  schmerzfrei_umfrage_question TEXT,
  submission_date TEXT,
  survey_source TEXT,
  CONSTRAINT pk_classified_schmerzfrei_umfrage_unpivotiert PRIMARY KEY (hash)
);

-- [Classified] WhatsApp  (Foundry apiName: ClassifiedWhatsApp)
CREATE TABLE classified_whats_app (
  body TEXT,
  contact_id TEXT,
  count_character INTEGER,
  count_words INTEGER,
  date_added TIMESTAMPTZ,
  email TEXT,
  mariadb_id TEXT,
  message_id TEXT,
  validation_reason TEXT,
  validation_status BOOLEAN,
  CONSTRAINT pk_classified_whats_app PRIMARY KEY (message_id)
);

-- [Classified] Zoom Chats  (Foundry apiName: ClassifiedZoomChats)
CREATE TABLE classified_zoom_chats (
  count_characters INTEGER,
  insight_decision BOOLEAN,
  insight_decision_reason TEXT,
  meeting_id TEXT,
  meeting_instance_id TEXT,
  meeting_topic TEXT,
  message_content TEXT,
  message_datetime TIMESTAMPTZ,
  message_id TEXT,
  sender_email TEXT,
  zoom_message_insight_classifier TEXT,
  CONSTRAINT pk_classified_zoom_chats PRIMARY KEY (message_id)
);

-- [Zoom] [Classified] Surveys  (Foundry apiName: ClassifiedZoomSurveys)
CREATE TABLE classified_zoom_surveys (
  answer TEXT,
  email TEXT,
  filename TEXT,
  id TEXT,
  man_ext_kontextualisierung_was_sollte_der_ai_agent_ber_diese_fr TEXT,
  man_ext_question_weight1_10 INTEGER,
  man_ext_use_question BOOLEAN,
  question TEXT,
  question_utility_validation TEXT,
  submission_date TIMESTAMPTZ,
  topic TEXT,
  validation_reason TEXT,
  validation_status BOOLEAN,
  CONSTRAINT pk_classified_zoom_surveys PRIMARY KEY (id)
);

-- [Close] Call Transcript Chunks Embbeding  (Foundry apiName: CloseCallTranscriptChunksEmbbeding)
CREATE TABLE close_call_transcript_chunks_embbeding (
  call_id TEXT,
  chunk_id TEXT,
  chunk_order DOUBLE PRECISION,
  embedded_at TIMESTAMPTZ,
  embedding_vector DOUBLE PRECISION[],
  text_to_embed TEXT,
  tokens DOUBLE PRECISION,
  total_number_of_chunks BIGINT,
  CONSTRAINT pk_close_call_transcript_chunks_embbeding PRIMARY KEY (chunk_id)
);

-- [Close] Connecting Call  (Foundry apiName: CloseConnectingCall2)
CREATE TABLE close_connecting_call2 (
  activity_at TIMESTAMPTZ,
  activity_call_id TEXT,
  activity_contact_id TEXT,
  activity_conversation TEXT,
  activity_lead_id TEXT,
  activity_summary_text TEXT,
  activity_user_id TEXT,
  custom_field_call_id TEXT,
  CONSTRAINT pk_close_connecting_call2 PRIMARY KEY (custom_field_call_id)
);

-- Close Generation Queue  (Foundry apiName: CloseGenerationQueue)
CREATE TABLE close_generation_queue (
  generation_name TEXT,
  primary_key TEXT,
  selected_campaign TEXT,
  transcript TEXT,
  user_id TEXT,
  CONSTRAINT pk_close_generation_queue PRIMARY KEY (primary_key)
);

-- Close Insight Answer  (Foundry apiName: CloseInsightAnswer)
CREATE TABLE close_insight_answer (
  answered TEXT,
  close_call_id TEXT,
  close_lead_id TEXT,
  created_at TIMESTAMPTZ,
  generation_id TEXT,
  generation_name TEXT,
  primary_key TEXT,
  question_id TEXT,
  sentiment TEXT,
  summary TEXT,
  transcript TEXT,
  user_id TEXT,
  CONSTRAINT pk_close_insight_answer PRIMARY KEY (primary_key)
);

-- Close Insight Question  (Foundry apiName: CloseInsightQuestion)
CREATE TABLE close_insight_question (
  campaign TEXT,
  id TEXT,
  question TEXT,
  CONSTRAINT pk_close_insight_question PRIMARY KEY (id)
);

-- Close IO Campaign Creation Job  (Foundry apiName: CloseIoCampaignCreationJob)
CREATE TABLE close_io_campaign_creation_job (
  additional_smart_view_filters TEXT,
  campaign_description TEXT,
  campaign_expiration_date TIMESTAMPTZ,
  campaign_id TEXT,
  campaign_objective TEXT,
  lead_emails TEXT[],
  primary_key TEXT,
  triggered_at TIMESTAMPTZ,
  triggered_by TEXT,
  CONSTRAINT pk_close_io_campaign_creation_job PRIMARY KEY (primary_key)
);

-- Close IO Smart View Creation Job  (Foundry apiName: CloseIoSmartViewCreationJob)
CREATE TABLE close_io_smart_view_creation_job (
  primary_key TEXT,
  lead_emails TEXT[],
  smart_view_name TEXT,
  triggered_at TIMESTAMPTZ,
  triggered_by TEXT,
  CONSTRAINT pk_close_io_smart_view_creation_job PRIMARY KEY (primary_key)
);

-- Close IO Task For Campaign  (Foundry apiName: CloseIoTaskForCampaign)
CREATE TABLE close_io_task_for_campaign (
  campaign_pk TEXT,
  close_sync_details TEXT,
  close_task_id TEXT,
  description TEXT,
  expiration_date TIMESTAMPTZ,
  lead_email TEXT,
  lead_close_id TEXT,
  objective TEXT,
  primary_key TEXT,
  status TEXT,
  task_owner TEXT,
  CONSTRAINT pk_close_io_task_for_campaign PRIMARY KEY (primary_key)
);

-- [Close] Lead via API  (Foundry apiName: CloseLeadViaApi)
CREATE TABLE close_lead_via_api (
  date_created TIMESTAMPTZ,
  date_updated TIMESTAMPTZ,
  description TEXT,
  display_name TEXT,
  email TEXT,
  html_url TEXT,
  ingestion_timestamp TIMESTAMPTZ,
  lead_country TEXT,
  lead_id TEXT,
  lead_owner_email TEXT,
  lead_owner_full_name TEXT,
  lead_owner_id TEXT,
  lead_phone_formatted_raw TEXT,
  lead_phone_processed TEXT,
  lead_phone_raw TEXT,
  status_id TEXT,
  status_label TEXT,
  url TEXT,
  CONSTRAINT pk_close_lead_via_api PRIMARY KEY (lead_id)
);

-- [Close] Transcript  (Foundry apiName: CloseTranscript)
CREATE TABLE close_transcript (
  activity_at TIMESTAMPTZ,
  activity_custom_field_foundry TEXT,
  activity_type TEXT,
  call_id TEXT,
  contact_id TEXT,
  conversation TEXT,
  custom_activity_type_id TEXT,
  date_created TIMESTAMPTZ,
  date_updated TIMESTAMPTZ,
  direction TEXT,
  disposition TEXT,
  duration INTEGER,
  email TEXT,
  has_speaker_labels BOOLEAN,
  lead_id TEXT,
  processing_timestamp TIMESTAMPTZ,
  speakers TEXT,
  summary_html TEXT,
  summary_text TEXT,
  transcript_id TEXT,
  transcript_type TEXT,
  user_id TEXT,
  utterances TEXT,
  CONSTRAINT pk_close_transcript PRIMARY KEY (call_id)
);

-- [Close] User  (Foundry apiName: CloseUser)
CREATE TABLE close_user (
  date_created TIMESTAMPTZ,
  date_updated TIMESTAMPTZ,
  email TEXT,
  email_verified_at TIMESTAMPTZ,
  first_name TEXT,
  full_name TEXT,
  google_profile_image_url TEXT,
  id TEXT,
  image TEXT,
  last_name TEXT,
  last_used_timezone TEXT,
  organizations TEXT,
  CONSTRAINT pk_close_user PRIMARY KEY (id)
);

-- Coach  (Foundry apiName: Coach)
CREATE TABLE coach (
  bio TEXT,
  certifications TEXT,
  coach_id TEXT,
  contact_info TEXT,
  experience_years TEXT,
  full_name TEXT,
  languages TEXT,
  photo_link TEXT,
  specialty TEXT,
  CONSTRAINT pk_coach PRIMARY KEY (coach_id)
);

-- Cohort  (Foundry apiName: Cohort)
CREATE TABLE cohort (
  cohort_slug TEXT,
  cohort_subscription_start_date DATE,
  CONSTRAINT pk_cohort PRIMARY KEY (cohort_slug)
);

-- Complete Survey Text  (Foundry apiName: CompleteSurveyText)
CREATE TABLE complete_survey_text (
  meeting_id TEXT,
  meeting_uuid TEXT,
  readable_survey TEXT,
  CONSTRAINT pk_complete_survey_text PRIMARY KEY (meeting_uuid)
);

-- Contract  (Foundry apiName: Contract)
CREATE TABLE contract (
  completion_date DATE,
  customer_email TEXT,
  contract_id TEXT,
  contract_name TEXT,
  contract_type TEXT,
  contract_url TEXT,
  creation_date DATE,
  currency_base TEXT,
  customer_address TEXT,
  customer_birth_date DATE,
  customer_city TEXT,
  customer_contract_status TEXT,
  customer_country TEXT,
  customer_first_name TEXT,
  customer_id TEXT,
  customer_last_name TEXT,
  customer_postal_code TEXT,
  duration_months TEXT,
  end_date DATE,
  first_subscription_contract_id TEXT,
  is_missing_info BOOLEAN,
  missing_info_issues TEXT[],
  payment_01_amount REAL,
  payment_01_date DATE,
  payment_02_amount REAL,
  payment_02_date DATE,
  payment_03_amount REAL,
  payment_03_date DATE,
  payment_04_amount REAL,
  payment_04_date DATE,
  payment_05_amount REAL,
  payment_05_date DATE,
  payment_06_amount REAL,
  payment_06_date DATE,
  payment_07_amount REAL,
  payment_07_date DATE,
  payment_08_amount REAL,
  payment_08_date DATE,
  payment_09_amount REAL,
  payment_09_date DATE,
  payment_10_amount REAL,
  payment_10_date DATE,
  payment_11_amount REAL,
  payment_11_date DATE,
  payment_12_amount REAL,
  payment_12_date DATE,
  payment_terms TEXT,
  program_id TEXT,
  source TEXT,
  start_date DATE,
  status TEXT,
  template_id TEXT,
  template_name TEXT,
  tob_contract_status TEXT,
  value_gross_base DOUBLE PRECISION,
  CONSTRAINT pk_contract PRIMARY KEY (contract_id)
);

-- Contracts To Be Exported (need approval)  (Foundry apiName: ContractsToBeExportedNeedApproval)
CREATE TABLE contracts_to_be_exported_need_approval (
  additional_clause_satisfaction_guarantee TEXT,
  additional_contract_information TEXT,
  billing_address_city TEXT,
  billing_address_company_name TEXT,
  billing_address_country TEXT,
  billing_address_postal_code TEXT,
  billing_address_street_house_number TEXT,
  billing_address_vat_id TEXT,
  close_opportunity_id TEXT,
  confirmation_information_correct TEXT,
  contract_date_time TEXT,
  contract_id TEXT,
  contract_name TEXT,
  contract_recording_video TEXT,
  contract_recording_zoom_link TEXT,
  contract_url TEXT,
  customer_birthday DATE,
  customer_email TEXT,
  customer_email_ab_re1 TEXT,
  customer_first_name TEXT,
  customer_gender TEXT,
  customer_last_name TEXT,
  customer_type TEXT,
  effective_product_price_gross_total DOUBLE PRECISION,
  email_address TEXT,
  export_status TEXT,
  has_matched_bexio_order BOOLEAN,
  has_previous_contract_in_30_days BOOLEAN,
  lzr_end DATE,
  lzr_start DATE,
  make_execution_id TEXT,
  payment_1_amount REAL,
  payment_1_date DATE,
  payment_10_amount REAL,
  payment_10_date DATE,
  payment_11_amount REAL,
  payment_11_date DATE,
  payment_12_amount REAL,
  payment_12_date DATE,
  payment_13_amount REAL,
  payment_13_date DATE,
  payment_14_amount REAL,
  payment_14_date DATE,
  payment_15_amount REAL,
  payment_15_date DATE,
  payment_16_amount REAL,
  payment_16_date DATE,
  payment_2_amount REAL,
  payment_2_date DATE,
  payment_3_amount REAL,
  payment_3_date DATE,
  payment_4_amount REAL,
  payment_4_date DATE,
  payment_5_amount REAL,
  payment_5_date DATE,
  payment_6_amount REAL,
  payment_6_date DATE,
  payment_7_amount REAL,
  payment_7_date DATE,
  payment_8_amount REAL,
  payment_8_date DATE,
  payment_9_amount REAL,
  payment_9_date DATE,
  payment_agreements TEXT,
  prev_contract_id TEXT,
  prev_contract_url TEXT,
  prev_signature_date DATE,
  product_currency TEXT,
  program_start_session_scheduled_on TEXT,
  reason_for_decline_export TEXT,
  send_onboarding BOOLEAN,
  signature_date DATE,
  skool_invite TEXT,
  timestamp TIMESTAMPTZ,
  upload_ab_re1_to_pipedrive TEXT,
  your_email_address_according_to_close_account TEXT,
  CONSTRAINT pk_contracts_to_be_exported_need_approval PRIMARY KEY (contract_id)
);

-- CSIC - Coaching Session Insight Chunk  (Foundry apiName: CsicCoachingSessionInsightChunk)
CREATE TABLE csic_coaching_session_insight_chunk (
  chunk_position INTEGER,
  chunk_row_id BIGINT,
  complete_chunk TEXT,
  complete_chunk_embedding DOUBLE PRECISION[],
  csicid TEXT,
  csictitle TEXT,
  guided_exercises TEXT,
  meeting_start_time TIMESTAMPTZ,
  meeting_duration DOUBLE PRECISION,
  meeting_id TEXT,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  recording_id TEXT,
  required_equipment TEXT,
  session_goal TEXT,
  session_name TEXT,
  session_name_abbreviation TEXT,
  session_name_description TEXT,
  session_summary_long TEXT,
  session_summary_short TEXT,
  CONSTRAINT pk_csic_coaching_session_insight_chunk PRIMARY KEY (csicid)
);

-- Customer  (Foundry apiName: Customer)
CREATE TABLE customer (
  address TEXT,
  app_user_id TEXT,
  birth_date DATE,
  city TEXT,
  contact_id TEXT,
  country TEXT,
  customer_id TEXT,
  email TEXT,
  first_name TEXT,
  full_name TEXT,
  has_booked_celebration_call BOOLEAN,
  has_participated_to_celebration_call BOOLEAN,
  user_created_in_web_app BOOLEAN,
  last_name TEXT,
  lead_id TEXT,
  phone TEXT,
  postal_code TEXT,
  CONSTRAINT pk_customer PRIMARY KEY (customer_id)
);

-- Customer Session Opened  (Foundry apiName: CustomerSessionOpened)
CREATE TABLE customer_session_opened (
  action TEXT,
  created_ts BIGINT,
  data_user_mail TEXT,
  event TEXT,
  timestamp TIMESTAMPTZ,
  CONSTRAINT pk_customer_session_opened PRIMARY KEY (data_user_mail)
);

-- Daily Recap Email  (Foundry apiName: DailyRecapEmail)
CREATE TABLE daily_recap_email (
  date_session DATE,
  day_content TEXT,
  focus_points TEXT,
  moment_content TEXT,
  morning_email_betreff TEXT,
  morning_email_highlight TEXT,
  morning_email_intro TEXT,
  morning_email_moment TEXT,
  morning_email_outro TEXT,
  morning_email_reconnection TEXT,
  morning_email_session TEXT,
  morning_email_support TEXT,
  pain_point TEXT[],
  recap_email_betreff TEXT,
  recap_email_editorial TEXT,
  recap_email_moment TEXT,
  recap_email_outlook TEXT,
  recap_email_sessions TEXT,
  recap_email_support TEXT,
  remainder_email_editorial TEXT,
  remainder_email_help TEXT,
  remainder_email_moment TEXT,
  remainder_email_outro TEXT,
  remainder_email_session TEXT,
  remainder_email_subject TEXT,
  session_day BIGINT,
  CONSTRAINT pk_daily_recap_email PRIMARY KEY (date_session)
);

-- Draft Whatsapp Answer  (Foundry apiName: DraftWhatsappAnswer)
CREATE TABLE draft_whatsapp_answer (
  answer TEXT,
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  contact_id TEXT,
  draft_id TEXT,
  generated_answer TEXT,
  generated_at TIMESTAMPTZ,
  generation_id TEXT,
  message_replied_to TEXT,
  modified_at TIMESTAMPTZ,
  modified_by TEXT,
  CONSTRAINT pk_draft_whatsapp_answer PRIMARY KEY (draft_id)
);

-- Email Offer Cohort  (Foundry apiName: EmailOfferCohort)
CREATE TABLE email_offer_cohort (
  cohort_name TEXT,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  email TEXT,
  ghl_contact_ids TEXT[],
  name TEXT,
  primary_key TEXT,
  sender_email TEXT,
  sender_name TEXT,
  CONSTRAINT pk_email_offer_cohort PRIMARY KEY (primary_key)
);

-- [Embedding] Cluster  (Foundry apiName: EmbeddingCluster)
CREATE TABLE embedding_cluster (
  cluster_id TEXT,
  cluster_ticket_example_embd DOUBLE PRECISION[],
  similarity_score DOUBLE PRECISION,
  cluster_description_embd DOUBLE PRECISION[],
  CONSTRAINT pk_embedding_cluster PRIMARY KEY (cluster_id)
);

-- Equipment  (Foundry apiName: Equipment)
CREATE TABLE equipment (
  equipment_active BOOLEAN,
  equipment_capacity INTEGER,
  equipment_id TEXT,
  equipment_inspection_date DATE,
  equipment_inspection_id TEXT,
  equipment_installation_date DATE,
  equipment_model TEXT,
  equipment_name TEXT,
  equipment_plant TEXT,
  equipment_type TEXT,
  equipment_year INTEGER,
  CONSTRAINT pk_equipment PRIMARY KEY (equipment_id)
);

-- Final Output  (Foundry apiName: FinalOutput)
CREATE TABLE final_output (
  all_landmarks TEXT,
  analysis_text JSONB,
  error TEXT,
  image_name TEXT,
  input_image_rid TEXT,
  landmarks TEXT,
  measurements TEXT,
  media_item_rid TEXT,
  media_reference JSONB,
  model TEXT,
  ok TEXT,
  output_image_rid TEXT,
  path TEXT,
  processing_status TEXT,
  prompt_version TEXT,
  segmentation TEXT,
  standardization TEXT,
  timestamp TIMESTAMPTZ,
  uuid TEXT,
  validation TEXT,
  CONSTRAINT pk_final_output PRIMARY KEY (uuid)
);

-- Final Output multi nodes  (Foundry apiName: FinalOutputMultiNodes)
CREATE TABLE final_output_multi_nodes (
  all_landmarks TEXT,
  ankle_tibia_analysis_text JSONB,
  breathing_space_analysis_text JSONB,
  cervical_head_analysis_text JSONB,
  cervical_spine_behavior_text JSONB,
  correction_prio_text JSONB,
  error TEXT,
  femur_hip_analysis_text JSONB,
  image_name TEXT,
  input_image_rid TEXT,
  kinetics_breaks_ditribution_text JSONB,
  knee_analysis_text JSONB,
  landmarks TEXT,
  lumbar_spine_behavior_text JSONB,
  measurements TEXT,
  media_item_rid TEXT,
  media_reference JSONB,
  model TEXT,
  ok_ankle_tibia_text TEXT,
  ok_breathing_space_analysis_text TEXT,
  ok_cervical_head_analysis_text TEXT,
  ok_cervical_spine_behavior_text TEXT,
  ok_correction_prio_text TEXT,
  ok_femur_hip_analysis_text TEXT,
  ok_kinetics_breaks_ditribution_text TEXT,
  ok_knee_analysis_text TEXT,
  ok_lumbar_spine_behavior_text TEXT,
  ok_pattern_chain_recognition_text TEXT,
  ok_pattern_integration_text TEXT,
  ok_pelvis_analysis_text TEXT,
  ok_shoulder_arm_text TEXT,
  ok_thoracic_spine_behavior_text TEXT,
  ok_thorax_analysis_text TEXT,
  ok_trunk_pressure_distribution_text TEXT,
  output_image_rid TEXT,
  path TEXT,
  pattern_chain_recognition_text JSONB,
  pattern_integration_text JSONB,
  pelvis_analysis_text JSONB,
  processing_status TEXT,
  prompt_version TEXT,
  segmentation TEXT,
  shoulder_arm_text JSONB,
  standardization TEXT,
  thoracic_spine_behavior_text JSONB,
  thorax_analysis_text JSONB,
  timestamp TIMESTAMPTZ,
  trunk_pressure_distribution_text JSONB,
  uuid TEXT,
  validation TEXT,
  CONSTRAINT pk_final_output_multi_nodes PRIMARY KEY (uuid)
);

-- Form Submission  (Foundry apiName: FormSubmission)
CREATE TABLE form_submission (
  form_name TEXT,
  form_submission_id TEXT,
  submission_date TIMESTAMPTZ,
  user_id TEXT,
  CONSTRAINT pk_form_submission PRIMARY KEY (form_submission_id)
);

-- Form Submission Answer  (Foundry apiName: FormSubmissionAnswer)
CREATE TABLE form_submission_answer (
  answer TEXT,
  form_submission_answer_id TEXT,
  form_submission_id TEXT,
  question TEXT,
  question_index INTEGER,
  CONSTRAINT pk_form_submission_answer PRIMARY KEY (form_submission_answer_id)
);

-- Form Submissions v2  (Foundry apiName: FormSubmissionsV2)
CREATE TABLE form_submissions_v2 (
  contact_id TEXT,
  email TEXT,
  form_id TEXT,
  form_name TEXT,
  form_submission_id TEXT,
  submitted_at TIMESTAMPTZ,
  submitter_full_name TEXT,
  CONSTRAINT pk_form_submissions_v2 PRIMARY KEY (form_submission_id)
);

-- [Product] Lecture  (Foundry apiName: FoundryDataCoachingProgrammLektionen)
CREATE TABLE foundry_data_coaching_programm_lektionen (
  lektion_beschreibung TEXT,
  lektion_id TEXT,
  lektion_name TEXT,
  lektion_url TEXT,
  zuordnung_modul_id NUMERIC,
  CONSTRAINT pk_foundry_data_coaching_programm_lektionen PRIMARY KEY (lektion_id)
);

-- [Product] Module  (Foundry apiName: FoundryDataCoachingProgrammModule)
CREATE TABLE foundry_data_coaching_programm_module (
  modul_beschreibung TEXT,
  modul_id TEXT,
  modul_name TEXT,
  modul_url TEXT,
  zuordnung_programm_id NUMERIC,
  CONSTRAINT pk_foundry_data_coaching_programm_module PRIMARY KEY (modul_id)
);

-- [Product] Session-Type  (Foundry apiName: FoundryDataCoachingProgrammSessionTypen)
CREATE TABLE foundry_data_coaching_programm_session_typen (
  session_description TEXT,
  session_id TEXT,
  session_name TEXT,
  zuordnung_lekture_id NUMERIC,
  CONSTRAINT pk_foundry_data_coaching_programm_session_typen PRIMARY KEY (session_id)
);

-- Foundry Resource  (Foundry apiName: FoundryResource)
CREATE TABLE foundry_resource (
  avg_file_size_mb DOUBLE PRECISION,
  created_by TEXT,
  created_time TIMESTAMPTZ,
  description TEXT,
  display_name TEXT,
  documentation TEXT,
  number_of_files BIGINT,
  parent_folder_rid TEXT,
  path TEXT,
  project_name TEXT,
  project_rid TEXT,
  rid TEXT,
  service_account_access_error TEXT,
  size_gbs DOUBLE PRECISION,
  space_rid TEXT,
  trash_status TEXT,
  type TEXT,
  updated_by TEXT,
  updated_time TIMESTAMPTZ,
  CONSTRAINT pk_foundry_resource PRIMARY KEY (rid)
);

-- Foundry Resource Alert  (Foundry apiName: FoundryResourceAlert)
CREATE TABLE foundry_resource_alert (
  alert_category TEXT,
  alert_id TEXT,
  alert_type TEXT,
  assignee TEXT,
  context TEXT,
  rid TEXT,
  status TEXT,
  CONSTRAINT pk_foundry_resource_alert PRIMARY KEY (alert_id)
);

-- Foundry Resource Daily Cost  (Foundry apiName: FoundryResourceDailyCost)
CREATE TABLE foundry_resource_daily_cost (
  currency_usage DOUBLE PRECISION,
  currency_usage_unit TEXT,
  date DATE,
  id TEXT,
  resource_rid TEXT,
  CONSTRAINT pk_foundry_resource_daily_cost PRIMARY KEY (id)
);

-- Foundry Resource Role  (Foundry apiName: FoundryResourceRole)
CREATE TABLE foundry_resource_role (
  principal_id TEXT,
  principal_type TEXT,
  resource_rid TEXT,
  resource_role_id TEXT,
  role_id TEXT,
  CONSTRAINT pk_foundry_resource_role PRIMARY KEY (resource_role_id)
);

-- Foundry User  (Foundry apiName: FoundryUser)
CREATE TABLE foundry_user (
  attributes TEXT,
  email TEXT,
  family_name TEXT,
  given_name TEXT,
  group_names_membership TEXT[],
  hash_called TEXT,
  hash_value TEXT,
  id TEXT,
  organization TEXT,
  realm TEXT,
  username TEXT,
  CONSTRAINT pk_foundry_user PRIMARY KEY (id)
);

-- [Funnelbox] Contact v2  (Foundry apiName: FunnelboxContactV2)
CREATE TABLE funnelbox_contact_v2 (
  attribution_source_session_source TEXT,
  bexio_is_active_main_program_client BOOLEAN,
  bexio_is_client BOOLEAN,
  bexio_is_finishing_lzr_30_days BOOLEAN,
  bexio_is_finishing_lzr_7_days BOOLEAN,
  bexio_is_finishing_lzr_90_days BOOLEAN,
  bexio_is_main_program_client BOOLEAN,
  bexio_is_training_cert_client BOOLEAN,
  bexio_lzr_end_date DATE,
  bexio_lzr_month_duration BIGINT,
  bexio_lzr_start_date DATE,
  bexio_was_main_program_client BOOLEAN,
  contract_is_signed BOOLEAN,
  country TEXT,
  custom_fields TEXT[],
  dnd_settings_email_status TEXT,
  docuseal_bexio_id TEXT,
  docuseal_contract_id TEXT,
  docuseal_contract_name TEXT,
  docuseal_duration_months TEXT,
  docuseal_is_contract_main_program BOOLEAN,
  docuseal_is_signed BOOLEAN,
  docuseal_program TEXT,
  docuseal_sent_date DATE,
  docuseal_sent_last_4_weeks BOOLEAN,
  docuseal_start_date DATE,
  docuseal_template_id TEXT,
  email TEXT,
  favorited_by_tob TEXT[],
  first_attribution_source TEXT,
  first_name TEXT,
  full_name TEXT,
  has_ticket BOOLEAN,
  id TEXT,
  is_deleted BOOLEAN,
  is_qualified_for_psychological_profile BOOLEAN,
  last_attribution_source TEXT,
  last_name TEXT,
  lobby_attendance BOOLEAN,
  notes TEXT,
  pandadoc_has_draft BOOLEAN,
  pandadoc_is_contract_main_program BOOLEAN,
  pandadoc_is_sent BOOLEAN,
  pandadoc_is_signed BOOLEAN,
  pandadoc_is_viewed BOOLEAN,
  pandadoc_is_voided BOOLEAN,
  pandadoc_name TEXT,
  pandadoc_pandadoc_document_id TEXT,
  pandadoc_pandadoc_id TEXT,
  pandadoc_sent_last_4_weeks BOOLEAN,
  pandadoc_template_name TEXT,
  pandadoc_ts_document_draft TIMESTAMPTZ,
  pandadoc_ts_document_sent TIMESTAMPTZ,
  pandadoc_ts_document_signed TIMESTAMPTZ,
  pandadoc_ts_document_viewed TIMESTAMPTZ,
  pandadoc_ts_document_voided TIMESTAMPTZ,
  pandadoc_url_signing_customer TEXT,
  phone TEXT,
  profile_generated_at TIMESTAMPTZ,
  psychological_profile TEXT,
  source TEXT,
  tags TEXT[],
  timestamp_creation TIMESTAMPTZ,
  timestamp_last_update TIMESTAMPTZ,
  tob_assigned_email TEXT,
  tob_assigned_id TEXT,
  tob_assigned_name TEXT,
  CONSTRAINT pk_funnelbox_contact_v2 PRIMARY KEY (id)
);

-- [Funnelbox] EMail Thread  (Foundry apiName: FunnelboxEmailThread)
CREATE TABLE funnelbox_email_thread (
  contact_email TEXT,
  contact_id TEXT,
  from TEXT,
  is_thread_unanswered BOOLEAN,
  latest_message_timestamp TIMESTAMPTZ,
  mailbox TEXT,
  original_direction TEXT,
  original_timestamp TIMESTAMPTZ,
  subject TEXT,
  thread_id TEXT,
  to TEXT,
  CONSTRAINT pk_funnelbox_email_thread PRIMARY KEY (thread_id)
);

-- Funnelbox Tags Creation Job  (Foundry apiName: FunnelboxTagsCreationJob)
CREATE TABLE funnelbox_tags_creation_job (
  primary_key TEXT,
  contact_ids TEXT[],
  description TEXT,
  errors TEXT[],
  errors_count INTEGER,
  failed_contact_ids TEXT[],
  job_id TEXT,
  name TEXT,
  response_code INTEGER,
  response_succeded BOOLEAN,
  tags TEXT[],
  triggered_at TIMESTAMPTZ,
  triggered_by TEXT,
  CONSTRAINT pk_funnelbox_tags_creation_job PRIMARY KEY (primary_key)
);

-- [Funnelbox] Video  (Foundry apiName: FunnelboxVideo)
CREATE TABLE funnelbox_video (
  emails TEXT[],
  ghl_contact_ids TEXT[],
  mean_watchtime DOUBLE PRECISION,
  num_consumers BIGINT,
  video TEXT,
  video_trackings TEXT[],
  CONSTRAINT pk_funnelbox_video PRIMARY KEY (video)
);

-- [Funnelbox] Video Tracking  (Foundry apiName: FunnelboxVideoTracking)
CREATE TABLE funnelbox_video_tracking (
  email TEXT,
  event TEXT,
  ghl_contact_id TEXT,
  mariadb_id TEXT,
  timestamp TIMESTAMPTZ,
  title TEXT,
  video TEXT,
  watchtime DOUBLE PRECISION,
  watchtime_string TEXT,
  workflow_id TEXT,
  workflow_name TEXT,
  CONSTRAINT pk_funnelbox_video_tracking PRIMARY KEY (mariadb_id)
);

-- [GHL] Form  (Foundry apiName: GhlForm)
CREATE TABLE ghl_form (
  count_submissions BIGINT,
  event_datadocument_url TEXT,
  form_id TEXT,
  form_name TEXT,
  question_ids TEXT[],
  submission_contact_ids TEXT[],
  submission_ids TEXT[],
  CONSTRAINT pk_ghl_form PRIMARY KEY (form_id)
);

-- [GHL] Form Q&A  (Foundry apiName: GhlFormQA)
CREATE TABLE ghl_form_qa (
  answer TEXT,
  answer_options TEXT[],
  created_at TIMESTAMPTZ,
  e_mail TEXT,
  form_id TEXT,
  form_name TEXT,
  ghl_id TEXT,
  id TEXT,
  q_aid TEXT,
  question TEXT,
  question_id TEXT,
  submission_id TEXT,
  title TEXT,
  CONSTRAINT pk_ghl_form_qa PRIMARY KEY (q_aid)
);

-- [GHL] Form Question  (Foundry apiName: GhlFormQuestion)
CREATE TABLE ghl_form_question (
  data_type TEXT,
  meaning TEXT,
  question_answer_options TEXT[],
  question_field_key TEXT,
  question_id TEXT,
  question_name TEXT,
  CONSTRAINT pk_ghl_form_question PRIMARY KEY (question_id)
);

-- [GHL] Form Submission  (Foundry apiName: GhlFormSubmission)
CREATE TABLE ghl_form_submission (
  affid TEXT,
  calendar_name TEXT,
  contact_id TEXT,
  date_field_details TEXT,
  domain_name TEXT,
  email TEXT,
  event_ad_source TEXT,
  event_contact_session_ids TEXT,
  event_document_url TEXT,
  event_domain TEXT,
  event_fb_event_id TEXT,
  event_fbc TEXT,
  event_fbp TEXT,
  event_fingerprint TEXT,
  event_medium TEXT,
  event_medium_id TEXT,
  event_page_title TEXT,
  event_page_url TEXT,
  event_page_visit_type TEXT,
  event_parent_id TEXT,
  event_parent_name TEXT,
  event_referrer TEXT,
  event_source TEXT,
  event_timestamp TIMESTAMPTZ,
  event_type_1 TEXT,
  event_type TEXT,
  event_version TEXT,
  fields_ori_sequance TEXT,
  first_name TEXT,
  form_id TEXT,
  form_name TEXT,
  full_name TEXT,
  funnel_id TEXT,
  funnel_step_id TEXT,
  id TEXT,
  internal_source TEXT,
  ip TEXT,
  last_name TEXT,
  location_id TEXT,
  page_id TEXT,
  page_url TEXT,
  phone TEXT,
  qa_ids TEXT[],
  selected_slot TEXT,
  selected_timezone TEXT,
  session_fingerprint TEXT,
  session_id TEXT,
  signature_hash TEXT,
  source TEXT,
  source_url TEXT,
  submission_id TEXT,
  created_at TIMESTAMPTZ,
  terms_and_conditions TEXT,
  timezone TEXT,
  title TEXT,
  user_id TEXT,
  CONSTRAINT pk_ghl_form_submission PRIMARY KEY (submission_id)
);

-- [Funnelbox] eMail  (Foundry apiName: GhlMessageV2)
CREATE TABLE ghl_message_v2 (
  body TEXT,
  clicked_count BIGINT,
  clicked_timestamp TIMESTAMPTZ,
  contact_email TEXT,
  contact_id TEXT,
  context TEXT,
  conversation_id TEXT,
  delivered_count BIGINT,
  delivered_timestamp TIMESTAMPTZ,
  direction TEXT,
  from TEXT,
  is_thread_unanswered BOOLEAN,
  is_unanswered BOOLEAN,
  mariadb_id TEXT,
  message_id TEXT,
  opened_count BIGINT,
  opened_timestamp TIMESTAMPTZ,
  source TEXT,
  subject TEXT,
  thread_id TEXT,
  timestamp TIMESTAMPTZ,
  to TEXT,
  CONSTRAINT pk_ghl_message_v2 PRIMARY KEY (mariadb_id)
);

-- [Funnelbox] Schmerzfrei Umfrage temp  (Foundry apiName: GhlSchmerzfreiUmfrageV2)
CREATE TABLE ghl_schmerzfrei_umfrage_v2 (
  auf_einer_skala_von_1_10_wo_w_rdest_du_deine_schmerzen_einordne TEXT,
  bist_du_bereit_dir_aktiv_zeit_zu_nehmen_und_mit_uns_gemeinsam_a TEXT,
  e_mail_adresse TEXT,
  ghl_contact_id TEXT,
  ghl_tob_id TEXT,
  gibt_es_etwas_das_du_in_deinem_leben_vermisst_was_du_gerne_wied TEXT,
  hast_du_hoffnung_dass_es_doch_noch_etwas_geben_k_nnte_das_dir_h TEXT,
  in_welchen_positionen_machen_sich_deine_schmerzen_bemerkbar TEXT,
  nachname TEXT,
  submission_date TEXT,
  timezone TEXT,
  url TEXT,
  uuid TEXT,
  vervollst_ndige_den_satz_wenn_ich_schmerzfrei_bin_muss_ich_nich TEXT,
  vorname TEXT,
  was_hast_du_bisher_alles_unternommen_um_deine_schmerzen_loszuwe TEXT,
  was_hat_aus_deiner_sicht_bislang_bei_diesen_methoden_gefehlt_od TEXT,
  was_sind_weitere_beschwerden_die_du_mitbringst TEXT,
  welche_beschwerden_hast_du TEXT,
  wie_lange_leidest_du_schon_unter_deinen_schmerzen TEXT,
  wie_sehr_willst_du_wieder_schmerzfrei_werden_10_ich_m_chte_unbe TEXT,
  wo_schr_nken_dich_deine_schmerzen_aktuell_am_meisten_ein TEXT,
  CONSTRAINT pk_ghl_schmerzfrei_umfrage_v2 PRIMARY KEY (uuid)
);

-- [GHL] Survey  (Foundry apiName: GhlSurvey)
CREATE TABLE ghl_survey (
  form_id TEXT,
  form_url TEXT,
  num_submissions BIGINT,
  question_ids TEXT[],
  submission_contact_ids TEXT[],
  submission_ids TEXT[],
  survey_name TEXT,
  CONSTRAINT pk_ghl_survey PRIMARY KEY (form_id)
);

-- [GHL] Survey Q&A  (Foundry apiName: GhlSurveyQA)
CREATE TABLE ghl_survey_qa (
  answer TEXT,
  contact_id TEXT,
  created_at TEXT,
  email TEXT,
  form_id TEXT,
  id TEXT,
  qa_id TEXT,
  question_id TEXT,
  question_name TEXT,
  question_options TEXT[],
  submission_id TEXT,
  survey_name TEXT,
  title TEXT,
  CONSTRAINT pk_ghl_survey_qa PRIMARY KEY (qa_id)
);

-- [GHL] Survey Question  (Foundry apiName: GhlSurveyQuestion)
CREATE TABLE ghl_survey_question (
  data_type TEXT,
  meaning TEXT,
  question_answer_options TEXT[],
  question_field_key TEXT,
  question_id TEXT,
  question_name TEXT,
  CONSTRAINT pk_ghl_survey_question PRIMARY KEY (question_id)
);

-- [GHL] Survey Submission  (Foundry apiName: GhlSurveySubmission)
CREATE TABLE ghl_survey_submission (
  contact_id TEXT,
  created_at TEXT,
  document_url TEXT,
  domain_name TEXT,
  email TEXT,
  event_ad_source TEXT,
  event_contact_session_ids TEXT,
  event_document_url TEXT,
  event_domain TEXT,
  event_fb_event_id TEXT,
  event_fbc TEXT,
  event_fbp TEXT,
  event_fingerprint TEXT,
  event_medium TEXT,
  event_medium_id TEXT,
  event_page_title TEXT,
  event_page_url TEXT,
  event_page_visit_type TEXT,
  event_parent_id TEXT,
  event_parent_name TEXT,
  event_referrer TEXT,
  event_source TEXT,
  event_timestamp TIMESTAMPTZ,
  event_type TEXT,
  event_type_optin TEXT,
  event_version TEXT,
  fields_ori_sequance TEXT,
  first_name TEXT,
  form_id TEXT,
  funnel_id TEXT,
  funnel_step_id TEXT,
  id TEXT,
  ip TEXT,
  last_name TEXT,
  location_id TEXT,
  page_id TEXT,
  page_url TEXT,
  phone TEXT,
  qa_ids TEXT[],
  session_fingerprint TEXT,
  signature_hash TEXT,
  submission_id TEXT,
  survey_name TEXT,
  timezone TEXT,
  title TEXT,
  CONSTRAINT pk_ghl_survey_submission PRIMARY KEY (submission_id)
);

-- [Funnelbox] TOB Member v2  (Foundry apiName: GhlTobUserV2)
CREATE TABLE ghl_tob_user_v2 (
  email TEXT,
  first_name TEXT,
  id TEXT,
  last_name TEXT,
  name TEXT,
  team TEXT,
  CONSTRAINT pk_ghl_tob_user_v2 PRIMARY KEY (id)
);

-- TOB Member [Funnelbox]  (Foundry apiName: GhlUser)
CREATE TABLE ghl_user (
  email TEXT,
  first_name TEXT,
  id TEXT,
  last_name TEXT,
  name TEXT,
  CONSTRAINT pk_ghl_user PRIMARY KEY (id)
);

-- [TOB] ID Matcher  (Foundry apiName: IdMatch)
CREATE TABLE id_match (
  close_contact_id TEXT[],
  close_lead_id TEXT[],
  email TEXT,
  exported_summit_profile TIMESTAMPTZ,
  ghl_contact_ids TEXT[],
  name TEXT,
  num_tickets BIGINT,
  num_zoom_meetings BIGINT,
  pandadoc_ids TEXT[],
  summit_profile_triggered TIMESTAMPTZ,
  tags TEXT[],
  tags_zoom_keywords TEXT[],
  uuid_foundry TEXT,
  zoom_meeting_ids TEXT[],
  zoom_meeting_instance_ids TEXT[],
  zoom_participant_uuids TEXT[],
  zoom_ticket_ids TEXT[],
  zoom_user_ids TEXT[],
  CONSTRAINT pk_id_match PRIMARY KEY (email)
);

-- Inbox [AST]  (Foundry apiName: InboxAst)
CREATE TABLE inbox_ast (
  clarification TEXT,
  description TEXT,
  primary_key TEXT,
  title TEXT,
  CONSTRAINT pk_inbox_ast PRIMARY KEY (primary_key)
);

-- Initiative [AST]  (Foundry apiName: InitiativeAst)
CREATE TABLE initiative_ast (
  completed_at DATE,
  created_at DATE,
  primary_key TEXT,
  status TEXT,
  titel TEXT,
  CONSTRAINT pk_initiative_ast PRIMARY KEY (primary_key)
);

-- [Insight] Call  (Foundry apiName: InsightCall)
CREATE TABLE insight_call (
  call_start_date TIMESTAMPTZ,
  call_status TEXT,
  campaign TEXT,
  closeio_call_duration INTEGER,
  closeio_custom_activity_type_id TEXT,
  closeio_lead_id TEXT,
  closeio_user_id TEXT,
  contactv2_uuid_foundry TEXT,
  conversation_id TEXT,
  elevenlabs_agent_id TEXT,
  full_transcript_text TEXT,
  lead_cockpit_tag TEXT[],
  lead_email TEXT,
  marketing_offer_days_from_start BIGINT,
  marketing_offer_id TEXT,
  primary_key TEXT,
  user_full_name TEXT,
  source TEXT,
  type_of_call TEXT,
  CONSTRAINT pk_insight_call PRIMARY KEY (primary_key)
);

-- Insight [Kickscale]  (Foundry apiName: InsightKickscale)
CREATE TABLE insight_kickscale (
  call_date TIMESTAMPTZ,
  call_date_string TEXT,
  call_id TEXT,
  call_name TEXT,
  call_origin TEXT,
  call_type_description TEXT,
  call_type_name TEXT,
  email TEXT,
  insight TEXT,
  insight_event_description TEXT,
  insight_event_type TEXT,
  insight_id TEXT,
  insight_result_evaluation TEXT,
  insight_type_class TEXT,
  name TEXT,
  quote TEXT,
  speaker TEXT,
  utterance_id TEXT,
  CONSTRAINT pk_insight_kickscale PRIMARY KEY (insight_id)
);

-- Calls Insight Queue  (Foundry apiName: InsightQueue)
CREATE TABLE insight_queue (
  call_foreign_key TEXT,
  campaign_foreign_key TEXT,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  primary_key TEXT,
  status TEXT,
  transcript TEXT,
  CONSTRAINT pk_insight_queue PRIMARY KEY (primary_key)
);

-- Insight Relevance Determinator System Prompt  (Foundry apiName: InsightRelevanceDeterminatorSystemPromptDataset)
CREATE TABLE insight_relevance_determinator_system_prompt_dataset (
  draft BOOLEAN,
  primary_key TEXT,
  prompt TEXT,
  reason_for_update_user_feedback TEXT,
  timestamp_created TIMESTAMPTZ,
  update_reasoning_provided_by_llm TEXT,
  CONSTRAINT pk_insight_relevance_determinator_system_prompt_dataset PRIMARY KEY (primary_key)
);

-- [Insight] Scope Call  (Foundry apiName: InsightScopeCall)
CREATE TABLE insight_scope_call (
  conversation_id TEXT,
  primary_key TEXT,
  scope_run_id TEXT,
  source TEXT,
  transcript TEXT,
  CONSTRAINT pk_insight_scope_call PRIMARY KEY (primary_key)
);

-- [Insight] Scope Run  (Foundry apiName: InsightScopeRun)
CREATE TABLE insight_scope_run (
  created_at TIMESTAMPTZ,
  created_by TEXT,
  description TEXT,
  markdown_report TEXT,
  primary_key TEXT,
  status TEXT,
  CONSTRAINT pk_insight_scope_run PRIMARY KEY (primary_key)
);

-- Insight Type  (Foundry apiName: InsightType)
CREATE TABLE insight_type (
  date_created TIMESTAMPTZ,
  description TEXT,
  id TEXT,
  lead_temperature_stage TEXT,
  question TEXT,
  question_embedding DOUBLE PRECISION[],
  question_type TEXT,
  tag TEXT[],
  CONSTRAINT pk_insight_type PRIMARY KEY (id)
);

-- Insight Type Response  (Foundry apiName: InsightTypeResponse)
CREATE TABLE insight_type_response (
  answers TEXT[],
  applicability_reason TEXT,
  insight_type_id TEXT,
  is_applicable BOOLEAN,
  primary_key TEXT,
  reviewed_by_humam BOOLEAN,
  touchpoint_id TEXT,
  CONSTRAINT pk_insight_type_response PRIMARY KEY (primary_key)
);

-- Insight Type Response v2  (Foundry apiName: InsightTypeResponseV2)
CREATE TABLE insight_type_response_v2 (
  answers TEXT[],
  applicability_reason TEXT,
  contact_id TEXT,
  email TEXT,
  insight_decay_timeline TEXT,
  insight_decay_timeline_applicability_reason TEXT,
  insight_type_id TEXT,
  is_applicable BOOLEAN,
  primary_key TEXT,
  source_context TEXT,
  timestamp_from TIMESTAMPTZ,
  timestamp_processed TIMESTAMPTZ,
  touchpoint_ids TEXT[],
  CONSTRAINT pk_insight_type_response_v2 PRIMARY KEY (primary_key)
);

-- Insights Summary  (Foundry apiName: InsightsSummaryDownloadForFunnelboxParquetFormat)
CREATE TABLE insights_summary_download_for_funnelbox_parquet_format (
  email TEXT,
  insight_summary TEXT,
  CONSTRAINT pk_insights_summary_download_for_funnelbox_parquet_format PRIMARY KEY (email)
);

-- [Internal] Resource Tracking  (Foundry apiName: InternalResourceTracking)
CREATE TABLE internal_resource_tracking (
  authors TEXT[],
  departments TEXT[],
  description TEXT,
  dev_docs TEXT[],
  dev_docs_rids TEXT[],
  documentation_walkthrough_media_item_rid TEXT,
  external_urls TEXT[],
  extra_links TEXT,
  foundry_rids TEXT[],
  is_valid BOOLEAN,
  maintainers TEXT[],
  maturity TEXT,
  media_item_rid TEXT,
  media_reference JSONB,
  new_property1 TEXT,
  owners TEXT[],
  path TEXT,
  pocs TEXT[],
  product_type TEXT,
  resources TEXT[],
  roadmap TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ,
  use_case_id TEXT,
  use_case_name TEXT,
  CONSTRAINT pk_internal_resource_tracking PRIMARY KEY (use_case_id)
);

-- Invoice  (Foundry apiName: Invoice)
CREATE TABLE invoice (
  answered_outbound_call_last_7_days BOOLEAN,
  anticipated_amount_gross DOUBLE PRECISION,
  anticipated_date_of_payment DATE,
  close_display_name TEXT,
  close_html_url TEXT,
  close_lead_id TEXT,
  close_lead_owner_email TEXT,
  close_lead_owner_full_name TEXT,
  close_lead_phone_processed TEXT,
  collection_assignee TEXT,
  contact_id INTEGER,
  contract_tob_email_closer TEXT,
  currency_description TEXT,
  customer_id TEXT,
  due_date DATE,
  full_name TEXT,
  invoice_id TEXT,
  invoice_status TEXT,
  is_overdue BOOLEAN,
  latest_outbound_answered_call TIMESTAMPTZ,
  mail TEXT,
  next_check_in_date DATE,
  order_id TEXT,
  overdue_days BIGINT,
  overdue_days_buckets TEXT,
  phone TEXT,
  product_name TEXT,
  title TEXT,
  total_gross NUMERIC,
  updated_at TIMESTAMPTZ,
  CONSTRAINT pk_invoice PRIMARY KEY (invoice_id)
);

-- Invoice Comment  (Foundry apiName: InvoiceComment)
CREATE TABLE invoice_comment (
  comment_id TEXT,
  created_at_ts TIMESTAMPTZ,
  image TEXT,
  image_path TEXT,
  invoice_id TEXT,
  is_public BOOLEAN,
  text TEXT,
  user_email TEXT,
  user_id INTEGER,
  user_name TEXT,
  CONSTRAINT pk_invoice_comment PRIMARY KEY (comment_id)
);

-- Invoice Debt Collection Actions  (Foundry apiName: InvoiceDebtCollectionActions)
CREATE TABLE invoice_debt_collection_actions (
  action_type TEXT,
  created_by TEXT,
  create_at_dt TIMESTAMPTZ,
  has_customer_responded BOOLEAN,
  invoice_id TEXT,
  notes TEXT,
  outcome_selector TEXT,
  primary_key TEXT,
  promised_payment_date DATE,
  CONSTRAINT pk_invoice_debt_collection_actions PRIMARY KEY (primary_key)
);

-- Invoice Reminder  (Foundry apiName: InvoiceReminder)
CREATE TABLE invoice_reminder (
  footer TEXT,
  header TEXT,
  is_sent BOOLEAN,
  is_valid_from DATE,
  is_valid_to DATE,
  kb_invoice_id TEXT,
  received_total REAL,
  remaining_price REAL,
  reminder_id TEXT,
  reminder_level INTEGER,
  reminder_period_in_days INTEGER,
  show_positions BOOLEAN,
  title TEXT,
  CONSTRAINT pk_invoice_reminder PRIMARY KEY (reminder_id)
);

-- Ki-Jana Draft  (Foundry apiName: JanaDraft)
CREATE TABLE jana_draft (
  content TEXT,
  context TEXT,
  drafted_at TIMESTAMPTZ,
  drafted_by TEXT,
  drafted_for TEXT,
  foreign_key TEXT,
  primary_key TEXT,
  reply_message_id TEXT,
  sender_email TEXT,
  sender_name TEXT,
  status TEXT,
  target TEXT,
  thread_id TEXT,
  title TEXT,
  type TEXT,
  CONSTRAINT pk_jana_draft PRIMARY KEY (primary_key)
);

-- Jana Static Data Unioned  (Foundry apiName: JanaStaticData)
CREATE TABLE jana_static_data (
  json_data TEXT,
  static_info_id TEXT,
  static_info_type TEXT,
  CONSTRAINT pk_jana_static_data PRIMARY KEY (static_info_id)
);

-- [KB] Document  (Foundry apiName: KbDocument)
CREATE TABLE kb_document (
  ai_summary TEXT,
  document_category TEXT,
  document_id TEXT,
  document_status TEXT,
  document_type TEXT,
  full_text_content TEXT,
  imported_datetime TIMESTAMPTZ,
  mentioned_exercises TEXT[],
  mentioned_symptoms TEXT[],
  primary_concepts TEXT[],
  semantic_tags TEXT[],
  source_media_item_rid TEXT,
  title TEXT,
  topic TEXT,
  version TEXT,
  CONSTRAINT pk_kb_document PRIMARY KEY (document_id)
);

-- [KB] Document Chunk  (Foundry apiName: KbDocumentChunk)
CREATE TABLE kb_document_chunk (
  chunk_id TEXT,
  chunk_index INTEGER,
  chunk_text TEXT,
  chunk_type TEXT,
  created_datetime TIMESTAMPTZ,
  document_id TEXT,
  embedding_vector DOUBLE PRECISION[],
  has_code_or_list BOOLEAN,
  is_rag_suitable BOOLEAN,
  is_table_content BOOLEAN,
  parent_category TEXT,
  parent_semantic_tags TEXT[],
  parent_title TEXT,
  relevance_keywords TEXT[],
  section_heading TEXT,
  CONSTRAINT pk_kb_document_chunk PRIMARY KEY (chunk_id)
);

-- KI-Jana Email Offer Draft  (Foundry apiName: KiJanaEmailOfferDraft)
CREATE TABLE ki_jana_email_offer_draft (
  brand_damage_risk TEXT,
  cohort_name TEXT,
  contact_id TEXT,
  email_address TEXT,
  email_content TEXT,
  judge_reasoning TEXT,
  lead_name TEXT,
  primary_key TEXT,
  sender_email TEXT,
  sender_name TEXT,
  should_be_reviewed BOOLEAN,
  status TEXT,
  subject TEXT,
  triggered_at TIMESTAMPTZ,
  triggered_by TEXT,
  CONSTRAINT pk_ki_jana_email_offer_draft PRIMARY KEY (primary_key)
);

-- [KB] Knowledge Base Q&A  (Foundry apiName: KnowledgeBaseQA)
CREATE TABLE knowledge_base_qa (
  access_level TEXT,
  answer TEXT,
  bounty INTEGER,
  created_from_issue_link TEXT,
  primary_key TEXT,
  question TEXT,
  time_created TIMESTAMPTZ,
  CONSTRAINT pk_knowledge_base_qa PRIMARY KEY (primary_key)
);

-- Lascha Orders  (Foundry apiName: LaschaOrders)
CREATE TABLE lascha_orders (
  assignee TEXT,
  consolidated_customer_id TEXT,
  customer_id TEXT,
  customer_name TEXT,
  days_until_due INTEGER,
  item_name TEXT,
  order_due_date TIMESTAMPTZ,
  order_id TEXT,
  quantity INTEGER,
  status TEXT,
  unit_price INTEGER,
  CONSTRAINT pk_lascha_orders PRIMARY KEY (order_id)
);

-- Latest Connecting Call Transcript  (Foundry apiName: LatestConnectingCallTranscript)
CREATE TABLE latest_connecting_call_transcript (
  activity_at TIMESTAMPTZ,
  activity_call_id TEXT,
  activity_contact_id TEXT,
  activity_conversation TEXT,
  activity_lead_id TEXT,
  activity_summary_text TEXT,
  activity_user_id TEXT,
  close_lead_id TEXT,
  close_lead_phone TEXT,
  contact_id TEXT,
  contact_mo_primary_key TEXT,
  custom_field_call_id TEXT,
  email TEXT,
  ghl_contact_ids TEXT,
  marketing_offer_id TEXT,
  name TEXT,
  primary_pain TEXT[],
  sales_agent_close_user_id TEXT,
  sales_agent_email TEXT,
  sales_agent_first_name TEXT,
  sales_agent_full_name TEXT,
  sales_agent_funnelbox_user_id TEXT,
  sales_agent_last_name TEXT,
  sales_agent_phone TEXT,
  sales_agent_waha_id TEXT,
  user_id TEXT,
  CONSTRAINT pk_latest_connecting_call_transcript PRIMARY KEY (activity_call_id)
);

-- Lead [Close]  (Foundry apiName: LeadClose)
CREATE TABLE lead_close (
  call_duration_summit DOUBLE PRECISION,
  count_status_busy BIGINT,
  count_status_cancel BIGINT,
  count_status_completed BIGINT,
  count_status_failed BIGINT,
  count_status_no_answer BIGINT,
  count_status_timeout BIGINT,
  emails TEXT[],
  last_call TIMESTAMPTZ,
  last_call_over_10_minutes TIMESTAMPTZ,
  last_call_over_20_minutes TIMESTAMPTZ,
  last_call_over_3_minutes TIMESTAMPTZ,
  last_call_over_minute TIMESTAMPTZ,
  last_call_string TEXT,
  close_lead_id TEXT,
  lead_status TEXT,
  contact_name TEXT,
  num_calls BIGINT,
  num_calls_over_minute BIGINT,
  num_close_email_adresses BIGINT,
  percentage_calls_over_minute DOUBLE PRECISION,
  percentage_calls_talked DOUBLE PRECISION,
  sum_call_durations DOUBLE PRECISION,
  CONSTRAINT pk_lead_close PRIMARY KEY (close_lead_id)
);

-- Lead [Kickscale]  (Foundry apiName: LeadKickscale)
CREATE TABLE lead_kickscale (
  call_ids TEXT[],
  email TEXT,
  name TEXT,
  CONSTRAINT pk_lead_kickscale PRIMARY KEY (email)
);

-- Mindset Stages  (Foundry apiName: LeadMindsetStages)
CREATE TABLE lead_mindset_stages (
  lead_mindset_description TEXT,
  lead_mindset_id TEXT,
  lead_mindset_stage TEXT,
  CONSTRAINT pk_lead_mindset_stages PRIMARY KEY (lead_mindset_id)
);

-- Lead Mindset Stages  (Foundry apiName: LeadMindsetStagesv2)
CREATE TABLE lead_mindset_stagesv2 (
  confidence TEXT,
  contact_id TEXT,
  evidences TEXT[],
  example TEXT,
  explanation TEXT,
  name TEXT,
  primary_key TEXT,
  stage_id TEXT,
  status TEXT,
  CONSTRAINT pk_lead_mindset_stagesv2 PRIMARY KEY (primary_key)
);

-- Lead Metric  (Foundry apiName: LeadProfile)
CREATE TABLE lead_profile (
  call_duration_minutes DOUBLE PRECISION,
  clicked_email_count BIGINT,
  created_at_timestamp TIMESTAMPTZ,
  curated_email BIGINT,
  curated_kickscale_insight BIGINT,
  curated_skool_comments BIGINT,
  curated_skool_posts BIGINT,
  curated_whatsapp BIGINT,
  curated_zoom_qa BIGINT,
  curated_zoom_session_attendance BIGINT,
  curated_zoom_survey BIGINT,
  email TEXT,
  foundry_tags TEXT[],
  id TEXT,
  inbound_email_count BIGINT,
  lead_score DOUBLE PRECISION,
  news BOOLEAN,
  opened_email_count BIGINT,
  snoozed TIMESTAMPTZ,
  stared BOOLEAN,
  total_curated_touchpoints BIGINT,
  call_longer_one_minute BOOLEAN,
  videos_percentage_watched_aggregated DOUBLE PRECISION,
  whatsapp_hours_since_last_message BIGINT,
  whatsapp_inbound_messages_sent_count BIGINT,
  whatsapp_inbound_msg_count BIGINT,
  whatsapp_inbound_words_written_count BIGINT,
  whatsapp_last_inboud_message_timestamp TIMESTAMPTZ,
  whatsapp_last_message_direction TEXT,
  whatsapp_last_message_timestamp TIMESTAMPTZ,
  whatsapp_last_outbound_message_timestamp TIMESTAMPTZ,
  whatsapp_needs_response BOOLEAN,
  whatsapp_outbound_messages_sent_count BIGINT,
  whatsapp_outbound_words_written_count BIGINT,
  CONSTRAINT pk_lead_profile PRIMARY KEY (id)
);

-- [Typed Facts] Lead  (Foundry apiName: LeadTypedFacts)
CREATE TABLE lead_typed_facts (
  all_typed_facts_from_lead TEXT,
  ausbildung_interest TEXT,
  best_improvement_category TEXT,
  build_timestamp TIMESTAMPTZ,
  email TEXT,
  gender TEXT,
  health_issues TEXT[],
  latest_pain_level INTEGER,
  life_situation_and_dreams TEXT[],
  lowest_pain_level_felt INTEGER,
  objections TEXT[],
  pain_before_summit INTEGER,
  pain_duration TEXT[],
  pain_improvement_category TEXT,
  pain_level_delta DOUBLE PRECISION,
  past_treatments TEXT[],
  relatives TEXT[],
  CONSTRAINT pk_lead_typed_facts PRIMARY KEY (email)
);

-- [Log] Assign Lead to Conversation  (Foundry apiName: LogAssignLeadToWahaConversation)
CREATE TABLE log_assign_lead_to_waha_conversation (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  assigned_to_1 TEXT,
  lead_temperature_1 TEXT,
  sales_notes_1 TEXT,
  id_41658b15_33ed_995a_9db2_7a094b251336 TEXT[],
  CONSTRAINT pk_log_assign_lead_to_waha_conversation PRIMARY KEY (action_rid)
);

-- [Log] Create Fluent Support Ticket via Webhook  (Foundry apiName: LogCreateFluentSupportTicketViaWebhook)
CREATE TABLE log_create_fluent_support_ticket_via_webhook (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  client_priority_2 TEXT,
  content_2 TEXT,
  customer_id_2 INTEGER,
  mailbox_id_2 INTEGER,
  product_id_2 INTEGER,
  title_2 TEXT,
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_create_fluent_support_ticket_via_webhook PRIMARY KEY (action_rid)
);

-- [Log] Create Subscription Pause  (Foundry apiName: LogCreateSubscriptionPause)
CREATE TABLE log_create_subscription_pause (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  end_date DATE,
  reason TEXT,
  start_date DATE,
  subscription TEXT,
  CONSTRAINT pk_log_create_subscription_pause PRIMARY KEY (action_rid)
);

-- [Log] Create Summit Profile FULL  (Foundry apiName: LogCreateSummitProfileFromId)
CREATE TABLE log_create_summit_profile_from_id (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  summit_profile TEXT[],
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_create_summit_profile_from_id PRIMARY KEY (action_rid)
);

-- [Log] Delete multiple Summit Profiles  (Foundry apiName: LogDeleteMultipleSummitProfile)
CREATE TABLE log_delete_multiple_summit_profile (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  summit_profile TEXT[],
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_delete_multiple_summit_profile PRIMARY KEY (action_rid)
);

-- [Log] Delete Subscription Pause  (Foundry apiName: LogDeleteSubscriptionPause)
CREATE TABLE log_delete_subscription_pause (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  subscription TEXT,
  subscription_pause TEXT,
  CONSTRAINT pk_log_delete_subscription_pause PRIMARY KEY (action_rid)
);

-- [Log] [DEV] Crete Fluent Support Ticket  (Foundry apiName: LogDevCreteFluentSupportTicket)
CREATE TABLE log_dev_crete_fluent_support_ticket (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  content_3 TEXT,
  customer_id_3 INTEGER,
  mailbox_id_3 INTEGER,
  title_3 TEXT,
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_dev_crete_fluent_support_ticket PRIMARY KEY (action_rid)
);

-- [Log] Edit Subscription's program & cohort  (Foundry apiName: LogEditSubscriptionProgramCohort)
CREATE TABLE log_edit_subscription_program_cohort (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  cohort_slug TEXT,
  program_id TEXT,
  subscription TEXT[],
  CONSTRAINT pk_log_edit_subscription_program_cohort PRIMARY KEY (action_rid)
);

-- [Log] [Fluent] API Respond Ticket  (Foundry apiName: LogFluentApiRespondTicket)
CREATE TABLE log_fluent_api_respond_ticket (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  auth_token_3 TEXT,
  close_yes_no_3 TEXT,
  content_3 TEXT,
  ticket_id_3 TEXT,
  ticket_response_fluent TEXT[],
  type_3 TEXT,
  CONSTRAINT pk_log_fluent_api_respond_ticket PRIMARY KEY (action_rid)
);

-- [Log] [Fluent] Create New LLM Cluster for Ticket  (Foundry apiName: LogFluentCreateNewClusterForTicket)
CREATE TABLE log_fluent_create_new_cluster_for_ticket (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  cluster_llm_fluent TEXT[],
  ticket_id_6 TEXT,
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_fluent_create_new_cluster_for_ticket PRIMARY KEY (action_rid)
);

-- [Log] GHLWASendMessage  (Foundry apiName: LogGhlwasendMessage)
CREATE TABLE log_ghlwasend_message (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  message_content_1 TEXT,
  CONSTRAINT pk_log_ghlwasend_message PRIMARY KEY (action_rid)
);

-- [Log] Set Completed - WhatsApp Chat  (Foundry apiName: LogModifyWhatsAppChat)
CREATE TABLE log_modify_whats_app_chat (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  completed_1 BOOLEAN,
  whats_app_chat TEXT[],
  CONSTRAINT pk_log_modify_whats_app_chat PRIMARY KEY (action_rid)
);

-- [Log] Name and eMail Update  (Foundry apiName: LogNameAndEMailUpdate)
CREATE TABLE log_name_and_e_mail_update (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  email_1 TEXT,
  first_name_1 TEXT,
  is_reverted BOOLEAN,
  cvkdqgky_zoom_participant TEXT[],
  CONSTRAINT pk_log_name_and_e_mail_update PRIMARY KEY (action_rid)
);

-- [Log] Enzo Mailsend run function Bulk  (Foundry apiName: LogSendToEnzoSideEffectAndMarkAsSent)
CREATE TABLE log_send_to_enzo_side_effect_and_mark_as_sent (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  set_sp_3 TEXT,
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_send_to_enzo_side_effect_and_mark_as_sent PRIMARY KEY (action_rid)
);

-- [Log] [Webhook][App] Setup Multiple Web App Users  (Foundry apiName: LogSetupMultipleWebAppUsers)
CREATE TABLE log_setup_multiple_web_app_users (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  assign_program BOOLEAN,
  cohort_slug TEXT,
  program TEXT,
  subscriptions TEXT[],
  CONSTRAINT pk_log_setup_multiple_web_app_users PRIMARY KEY (action_rid)
);

-- [Log] [Webhook][App] Setup Web App User  (Foundry apiName: LogSetupWebAppUser)
CREATE TABLE log_setup_web_app_user (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  assign_program BOOLEAN,
  cohort_slug TEXT,
  customer TEXT,
  end_date DATE,
  program TEXT,
  start_date DATE,
  subscription TEXT,
  user_mail TEXT,
  CONSTRAINT pk_log_setup_web_app_user PRIMARY KEY (action_rid)
);

-- [Log] Trigger Summit Profile Creation  (Foundry apiName: LogTriggerSummitProfileCreation)
CREATE TABLE log_trigger_summit_profile_creation (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  id_match TEXT[],
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_trigger_summit_profile_creation PRIMARY KEY (action_rid)
);

-- [Log] Update Opportunity  (Foundry apiName: LogUpdateOpportunity)
CREATE TABLE log_update_opportunity (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  context_notes_1 TEXT,
  contract_id_1 TEXT,
  current_stage_1 TEXT,
  hypothesis_1 TEXT,
  opportunity TEXT[],
  owner_1 TEXT,
  potential_value_1 DOUBLE PRECISION,
  subscription_id_1 TEXT,
  CONSTRAINT pk_log_update_opportunity PRIMARY KEY (action_rid)
);

-- [Log] Update Subscription Start Date  (Foundry apiName: LogUpdateSubscriptionStartDate)
CREATE TABLE log_update_subscription_start_date (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  new_start_date DATE,
  subscription TEXT,
  CONSTRAINT pk_log_update_subscription_start_date PRIMARY KEY (action_rid)
);

-- [Log] [Webhook][App] Update User Subscription Statuses  (Foundry apiName: LogUpdateSubscriptionStatus)
CREATE TABLE log_update_subscription_status (
  revert_timestamp TIMESTAMPTZ,
  revert_user TEXT,
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  status_9 TEXT,
  subscription TEXT[],
  is_reverted BOOLEAN,
  CONSTRAINT pk_log_update_subscription_status PRIMARY KEY (action_rid)
);

-- [Log] [Webhook][App] Update Subscription Statuses  (Foundry apiName: LogWebhookAppUpdateSubscriptionStatuses)
CREATE TABLE log_webhook_app_update_subscription_statuses (
  action_rid TEXT,
  action_summary TEXT,
  action_timestamp TIMESTAMPTZ,
  action_triggerer_user_id TEXT,
  action_type_rid TEXT,
  action_type_version TEXT,
  status_1 TEXT,
  subscription TEXT[],
  CONSTRAINT pk_log_webhook_app_update_subscription_statuses PRIMARY KEY (action_rid)
);

-- Marketing Campaign  (Foundry apiName: MarketingCampaign)
CREATE TABLE marketing_campaign (
  campaign_description TEXT,
  campaign_name TEXT,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  primary_key TEXT,
  CONSTRAINT pk_marketing_campaign PRIMARY KEY (primary_key)
);

-- Marketing Offer  (Foundry apiName: MarketingOffer)
CREATE TABLE marketing_offer (
  attendance_type TEXT,
  description TEXT,
  end_time TIMESTAMPTZ,
  event_type TEXT,
  marketing_offer_id TEXT,
  name TEXT,
  start_time TIMESTAMPTZ,
  status TEXT,
  CONSTRAINT pk_marketing_offer PRIMARY KEY (marketing_offer_id)
);

-- [MOP] Marketing Offer Participation  (Foundry apiName: MarketingOfferParticipation)
CREATE TABLE marketing_offer_participation (
  n3days_live_time_watched DOUBLE PRECISION,
  n3days_recording_time_watched DOUBLE PRECISION,
  n7days_live_time_watched DOUBLE PRECISION,
  n7days_recording_time_watched DOUBLE PRECISION,
  agent_false_calls TEXT[],
  agent_true_calls TEXT[],
  assistant_id TEXT[],
  attendance_ratio DOUBLE PRECISION,
  attended_session BOOLEAN,
  average_call_duration DOUBLE PRECISION,
  avg_daily_recording_view_time DOUBLE PRECISION,
  avg_open_lag_minutes_all DOUBLE PRECISION,
  chat_message_count BIGINT,
  chat_message_count_words BIGINT,
  clicked_email_count BIGINT,
  clicked_timestamp_mop TIMESTAMPTZ[],
  completed_call BIGINT,
  completed_strukturanalyse BOOLEAN,
  contact_id TEXT,
  contact_mo_primary_key TEXT,
  count_free_form_questions BIGINT,
  count_long_answer_question BIGINT,
  count_questions_answered BIGINT,
  count_sessions BIGINT,
  count_short_answer_question BIGINT,
  count_skool_comment_after_event BIGINT,
  count_skool_post_after_event BIGINT,
  count_surveys_submitted BIGINT,
  count_words_long_answer_questions BIGINT,
  count_words_short_answer_questions BIGINT,
  days_between_ticket_first_session BIGINT,
  docuseal_click_email_count BIGINT,
  docuseal_completed_at TIMESTAMPTZ,
  docuseal_email_clicked_at TIMESTAMPTZ,
  docuseal_is_opened BOOLEAN,
  docuseal_is_sent BOOLEAN,
  docuseal_is_signed BOOLEAN,
  docuseal_opened_at TIMESTAMPTZ,
  docuseal_program TEXT,
  docuseal_sent_at TIMESTAMPTZ,
  docuseal_template TEXT[],
  docuseal_template_signed TEXT[],
  docuseal_view_form_count BIGINT,
  email TEXT,
  email_open_consistency DOUBLE PRECISION,
  email_responsiveness_score DOUBLE PRECISION,
  email_word_count BIGINT,
  ended_reason TEXT[],
  event_activity_days BIGINT,
  false_calls BIGINT,
  first_chat_message TIMESTAMPTZ,
  first_close_call_attempt_ts TIMESTAMPTZ,
  first_close_call_over_3_minute TIMESTAMPTZ,
  first_close_call_over_minute TIMESTAMPTZ,
  first_original_moments_published TIMESTAMPTZ,
  first_ts_document_draft TIMESTAMPTZ,
  first_ts_document_signed TIMESTAMPTZ,
  first_ts_document_viewed TIMESTAMPTZ,
  has_converted BOOLEAN,
  has_lead_attended_session BOOLEAN,
  has_not_received_any_pandadoc BOOLEAN,
  has_skool_account BOOLEAN,
  has_skool_account_after_event BOOLEAN,
  hours_between_registration_call_activation BIGINT,
  hours_between_registration_email_activation BIGINT,
  hours_between_registration_sms_activation BIGINT,
  hours_between_registration_whatsapp_activation BIGINT,
  hours_between_ticket_first_session BIGINT,
  hours_between_ticket_skool DOUBLE PRECISION,
  id TEXT,
  inbound_email_count BIGINT,
  inbound_timestamp_mop TIMESTAMPTZ[],
  inbound_touchpoints_content_tokens DOUBLE PRECISION,
  inbound_touchpoints_count BIGINT,
  inbound_touchpoints_latest_timestamp TIMESTAMPTZ,
  inbound_touchpoints_sources TEXT[],
  is_call_dnd_activated_after_registration BOOLEAN,
  is_call_dnd_active BOOLEAN,
  is_email_dnd_activated_after_registration BOOLEAN,
  is_email_dnd_active BOOLEAN,
  is_signed BOOLEAN,
  is_sms_dnd_activated_after_registration BOOLEAN,
  is_sms_dnd_active BOOLEAN,
  is_viewed BOOLEAN,
  is_whatsapp_dnd_activated_after_registration BOOLEAN,
  is_whatsapp_dnd_active BOOLEAN,
  joined_date TIMESTAMPTZ,
  joined_first_session TIMESTAMPTZ,
  joined_last_session TIMESTAMPTZ,
  last_3_days_total_watchtime DOUBLE PRECISION,
  last_7_days_total_watchtime DOUBLE PRECISION,
  last_active DATE,
  last_attempt TIMESTAMPTZ,
  last_clicked_email TIMESTAMPTZ,
  last_day_watched_recording DATE,
  last_dnd_timestamp TIMESTAMPTZ,
  last_email_timestamp TIMESTAMPTZ,
  last_online TIMESTAMPTZ,
  last_opened_email TIMESTAMPTZ,
  last_original_moments_published TIMESTAMPTZ,
  last_pageview_timestamp TIMESTAMPTZ,
  last_pandadoc_ts TIMESTAMPTZ,
  last_survey_timestamp TIMESTAMPTZ,
  last_vapi_call_1_sec TIMESTAMPTZ,
  last_vapi_call_60_sec TIMESTAMPTZ,
  last_video_timestamp TIMESTAMPTZ,
  lead_age DOUBLE PRECISION,
  lead_bmi DOUBLE PRECISION,
  lead_gender TEXT,
  lead_height_cm DOUBLE PRECISION,
  lead_opening_session_watchtime BIGINT,
  lead_weight_kg DOUBLE PRECISION,
  marketing_offer_end_timestamp TIMESTAMPTZ,
  marketing_offer_followup_end TIMESTAMPTZ,
  marketing_offer_id TEXT,
  marketing_offer_name TEXT,
  marketing_offer_registration_timestamp TIMESTAMPTZ,
  marketing_offer_start_timestamp TIMESTAMPTZ,
  mop_active_session_count BIGINT,
  mop_active_session_watch_time DOUBLE PRECISION,
  mop_confirmation_email_clicks BIGINT,
  mop_confirmation_email_opens BIGINT,
  mop_days_since_ticket_issue BIGINT,
  mop_days_ticket_issue_to_event_start BIGINT,
  mop_days_until_event_start BIGINT,
  mop_during_summit_count_email_clicks BIGINT,
  mop_during_summit_count_email_opens BIGINT,
  mop_first_active_session_joined TIMESTAMPTZ,
  mop_first_created_pandadoc_id TEXT,
  mop_first_created_template_id TEXT,
  mop_first_inbound_email TIMESTAMPTZ,
  mop_first_inbound_whatsapp TIMESTAMPTZ,
  mop_first_mechanic_session_joined TIMESTAMPTZ,
  mop_first_original_release_evening_session_joined TIMESTAMPTZ,
  mop_first_original_release_morning_session_joined TIMESTAMPTZ,
  mop_first_original_release_session_joined TIMESTAMPTZ,
  mop_first_other_session_joined TIMESTAMPTZ,
  mop_first_outbound_whatsapp TIMESTAMPTZ,
  mop_first_prime_time_late_night_joined TIMESTAMPTZ,
  mop_first_signed_pandadoc_id TEXT,
  mop_first_signed_template_id TEXT,
  mop_first_viewed_pandadoc_id TEXT,
  mop_first_viewed_template_id TEXT,
  mop_hours_since_ticket_creation BIGINT,
  mop_last_active_session_joined TIMESTAMPTZ,
  mop_last_mechanic_session_joined TIMESTAMPTZ,
  mop_last_original_release_evening_session_joined TIMESTAMPTZ,
  mop_last_original_release_morning_session_joined TIMESTAMPTZ,
  mop_last_original_release_session_joined TIMESTAMPTZ,
  mop_last_other_session_joined TIMESTAMPTZ,
  mop_last_prime_time_late_night_joined TIMESTAMPTZ,
  mop_mechanic_session_count BIGINT,
  mop_mechanic_session_watch_time DOUBLE PRECISION,
  mop_original_release_evening_session_count BIGINT,
  mop_original_release_evening_session_watch_time DOUBLE PRECISION,
  mop_original_release_morning_session_count BIGINT,
  mop_original_release_morning_session_watch_time DOUBLE PRECISION,
  mop_original_release_total_session_count BIGINT,
  mop_original_release_total_session_watch_time DOUBLE PRECISION,
  mop_other_session_count BIGINT,
  mop_other_session_watch_time DOUBLE PRECISION,
  mop_pre_summit_count_email_clicks BIGINT,
  mop_pre_summit_count_email_opens BIGINT,
  mop_prime_time_late_night_count BIGINT,
  mop_prime_time_late_night_watch_time DOUBLE PRECISION,
  mop_seconds_ticket_issue_to_event_start BIGINT,
  mop_time_between_event_start_first_chat_message BIGINT,
  mop_time_between_event_start_first_session_joined BIGINT,
  mop_time_between_event_start_pandadoc_created BIGINT,
  mop_time_between_event_start_pandadoc_signed BIGINT,
  mop_time_between_event_start_pandadoc_viewed BIGINT,
  mop_time_between_first_email_response_event_start BIGINT,
  mop_time_between_first_email_response_first_close_call_attempt BIGINT,
  mop_time_between_first_email_response_first_close_call1_minute BIGINT,
  mop_time_between_first_email_response_first_close_call3_minute BIGINT,
  mop_time_between_first_email_response_first_session_joined BIGINT,
  mop_time_between_first_inbound_whatsapp_event_start BIGINT,
  mop_time_between_first_inbound_whatsapp_first_session_joined BIGINT,
  mop_time_between_first_outbound_whatsapp_event_start BIGINT,
  mop_time_between_first_outbound_whatsapp_first_session_joined BIGINT,
  mop_time_between_first_session_joined_first_chat_message BIGINT,
  mop_time_between_first_session_joined_pandadoc_created BIGINT,
  mop_time_between_first_session_joined_pandadoc_signed BIGINT,
  mop_time_between_first_session_joined_pandadoc_viewed BIGINT,
  mop_time_between_ticket_first_chat_message BIGINT,
  mop_time_between_ticket_first_close_call_attempt BIGINT,
  mop_time_between_ticket_first_email_response BIGINT,
  mop_time_between_ticket_first_inbound_whatsapp BIGINT,
  mop_time_between_ticket_first_outbound_whatsapp BIGINT,
  mop_time_between_ticket_first_session_joined BIGINT,
  mop_time_between_ticket_pandadoc_created BIGINT,
  mop_time_between_ticket_pandadoc_signed BIGINT,
  mop_time_between_ticket_pandadoc_viewed BIGINT,
  mop_time_first_email_click_to_event_start BIGINT,
  mop_time_first_email_open_to_event_start BIGINT,
  mop_time_first_email_sent_after_ticket BIGINT,
  mop_time_ticket_issue_to_first_email_click BIGINT,
  mop_time_ticket_issue_to_first_email_open BIGINT,
  mop_time_to_first_confirmation_email_click BIGINT,
  mop_time_to_first_confirmation_email_open BIGINT,
  mop_total_email_clicks_per_days_since_ticket_issue DOUBLE PRECISION,
  mop_total_email_opens_per_days_since_ticket_issue DOUBLE PRECISION,
  mop_total_summit_count_email_clicks BIGINT,
  mop_total_summit_count_email_opens BIGINT,
  mop_zoom_last_active TIMESTAMPTZ,
  num_segments DOUBLE PRECISION,
  opened_email_count BIGINT,
  opened_timestamp_mop TIMESTAMPTZ[],
  original_moments_uploaded BIGINT,
  original_moments_words_produced BIGINT,
  overall_email_open_rate DOUBLE PRECISION,
  page_views_after_registration BIGINT,
  pain_duration TEXT,
  past_treatments TEXT[],
  percentage_watched DOUBLE PRECISION,
  pre_summit_close_call_duration DOUBLE PRECISION,
  prelead_score DOUBLE PRECISION,
  prelead_score_segment TEXT,
  prepercent_rank DOUBLE PRECISION,
  primary_pain TEXT,
  recording_view_duration DOUBLE PRECISION,
  share_emails_opened_within_1h DOUBLE PRECISION,
  share_emails_opened_within_24h DOUBLE PRECISION,
  skool_comment_word_count_after_event BIGINT,
  skool_post_word_count_after_event BIGINT,
  skool_total_words_produced_after_event BIGINT,
  smart_view_name TEXT[],
  submitted_ghl_forms TEXT[],
  summit_close_call_duration DOUBLE PRECISION,
  symptoms TEXT[],
  template TEXT[],
  template_id TEXT[],
  template_name TEXT[],
  template_signed TEXT[],
  time_joined_first TIMESTAMPTZ,
  time_left_last TIMESTAMPTZ,
  title TEXT[],
  title_higher_60_percent TEXT[],
  total_call_duration BIGINT,
  total_close_call_duration DOUBLE PRECISION,
  total_event_activity_count BIGINT,
  total_live_time_missed BIGINT,
  total_live_watchtime DOUBLE PRECISION,
  total_watch_time DOUBLE PRECISION,
  total_words_free_form_questions BIGINT,
  touchpoints_sources_count INTEGER,
  tp_latest TIMESTAMPTZ,
  true_calls BIGINT,
  ts_document_sent TIMESTAMPTZ[],
  ts_document_signed TIMESTAMPTZ,
  ts_document_viewed TIMESTAMPTZ[],
  type_of_participation TEXT,
  videos_percentage_watched_aggregated DOUBLE PRECISION,
  videos_started_count BIGINT,
  watched_more_1_hour BOOLEAN,
  watched_more_1_minute BOOLEAN,
  watched_more_10_hours BOOLEAN,
  watched_more_100_hours BOOLEAN,
  watched_more_150_hours BOOLEAN,
  watched_more_200_hours BOOLEAN,
  watched_more_25_hours BOOLEAN,
  watched_more_3_hours BOOLEAN,
  watched_more_5_hours BOOLEAN,
  watched_more_50_hours BOOLEAN,
  watched_total_more_1_hour BOOLEAN,
  watched_total_more_1_minute BOOLEAN,
  watched_total_more_10_hours BOOLEAN,
  watched_total_more_100_hours BOOLEAN,
  watched_total_more_150_hours BOOLEAN,
  watched_total_more_200_hours BOOLEAN,
  watched_total_more_25_hours BOOLEAN,
  watched_total_more_3_hours BOOLEAN,
  watched_total_more_5_hours BOOLEAN,
  watched_total_more_50_hours BOOLEAN,
  whatsapp_date TIMESTAMPTZ,
  whatsapp_inbound_msg_count BIGINT,
  whatsapp_inbound_word_count BIGINT,
  whatsapp_outbound_msg_count BIGINT,
  whatsapp_outbound_word_count BIGINT,
  whatsapp_total_words_produced BIGINT,
  yesterday_live_time_watched DOUBLE PRECISION,
  yesterday_recording_time_watched DOUBLE PRECISION,
  yesterday_total_watchtime DOUBLE PRECISION,
  CONSTRAINT pk_marketing_offer_participation PRIMARY KEY (contact_mo_primary_key)
);

-- Marketing Offer Participation Daily  (Foundry apiName: MarketingOfferParticipationDaily)
CREATE TABLE marketing_offer_participation_daily (
  avg_open_lag_minutes_d_all DOUBLE PRECISION,
  chat_message_count BIGINT,
  chat_message_count_words BIGINT,
  date_session DATE,
  email TEXT,
  email_open_rate_d DOUBLE PRECISION,
  email_responsiveness_score_d DOUBLE PRECISION,
  id TEXT,
  joined_last_session TIMESTAMPTZ,
  marketing_offer_end_timestamp TIMESTAMPTZ,
  marketing_offer_followup_end TIMESTAMPTZ,
  marketing_offer_id TEXT,
  marketing_offer_name TEXT,
  marketing_offer_registration_timestamp TIMESTAMPTZ,
  marketing_offer_start_timestamp TIMESTAMPTZ,
  primary_key TEXT,
  recording_view_duration DOUBLE PRECISION,
  session_day TEXT,
  sessions_joined BIGINT,
  share_emails_opened_within_1h_d DOUBLE PRECISION,
  total_live_watchtime DOUBLE PRECISION,
  CONSTRAINT pk_marketing_offer_participation_daily PRIMARY KEY (primary_key)
);

-- Meeting For Knowledge Base  (Foundry apiName: MeetingForKnowledgeBase)
CREATE TABLE meeting_for_knowledge_base (
  description TEXT,
  meeting_uuid TEXT,
  primary_key TEXT,
  tags TEXT[],
  CONSTRAINT pk_meeting_for_knowledge_base PRIMARY KEY (primary_key)
);

-- [Zoom] Meeting Participation Segment  (Foundry apiName: MeetingParticipationSegmentZoom_1)
CREATE TABLE meeting_participation_segment_zoom_1 (
  diff_start_joined BIGINT,
  diff_start_left BIGINT,
  duration_segment_minutes BIGINT,
  email TEXT,
  event_scheduled_ts TIMESTAMPTZ,
  left_earlier_minutes BIGINT,
  length_meeting BIGINT,
  meeting_id TEXT,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  participant_id TEXT,
  participant_primary_key TEXT,
  participant_uuid TEXT,
  percentage_joined INTEGER,
  percentage_left INTEGER,
  time_event_created TIMESTAMPTZ,
  time_event_ended TIMESTAMPTZ,
  time_event_started TIMESTAMPTZ,
  time_joined TIMESTAMPTZ,
  time_left TIMESTAMPTZ,
  title TEXT,
  total_minutes_meeting BIGINT,
  user_name TEXT,
  CONSTRAINT pk_meeting_participation_segment_zoom_1 PRIMARY KEY (participant_primary_key)
);

-- [Zoom] Meeting Participant  (Foundry apiName: MeetingParticipationZoom_1)
CREATE TABLE meeting_participation_zoom_1 (
  email TEXT,
  event_scheduled_ts TIMESTAMPTZ,
  length_meeting BIGINT,
  meeting_id TEXT,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  num_participant_uuid BIGINT,
  num_segments BIGINT,
  participant_ids TEXT[],
  meetinguuid_partuuids TEXT,
  participant_primary_keys TEXT[],
  participant_uuids TEXT[],
  percentage_watched DOUBLE PRECISION,
  time_event_created TIMESTAMPTZ,
  time_event_ended TIMESTAMPTZ,
  time_event_started TIMESTAMPTZ,
  time_joined_first TIMESTAMPTZ,
  time_left_last TIMESTAMPTZ,
  title TEXT,
  total_live_time_missed BIGINT,
  total_live_watchtime BIGINT,
  user_name TEXT,
  CONSTRAINT pk_meeting_participation_zoom_1 PRIMARY KEY (meetinguuid_partuuids)
);

-- [Zoom] Meeting  (Foundry apiName: MeetingZoom)
CREATE TABLE meeting_zoom (
  chat TEXT,
  creation_source TEXT,
  duration DOUBLE PRECISION,
  event_created_ts TIMESTAMPTZ,
  event_ended_ts TIMESTAMPTZ,
  event_ended_ts_string TEXT,
  event_lifecycle_complete BOOLEAN,
  event_scheduled_ts TIMESTAMPTZ,
  event_started_ts TIMESTAMPTZ,
  zusammenfassung_lang TEXT,
  host_email TEXT,
  host_id TEXT,
  join_url TEXT,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  num_chat_messages BIGINT,
  num_participants BIGINT,
  password TEXT,
  qa_results TEXT,
  summary_eng TEXT,
  survey_results TEXT,
  timezone TEXT,
  topic TEXT,
  topic_cleaned TEXT,
  transcript TEXT,
  type TEXT,
  zusammenfassung TEXT,
  CONSTRAINT pk_meeting_zoom PRIMARY KEY (meeting_uuid)
);

-- Note For High Quality Close Leads  (Foundry apiName: NoteForHighQualityCloseLeads)
CREATE TABLE note_for_high_quality_close_leads (
  build_timestamp TIMESTAMPTZ,
  clean_extraction_string TEXT,
  close_lead_id TEXT,
  close_lead_id_len INTEGER,
  close_note_title TEXT,
  email TEXT,
  health_issues TEXT[],
  html_close_note TEXT,
  html_lead_profile_foundry_url TEXT,
  html_reasons_to_buy TEXT,
  html_short_lead_profile TEXT,
  lead_profile_foundry_url TEXT,
  life_situation_and_dreams TEXT[],
  llm_lead_summary TEXT,
  objections TEXT[],
  pain_duration TEXT[],
  pandadoc_is_signed BOOLEAN,
  past_treatments TEXT[],
  relatives TEXT[],
  short_lead_profile TEXT,
  total_live_watchtime DOUBLE PRECISION,
  watched_total_more5_hours BOOLEAN,
  CONSTRAINT pk_note_for_high_quality_close_leads PRIMARY KEY (close_lead_id)
);

-- Objection  (Foundry apiName: Objection)
CREATE TABLE objection (
  comment TEXT,
  objection_category TEXT,
  objection_id TEXT,
  objection_text TEXT,
  recommended_response TEXT,
  supporting_proof TEXT,
  CONSTRAINT pk_objection PRIMARY KEY (objection_id)
);

-- [Onboarding Tracker] Action Item  (Foundry apiName: OnboardingTrackerActionItem)
CREATE TABLE onboarding_tracker_action_item (
  action_id TEXT,
  action_type TEXT,
  description TEXT,
  role_type TEXT[],
  title TEXT,
  CONSTRAINT pk_onboarding_tracker_action_item PRIMARY KEY (action_id)
);

-- [Onboarding Tracker] Action Item Progress  (Foundry apiName: OnboardingTrackerActionItemProgress)
CREATE TABLE onboarding_tracker_action_item_progress (
  action_id TEXT,
  comment TEXT,
  email TEXT,
  progress_id TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ,
  CONSTRAINT pk_onboarding_tracker_action_item_progress PRIMARY KEY (progress_id)
);

-- [Onboarding Tracker] User  (Foundry apiName: OnboardingTrackerUser)
CREATE TABLE onboarding_tracker_user (
  email TEXT,
  name TEXT,
  role_type TEXT[],
  CONSTRAINT pk_onboarding_tracker_user PRIMARY KEY (email)
);

-- [Onboarding Tracker] User Action Matrix  (Foundry apiName: OnboardingTrackerUserActionMatrix)
CREATE TABLE onboarding_tracker_user_action_matrix (
  action_id TEXT,
  action_type TEXT,
  comment TEXT,
  description TEXT,
  email TEXT,
  name TEXT,
  progress_id TEXT,
  role_type TEXT,
  status TEXT,
  timestamp TIMESTAMPTZ,
  title TEXT,
  CONSTRAINT pk_onboarding_tracker_user_action_matrix PRIMARY KEY (progress_id)
);

-- Opportunity  (Foundry apiName: Opportunity)
CREATE TABLE opportunity (
  assigned_at TIMESTAMPTZ,
  closed_at TIMESTAMPTZ,
  context_notes TEXT,
  contract_id TEXT,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  current_stage TEXT,
  customer_id TEXT,
  hypothesis TEXT,
  last_modified_at TIMESTAMPTZ,
  last_modified_by TEXT,
  opportunity_id TEXT,
  opportunity_type TEXT,
  owner TEXT,
  potential_value DOUBLE PRECISION,
  subscription_id TEXT,
  CONSTRAINT pk_opportunity PRIMARY KEY (opportunity_id)
);

-- Opportunity Note  (Foundry apiName: OpportunityNote)
CREATE TABLE opportunity_note (
  author TEXT,
  content TEXT,
  created_at TIMESTAMPTZ,
  note_id TEXT,
  opportunity_id TEXT,
  CONSTRAINT pk_opportunity_note PRIMARY KEY (note_id)
);

-- Order  (Foundry apiName: Order)
CREATE TABLE order (
  contract_date_end DATE,
  contract_date_start DATE,
  contract_id TEXT,
  customer_id TEXT,
  is_valid_from DATE,
  order_id TEXT,
  order_status_description TEXT,
  title TEXT,
  total_gross DOUBLE PRECISION,
  updated_at TIMESTAMPTZ,
  CONSTRAINT pk_order PRIMARY KEY (order_id)
);

-- Part  (Foundry apiName: Part)
CREATE TABLE part (
  eq_id TEXT,
  part_color TEXT,
  part_cost DOUBLE PRECISION,
  part_dimensions TEXT,
  part_id TEXT,
  part_material TEXT,
  part_production_date DATE,
  part_purity TEXT,
  part_quality_grade TEXT,
  part_type TEXT,
  part_weight DOUBLE PRECISION,
  CONSTRAINT pk_part PRIMARY KEY (part_id)
);

-- [Zoom] Participation Metrics  (Foundry apiName: ParticipantZoom_1)
CREATE TABLE participant_zoom_1 (
  num_user_names BIGINT,
  average_percentage_watched DOUBLE PRECISION,
  average_segments_per_meeting DOUBLE PRECISION,
  email TEXT,
  event_names TEXT[],
  joined_since TIMESTAMPTZ,
  joined_until TIMESTAMPTZ,
  live_watch_time BIGINT,
  user_name TEXT,
  meeting_ids TEXT[],
  meeting_topics TEXT[],
  meeting_uuids TEXT[],
  num_meetings BIGINT,
  num_segments BIGINT,
  num_zoom_meetings BIGINT,
  participant_ids TEXT[],
  participant_primary_keys TEXT[],
  participant_uuids TEXT[],
  recording_watch_time BIGINT,
  ticket_attendance_types TEXT[],
  ticket_role_types TEXT[],
  ticket_type_ids TEXT[],
  ticket_type_names TEXT[],
  topics TEXT[],
  total_time_dropped_out BIGINT,
  total_watch_time BIGINT,
  user_names TEXT[],
  zoom_chat_messages_sent BIGINT,
  zoom_chat_words_written BIGINT,
  zoom_meeting_ids TEXT[],
  zoom_meeting_instance_ids TEXT[],
  zoom_meetings_with_chat_participation BIGINT,
  CONSTRAINT pk_participant_zoom_1 PRIMARY KEY (email)
);

-- [Pierrejean] Location  (Foundry apiName: PierrejeanLocation)
CREATE TABLE pierrejean_location (
  geohash DOUBLE PRECISION[],
  location_id TEXT,
  name TEXT,
  CONSTRAINT pk_pierrejean_location PRIMARY KEY (location_id)
);

-- [PMF] App Question  (Foundry apiName: PmfAppQuestion)
CREATE TABLE pmf_app_question (
  id TEXT,
  question TEXT,
  CONSTRAINT pk_pmf_app_question PRIMARY KEY (id)
);

-- [PMF] Insight  (Foundry apiName: PmfInsight)
CREATE TABLE pmf_insight (
  answered TEXT,
  created_at TIMESTAMPTZ,
  id TEXT,
  insight_generator_id TEXT,
  insight_text TEXT,
  recording_id TEXT,
  question_id TEXT,
  question_text TEXT,
  quote TEXT,
  sentiment TEXT,
  CONSTRAINT pk_pmf_insight PRIMARY KEY (id)
);

-- [PMF] Insight Generator  (Foundry apiName: PmfInsightGenerator)
CREATE TABLE pmf_insight_generator (
  created_at TIMESTAMPTZ,
  id TEXT,
  recording_id TEXT,
  question_ids TEXT[],
  status TEXT,
  user_id TEXT,
  CONSTRAINT pk_pmf_insight_generator PRIMARY KEY (id)
);

-- Processed Strukturanalyse Image   (Foundry apiName: ProcessedStrukturanalyseImage)
CREATE TABLE processed_strukturanalyse_image (
  media_item_rid TEXT,
  media_reference TEXT,
  path TEXT,
  timestamp TIMESTAMPTZ,
  uuid TEXT,
  CONSTRAINT pk_processed_strukturanalyse_image PRIMARY KEY (uuid)
);

-- [Product] Lecture  (Foundry apiName: ProductLecture)
CREATE TABLE product_lecture (
  lektion_beschreibung TEXT,
  lektion_id TEXT,
  lektion_name TEXT,
  lektion_url TEXT,
  zuordnung_modul_id TEXT,
  CONSTRAINT pk_product_lecture PRIMARY KEY (lektion_id)
);

-- [Product] Module  (Foundry apiName: ProductModule)
CREATE TABLE product_module (
  modul_beschreibung TEXT,
  modul_id TEXT,
  modul_name TEXT,
  modul_url TEXT,
  zuordnung_programm_id TEXT,
  CONSTRAINT pk_product_module PRIMARY KEY (modul_id)
);

-- [Product] Session-Type  (Foundry apiName: ProductSessionType)
CREATE TABLE product_session_type (
  session_description TEXT,
  session_id TEXT,
  session_name TEXT,
  zuordnung_lekture_id TEXT,
  CONSTRAINT pk_product_session_type PRIMARY KEY (session_id)
);

-- Program  (Foundry apiName: Program)
CREATE TABLE program (
  description TEXT,
  duration TEXT,
  format TEXT,
  price TEXT,
  program_id TEXT,
  program_name TEXT,
  requires_celebration_call BOOLEAN,
  target_audience TEXT,
  CONSTRAINT pk_program PRIMARY KEY (program_id)
);

-- Program App Module Link  (Foundry apiName: ProgramAppModuleLink)
CREATE TABLE program_app_module_link (
  app_module_id TEXT,
  position BIGINT,
  program_app_module_link_id TEXT,
  program_id TEXT,
  CONSTRAINT pk_program_app_module_link PRIMARY KEY (program_app_module_link_id)
);

-- Prompts [AST]  (Foundry apiName: PromptsAst)
CREATE TABLE prompts_ast (
  primary_key TEXT,
  prompt TEXT,
  title TEXT,
  CONSTRAINT pk_prompts_ast PRIMARY KEY (primary_key)
);

-- Prompts Rule Engine  (Foundry apiName: PromptsRuleEngine)
CREATE TABLE prompts_rule_engine (
  added_at DATE,
  added_by TEXT,
  channels TEXT[],
  if TEXT,
  primary_key TEXT,
  then TEXT,
  CONSTRAINT pk_prompts_rule_engine PRIMARY KEY (primary_key)
);

-- Raw Strukturanalyse Image  (Foundry apiName: RawStrukturanalyseImage)
CREATE TABLE raw_strukturanalyse_image (
  media_item_rid TEXT,
  media_reference TEXT,
  path TEXT,
  timestamp TIMESTAMPTZ,
  uuid TEXT,
  CONSTRAINT pk_raw_strukturanalyse_image PRIMARY KEY (uuid)
);

-- Reason To Call Per Touchpoint  (Foundry apiName: ReasonToCallPerTouchpoint)
CREATE TABLE reason_to_call_per_touchpoint (
  category TEXT,
  contact_id TEXT,
  created_at TIMESTAMPTZ,
  mean_of_communication TEXT,
  mean_of_communication_reasoning TEXT,
  reason_to_call TEXT,
  primary_key TEXT,
  CONSTRAINT pk_reason_to_call_per_touchpoint PRIMARY KEY (primary_key)
);

-- [Zoom] Recording  (Foundry apiName: RecordingZoom)
CREATE TABLE recording_zoom (
  account_id TEXT,
  auto_delete BOOLEAN,
  auto_delete_date TEXT,
  download_token TEXT,
  duration DOUBLE PRECISION,
  event_timestamp TIMESTAMPTZ,
  event_type TEXT,
  host_email TEXT,
  host_id TEXT,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  object_account_id TEXT,
  on_prem BOOLEAN,
  participant_audio_files JSONB,
  recording_count INTEGER,
  recording_files JSONB,
  share_url TEXT,
  start_time TIMESTAMPTZ,
  strategy TEXT,
  timezone TEXT,
  topic TEXT,
  total_size DOUBLE PRECISION,
  type TEXT,
  CONSTRAINT pk_recording_zoom PRIMARY KEY (meeting_uuid)
);

-- Review Response  (Foundry apiName: ReviewResponse)
CREATE TABLE review_response (
  item_id TEXT,
  media_rid TEXT,
  rejection_reasons TEXT,
  reviewed_at DATE,
  reviewer TEXT,
  valid BOOLEAN,
  warnings TEXT,
  CONSTRAINT pk_review_response PRIMARY KEY (item_id)
);

-- Removed - Review Response Processedss  (Foundry apiName: ReviewResponseProcesse)
CREATE TABLE review_response_processe (
  item_id TEXT,
  media_rid TEXT,
  rejection_reasons TEXT[],
  reviewed_at DATE,
  reviewer TEXT,
  valid BOOLEAN,
  warnings TEXT,
  CONSTRAINT pk_review_response_processe PRIMARY KEY (item_id)
);

-- Review Response Processed  (Foundry apiName: ReviewResponseProcessed)
CREATE TABLE review_response_processed (
  item_id TEXT,
  media_rid TEXT,
  rejection_reasons TEXT[],
  reviewed_at DATE,
  reviewer TEXT,
  valid BOOLEAN,
  warnings TEXT,
  CONSTRAINT pk_review_response_processed PRIMARY KEY (item_id)
);

-- Review Response Raw  (Foundry apiName: ReviewResponseRaw)
CREATE TABLE review_response_raw (
  item_id TEXT,
  media_rid TEXT,
  rejection_reasons TEXT[],
  reviewed_at DATE,
  reviewer TEXT,
  valid BOOLEAN,
  warnings TEXT,
  CONSTRAINT pk_review_response_raw PRIMARY KEY (item_id)
);

-- Sales Agent  (Foundry apiName: SalesAgent)
CREATE TABLE sales_agent (
  close_user_id TEXT,
  email TEXT,
  first_name TEXT,
  full_name TEXT,
  funnelbox_user_id TEXT,
  last_name TEXT,
  phone TEXT,
  waha_id TEXT,
  CONSTRAINT pk_sales_agent PRIMARY KEY (close_user_id)
);

-- Sales Alerts  (Foundry apiName: SalesAlerts)
CREATE TABLE sales_alerts (
  alert_id TEXT,
  alert_json TEXT,
  alert_priority TEXT,
  alert_raised_at TIMESTAMPTZ,
  alert_remediation_object_fkey TEXT,
  alert_source_object_fkey TEXT,
  alert_status TEXT,
  alert_status_updated_at TIMESTAMPTZ,
  alert_title TEXT,
  alert_to_be_resolved_until TIMESTAMPTZ,
  alert_type TEXT,
  contact_id TEXT,
  CONSTRAINT pk_sales_alerts PRIMARY KEY (alert_id)
);

-- [Sales CRM] Ausbildung Lead Enriched  (Foundry apiName: SalesCrmAusbildungLeadEnriched)
CREATE TABLE sales_crm_ausbildung_lead_enriched (
  assigned_to TEXT,
  bexio_is_client BOOLEAN,
  bexio_is_training_cert_client BOOLEAN,
  close_last_call TIMESTAMPTZ,
  close_lead_id TEXT,
  close_lead_status TEXT,
  contract_is_signed BOOLEAN,
  current_ausbildung_has_whatsapp_conversation BOOLEAN,
  current_ausbildung_mop_chat_messages BIGINT,
  current_ausbildung_mop_close_call_duration DOUBLE PRECISION,
  current_ausbildung_mop_completed_strukturanalyse BOOLEAN,
  current_ausbildung_mop_docuseal_is_sent BOOLEAN,
  current_ausbildung_mop_docuseal_is_signed BOOLEAN,
  current_ausbildung_mop_docuseal_is_viewed BOOLEAN,
  current_ausbildung_mop_has_attended_session BOOLEAN,
  current_ausbildung_mop_has_converted BOOLEAN,
  current_ausbildung_mop_has_skool BOOLEAN,
  current_ausbildung_mop_inbound_emails BIGINT,
  current_ausbildung_mop_is_signed BOOLEAN,
  current_ausbildung_mop_last_call_attempt TIMESTAMPTZ,
  current_ausbildung_mop_live_watch_time DOUBLE PRECISION,
  current_ausbildung_mop_pandadoc_is_sent BOOLEAN,
  current_ausbildung_mop_pandadoc_is_viewed BOOLEAN,
  current_ausbildung_mop_prelead_score DOUBLE PRECISION,
  current_ausbildung_mop_registration_timestamp TIMESTAMPTZ,
  current_ausbildung_mop_sessions BIGINT,
  current_ausbildung_mop_watch_time DOUBLE PRECISION,
  current_ausbildung_mop_whatsapp_responded BOOLEAN,
  detected_date TIMESTAMPTZ,
  docuseal_is_signed BOOLEAN,
  email TEXT,
  full_name TEXT,
  has_whatsapp_conversation BOOLEAN,
  interest_level TEXT,
  lead_opportunity_status TEXT,
  lead_whatsapp_status TEXT,
  llm_generated_is_interested BOOLEAN,
  llm_generated_key_message_body TEXT,
  llm_generated_key_message_id TEXT,
  llm_generated_key_sentence TEXT,
  llm_generated_summary TEXT,
  message_content TEXT,
  mop_ausbildung_count BIGINT,
  mop_chat_message_count BIGINT,
  mop_completed_strukturanalyse BOOLEAN,
  mop_count_sessions BIGINT,
  mop_docuseal_is_sent BOOLEAN,
  mop_docuseal_is_viewed BOOLEAN,
  mop_has_attended_session BOOLEAN,
  mop_has_skool_account BOOLEAN,
  mop_inbound_email_count BIGINT,
  mop_pandadoc_is_sent BOOLEAN,
  mop_pandadoc_is_viewed BOOLEAN,
  mop_prelead_score DOUBLE PRECISION,
  mop_total_close_call_duration DOUBLE PRECISION,
  mop_total_live_watch_time DOUBLE PRECISION,
  mop_total_watch_time DOUBLE PRECISION,
  mop_whatsapp_responded BOOLEAN,
  open_in_whatsapp_links TEXT[],
  opportunity_created_at TIMESTAMPTZ,
  opportunity_created_by TEXT,
  opportunity_source TEXT[],
  pandadoc_is_signed BOOLEAN,
  phone TEXT,
  reason_to_call TEXT,
  reg_current_ausbildung BOOLEAN,
  reg_past_ausbildung BOOLEAN,
  sales_notes TEXT,
  source TEXT,
  tob_assigned_name TEXT,
  waha_conversation_id TEXT,
  whatsapp_message_count BIGINT,
  CONSTRAINT pk_sales_crm_ausbildung_lead_enriched PRIMARY KEY (email)
);

-- Sales CRM Usage Log  (Foundry apiName: SalesCrmUsageLog)
CREATE TABLE sales_crm_usage_log (
  active_seconds INTEGER,
  app_version TEXT,
  date DATE,
  error_count INTEGER,
  feature_counts TEXT,
  last_updated TIMESTAMPTZ,
  primary_key TEXT,
  route_visits TEXT,
  user_email TEXT,
  user_id TEXT,
  CONSTRAINT pk_sales_crm_usage_log PRIMARY KEY (primary_key)
);

-- [Waha] Sales Representative  (Foundry apiName: SalesRepresentative)
CREATE TABLE sales_representative (
  avatar_url TEXT,
  display_name TEXT,
  email TEXT,
  ghl_id TEXT,
  is_active BOOLEAN,
  is_test_user BOOLEAN,
  session_name TEXT,
  user_id TEXT,
  user_name TEXT,
  CONSTRAINT pk_sales_representative PRIMARY KEY (user_name)
);

-- [Funnelbox] Schmerzfrei Umfrage  (Foundry apiName: SchmerzfreiUmfrageFuBo)
CREATE TABLE schmerzfrei_umfrage_fu_bo (
  bist_du_bereit_dir_aktiv_zeit_zu_nehmen_und_mit_uns_gemeinsam_a TEXT,
  welche_beschwerden_hast_du TEXT,
  was_hast_du_bisher_alles_unternommen_um_deine_schmerzen_loszuwe TEXT[],
  ghl_contact_id TEXT,
  auf_einer_skala_von_1_10_wo_w_rdest_du_deine_schmerzen_einordne TEXT[],
  wo_schr_nken_dich_deine_schmerzen_aktuell_am_meisten_ein TEXT[],
  e_mail_adresse TEXT,
  wie_lange_leidest_du_schon_unter_deinen_schmerzen TEXT,
  in_welchen_positionen_machen_sich_deine_schmerzen_bemerkbar TEXT[],
  submission_date TEXT,
  ghl_tob_id TEXT,
  uuid TEXT,
  wie_sehr_willst_du_wieder_schmerzfrei_werden_10_ich_m_chte_unbe TEXT[],
  CONSTRAINT pk_schmerzfrei_umfrage_fu_bo PRIMARY KEY (uuid)
);

-- Session Info  (Foundry apiName: SessionInfo)
CREATE TABLE session_info (
  category_id TEXT,
  date_of_session DATE,
  session_id TEXT,
  session_name TEXT,
  session_title TEXT,
  time_of_session TEXT,
  zoom_meeting_id TEXT,
  CONSTRAINT pk_session_info PRIMARY KEY (session_id)
);

-- App Session Participation  (Foundry apiName: SessionParticipation)
CREATE TABLE session_participation (
  body_position_id TEXT,
  category_id TEXT,
  date_of_session DATE,
  equipment_id TEXT,
  first_time_user_opened_session_at TIMESTAMPTZ,
  session_duration INTEGER,
  session_end_timestamp TIMESTAMPTZ,
  session_id TEXT,
  session_live_or_recording TEXT,
  session_participation_id TEXT,
  session_start_timestamp TIMESTAMPTZ,
  session_title TEXT,
  user_booked_session_at TIMESTAMPTZ,
  user_id TEXT,
  vector_id TEXT,
  CONSTRAINT pk_session_participation PRIMARY KEY (session_participation_id)
);

-- Session Participation Subscription  (Foundry apiName: SessionParticipationSubscription)
CREATE TABLE session_participation_subscription (
  pk TEXT,
  session_id TEXT,
  session_participation_id TEXT,
  subscription_id TEXT,
  subscription_week BIGINT,
  CONSTRAINT pk_session_participation_subscription PRIMARY KEY (pk)
);

-- Session  Happened  (Foundry apiName: Sessions)
CREATE TABLE sessions (
  category_id TEXT,
  date_of_session DATE,
  session_id TEXT,
  session_name TEXT,
  session_title TEXT,
  time_of_session TEXT,
  unique_session_id TEXT,
  zoom_meeting_id TEXT,
  CONSTRAINT pk_sessions PRIMARY KEY (unique_session_id)
);

-- Short Lead Profile  (Foundry apiName: ShortLeadProfile)
CREATE TABLE short_lead_profile (
  email TEXT,
  short_lead_profile TEXT,
  CONSTRAINT pk_short_lead_profile PRIMARY KEY (email)
);

-- Signed Marketing Offer Participation  (Foundry apiName: SignedMarketingOfferParticipation)
CREATE TABLE signed_marketing_offer_participation (
  chat_message_count_until_signed BIGINT,
  chat_message_count_words_until_signed BIGINT,
  count_clicked_email_until_sign BIGINT,
  count_inbound_email_until_sign BIGINT,
  count_opened_email_until_sign BIGINT,
  count_questions_answered_until_sign BIGINT,
  count_sessions_until_signed BIGINT,
  count_skool_comment_until_sign BIGINT,
  count_skool_post_until_sign BIGINT,
  count_surveys_submitted_until_sign BIGINT,
  email TEXT,
  id TEXT,
  inbound_touchpoints_content_tokens DOUBLE PRECISION,
  inbound_touchpoints_count BIGINT,
  marketing_offer_name TEXT,
  marketing_offer_registration_timestamp TIMESTAMPTZ,
  pre_summit_close_call_duration_until_sign DOUBLE PRECISION,
  summit_close_call_duration_until_sign DOUBLE PRECISION,
  template TEXT,
  total_close_call_duration_until_sign DOUBLE PRECISION,
  total_live_watchtime_until_signed DOUBLE PRECISION,
  touchpoints_sources_count INTEGER,
  ts_document_signed TIMESTAMPTZ,
  whatsapp_inbound_msg_count_until_sign BIGINT,
  whatsapp_inbound_word_count_until_sign BIGINT,
  whatsapp_outbound_msg_count_until_sign BIGINT,
  whatsapp_outbound_word_count_until_sign BIGINT,
  whatsapp_total_words_produced_until_sign BIGINT,
  CONSTRAINT pk_signed_marketing_offer_participation PRIMARY KEY (id)
);

-- [Skool] Community  (Foundry apiName: SkoolCommunity)
CREATE TABLE skool_community (
  author_ids TEXT[],
  categories TEXT[],
  community TEXT,
  community_id TEXT,
  num_comments BIGINT,
  num_post_authors BIGINT,
  num_posts BIGINT,
  post_ids TEXT[],
  total_likes_count BIGINT,
  CONSTRAINT pk_skool_community PRIMARY KEY (community)
);

-- [Skool] Member  (Foundry apiName: SkoolMember)
CREATE TABLE skool_member (
  communities TEXT[],
  email_first TEXT,
  emails TEXT[],
  first_name TEXT,
  full_name TEXT,
  invited_by TEXT[],
  joined_date TIMESTAMPTZ,
  last_name TEXT,
  user_id_skool TEXT,
  CONSTRAINT pk_skool_member PRIMARY KEY (user_id_skool)
);

-- [Skool] Post  (Foundry apiName: SkoolPost)
CREATE TABLE skool_post (
  author_name TEXT,
  author_profile_image TEXT,
  category TEXT,
  community TEXT,
  likes_count INTEGER,
  post_author_user_id_skool TEXT,
  post_content TEXT,
  post_date DATE,
  post_id TEXT,
  post_title TEXT,
  post_url TEXT,
  CONSTRAINT pk_skool_post PRIMARY KEY (post_id)
);

-- [Skool] Post Comment  (Foundry apiName: SkoolPostComment)
CREATE TABLE skool_post_comment (
  comment_author_name TEXT,
  comment_author_profile_image TEXT,
  comment_author_user_id_skool TEXT,
  comment_content TEXT,
  comment_date DATE,
  comment_id TEXT,
  comment_likes_count TEXT,
  comments_count INTEGER,
  community TEXT,
  post_id TEXT,
  CONSTRAINT pk_skool_post_comment PRIMARY KEY (comment_id)
);

-- Speaker [Kickscale]  (Foundry apiName: SpeakerKickscale)
CREATE TABLE speaker_kickscale (
  email TEXT,
  hash TEXT,
  is_seller BOOLEAN,
  call_id TEXT,
  name TEXT,
  speaker TEXT,
  CONSTRAINT pk_speaker_kickscale PRIMARY KEY (hash)
);

-- Structure Analysis Element  (Foundry apiName: StructureAnalysisElement)
CREATE TABLE structure_analysis_element (
  analysis_id TEXT,
  analysis_name TEXT,
  analysis_reason TEXT,
  analyzed_image_url TEXT,
  contact_id TEXT,
  created_at TIMESTAMPTZ,
  is_archived BOOLEAN,
  is_for_self BOOLEAN,
  sa_element_id TEXT,
  side TEXT,
  status TEXT,
  structure_analysis_text TEXT,
  subject_name TEXT,
  subject_relationship TEXT,
  updated_at TIMESTAMPTZ,
  user_age_at_sa_time INTEGER,
  user_email TEXT,
  user_gender TEXT,
  user_height_cm_at_sa_time INTEGER,
  user_id TEXT,
  user_weight_kg_at_sa_time INTEGER,
  CONSTRAINT pk_structure_analysis_element PRIMARY KEY (sa_element_id)
);

-- Structure Analysis Instance  (Foundry apiName: StructureAnalysisInstance)
CREATE TABLE structure_analysis_instance (
  analysis_id TEXT,
  analysis_name TEXT,
  analysis_reason TEXT,
  contact_id TEXT,
  created_at TIMESTAMPTZ,
  is_archived BOOLEAN,
  is_for_self BOOLEAN,
  status TEXT,
  subject_name TEXT,
  subject_relationship TEXT,
  updated_at TIMESTAMPTZ,
  user_age_at_sa_time INTEGER,
  user_email TEXT,
  user_gender TEXT,
  user_height_cm_at_sa_time INTEGER,
  user_id TEXT,
  user_weight_kg_at_sa_time INTEGER,
  CONSTRAINT pk_structure_analysis_instance PRIMARY KEY (analysis_id)
);

-- [Summit App] Struktur Analyse With Consent  (Foundry apiName: StrukturAnalyseWithConsent)
CREATE TABLE struktur_analyse_with_consent (
  age INTEGER,
  author_name TEXT,
  blurred_output_image_rid TEXT,
  consent_to_processing BOOLEAN,
  contact_id TEXT,
  email TEXT,
  gender TEXT,
  height_cm INTEGER,
  image_count INTEGER,
  image_name TEXT,
  image_url TEXT,
  image_urls TEXT,
  image_use_marketing BOOLEAN,
  image_use_summit BOOLEAN,
  image_use_training BOOLEAN,
  input_image_rid TEXT,
  media_item_rid TEXT,
  media_reference JSONB,
  output_image_rid TEXT,
  pk TEXT,
  processing_status TEXT,
  self_appearance BOOLEAN,
  slot_label TEXT,
  slot_number INTEGER,
  status TEXT,
  title TEXT,
  uid TEXT,
  unique_id TEXT,
  user_id TEXT,
  view TEXT,
  weight_kg DOUBLE PRECISION,
  CONSTRAINT pk_struktur_analyse_with_consent PRIMARY KEY (pk)
);

-- Strukturanalyse  (Foundry apiName: Strukturanalyse)
CREATE TABLE strukturanalyse (
  author_name TEXT,
  author_profile_image TEXT,
  author_profile_url TEXT,
  category TEXT,
  comments_count INTEGER,
  community TEXT,
  created_ts TIMESTAMPTZ,
  image_url TEXT,
  likes_count INTEGER,
  media_item_rid TEXT,
  media_item_rid2 TEXT[],
  media_reference JSONB,
  medie_reference_string TEXT[],
  path TEXT,
  post_author_user_id_skool TEXT,
  post_content TEXT,
  post_date TIMESTAMPTZ,
  post_files_url TEXT[],
  post_id TEXT,
  post_images_url TEXT[],
  post_title TEXT,
  post_url TEXT,
  post_videos_url TEXT[],
  sa_feedback_de TEXT,
  CONSTRAINT pk_strukturanalyse PRIMARY KEY (media_item_rid)
);

-- Strukturanalyse for OSDK  (Foundry apiName: StrukturanalyseForOsdk)
CREATE TABLE strukturanalyse_for_osdk (
  all_landmarks TEXT,
  filename_in_final TEXT,
  filename_in_raw TEXT,
  formatted_timestamp TEXT,
  image_name TEXT,
  landmarks TEXT,
  measurements TEXT,
  model TEXT,
  primary_key TEXT,
  processed_media_item_rid TEXT,
  processed_media_reference JSONB,
  processing_status TEXT,
  prompt_version TEXT,
  raw_media_reference JSONB,
  raw_media_rid TEXT,
  segmentation TEXT,
  standardization TEXT,
  status TEXT,
  strukturanalyse_text TEXT,
  timestamp TIMESTAMPTZ,
  validation TEXT,
  CONSTRAINT pk_strukturanalyse_for_osdk PRIMARY KEY (primary_key)
);

-- Subscription  (Foundry apiName: Subscription)
CREATE TABLE subscription (
  app_user_id TEXT,
  cohort_slug TEXT,
  customer_id TEXT,
  days_since_start INTEGER,
  days_until_end INTEGER,
  duration_days INTEGER,
  end_date DATE,
  program_assigned_in_web_app BOOLEAN,
  program_id TEXT,
  start_date DATE,
  subscription_app_status TEXT,
  subscription_app_updated_at TIMESTAMPTZ,
  subscription_id TEXT,
  subscription_name TEXT,
  subscription_pause_days BIGINT,
  CONSTRAINT pk_subscription PRIMARY KEY (subscription_id)
);

-- Subscription Lecture Progress  (Foundry apiName: SubscriptionLectureProgress)
CREATE TABLE subscription_lecture_progress (
  app_lecture_id TEXT,
  end_timestamp TIMESTAMPTZ,
  lecture_name TEXT,
  lecture_progress_status TEXT,
  position BIGINT,
  subscription_lecture_progress_id TEXT,
  subscription_module_progress_id TEXT,
  CONSTRAINT pk_subscription_lecture_progress PRIMARY KEY (subscription_lecture_progress_id)
);

-- Subscription Module Progress  (Foundry apiName: SubscriptionModuleProgress)
CREATE TABLE subscription_module_progress (
  app_module_id TEXT,
  app_user_id TEXT,
  end_timestamp TIMESTAMPTZ,
  module_description TEXT,
  module_name TEXT,
  module_progress_status TEXT,
  module_url TEXT,
  start_timestamp TIMESTAMPTZ,
  subscription_id TEXT,
  subscription_module_progress_id TEXT,
  CONSTRAINT pk_subscription_module_progress PRIMARY KEY (subscription_module_progress_id)
);

-- Subscription Pause  (Foundry apiName: SubscriptionPause)
CREATE TABLE subscription_pause (
  created_at TIMESTAMPTZ,
  pause_days INTEGER,
  pause_end DATE,
  pause_id TEXT,
  pause_start DATE,
  pause_title TEXT,
  reason TEXT,
  subscription_id TEXT,
  CONSTRAINT pk_subscription_pause PRIMARY KEY (pause_id)
);

-- [Summit App] Daily Survey Answer  (Foundry apiName: SummitAppDailySurveyAnswer)
CREATE TABLE summit_app_daily_survey_answer (
  answer TEXT,
  answer_id TEXT,
  contact_id TEXT,
  display_name TEXT,
  marketing_offer_id TEXT,
  question_id TEXT,
  survey_id TEXT,
  timestamp TIMESTAMPTZ,
  user_id TEXT,
  CONSTRAINT pk_summit_app_daily_survey_answer PRIMARY KEY (answer_id)
);

-- [Summit App] Daily Survey Question  (Foundry apiName: SummitAppDailySurveyQuestion)
CREATE TABLE summit_app_daily_survey_question (
  answer_options TEXT[],
  comment TEXT,
  date DATE,
  date_string TEXT,
  marketing_offer_id TEXT,
  question TEXT,
  question_id TEXT,
  question_order INTEGER,
  question_type TEXT,
  required BOOLEAN,
  survey_id TEXT,
  CONSTRAINT pk_summit_app_daily_survey_question PRIMARY KEY (question_id)
);

-- [Summit App] Mindset  (Foundry apiName: SummitAppMindset)
CREATE TABLE summit_app_mindset (
  image_url TEXT,
  q1 TEXT,
  q2 TEXT,
  q3 TEXT,
  session_id TEXT,
  session_number INTEGER,
  session_title TEXT,
  uid TEXT,
  CONSTRAINT pk_summit_app_mindset PRIMARY KEY (session_id)
);

-- [Summit App] Moment  (Foundry apiName: SummitAppMoment)
CREATE TABLE summit_app_moment (
  contact_id TEXT,
  created_at_us TIMESTAMPTZ,
  display_name TEXT,
  email TEXT,
  id TEXT,
  is_shared BOOLEAN,
  marketing_offer_days_from_start BIGINT,
  marketing_offer_id TEXT,
  number_of_characters INTEGER,
  number_of_words INTEGER,
  o_count INTEGER,
  primary_emotion TEXT,
  shared_at_us TIMESTAMPTZ,
  shared_with_sales_rep BOOLEAN,
  summit_day_string TEXT,
  symptoms TEXT[],
  synced_at_us TIMESTAMPTZ,
  tags TEXT,
  tags_array TEXT[],
  text TEXT,
  title TEXT,
  uid TEXT,
  user_name TEXT,
  wow_factor_justification TEXT,
  wow_factor_score INTEGER,
  CONSTRAINT pk_summit_app_moment PRIMARY KEY (id)
);

-- Summit app Strukturanalyse  (Foundry apiName: SummitAppStrukturanalyse)
CREATE TABLE summit_app_strukturanalyse (
  confidence REAL,
  directory TEXT,
  error TEXT,
  extension TEXT,
  filename TEXT,
  id TEXT,
  is_valid BOOLEAN,
  path TEXT,
  primary_key TEXT,
  rejection_reasons TEXT[],
  status TEXT,
  timestamp TEXT,
  warnings TEXT[],
  CONSTRAINT pk_summit_app_strukturanalyse PRIMARY KEY (id)
);

-- [Summit App] User  (Foundry apiName: SummitAppUser)
CREATE TABLE summit_app_user (
  display_name TEXT,
  email TEXT,
  phone_number TEXT,
  uid TEXT,
  CONSTRAINT pk_summit_app_user PRIMARY KEY (uid)
);

-- [Summit App] Video Watch Data  (Foundry apiName: SummitAppVideoWatchData)
CREATE TABLE summit_app_video_watch_data (
  completed BOOLEAN,
  completed_at TEXT,
  completion_percentage DOUBLE PRECISION,
  display_name TEXT,
  duration INTEGER,
  email TEXT,
  first_watched_at TEXT,
  last_pos INTEGER,
  last_watched_at TEXT,
  synced_at TEXT,
  total_watch_time INTEGER,
  uid TEXT,
  updated_at TIMESTAMPTZ,
  video_id TEXT,
  video_title TEXT,
  video_watch_id TEXT,
  watch_count INTEGER,
  watched_ranges TEXT,
  CONSTRAINT pk_summit_app_video_watch_data PRIMARY KEY (video_watch_id)
);

-- Summit App Zoom Recordings  (Foundry apiName: SummitAppZoomRecordings)
CREATE TABLE summit_app_zoom_recordings (
  download_url TEXT,
  duration INTEGER,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  name TEXT,
  recording_type TEXT,
  source TEXT,
  start_time_session TIMESTAMPTZ,
  test_recording_time TIMESTAMPTZ,
  transcript_download_url TEXT,
  unique_id TEXT,
  CONSTRAINT pk_summit_app_zoom_recordings PRIMARY KEY (unique_id)
);

-- Summit Profile  (Foundry apiName: SummitProfile)
CREATE TABLE summit_profile (
  approved BOOLEAN,
  auto_freigabe TEXT,
  brief_justus TEXT,
  brief_justus_testimonials_betreff TEXT,
  brief_justus_betreff TEXT,
  brief_justus_exported BOOLEAN,
  brief_justus_testimonials TEXT,
  brief_justus_testimonials_exported TEXT,
  close_contact_id TEXT[],
  close_lead_id TEXT[],
  edited BOOLEAN,
  einwaende_kauf TEXT,
  einwaende_schmerzfrei TEXT,
  email TEXT,
  exported BOOLEAN,
  exported_summit_profile TIMESTAMPTZ,
  feedback TEXT,
  freigabe_grund TEXT,
  freigabe_tag TEXT,
  total_text TEXT,
  ghl_contact_ids TEXT[],
  ghl_id TEXT,
  kaufeinwand_begruendung TEXT,
  kaufeinwand_typ TEXT,
  last_rerun_triggered TIMESTAMPTZ,
  leidensdruck TEXT,
  link_doc TEXT,
  mindset_positiv TEXT,
  name TEXT,
  num_tickets BIGINT,
  num_zoom_meetings BIGINT,
  pandadoc_ids TEXT[],
  postlink TEXT,
  prelink TEXT,
  prompt_verbesserung TEXT,
  psychologisches_profil TEXT,
  sales_blockaden_stichpunkte TEXT,
  sales_rep TEXT,
  subject TEXT,
  subject_backup TEXT,
  summit_profile_triggered TIMESTAMPTZ,
  tags TEXT[],
  tags_zoom_keywords TEXT[],
  total_text_backup TEXT,
  wuensche_und_traeume TEXT,
  zoom_meeting_ids TEXT[],
  zoom_meeting_instance_ids TEXT[],
  zoom_participant_uuids TEXT[],
  zoom_ticket_ids TEXT[],
  zoom_user_ids TEXT[],
  new_property1 BOOLEAN,
  CONSTRAINT pk_summit_profile PRIMARY KEY (email)
);

-- [Summit] Session Chat Participation  (Foundry apiName: SummitSessionChatParticipation)
CREATE TABLE summit_session_chat_participation (
  end_time TIMESTAMPTZ,
  event_id TEXT,
  latest_message TIMESTAMPTZ,
  meeting_id TEXT,
  meeting_instance_id TEXT,
  num_messages_sent BIGINT,
  num_words_written BIGINT,
  primary_key TEXT,
  sender_email TEXT,
  sender_name TEXT,
  session_id TEXT,
  session_topic TEXT,
  start_time TIMESTAMPTZ,
  title TEXT,
  CONSTRAINT pk_summit_session_chat_participation PRIMARY KEY (primary_key)
);

-- Summit  Strukturanalyse WA  (Foundry apiName: SummitStrukturanalyseWa)
CREATE TABLE summit_strukturanalyse_wa (
  all_landmarks JSONB,
  analysis_text JSONB,
  analysis_text_only TEXT,
  clean_path TEXT,
  confidence REAL,
  directory TEXT,
  error TEXT,
  extension TEXT,
  file_extension TEXT,
  filename TEXT,
  formatted_timestamp TEXT,
  id TEXT,
  image_name TEXT,
  input_error TEXT,
  input_image_rid TEXT,
  input_okconfidence REAL,
  input_okis_valid BOOLEAN,
  input_okrejection_reasons TEXT[],
  input_okwarnings TEXT[],
  is_path_valid BOOLEAN,
  is_valid BOOLEAN,
  landmarks TEXT,
  measurements TEXT,
  output_image_rid TEXT,
  path TEXT,
  primary_key TEXT,
  processed_error TEXT,
  processed_media_reference JSONB,
  processed_ok_confidence REAL,
  processed_ok_is_valid BOOLEAN,
  processed_ok_rejection_reasons TEXT[],
  processed_ok_warnings TEXT[],
  processing_status TEXT,
  raw_media_reference JSONB,
  record_id TEXT,
  rejection_reasons TEXT[],
  standardization TEXT,
  status TEXT,
  timestamp TEXT,
  validation TEXT,
  warnings TEXT[],
  CONSTRAINT pk_summit_strukturanalyse_wa PRIMARY KEY (primary_key)
);

-- Task-Kontext[AST]  (Foundry apiName: TaskKontextAst)
CREATE TABLE task_kontext_ast (
  description TEXT,
  primary_key TEXT,
  title TEXT,
  CONSTRAINT pk_task_kontext_ast PRIMARY KEY (primary_key)
);

-- [Temp] Opportunities for alerts  (Foundry apiName: TempOpportunitiesForAlerts)
CREATE TABLE temp_opportunities_for_alerts (
  alert_assignee TEXT,
  alert_count BIGINT,
  alert_issues TEXT[],
  alert_note TEXT,
  alert_status TEXT,
  assigned_to TEXT,
  contact_email TEXT,
  contact_first_name TEXT,
  contact_id TEXT,
  contact_last_name TEXT,
  contract_count BIGINT,
  created_at TIMESTAMPTZ,
  customer_id TEXT,
  id TEXT,
  last_stage_change_at TIMESTAMPTZ,
  last_status_change_at TIMESTAMPTZ,
  lzr_end DATE,
  lzr_ende_kulanz DATE,
  lzr_start DATE,
  name TEXT,
  opportunity_calculated_program_id TEXT,
  opportunity_calculated_program_name TEXT,
  opportunity_duration_months BIGINT,
  status TEXT,
  pipeline_duration_months BIGINT,
  pipeline_duration_months_matches_contract BOOLEAN,
  pipeline_duration_months_matches_subscription BOOLEAN,
  pipeline_id TEXT,
  pipeline_name TEXT,
  pipeline_stage_id TEXT,
  pipeline_stage_uid TEXT,
  recommended_subscription_id TEXT,
  source TEXT,
  subscription_count BIGINT,
  updated_at TIMESTAMPTZ,
  CONSTRAINT pk_temp_opportunities_for_alerts PRIMARY KEY (id)
);

-- [Fluent] Ticket Activity  (Foundry apiName: TicketActivityFluent)
CREATE TABLE ticket_activity_fluent (
  conversation_type TEXT,
  created_ts TEXT,
  email_message_id TEXT,
  is_important TEXT,
  message_content TEXT,
  response_id TEXT,
  sender_email TEXT,
  sender_full_name TEXT,
  sender_id TEXT,
  sender_person_type TEXT,
  source TEXT,
  ticket_id TEXT,
  ticket_initial_message TEXT,
  ticket_response_count INTEGER,
  ticket_title TEXT,
  timestamp TEXT,
  CONSTRAINT pk_ticket_activity_fluent PRIMARY KEY (response_id)
);

-- Ticket [Fluent]  (Foundry apiName: TicketFluent)
CREATE TABLE ticket_fluent (
  agent_email TEXT,
  agent_full_name TEXT,
  agent_id TEXT,
  assigned_to_suppor_level TEXT,
  closed_by_full_name TEXT,
  closed_by TEXT,
  closed_by_email TEXT,
  closed_by_suppor_level TEXT,
  customer_app_user_id TEXT,
  customer_email TEXT,
  customer_email_first TEXT,
  ticket_customer_id TEXT,
  customer_full_name TEXT,
  first_response_time INTEGER,
  first_response_time_hours DOUBLE PRECISION,
  initial_ticket_message TEXT,
  last_agent_response TEXT,
  last_customer_response TEXT,
  llm_category TEXT,
  llm_cluster TEXT,
  mailbox_email TEXT,
  message_id TEXT,
  privacy TEXT,
  product TEXT,
  resolved_at TIMESTAMPTZ,
  response_count_int INTEGER,
  secret_content TEXT,
  slug TEXT,
  tags TEXT[],
  ticket_client_priority TEXT,
  ticket_collected TEXT,
  ticket_content_anonymised TEXT,
  ticket_created_at TIMESTAMPTZ,
  ticket_id TEXT,
  ticket_priority TEXT,
  ticket_product_source TEXT,
  ticket_source TEXT,
  ticket_status TEXT,
  ticket_status_foundry TEXT,
  ticket_sumary_500t TEXT,
  ticket_summary_anonymised TEXT,
  ticket_summary_anonymised_embedding DOUBLE PRECISION[],
  ticket_sumary_embedded DOUBLE PRECISION[],
  ticket_title TEXT,
  ticket_title TEXT,
  ticket_title_anonymised TEXT,
  updated_at TIMESTAMPTZ,
  ticket_url TEXT,
  ticket_waiting_since TEXT,
  timestamp_first TIMESTAMPTZ,
  total_close_time INTEGER,
  total_close_time_hours DOUBLE PRECISION,
  updated_at_date DATE,
  CONSTRAINT pk_ticket_fluent PRIMARY KEY (ticket_id)
);

-- TOB  (Foundry apiName: Tob)
CREATE TABLE tob (
  company_name TEXT,
  contact_email TEXT,
  contact_phone TEXT,
  employee_count_or_revenue_bracket TEXT,
  founded TEXT,
  headquarters TEXT,
  industry TEXT,
  key_services TEXT,
  logo_link TEXT,
  mission_statement TEXT,
  size TEXT,
  social_links TEXT,
  target_audience TEXT,
  value_proposition TEXT,
  website TEXT,
  CONSTRAINT pk_tob PRIMARY KEY (company_name)
);

-- [TOB] Youtube Analytics  (Foundry apiName: TobYoutubeAnalytics)
CREATE TABLE tob_youtube_analytics (
  age_in_days BIGINT,
  caption_fetched_at TEXT,
  caption_text TEXT,
  channel_id TEXT,
  channel_title TEXT,
  comment_count BIGINT,
  description TEXT,
  duration_seconds BIGINT,
  engagement_rate DOUBLE PRECISION,
  fetched_at TEXT,
  hooks TEXT,
  lang_code TEXT,
  like_count BIGINT,
  published_at TIMESTAMPTZ,
  summary TEXT,
  thumbnail_high TEXT,
  title TEXT,
  video_id TEXT,
  video_url TEXT,
  view_count BIGINT,
  views_per_day DOUBLE PRECISION,
  CONSTRAINT pk_tob_youtube_analytics PRIMARY KEY (video_id)
);

-- Touchpoint  (Foundry apiName: Touchpoint)
CREATE TABLE touchpoint (
  context TEXT,
  email TEXT,
  foreign_key TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ,
  touchpoint_data TEXT,
  CONSTRAINT pk_touchpoint PRIMARY KEY (foreign_key)
);

-- Touchpoint Utility Determinator Prompt  (Foundry apiName: TouchpointUtilityDeterminatorPrompt)
CREATE TABLE touchpoint_utility_determinator_prompt (
  date_created TIMESTAMPTZ,
  primary_key TEXT,
  prompt TEXT,
  CONSTRAINT pk_touchpoint_utility_determinator_prompt PRIMARY KEY (primary_key)
);

-- Touchpoint v2  (Foundry apiName: TouchpointV2)
CREATE TABLE touchpoint_v2 (
  contact_id TEXT,
  content TEXT,
  content_characters_count INTEGER,
  content_context TEXT,
  content_context_embeddings DOUBLE PRECISION[],
  content_tokens DOUBLE PRECISION,
  context TEXT,
  context_characters_count INTEGER,
  context_tokens DOUBLE PRECISION,
  direction TEXT,
  email TEXT,
  is_curated INTEGER,
  marketing_offer_days_from_start BIGINT,
  marketing_offer_id TEXT,
  primary_key TEXT,
  reference_foreign_key_id TEXT,
  reference_foreign_key_name TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ,
  total_characters_count INTEGER,
  total_tokens DOUBLE PRECISION,
  zoom_attendance_max_total_live_watchtime BIGINT,
  CONSTRAINT pk_touchpoint_v2 PRIMARY KEY (primary_key)
);

-- Touchpoint v2 Embeddings  (Foundry apiName: TouchpointV2Embeddings)
CREATE TABLE touchpoint_v2_embeddings (
  contact_id TEXT,
  content TEXT,
  content_characters_count INTEGER,
  content_embeddings DOUBLE PRECISION[],
  content_tokens DOUBLE PRECISION,
  content_whitelisted TEXT,
  context TEXT,
  context_characters_count INTEGER,
  context_tokens DOUBLE PRECISION,
  direction TEXT,
  email TEXT,
  is_curated INTEGER,
  marketing_offer_days_from_start BIGINT,
  marketing_offer_id TEXT,
  primary_key TEXT,
  reference_foreign_key_id TEXT,
  reference_foreign_key_name TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ,
  total_characters_count INTEGER,
  total_tokens DOUBLE PRECISION,
  CONSTRAINT pk_touchpoint_v2_embeddings PRIMARY KEY (primary_key)
);

-- Touchpoints v2 Curated  (Foundry apiName: TouchpointsV2Curated)
CREATE TABLE touchpoints_v2_curated (
  contact_id TEXT,
  content TEXT,
  content_characters_count INTEGER,
  content_tokens DOUBLE PRECISION,
  context TEXT,
  context_characters_count INTEGER,
  context_tokens DOUBLE PRECISION,
  direction TEXT,
  email TEXT,
  is_curated INTEGER,
  marketing_offer_days_from_start BIGINT,
  marketing_offer_id TEXT,
  primary_key TEXT,
  reference_foreign_key_id TEXT,
  reference_foreign_key_name TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ,
  total_characters_count INTEGER,
  total_tokens DOUBLE PRECISION,
  CONSTRAINT pk_touchpoints_v2_curated PRIMARY KEY (primary_key)
);

-- [Zoom] Transcript Segment  (Foundry apiName: TranscriptSegmentZoom_1)
CREATE TABLE transcript_segment_zoom_1 (
  content TEXT,
  download_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  participant_id TEXT,
  participant_uuid TEXT,
  meeting_duration DOUBLE PRECISION,
  meeting_start_time TIMESTAMPTZ,
  meeting_topic TEXT,
  primary_key TEXT,
  primary_key_speaker TEXT,
  recording_id TEXT,
  section_end_timestamp TIMESTAMPTZ,
  section_start_timestamp TIMESTAMPTZ,
  segment_number TEXT,
  speaker TEXT,
  speaker_email TEXT,
  CONSTRAINT pk_transcript_segment_zoom_1 PRIMARY KEY (primary_key)
);

-- [Zoom] Transcript  (Foundry apiName: TranscriptZoom)
CREATE TABLE transcript_zoom (
  payload_object_auto_delete BOOLEAN,
  payload_object_auto_delete_date TEXT,
  download_datetime_created TIMESTAMPTZ,
  download_datetime_finished TIMESTAMPTZ,
  download_datetime_updated TIMESTAMPTZ,
  download_id TEXT,
  download_meeting_uuid TEXT,
  download_recording_start TIMESTAMPTZ,
  download_download_url TEXT,
  meeting_duration DOUBLE PRECISION,
  event TEXT,
  download_file_extension TEXT,
  download_file_size BIGINT,
  download_file_type TEXT,
  has_summary BOOLEAN,
  has_transcript BOOLEAN,
  payload_object_host_email TEXT,
  payload_object_host_id TEXT,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  meeting_text TEXT,
  meeting_topic TEXT,
  download_play_url TEXT,
  download_process_status TEXT,
  payload_object_recording_count DOUBLE PRECISION,
  download_recording_end TIMESTAMPTZ,
  download_recording_id TEXT,
  meeting_start_time TIMESTAMPTZ,
  download_recording_type TEXT,
  download_retry SMALLINT,
  payload_object_share_url TEXT,
  download_status TEXT,
  summary_eng TEXT,
  payload_object_timezone TEXT,
  payload_object_total_size DOUBLE PRECISION,
  transcript TEXT,
  transcript_text TEXT,
  zusammenfassung TEXT,
  zusammenfassung_lang TEXT,
  CONSTRAINT pk_transcript_zoom PRIMARY KEY (download_recording_id)
);

-- Typed Fact  (Foundry apiName: TypedFact)
CREATE TABLE typed_fact (
  clean_extraction TEXT,
  email TEXT,
  extraction_id TEXT,
  extraction_job_id TEXT,
  extraction_key TEXT,
  primary_key TEXT,
  source_touchpoint_id TEXT,
  timestamp_extraction TIMESTAMPTZ,
  touchpoint_in_job_earliest_timestanp TIMESTAMPTZ,
  CONSTRAINT pk_typed_fact PRIMARY KEY (primary_key)
);

-- Uploaded User Picture  (Foundry apiName: UploadedUserPicture)
CREATE TABLE uploaded_user_picture (
  email TEXT,
  primary_key TEXT,
  processing_request_ts TIMESTAMPTZ,
  uploaded_picture_rid TEXT,
  CONSTRAINT pk_uploaded_user_picture PRIMARY KEY (primary_key)
);

-- User Media Reference  (Foundry apiName: UserMediaReference)
CREATE TABLE user_media_reference (
  app_user_id TEXT,
  id TEXT,
  media_reference JSONB,
  origin TEXT,
  ticket_id TEXT,
  upload_date TIMESTAMPTZ,
  CONSTRAINT pk_user_media_reference PRIMARY KEY (id)
);

-- User Upload  (Foundry apiName: UserUpload)
CREATE TABLE user_upload (
  image JSONB,
  timestamp TIMESTAMPTZ,
  uploader TEXT,
  upload_id TEXT,
  CONSTRAINT pk_user_upload PRIMARY KEY (upload_id)
);

-- [VAPI] Assistants History  (Foundry apiName: VapiAssistantsHistory)
CREATE TABLE vapi_assistants_history (
  analysis_plan_min_messages_threshold DOUBLE PRECISION,
  background_denoising_enabled BOOLEAN,
  background_sound TEXT,
  client_messages TEXT[],
  created_at TEXT,
  end_call_function_enabled BOOLEAN,
  end_call_message TEXT,
  end_call_phrases TEXT[],
  first_message TEXT,
  first_message_mode TEXT,
  model_first_message_content TEXT,
  model_first_message_role TEXT,
  hipaa_enabled BOOLEAN,
  id TEXT,
  is_server_url_secret_set BOOLEAN,
  max_duration_seconds DOUBLE PRECISION,
  model_max_tokens DOUBLE PRECISION,
  model_messages JSONB,
  model_model TEXT,
  model_provider TEXT,
  model_temperature DOUBLE PRECISION,
  name TEXT,
  new_property1 TEXT,
  ontology_id TEXT,
  org_id TEXT,
  server_messages TEXT[],
  server_timeout_seconds DOUBLE PRECISION,
  server_url TEXT,
  silence_timeout_seconds DOUBLE PRECISION,
  start_speaking_plan_smart_endpointing_enabled TEXT,
  start_speaking_plan_wait_seconds DOUBLE PRECISION,
  stop_speaking_plan_backoff_seconds DOUBLE PRECISION,
  stop_speaking_plan_num_words DOUBLE PRECISION,
  stop_speaking_plan_voice_seconds DOUBLE PRECISION,
  transcriber_endpointing DOUBLE PRECISION,
  transcriber_language TEXT,
  transcriber_model TEXT,
  transcriber_numerals BOOLEAN,
  transcriber_provider TEXT,
  updated_at TEXT,
  voice_auto_mode BOOLEAN,
  voice_input_min_characters DOUBLE PRECISION,
  voice_input_punctuation_boundaries TEXT[],
  voice_model TEXT,
  voice_optimize_streaming_latency DOUBLE PRECISION,
  voice_provider TEXT,
  voice_similarity_boost DOUBLE PRECISION,
  voice_speed DOUBLE PRECISION,
  voice_stability DOUBLE PRECISION,
  voice_style DOUBLE PRECISION,
  voice_use_speaker_boost BOOLEAN,
  voice_voice_id TEXT,
  voicemail_detection_backoff_plan_frequency_seconds DOUBLE PRECISION,
  voicemail_detection_backoff_plan_max_retries DOUBLE PRECISION,
  voicemail_detection_backoff_plan_start_at_seconds DOUBLE PRECISION,
  voicemail_detection_beep_max_await_seconds DOUBLE PRECISION,
  voicemail_detection_provider TEXT,
  voicemail_message TEXT,
  CONSTRAINT pk_vapi_assistants_history PRIMARY KEY (ontology_id)
);

-- [VAPI] Assistants Latest  (Foundry apiName: VapiAssistantsLatest)
CREATE TABLE vapi_assistants_latest (
  analysis_plan_min_messages_threshold DOUBLE PRECISION,
  background_denoising_enabled BOOLEAN,
  background_sound TEXT,
  client_messages TEXT[],
  created_at TEXT,
  end_call_function_enabled BOOLEAN,
  end_call_message TEXT,
  end_call_phrases TEXT[],
  first_message TEXT,
  first_message_mode TEXT,
  model_first_message_content TEXT,
  model_first_message_role TEXT,
  hipaa_enabled BOOLEAN,
  id TEXT,
  is_server_url_secret_set BOOLEAN,
  max_duration_seconds DOUBLE PRECISION,
  model_max_tokens DOUBLE PRECISION,
  model_messages JSONB,
  model_model TEXT,
  model_provider TEXT,
  model_temperature DOUBLE PRECISION,
  name TEXT,
  org_id TEXT,
  server_messages TEXT[],
  server_timeout_seconds DOUBLE PRECISION,
  server_url TEXT,
  silence_timeout_seconds DOUBLE PRECISION,
  start_speaking_plan_smart_endpointing_enabled TEXT,
  start_speaking_plan_wait_seconds DOUBLE PRECISION,
  stop_speaking_plan_backoff_seconds DOUBLE PRECISION,
  stop_speaking_plan_num_words DOUBLE PRECISION,
  stop_speaking_plan_voice_seconds DOUBLE PRECISION,
  transcriber_endpointing DOUBLE PRECISION,
  transcriber_language TEXT,
  transcriber_model TEXT,
  transcriber_numerals BOOLEAN,
  transcriber_provider TEXT,
  updated_at TEXT,
  voice_auto_mode BOOLEAN,
  voice_input_min_characters DOUBLE PRECISION,
  voice_input_punctuation_boundaries TEXT[],
  voice_model TEXT,
  voice_optimize_streaming_latency DOUBLE PRECISION,
  voice_provider TEXT,
  voice_similarity_boost DOUBLE PRECISION,
  voice_speed DOUBLE PRECISION,
  voice_stability DOUBLE PRECISION,
  voice_style DOUBLE PRECISION,
  voice_use_speaker_boost BOOLEAN,
  voice_voice_id TEXT,
  voicemail_detection_backoff_plan_frequency_seconds DOUBLE PRECISION,
  voicemail_detection_backoff_plan_max_retries DOUBLE PRECISION,
  voicemail_detection_backoff_plan_start_at_seconds DOUBLE PRECISION,
  voicemail_detection_beep_max_await_seconds DOUBLE PRECISION,
  voicemail_detection_provider TEXT,
  voicemail_message TEXT,
  CONSTRAINT pk_vapi_assistants_latest PRIMARY KEY (id)
);

-- [VAPI] Call Review  (Foundry apiName: VapiCallReview)
CREATE TABLE vapi_call_review (
  call_id TEXT,
  comment TEXT,
  primary_key TEXT,
  reviewed BOOLEAN,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  status TEXT,
  CONSTRAINT pk_vapi_call_review PRIMARY KEY (primary_key)
);

-- [VAPI] Call Transcript Reference  (Foundry apiName: VapiCallTranscriptReference)
CREATE TABLE vapi_call_transcript_reference (
  call_id TEXT,
  media_item_rid TEXT,
  media_preview_string TEXT,
  media_set_rid TEXT,
  media_set_view_rid TEXT,
  recording_url TEXT,
  CONSTRAINT pk_vapi_call_transcript_reference PRIMARY KEY (media_item_rid)
);

-- [VAPI] Calls  (Foundry apiName: VapiCalls)
CREATE TABLE vapi_calls (
  analysis_success_evaluation TEXT,
  analysis_summary TEXT,
  artifact_log_url TEXT,
  artifact_recording_mono_assistant_url TEXT,
  artifact_recording_mono_combined_url TEXT,
  artifact_recording_mono_customer_url TEXT,
  artifact_recording_stereo_url TEXT,
  artifact_recording_url TEXT,
  artifact_stereo_recording_url TEXT,
  artifact_transcript TEXT,
  artifact_variable_values_customer_name TEXT,
  artifact_variable_values_customer_number TEXT,
  artifact_variable_values_date TEXT,
  artifact_variable_values_day TEXT,
  artifact_variable_values_email TEXT,
  artifact_variable_values_first_name TEXT,
  artifact_variable_values_month TEXT,
  artifact_variable_values_name TEXT,
  artifact_variable_values_now TEXT,
  artifact_variable_values_phone_number_created_at TEXT,
  artifact_variable_values_phone_number_id TEXT,
  artifact_variable_values_phone_number_name TEXT,
  artifact_variable_values_phone_number_number TEXT,
  artifact_variable_values_phone_number_org_id TEXT,
  artifact_variable_values_phone_number_provider TEXT,
  artifact_variable_values_phone_number_status TEXT,
  artifact_variable_values_phone_number_twilio_account_sid TEXT,
  artifact_variable_values_phone_number_twilio_auth_token TEXT,
  artifact_variable_values_phone_number_updated_at TEXT,
  artifact_variable_values_primaerschmerz TEXT,
  artifact_variable_values_time TEXT,
  artifact_variable_values_year TEXT,
  artifact_variables_customer_name TEXT,
  artifact_variables_customer_number TEXT,
  artifact_variables_date TEXT,
  artifact_variables_day TEXT,
  artifact_variables_email TEXT,
  artifact_variables_first_name TEXT,
  artifact_variables_month TEXT,
  artifact_variables_name TEXT,
  artifact_variables_now TEXT,
  artifact_variables_phone_number_created_at TEXT,
  artifact_variables_phone_number_id TEXT,
  artifact_variables_phone_number_name TEXT,
  artifact_variables_phone_number_number TEXT,
  artifact_variables_phone_number_org_id TEXT,
  artifact_variables_phone_number_provider TEXT,
  artifact_variables_phone_number_status TEXT,
  artifact_variables_phone_number_twilio_account_sid TEXT,
  artifact_variables_phone_number_twilio_auth_token TEXT,
  artifact_variables_phone_number_updated_at TEXT,
  artifact_variables_primaerschmerz TEXT,
  artifact_variables_time TEXT,
  artifact_variables_year TEXT,
  assistant_id TEXT,
  assistant_overrides_background_sound TEXT,
  assistant_overrides_client_messages TEXT,
  assistant_overrides_end_call_function_enabled BOOLEAN,
  assistant_overrides_end_call_message TEXT,
  assistant_overrides_first_message TEXT,
  assistant_overrides_first_message_mode TEXT,
  assistant_overrides_max_duration_seconds DOUBLE PRECISION,
  assistant_overrides_model_messages TEXT,
  assistant_overrides_model_model TEXT,
  assistant_overrides_model_provider TEXT,
  assistant_overrides_model_temperature DOUBLE PRECISION,
  assistant_overrides_name TEXT,
  assistant_overrides_server_messages TEXT[],
  assistant_overrides_server_timeout_seconds DOUBLE PRECISION,
  assistant_overrides_server_url TEXT,
  assistant_overrides_silence_timeout_seconds DOUBLE PRECISION,
  assistant_overrides_start_speaking_plan_transcription_endpointi DOUBLE PRECISION,
  assistant_overrides_start_speaking_plan_transcription_endpointi DOUBLE PRECISION,
  assistant_overrides_start_speaking_plan_wait_seconds DOUBLE PRECISION,
  assistant_overrides_stop_speaking_plan_num_words DOUBLE PRECISION,
  assistant_overrides_stop_speaking_plan_voice_seconds DOUBLE PRECISION,
  assistant_overrides_transcriber_language TEXT,
  assistant_overrides_transcriber_model TEXT,
  assistant_overrides_transcriber_numerals BOOLEAN,
  assistant_overrides_transcriber_provider TEXT,
  assistant_overrides_variable_values_email TEXT,
  assistant_overrides_variable_values_first_name TEXT,
  assistant_overrides_variable_values_name TEXT,
  assistant_overrides_variable_values_primaerschmerz TEXT,
  assistant_overrides_voice_enable_ssml_parsing BOOLEAN,
  assistant_overrides_voice_model TEXT,
  assistant_overrides_voice_optimize_streaming_latency DOUBLE PRECISION,
  assistant_overrides_voice_provider TEXT,
  assistant_overrides_voice_similarity_boost DOUBLE PRECISION,
  assistant_overrides_voice_speed DOUBLE PRECISION,
  assistant_overrides_voice_stability DOUBLE PRECISION,
  assistant_overrides_voice_style DOUBLE PRECISION,
  assistant_overrides_voice_voice_id TEXT,
  assistant_overrides_voicemail_detection_backoff_plan_frequency_ DOUBLE PRECISION,
  assistant_overrides_voicemail_detection_backoff_plan_max_retrie DOUBLE PRECISION,
  assistant_overrides_voicemail_detection_backoff_plan_start_at_s DOUBLE PRECISION,
  assistant_overrides_voicemail_detection_beep_max_await_seconds DOUBLE PRECISION,
  assistant_overrides_voicemail_detection_provider TEXT,
  assistant_overrides_voicemail_message TEXT,
  call_duration BIGINT,
  call_duration_bucket TEXT,
  cost DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_structured_data DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_structured_data_completi DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_structured_data_prompt_t DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_structured_output DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_structured_output_comple DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_structured_output_prompt DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_success_evaluation DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_success_evaluation_compl DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_success_evaluation_promp DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_summary DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_summary_completion_token DOUBLE PRECISION,
  cost_breakdown_analysis_cost_breakdown_summary_prompt_tokens DOUBLE PRECISION,
  cost_breakdown_chat DOUBLE PRECISION,
  cost_breakdown_knowledge_base_cost DOUBLE PRECISION,
  cost_breakdown_llm DOUBLE PRECISION,
  cost_breakdown_llm_completion_tokens DOUBLE PRECISION,
  cost_breakdown_llm_prompt_tokens DOUBLE PRECISION,
  cost_breakdown_stt DOUBLE PRECISION,
  cost_breakdown_total DOUBLE PRECISION,
  cost_breakdown_transport DOUBLE PRECISION,
  cost_breakdown_tts DOUBLE PRECISION,
  cost_breakdown_tts_characters DOUBLE PRECISION,
  cost_breakdown_vapi DOUBLE PRECISION,
  cost_breakdown_voicemail_detection_cost DOUBLE PRECISION,
  created_at TIMESTAMPTZ,
  customer_name TEXT,
  customer_number TEXT,
  ended_at TIMESTAMPTZ,
  ended_reason TEXT,
  id TEXT,
  monitor_control_url TEXT,
  monitor_listen_url TEXT,
  name TEXT,
  org_id TEXT,
  phone_call_provider TEXT,
  phone_call_provider_id TEXT,
  phone_call_transport TEXT,
  phone_number_id TEXT,
  recording_url TEXT,
  started_at TIMESTAMPTZ,
  status TEXT,
  stereo_recording_url TEXT,
  summary TEXT,
  transcript TEXT,
  transport_account_sid TEXT,
  transport_assistant_video_enabled BOOLEAN,
  transport_call_sid TEXT,
  transport_call_url TEXT,
  transport_provider TEXT,
  type TEXT,
  updated_at TIMESTAMPTZ,
  web_call_url TEXT,
  CONSTRAINT pk_vapi_calls PRIMARY KEY (id)
);

-- [Vimeo] Video  (Foundry apiName: VimeoVideo)
CREATE TABLE vimeo_video (
  categories INTEGER[],
  created_time TEXT,
  description TEXT,
  download_url TEXT,
  duration BIGINT,
  embed_html TEXT,
  folder_name TEXT,
  folder_uri TEXT,
  height BIGINT,
  ingestion_timestamp TEXT,
  link TEXT,
  modified_time TEXT,
  name TEXT,
  privacy_view TEXT,
  tags INTEGER[],
  thumbnail_url TEXT,
  tob_video_app_link TEXT,
  tob_video_category TEXT,
  uri TEXT,
  video_id TEXT,
  views BIGINT,
  width BIGINT,
  CONSTRAINT pk_vimeo_video PRIMARY KEY (video_id)
);

-- [SalesCRM] [Waha] WA Conversation  (Foundry apiName: WahaConversation)
CREATE TABLE waha_conversation (
  assigned_at TIMESTAMPTZ,
  assigned_by TEXT,
  assigned_to_email TEXT,
  assigned_to_name TEXT,
  coach_lead_owner_email TEXT,
  coach_lead_owner_name TEXT,
  completed_strukturanalyse BOOLEAN,
  contactv2_email TEXT,
  contactv2_pk TEXT,
  contract_is_signed BOOLEAN,
  contract_sent BOOLEAN,
  contract_viewed BOOLEAN,
  conversation_id TEXT,
  customer_program TEXT,
  has_ticket_for_current_mop BOOLEAN,
  is_archived BOOLEAN,
  is_client BOOLEAN,
  is_group_conversation BOOLEAN,
  is_training_cert_client BOOLEAN,
  is_unread BOOLEAN,
  is_pinned BOOLEAN,
  justus_labels TEXT[],
  label_ids TEXT[],
  lead_chat_id TEXT,
  lead_full_name TEXT,
  lead_phone_number TEXT,
  mop_count BIGINT,
  mop_first_signup_date TIMESTAMPTZ,
  mop_ids TEXT[],
  mop_last_activity_date TIMESTAMPTZ,
  mop_last_call_date TIMESTAMPTZ,
  mop_last_call_duration_seconds DOUBLE PRECISION,
  mop_latest_offer_name TEXT,
  mop_names TEXT[],
  mop_total_call_duration_seconds DOUBLE PRECISION,
  mop_total_watch_time_minutes DOUBLE PRECISION,
  sales_rep_email TEXT,
  sales_rep_number TEXT,
  session_name TEXT,
  whatsapp_name TEXT,
  CONSTRAINT pk_waha_conversation PRIMARY KEY (conversation_id)
);

-- [WAHA] Conversation Label  (Foundry apiName: WahaConversationLabel)
CREATE TABLE waha_conversation_label (
  colour TEXT,
  id TEXT,
  name TEXT,
  CONSTRAINT pk_waha_conversation_label PRIMARY KEY (id)
);

-- [WAHA] Message Edit (no RV)  (Foundry apiName: WahaEditsNoRv)
CREATE TABLE waha_edits_no_rv (
  contactv2_id TEXT,
  conversation_id TEXT,
  edit_event_id TEXT,
  edited_at TIMESTAMPTZ,
  lead_full_name TEXT,
  new_message_body TEXT,
  original_message_id TEXT,
  CONSTRAINT pk_waha_edits_no_rv PRIMARY KEY (edit_event_id)
);

-- [Waha] Image  (Foundry apiName: WahaImage)
CREATE TABLE waha_image (
  id TEXT,
  image_url TEXT,
  media_reference JSONB,
  media_rid TEXT,
  sales_rep_email TEXT,
  session_name TEXT,
  CONSTRAINT pk_waha_image PRIMARY KEY (id)
);

-- [Waha] Label Sync Log  (Foundry apiName: WahaLabelSyncLog)
CREATE TABLE waha_label_sync_log (
  chat_id TEXT,
  error_message TEXT,
  http_status INTEGER,
  primary_key TEXT,
  mapped_label_ids TEXT[],
  requested_labels TEXT[],
  response_time_ms DOUBLE PRECISION,
  session_id TEXT,
  success BOOLEAN,
  timestamp TIMESTAMPTZ,
  unmapped_labels TEXT[],
  CONSTRAINT pk_waha_label_sync_log PRIMARY KEY (primary_key)
);

-- WAHA Lead  (Foundry apiName: WahaLead)
CREATE TABLE waha_lead (
  close_activity_at TIMESTAMPTZ,
  close_activity_conversation TEXT,
  close_activity_date_created TIMESTAMPTZ,
  close_activity_summary_text TEXT,
  close_call_duration INTEGER,
  close_custom_field_call_id TEXT,
  close_lead_id TEXT,
  close_lead_phone TEXT,
  close_tob_user_id TEXT,
  count_inbount_per_lead BIGINT,
  count_outbound_per_lead BIGINT,
  event_object_id TEXT,
  has_inbound BOOLEAN,
  has_inbound_and_outbound BOOLEAN,
  has_outbound BOOLEAN,
  has_transcript BOOLEAN,
  last_message_timestamp TIMESTAMPTZ,
  lead_phone_number TEXT,
  local_phone TEXT,
  mop_lead_contact_id TEXT,
  mop_lead_contact_mo_primary_key TEXT,
  mop_lead_email TEXT,
  mop_lead_ghl_contact_ids TEXT,
  mop_lead_marketing_offer_id TEXT,
  mop_lead_name TEXT,
  mop_lead_primary_pain TEXT[],
  sales_agent_email TEXT,
  sales_agent_first_name TEXT,
  sales_agent_full_name TEXT,
  sales_agent_funnelbox_user_id TEXT,
  sales_agent_last_name TEXT,
  sales_agent_phone TEXT,
  sales_agent_waha_id TEXT,
  session TEXT,
  tob_wa_number TEXT,
  CONSTRAINT pk_waha_lead PRIMARY KEY (event_object_id)
);

-- WAHA Lead Draft  (Foundry apiName: WahaLeadDraft)
CREATE TABLE waha_lead_draft (
  category TEXT,
  connecting_call_id TEXT,
  created_at TEXT,
  message_draft TEXT,
  primary_key TEXT,
  status TEXT,
  updated_at TEXT,
  waha_lead_id TEXT,
  CONSTRAINT pk_waha_lead_draft PRIMARY KEY (primary_key)
);

-- [WAHA] Message Deleted (No RV)  (Foundry apiName: WahaMessageDeletedNoRv)
CREATE TABLE waha_message_deleted_no_rv (
  contactv2_id TEXT,
  conversation_id TEXT,
  lead_full_name TEXT,
  original_message_id TEXT,
  revoke_event_id TEXT,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT pk_waha_message_deleted_no_rv PRIMARY KEY (revoke_event_id)
);

-- [Waha] Message (no RV)  (Foundry apiName: WahaMessageNoRv)
CREATE TABLE waha_message_no_rv (
  ack INTEGER,
  ack_name TEXT,
  body TEXT,
  contactv2_id TEXT,
  conversation_id TEXT,
  created_at TIMESTAMPTZ,
  event TEXT,
  event_id TEXT,
  from TEXT,
  from_tob BOOLEAN,
  has_media BOOLEAN,
  id TEXT,
  is_from_broadcast BOOLEAN,
  is_group BOOLEAN,
  key_id TEXT,
  key_remote_jid TEXT,
  key_remote_jid_alt TEXT,
  lead_full_name TEXT,
  lead_phone_number TEXT,
  me_lid TEXT,
  media_filename TEXT,
  media_mimetype TEXT,
  media_url TEXT,
  media_url_path TEXT,
  message_timestamp TIMESTAMPTZ,
  participant TEXT,
  payload_id TEXT,
  reply_body TEXT,
  reply_id TEXT,
  reply_participant TEXT,
  sales_rep_email TEXT,
  sales_rep_number TEXT,
  session_name TEXT,
  source_app_or_api TEXT,
  to TEXT,
  whatsapp_name TEXT,
  CONSTRAINT pk_waha_message_no_rv PRIMARY KEY (id)
);

-- WAHA MOP Lead  (Foundry apiName: WahaMopLead)
CREATE TABLE waha_mop_lead (
  close_lead_id TEXT,
  count_inbount_per_lead BIGINT,
  count_outbound_per_lead BIGINT,
  has_inbound BOOLEAN,
  has_inbound_and_outbound BOOLEAN,
  has_outbound BOOLEAN,
  last_message_timestamp TIMESTAMPTZ,
  lead_phone_number TEXT,
  mop_lead_contact_id TEXT,
  mop_lead_marketing_offer_id TEXT,
  mop_lead_primary_pain TEXT,
  session TEXT,
  tob_wa_number TEXT,
  waha_lead_id TEXT,
  CONSTRAINT pk_waha_mop_lead PRIMARY KEY (waha_lead_id)
);

-- [Waha] Sessions Status  (Foundry apiName: WahaSessionStatus)
CREATE TABLE waha_session_status (
  current_status TEXT,
  ghl_id TEXT,
  last_3_statuses JSONB,
  session_name TEXT,
  timestamp TIMESTAMPTZ,
  user_id TEXT,
  user_name TEXT,
  CONSTRAINT pk_waha_session_status PRIMARY KEY (user_name)
);

-- [WAHA] Stream Audio Message With Transcription  (Foundry apiName: WahaStreamAudioMessageWithTranscription)
CREATE TABLE waha_stream_audio_message_with_transcription (
  audio_url TEXT,
  from TEXT,
  from_tob BOOLEAN,
  id TEXT,
  lead_phone_number TEXT,
  media_item_rid TEXT,
  media_mimetype TEXT,
  media_reference TEXT,
  media_rid TEXT,
  media_type TEXT,
  path TEXT,
  sales_rep_email TEXT,
  session_name TEXT,
  timestamp TIMESTAMPTZ,
  to TEXT,
  tob_wa_name TEXT,
  transcript_summary TEXT,
  transcription TEXT,
  transcription_ts TIMESTAMPTZ,
  CONSTRAINT pk_waha_stream_audio_message_with_transcription PRIMARY KEY (id)
);

-- [WAHA] Struktur Analyse Image  (Foundry apiName: WahaStrukturAnalyseImage)
CREATE TABLE waha_struktur_analyse_image (
  blurred_output_image_media_reference JSONB,
  blurred_output_image_rid TEXT,
  error TEXT,
  image_name TEXT,
  input_image_media_reference JSONB,
  input_image_rid TEXT,
  interpretation TEXT,
  is_valid BOOLEAN,
  issues TEXT[],
  output_image_rid TEXT,
  processing_status TEXT,
  sales_rep_email TEXT,
  session_name TEXT,
  source TEXT,
  timestamp TIMESTAMPTZ,
  unique_id TEXT,
  CONSTRAINT pk_waha_struktur_analyse_image PRIMARY KEY (unique_id)
);

-- [Funnelbox] WhatsApp Chat  (Foundry apiName: WhatsAppChatV2)
CREATE TABLE whats_app_chat_v2 (
  tob_assigned_id TEXT,
  tob_assigned_name TEXT,
  chat_dead BOOLEAN,
  completed BOOLEAN,
  contact_id TEXT,
  context TEXT,
  conversation_id TEXT,
  email TEXT,
  full_name TEXT,
  hours_since_last_message BIGINT,
  hours_since_last_inbound BIGINT,
  hours_since_last_outbound BIGINT,
  inbound_latest_message TIMESTAMPTZ,
  inbound_num_messages_sent BIGINT,
  inbound_num_words_written BIGINT,
  last_direction TEXT,
  last_message_content TEXT,
  last_message_time TIMESTAMPTZ,
  last_user_id TEXT,
  needs_response BOOLEAN,
  outbound_latest_message TIMESTAMPTZ,
  outbound_num_messages_sent BIGINT,
  outbound_num_words_written BIGINT,
  priority TEXT,
  status TEXT,
  CONSTRAINT pk_whats_app_chat_v2 PRIMARY KEY (contact_id)
);

-- Whats App Message V4  (Foundry apiName: WhatsAppMessageV4)
CREATE TABLE whats_app_message_v4 (
  app_id TEXT,
  body TEXT,
  contact_id TEXT,
  context_latest_messages TEXT,
  conversation_id TEXT,
  count_character INTEGER,
  count_words INTEGER,
  date_added TIMESTAMPTZ,
  date_string TEXT,
  direction TEXT,
  email TEXT,
  last_message_timestamp TIMESTAMPTZ,
  latest_messages TEXT[],
  location_id TEXT,
  mariadb_id TEXT,
  message_id TEXT,
  message_sentiment_analysis INTEGER,
  name TEXT,
  source TEXT,
  status TEXT,
  time_to_answer BIGINT,
  timestamp TIMESTAMPTZ,
  tob_email TEXT,
  tob_first_name TEXT,
  tob_last_name TEXT,
  user_id TEXT,
  version_id TEXT,
  webhook_id TEXT,
  CONSTRAINT pk_whats_app_message_v4 PRIMARY KEY (message_id)
);

-- Whats App Thread V4  (Foundry apiName: WhatsAppThreadV4)
CREATE TABLE whats_app_thread_v4 (
  contact_id TEXT,
  conversation_id TEXT,
  email TEXT,
  latest_timestamp TIMESTAMPTZ,
  started_timestamp TIMESTAMPTZ,
  tob_email TEXT,
  user_id TEXT,
  CONSTRAINT pk_whats_app_thread_v4 PRIMARY KEY (conversation_id)
);

-- Whatsapp Draft Generation  (Foundry apiName: WhatsappDraftGeneration)
CREATE TABLE whatsapp_draft_generation (
  approved_at TIMESTAMPTZ,
  approved_by TEXT,
  generated_by TEXT,
  generation_id TEXT,
  generation_name TEXT,
  prompt TEXT,
  started_generation_at TIMESTAMPTZ,
  messages_to_answer TEXT[],
  CONSTRAINT pk_whatsapp_draft_generation PRIMARY KEY (generation_id)
);

-- Whatsapp Generation Job Queue  (Foundry apiName: WhatsappGenerationJobQueue)
CREATE TABLE whatsapp_generation_job_queue (
  generated_by TEXT,
  generation_id TEXT,
  generation_name TEXT,
  is_deleted BOOLEAN,
  job_id TEXT,
  messages_to_answer TEXT[],
  patch_offset BIGINT,
  prompt TEXT,
  started_generation_at TIMESTAMPTZ,
  thread_to_answer TEXT,
  CONSTRAINT pk_whatsapp_generation_job_queue PRIMARY KEY (job_id)
);

-- Workshop Applications  (Foundry apiName: WorkshopApplications)
CREATE TABLE workshop_applications (
  primary_key TEXT,
  link TEXT,
  name TEXT,
  owner TEXT,
  status TEXT,
  CONSTRAINT pk_workshop_applications PRIMARY KEY (primary_key)
);

-- Youtube Analytics  (Foundry apiName: YoutubeAnalytics)
CREATE TABLE youtube_analytics (
  age_in_days BIGINT,
  caption_fetched_at TEXT,
  caption_text TEXT,
  channel_id TEXT,
  channel_title TEXT,
  comment_count BIGINT,
  description TEXT,
  duration_seconds BIGINT,
  engagement_rate DOUBLE PRECISION,
  fetched_at TEXT,
  is_short BOOLEAN,
  lang_code TEXT,
  like_count BIGINT,
  published_at TIMESTAMPTZ,
  short_hooks TEXT,
  short_summary TEXT,
  thumbnail_high TEXT,
  title TEXT,
  video_id TEXT,
  video_url TEXT,
  view_count BIGINT,
  views_per_day DOUBLE PRECISION,
  CONSTRAINT pk_youtube_analytics PRIMARY KEY (video_id)
);

-- [Zoom] Audio Media  (Foundry apiName: ZoomAudioMedia)
CREATE TABLE zoom_audio_media (
  created_ts TIMESTAMPTZ,
  event TEXT,
  mariadb_id TEXT,
  mariiadb_created_ts BIGINT,
  media_item_rid TEXT,
  media_reference TEXT,
  media_reference2 JSONB,
  object_account_id TEXT,
  object_duration BIGINT,
  object_host_email TEXT,
  object_host_id TEXT,
  object_id BIGINT,
  object_recording_count INTEGER,
  object_share_url TEXT,
  object_start_time TEXT,
  object_timezone TEXT,
  object_topic TEXT,
  object_total_size BIGINT,
  object_type INTEGER,
  object_uuid TEXT,
  path TEXT,
  recording_download_url TEXT,
  recording_end TEXT,
  recording_file_extension TEXT,
  recording_file_size TEXT,
  recording_file_type TEXT,
  recording_id TEXT,
  recording_meeting_id TEXT,
  recording_play_url TEXT,
  recording_start TEXT,
  recording_status TEXT,
  recording_type TEXT,
  s3_key TEXT,
  s3_url TEXT,
  strategy TEXT,
  timestamp TIMESTAMPTZ,
  updated_ts TIMESTAMPTZ,
  upload_finished BOOLEAN,
  upload_finished_ts TIMESTAMPTZ,
  upload_started BOOLEAN,
  upload_started_ts TIMESTAMPTZ,
  url_media_rid TEXT,
  CONSTRAINT pk_zoom_audio_media PRIMARY KEY (media_item_rid)
);

-- [Zoom] Call To Action  (Foundry apiName: ZoomCallToAction)
CREATE TABLE zoom_call_to_action (
  content TEXT,
  ctas TEXT,
  event_created_ts TIMESTAMPTZ,
  event_ended_ts TIMESTAMPTZ,
  event_started_ts TIMESTAMPTZ,
  id TEXT,
  meeting_start_time TIMESTAMPTZ,
  participant_id TEXT,
  participant_uuid TEXT,
  payload_object_duration DOUBLE PRECISION,
  payload_object_id TEXT,
  payload_object_topic TEXT,
  payload_object_uuid TEXT,
  primary_key TEXT,
  primary_key_speaker TEXT,
  recording_end TIMESTAMPTZ,
  recording_id TEXT,
  recording_start TIMESTAMPTZ,
  section_end_timestamp TIMESTAMPTZ,
  section_start_timestamp TIMESTAMPTZ,
  segment_number TEXT,
  speaker TEXT,
  speaker_email TEXT,
  status TEXT,
  CONSTRAINT pk_zoom_call_to_action PRIMARY KEY (primary_key)
);

-- [Zoom] Chat Insight  (Foundry apiName: ZoomChatInsight)
CREATE TABLE zoom_chat_insight (
  call_to_action_id TEXT,
  chat_message_id TEXT,
  cta_text TEXT,
  insight TEXT,
  insight_timestamp TIMESTAMPTZ,
  meeting_id TEXT,
  meeting_uuid TEXT,
  primary_key TEXT,
  sender_email TEXT,
  sender_name TEXT,
  CONSTRAINT pk_zoom_chat_insight PRIMARY KEY (primary_key)
);

-- Zoom Chat Keywords  (Foundry apiName: ZoomChatKeywords)
CREATE TABLE zoom_chat_keywords (
  active BOOLEAN,
  end DATE,
  keyword TEXT,
  only_start BOOLEAN,
  primary_key TEXT,
  start DATE,
  CONSTRAINT pk_zoom_chat_keywords PRIMARY KEY (primary_key)
);

-- [Zoom] CTA Search  (Foundry apiName: ZoomCtaSearch)
CREATE TABLE zoom_cta_search (
  business_reason TEXT,
  created_at TIMESTAMPTZ,
  created_by TEXT,
  cta_to_look_for TEXT,
  manual_or_llm TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  possible_words TEXT[],
  primary_key TEXT,
  status TEXT,
  transcript_quote TEXT,
  transcript_segment_number TEXT,
  zoom_transcript_timestamp TIMESTAMPTZ,
  CONSTRAINT pk_zoom_cta_search PRIMARY KEY (primary_key)
);

-- Zoom Download URL List  (Foundry apiName: ZoomDownloadUrlList)
CREATE TABLE zoom_download_url_list (
  account_id TEXT,
  auto_delete BOOLEAN,
  auto_delete_date TEXT,
  download_token TEXT,
  download_url TEXT,
  duration DOUBLE PRECISION,
  event TEXT,
  event_timestamp TIMESTAMPTZ,
  event_ts TIMESTAMPTZ,
  event_type TEXT,
  host_email TEXT,
  host_id TEXT,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  object_account_id TEXT,
  on_prem BOOLEAN,
  p_audio_donwload_url TEXT,
  participant_audio_files JSONB,
  payload_object_share_url TEXT,
  payload_object_start_time TEXT,
  payload_object_topic TEXT,
  payload_object_total_size DOUBLE PRECISION,
  payload_object_type TEXT,
  recording_count INTEGER,
  share_url TEXT,
  start_time TEXT,
  strategy TEXT,
  timezone TEXT,
  topic TEXT,
  total_size DOUBLE PRECISION,
  transcript_download_url TEXT,
  type TEXT,
  CONSTRAINT pk_zoom_download_url_list PRIMARY KEY (meeting_uuid)
);

-- [Zoom] Event Session Attendance  (Foundry apiName: ZoomEventSessionAttendance)
CREATE TABLE zoom_event_session_attendance (
  n3days_live_time_watched BIGINT,
  n3days_recording_time_watched DOUBLE PRECISION,
  n7days_live_time_watched BIGINT,
  n7days_recording_time_watched DOUBLE PRECISION,
  audience_labels TEXT[],
  avg_daily_view_time DOUBLE PRECISION,
  chat_message_count BIGINT,
  chat_message_count_words BIGINT,
  date_session DATE,
  email TEXT,
  end_time_session TIMESTAMPTZ,
  event_end_date DATE,
  event_id TEXT,
  event_name TEXT,
  event_session_ids TEXT[],
  event_start_date DATE,
  event_total_event_days BIGINT,
  fubo_first_id TEXT,
  last_day_watched_recording DATE,
  length_meeting BIGINT,
  meeting_duration_actual BIGINT,
  meeting_event_ended_ts TIMESTAMPTZ,
  meeting_event_started_ts TIMESTAMPTZ,
  meeting_id TEXT,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  meetinguuid_partuuids TEXT,
  message_datetime TIMESTAMPTZ,
  num_participant_uuid BIGINT,
  num_segments BIGINT,
  participant_ids TEXT[],
  participant_primary_keys TEXT[],
  participant_uuids TEXT[],
  percentage_watched DOUBLE PRECISION,
  product_labels TEXT[],
  recording_view_duration DOUBLE PRECISION,
  session_day TEXT,
  session_description TEXT,
  session_id TEXT,
  session_name TEXT,
  session_name_date TEXT,
  start_time_session TIMESTAMPTZ,
  time_event_ended TIMESTAMPTZ,
  time_event_started TIMESTAMPTZ,
  time_joined_first TIMESTAMPTZ,
  time_left_last TIMESTAMPTZ,
  title TEXT,
  total_live_time_missed BIGINT,
  total_live_watchtime BIGINT,
  user_name TEXT,
  yesterday_live_time_watched BIGINT,
  yesterday_recording_time_watched DOUBLE PRECISION,
  CONSTRAINT pk_zoom_event_session_attendance PRIMARY KEY (meetinguuid_partuuids)
);

-- [Zoom] Event Session  (Foundry apiName: ZoomEventSession_2)
CREATE TABLE zoom_event_session_2 (
  alternative_host TEXT[],
  attendance_type TEXT,
  audience_labels TEXT[],
  date_session DATE,
  end_time_session TIMESTAMPTZ,
  event_creation_time TIMESTAMPTZ,
  event_end_date DATE,
  event_hub_id TEXT,
  event_id TEXT,
  event_name TEXT,
  event_session_ids TEXT[],
  event_start_date DATE,
  event_type TEXT,
  featured BOOLEAN,
  featured_in_lobby BOOLEAN,
  is_simulive BOOLEAN,
  last_update_time TIMESTAMPTZ,
  led_by_sponsor BOOLEAN,
  level TEXT[],
  mariadb_id TEXT,
  meeting_creation_source TEXT,
  meeting_duration_actual BIGINT,
  meeting_duration_scheduled DOUBLE PRECISION,
  meeting_event_created_ts TIMESTAMPTZ,
  meeting_event_ended_ts TIMESTAMPTZ,
  meeting_event_scheduled_ts TIMESTAMPTZ,
  meeting_event_started_ts TIMESTAMPTZ,
  meeting_id TEXT,
  meeting_join_url TEXT,
  meeting_num_chat_messages BIGINT,
  meeting_num_participants BIGINT,
  meeting_occurrences JSONB,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  physical_location TEXT,
  product_labels TEXT[],
  session_description TEXT,
  session_day BIGINT,
  session_id TEXT,
  session_name TEXT,
  session_reservation_allow_reservations BOOLEAN,
  session_reservation_max_capacity DOUBLE PRECISION,
  session_speakers JSONB,
  start_time_session TIMESTAMPTZ,
  timezone TEXT,
  title TEXT,
  event_total_event_days BIGINT,
  track_labels TEXT[],
  type TEXT,
  visible_in_landing_page BOOLEAN,
  visible_in_lobby BOOLEAN,
  wh_deleted BOOLEAN,
  CONSTRAINT pk_zoom_event_session_2 PRIMARY KEY (session_id)
);

-- [Zoom] Event  (Foundry apiName: ZoomEventsZoom_1)
CREATE TABLE zoom_events_zoom_1 (
  attendance_type TEXT,
  description TEXT,
  end_time TIMESTAMPTZ,
  event_id TEXT,
  webhook_timestamp TIMESTAMPTZ,
  event_type TEXT,
  host_id TEXT,
  hub_id TEXT,
  name TEXT,
  webhook_event_name TEXT,
  start_time TIMESTAMPTZ,
  status TEXT,
  tagline TEXT,
  CONSTRAINT pk_zoom_events_zoom_1 PRIMARY KEY (event_id)
);

-- [Zoom][Light] Chat Message  (Foundry apiName: ZoomLightChatMessage)
CREATE TABLE zoom_light_chat_message (
  event TEXT,
  event_ts TIMESTAMPTZ,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_instance_id TEXT,
  message_content TEXT,
  message_datetime_utc TIMESTAMPTZ,
  message_id TEXT,
  recipient_type TEXT,
  sender_email TEXT,
  sender_name TEXT,
  CONSTRAINT pk_zoom_light_chat_message PRIMARY KEY (message_id)
);

-- Zoom Meeting Current Attende  (Foundry apiName: ZoomMeetingCurrentAttende)
CREATE TABLE zoom_meeting_current_attende (
  event_label TEXT,
  event_reason TEXT,
  joined_but_left BOOLEAN,
  meeting_id TEXT,
  meeting_start_time TIMESTAMPTZ,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  participant_email TEXT,
  participant_event_time TIMESTAMPTZ,
  participant_id TEXT,
  participant_left_event_label TEXT,
  participant_left_event_reason TEXT,
  participant_left_meeting_id TEXT,
  participant_left_meeting_start_time TIMESTAMPTZ,
  participant_left_meeting_topic TEXT,
  participant_left_meeting_uuid TEXT,
  participant_left_participant_email TEXT,
  participant_left_participant_event_time TIMESTAMPTZ,
  participant_left_participant_id TEXT,
  participant_left_participant_user_name TEXT,
  participant_left_participant_uuid TEXT,
  participant_user_name TEXT,
  participant_uuid TEXT,
  primary_key TEXT,
  CONSTRAINT pk_zoom_meeting_current_attende PRIMARY KEY (primary_key)
);

-- EXPERIMENTAL Zoom Meeting Started Incremental  (Foundry apiName: ZoomMeetingStartedIncremental)
CREATE TABLE zoom_meeting_started_incremental (
  payload_account_id TEXT,
  payload_object_duration DOUBLE PRECISION,
  event TEXT,
  event_started_ts TEXT,
  event_ts TIMESTAMPTZ,
  payload_object_host_id TEXT,
  mariadb_date_created TEXT,
  mariadb_id TEXT,
  payload_object_id TEXT,
  payload_object_uuid TEXT,
  payload_object_type DOUBLE PRECISION,
  payload_object_timezone TEXT,
  payload_object_topic TEXT,
  CONSTRAINT pk_zoom_meeting_started_incremental PRIMARY KEY (payload_object_uuid)
);

-- EXPERIMENTAL Zoom Meeting Started Incremental Direct  (Foundry apiName: ZoomMeetingStartedIncrementalDirect)
CREATE TABLE zoom_meeting_started_incremental_direct (
  event TEXT,
  event_started_ts TEXT,
  event_ts TIMESTAMPTZ,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  payload_account_id TEXT,
  payload_object_duration DOUBLE PRECISION,
  payload_object_host_id TEXT,
  payload_object_id TEXT,
  payload_object_timezone TEXT,
  payload_object_topic TEXT,
  payload_object_type DOUBLE PRECISION,
  payload_object_uuid TEXT,
  CONSTRAINT pk_zoom_meeting_started_incremental_direct PRIMARY KEY (payload_object_uuid)
);

-- EXPERIMENTAL Zoom Messages Incremental  (Foundry apiName: ZoomMessagesIncremental)
CREATE TABLE zoom_messages_incremental (
  account_id TEXT,
  event TEXT,
  event_ts TIMESTAMPTZ,
  mariadb_date_created TEXT,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_instance_id TEXT,
  message_content TEXT,
  message_datetime TIMESTAMPTZ,
  message_id TEXT,
  recipient_email TEXT,
  recipient_foreign_key TEXT,
  recipient_name TEXT,
  recipient_session_id TEXT,
  recipient_type TEXT,
  sender_email TEXT,
  sender_foreign_key TEXT,
  sender_name TEXT,
  sender_session_id TEXT,
  sender_type TEXT,
  CONSTRAINT pk_zoom_messages_incremental PRIMARY KEY (mariadb_id)
);

-- [Zoom] Meeting Polls Q&A  (Foundry apiName: ZoomQA_2)
CREATE TABLE zoom_qa_2 (
  answer TEXT,
  email TEXT,
  id TEXT,
  meeting_id TEXT,
  meeting_started TIMESTAMPTZ,
  topic TEXT,
  created_ts TIMESTAMPTZ,
  question TEXT,
  CONSTRAINT pk_zoom_qa_2 PRIMARY KEY (id)
);

-- [Zoom] Session Recording Day Segments  (Foundry apiName: ZoomRecordingSessionWatchtime)
CREATE TABLE zoom_recording_session_watchtime (
  daily_view_time DOUBLE PRECISION,
  date DATE,
  email TEXT,
  primary_key TEXT,
  recording_view_duration DOUBLE PRECISION,
  session_email_id TEXT,
  session_id TEXT,
  CONSTRAINT pk_zoom_recording_session_watchtime PRIMARY KEY (primary_key)
);

-- [Zoom][Stream] Chat Message  (Foundry apiName: ZoomStreamChatMessage)
CREATE TABLE zoom_stream_chat_message (
  alternative_host TEXT[],
  are_there_phone_number_extracted_from_message BOOLEAN,
  attendance_type TEXT,
  audience_labels TEXT[],
  close_contact_id TEXT[],
  close_lead_id TEXT[],
  date_session DATE,
  date_time TIMESTAMPTZ,
  end_time_session TIMESTAMPTZ,
  event TEXT,
  event_creation_time TIMESTAMPTZ,
  event_end_date DATE,
  event_hub_id TEXT,
  event_id TEXT,
  event_name TEXT,
  event_session_ids TEXT[],
  event_start_date DATE,
  event_total_event_days BIGINT,
  event_type TEXT,
  exported_summit_profile TIMESTAMPTZ,
  extracted_phone_numbers TEXT[],
  featured BOOLEAN,
  featured_in_lobby BOOLEAN,
  ghl_contact_ids TEXT[],
  is_simulive BOOLEAN,
  last_update_time TIMESTAMPTZ,
  led_by_sponsor BOOLEAN,
  level TEXT[],
  mariadb_id TEXT,
  meeting_creation_source TEXT,
  meeting_duration_actual BIGINT,
  meeting_duration_scheduled DOUBLE PRECISION,
  meeting_event_created_ts TIMESTAMPTZ,
  meeting_event_ended_ts TIMESTAMPTZ,
  meeting_event_scheduled_ts TIMESTAMPTZ,
  meeting_event_started_ts TIMESTAMPTZ,
  meeting_id TEXT,
  meeting_join_url TEXT,
  meeting_num_chat_messages BIGINT,
  meeting_num_participants BIGINT,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  message_content TEXT,
  message_id TEXT,
  name TEXT,
  num_tickets BIGINT,
  num_zoom_meetings BIGINT,
  object_id BIGINT,
  object_uuid TEXT,
  pandadoc_ids TEXT[],
  payload_id TEXT,
  phone_numbers_extracted_from_message TEXT,
  physical_location TEXT,
  product_labels TEXT[],
  recipient_type TEXT,
  sender_email TEXT,
  session_day BIGINT,
  session_description TEXT,
  session_id TEXT,
  session_name TEXT,
  session_reservation_allow_reservations BOOLEAN,
  session_reservation_max_capacity DOUBLE PRECISION,
  start_time_session TIMESTAMPTZ,
  summit_profile_triggered TIMESTAMPTZ,
  tags TEXT[],
  tags_zoom_keywords TEXT[],
  timezone TEXT,
  title TEXT,
  track_labels TEXT[],
  type TEXT,
  uuid_foundry TEXT,
  visible_in_landing_page BOOLEAN,
  visible_in_lobby BOOLEAN,
  zoom_meeting_ids TEXT[],
  zoom_meeting_instance_ids TEXT[],
  zoom_participant_uuids TEXT[],
  zoom_ticket_ids TEXT[],
  zoom_user_ids TEXT[],
  CONSTRAINT pk_zoom_stream_chat_message PRIMARY KEY (message_id)
);

-- [Zoom] Suggested Session Description  (Foundry apiName: ZoomSuggestedSessionDescription)
CREATE TABLE zoom_suggested_session_description (
  download_download_file_content TEXT,
  end_time_session TIMESTAMPTZ,
  event_id TEXT,
  meeting_uuid TEXT,
  session_id TEXT,
  session_name TEXT,
  start_time_session TIMESTAMPTZ,
  suggested_description TEXT,
  CONSTRAINT pk_zoom_suggested_session_description PRIMARY KEY (meeting_uuid)
);

-- [Zoom] Summit Session Summary  (Foundry apiName: ZoomSummitTranscipt)
CREATE TABLE zoom_summit_transcipt (
  event_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  pk TEXT,
  session_id TEXT,
  zusammenfassung_summit_session TEXT,
  CONSTRAINT pk_zoom_summit_transcipt PRIMARY KEY (pk)
);

-- [Zoom] Survey Q&A  (Foundry apiName: ZoomSurveyQA)
CREATE TABLE zoom_survey_qa (
  answer TEXT,
  date_time TIMESTAMPTZ,
  email TEXT,
  meeting_id TEXT,
  topic TEXT,
  polling_id TEXT,
  qa_id TEXT,
  question TEXT,
  question_id TEXT,
  session_id TEXT,
  start_time TIMESTAMPTZ,
  title TEXT,
  CONSTRAINT pk_zoom_survey_qa PRIMARY KEY (qa_id)
);

-- [Zoom] Survey Question  (Foundry apiName: ZoomSurveyQuestion)
CREATE TABLE zoom_survey_question (
  meaning TEXT,
  meeting_ids TEXT[],
  topic TEXT,
  qa_id TEXT[],
  question TEXT,
  question_id TEXT,
  question_type TEXT,
  session_ids TEXT[],
  CONSTRAINT pk_zoom_survey_question PRIMARY KEY (question_id)
);

-- [Zoom] Ticket Join Link  (Foundry apiName: ZoomTicketJoinLink)
CREATE TABLE zoom_ticket_join_link (
  email TEXT,
  event_id TEXT,
  event_join_link TEXT,
  ticket_created_ts TIMESTAMPTZ,
  ticket_id TEXT,
  CONSTRAINT pk_zoom_ticket_join_link PRIMARY KEY (ticket_id)
);

-- [Zoom] Ticket  (Foundry apiName: ZoomTicketsZoom)
CREATE TABLE zoom_tickets_zoom (
  account_id TEXT,
  authentication_method TEXT,
  email TEXT,
  event_id TEXT,
  webhook_event_name TEXT,
  event_timestamp TIMESTAMPTZ,
  host TEXT,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  strategy TEXT,
  ticket_id TEXT,
  ticket_role_type TEXT,
  ticket_type_attendance_type TEXT,
  ticket_type_description TEXT,
  ticket_type_id TEXT,
  ticket_type_name TEXT,
  title TEXT,
  CONSTRAINT pk_zoom_tickets_zoom PRIMARY KEY (ticket_id)
);

-- Payload to Zoom  (Foundry apiName: ZoomToZapierForVimeo)
CREATE TABLE zoom_to_zapier_for_vimeo (
  download_url TEXT,
  duration INTEGER,
  host_id TEXT,
  meeting_uuid TEXT,
  name TEXT,
  recording_type TEXT,
  source TEXT,
  test_recording_start TIMESTAMPTZ,
  topic TEXT,
  total_size DOUBLE PRECISION,
  transcript_download_url TEXT,
  unique_id TEXT,
  CONSTRAINT pk_zoom_to_zapier_for_vimeo PRIMARY KEY (unique_id)
);

-- [Zoom] Transcript Block  (Foundry apiName: ZoomTranscriptBlock)
CREATE TABLE zoom_transcript_block (
  content TEXT[],
  content_embeddings DOUBLE PRECISION[],
  id TEXT,
  meeting_start_time TIMESTAMPTZ,
  meeting_uuid TEXT,
  participant_id TEXT,
  participant_uuid TEXT,
  meeting_duration DOUBLE PRECISION,
  meeting_topic TEXT,
  primary_key TEXT,
  primary_key_speaker TEXT,
  recording_id TEXT,
  section_end_timestamp TIMESTAMPTZ,
  section_start_timestamp TIMESTAMPTZ,
  segment_number TEXT,
  speaker TEXT,
  speaker_email TEXT,
  CONSTRAINT pk_zoom_transcript_block PRIMARY KEY (primary_key)
);

-- [Zoom] Transcript Chunks Embedding  (Foundry apiName: ZoomTranscriptChunksEmbedding)
CREATE TABLE zoom_transcript_chunks_embedding (
  chunk_id TEXT,
  chunk_order DOUBLE PRECISION,
  download_recording_id TEXT,
  embedded_at TIMESTAMPTZ,
  embedding_vector DOUBLE PRECISION[],
  is_other_call BOOLEAN,
  is_summit_call BOOLEAN,
  is_training_call BOOLEAN,
  justus_percentage DOUBLE PRECISION,
  new_property1 TEXT,
  speaker_distributions TEXT[],
  speaker_text_flattened TEXT,
  speaker_text_flattened_json TEXT[],
  summary_eng TEXT,
  text_to_embed TEXT,
  tokens DOUBLE PRECISION,
  total_number_of_chunks BIGINT,
  transcripts_chunk_len INTEGER,
  zusammenfassung TEXT,
  CONSTRAINT pk_zoom_transcript_chunks_embedding PRIMARY KEY (chunk_id)
);

-- [Zoom] Transcripts raw  (Foundry apiName: ZoomTranscriptsRaw)
CREATE TABLE zoom_transcripts_raw (
  call_id TEXT,
  download_datetime_created TIMESTAMPTZ,
  download_datetime_finished TIMESTAMPTZ,
  download_datetime_updated TIMESTAMPTZ,
  download_download_file_content TEXT,
  download_download_url TEXT,
  download_file_extension TEXT,
  download_file_size BIGINT,
  download_file_type TEXT,
  download_id TEXT,
  download_meeting_uuid TEXT,
  download_play_url TEXT,
  download_process_status TEXT,
  download_recording_end TIMESTAMPTZ,
  download_recording_id TEXT,
  download_recording_start TIMESTAMPTZ,
  download_recording_type TEXT,
  download_retry SMALLINT,
  download_status TEXT,
  event TEXT,
  has_transcript BOOLEAN,
  mariadb_id TEXT,
  meeting_duration DOUBLE PRECISION,
  meeting_id TEXT,
  meeting_start_time TIMESTAMPTZ,
  meeting_topic TEXT,
  meeting_uuid TEXT,
  payload_object_auto_delete BOOLEAN,
  payload_object_auto_delete_date TEXT,
  payload_object_host_email TEXT,
  payload_object_host_id TEXT,
  payload_object_recording_count DOUBLE PRECISION,
  payload_object_share_url TEXT,
  payload_object_timezone TEXT,
  payload_object_total_size DOUBLE PRECISION,
  CONSTRAINT pk_zoom_transcripts_raw PRIMARY KEY (download_recording_id)
);

-- [Zoom] Video Media  (Foundry apiName: ZoomVideoMedia)
CREATE TABLE zoom_video_media (
  created_ts TIMESTAMPTZ,
  event TEXT,
  mariadb_id TEXT,
  mariiadb_created_ts BIGINT,
  media_item_rid TEXT,
  media_reference TEXT,
  media_reference2 JSONB,
  object_account_id TEXT,
  object_duration BIGINT,
  object_host_email TEXT,
  object_host_id TEXT,
  object_id BIGINT,
  object_recording_count INTEGER,
  object_share_url TEXT,
  object_start_time TEXT,
  object_timezone TEXT,
  object_topic TEXT,
  object_total_size BIGINT,
  object_type INTEGER,
  object_uuid TEXT,
  path TEXT,
  recording_download_url TEXT,
  recording_end TEXT,
  recording_file_extension TEXT,
  recording_file_size TEXT,
  recording_file_type TEXT,
  recording_id TEXT,
  recording_meeting_id TEXT,
  recording_play_url TEXT,
  recording_start TEXT,
  recording_status TEXT,
  recording_type TEXT,
  s3_key TEXT,
  s3_url TEXT,
  strategy TEXT,
  timestamp TIMESTAMPTZ,
  updated_ts TIMESTAMPTZ,
  upload_finished BOOLEAN,
  upload_finished_ts TIMESTAMPTZ,
  upload_started BOOLEAN,
  upload_started_ts TIMESTAMPTZ,
  url_media_rid TEXT,
  CONSTRAINT pk_zoom_video_media PRIMARY KEY (media_item_rid)
);

-- Zoom Recording daten fur Zoom  (Foundry apiName: ZoomZapierWebhook)
CREATE TABLE zoom_zapier_webhook (
  account_id TEXT,
  auto_delete BOOLEAN,
  auto_delete_date TEXT,
  download_token TEXT,
  duration INTEGER,
  event TEXT,
  event_timestamp TIMESTAMPTZ,
  event_ts TIMESTAMPTZ,
  event_type TEXT,
  host_email TEXT,
  host_id TEXT,
  mariadb_date_created TIMESTAMPTZ,
  mariadb_id TEXT,
  meeting_id TEXT,
  meeting_uuid TEXT,
  name TEXT,
  object_account_id TEXT,
  on_prem BOOLEAN,
  participant_audio_files JSONB,
  payload_object_recording_files JSONB,
  priority TEXT,
  recording_count INTEGER,
  recording_files JSONB,
  second_download_url TEXT,
  second_recording_type TEXT,
  share_url TEXT,
  start_time TIMESTAMPTZ,
  test_download_url TEXT,
  test_file_extension TEXT,
  test_file_size DOUBLE PRECISION,
  test_file_type TEXT,
  test_id TEXT,
  test_meeting_id TEXT,
  test_play_url TEXT,
  test_recording_end TIMESTAMPTZ,
  test_recording_start TIMESTAMPTZ,
  test_recording_type TEXT,
  timezone TEXT,
  topic TEXT,
  total_size DOUBLE PRECISION,
  transcript_download_url TEXT,
  type TEXT,
  webhook_priority INTEGER,
  CONSTRAINT pk_zoom_zapier_webhook PRIMARY KEY (meeting_uuid)
);

-- [11 Labs] Agent  (Foundry apiName: _11LabsAgent)
CREATE TABLE n11_labs_agent (
  agent_id TEXT,
  created_at_unix_secs BIGINT,
  creator_name TEXT,
  dynamic_variables_json TEXT,
  first_message TEXT,
  language_code TEXT,
  last_updated_at_unix_secs BIGINT,
  llm_model_id TEXT,
  llm_temperature DOUBLE PRECISION,
  llm_token_limit BIGINT,
  name TEXT,
  system_prompt TEXT,
  CONSTRAINT pk_n11_labs_agent PRIMARY KEY (agent_id)
);

-- [11 Labs] Agent History  (Foundry apiName: _11LabsAgentHistory)
CREATE TABLE n11_labs_agent_history (
  agent_history_pk TEXT,
  agent_id TEXT,
  created_at_unix_secs BIGINT,
  creator_name TEXT,
  dynamic_variables_json TEXT,
  first_message TEXT,
  language_code TEXT,
  last_updated_at_unix_secs BIGINT,
  llm_model_id TEXT,
  llm_temperature DOUBLE PRECISION,
  llm_token_limit BIGINT,
  name TEXT,
  system_prompt TEXT,
  CONSTRAINT pk_n11_labs_agent_history PRIMARY KEY (agent_history_pk)
);

-- [11 Labs] Agent User Feedback  (Foundry apiName: _11LabsAgentUserFeedback)
CREATE TABLE n11_labs_agent_user_feedback (
  conversation_id TEXT,
  created_at TEXT,
  customer_id TEXT,
  feedback TEXT,
  primary_key TEXT,
  CONSTRAINT pk_n11_labs_agent_user_feedback PRIMARY KEY (primary_key)
);

-- [11 Labs] Agent Workflow Edge  (Foundry apiName: _11LabsAgentWorkflowEdge)
CREATE TABLE n11_labs_agent_workflow_edge (
  agent_id TEXT,
  backward_condition TEXT,
  edge_id TEXT,
  forward_condition TEXT,
  source TEXT,
  target TEXT,
  CONSTRAINT pk_n11_labs_agent_workflow_edge PRIMARY KEY (edge_id)
);

-- [11 Labs] Agent Workflow Node  (Foundry apiName: _11LabsAgentWorkflowNode)
CREATE TABLE n11_labs_agent_workflow_node (
  additional_knowledge_base TEXT,
  additional_prompt TEXT,
  agent_id TEXT,
  eleven_labs_node_id TEXT,
  label TEXT,
  name TEXT,
  node_id TEXT,
  prompt TEXT,
  type TEXT,
  CONSTRAINT pk_n11_labs_agent_workflow_node PRIMARY KEY (node_id)
);

-- [11 Labs] Call Review  (Foundry apiName: _11LabsCallReview)
CREATE TABLE n11_labs_call_review (
  comment TEXT[],
  conversation_id TEXT,
  primary_key TEXT,
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  status TEXT,
  CONSTRAINT pk_n11_labs_call_review PRIMARY KEY (primary_key)
);

-- [11 Labs] Evaluation Criteria  (Foundry apiName: _11LabsEvaluationCriteria)
CREATE TABLE n11_labs_evaluation_criteria (
  agent_id TEXT,
  conversation_id TEXT,
  criteria_id TEXT,
  criteria_name TEXT,
  criteria_rationale TEXT,
  criteria_result TEXT,
  CONSTRAINT pk_n11_labs_evaluation_criteria PRIMARY KEY (criteria_id)
);

-- [11 Labs] Insight Answer  (Foundry apiName: _11LabsInsightAnswer)
CREATE TABLE n11_labs_insight_answer (
  agent_foreign_key TEXT,
  primary_key TEXT,
  answer_text TEXT,
  answered TEXT,
  conversation_foreign_key TEXT,
  question_foreign_key TEXT,
  question_text TEXT,
  quote TEXT,
  sentiment TEXT,
  CONSTRAINT pk_n11_labs_insight_answer PRIMARY KEY (primary_key)
);

-- [11 Labs] Insight Question  (Foundry apiName: _11LabsInsightQuestion)
CREATE TABLE n11_labs_insight_question (
  last_modified_at TIMESTAMPTZ,
  last_modified_by TEXT,
  primary_key TEXT,
  question_text TEXT,
  CONSTRAINT pk_n11_labs_insight_question PRIMARY KEY (primary_key)
);

-- [11 Labs] Insight Queue  (Foundry apiName: _11LabsInsightQueue)
CREATE TABLE n11_labs_insight_queue (
  agent_id TEXT,
  conversation_id TEXT,
  creation_time TIMESTAMPTZ,
  primary_key TEXT,
  status TEXT,
  transcript TEXT,
  CONSTRAINT pk_n11_labs_insight_queue PRIMARY KEY (primary_key)
);

-- [11 Labs] Phone Call  (Foundry apiName: _11LabsPhoneCall)
CREATE TABLE n11_labs_phone_call (
  call_sid TEXT,
  call_title TEXT,
  conversation_id TEXT,
  lead_context_information TEXT,
  lead_email TEXT,
  lead_name TEXT,
  lead_phone_number TEXT,
  primary_key TEXT,
  success BOOLEAN,
  CONSTRAINT pk_n11_labs_phone_call PRIMARY KEY (primary_key)
);

-- [11 Labs] Phone Call Information  (Foundry apiName: _11LabsPhoneCallInformation)
CREATE TABLE n11_labs_phone_call_information (
  agent_history_pk TEXT,
  agent_id TEXT,
  agent_missed_question BOOLEAN,
  branch_id TEXT,
  call_duration_secs INTEGER,
  call_start_timestamp TIMESTAMPTZ,
  call_successful TEXT,
  conversation_id TEXT,
  cost INTEGER,
  data_freshness TIMESTAMPTZ,
  error_code TEXT,
  error_reason TEXT,
  evaluation_criteria_results_criteria_id TEXT,
  evaluation_criteria_results_rationale TEXT,
  evaluation_criteria_results_result TEXT,
  feedback_comment TEXT,
  feedback_dislikes DOUBLE PRECISION,
  feedback_likes DOUBLE PRECISION,
  feedback_overall_score TEXT,
  feedback_rating DOUBLE PRECISION,
  feedback_type TEXT,
  input_cache_read_token_price_usd DOUBLE PRECISION,
  input_cache_read_tokens DOUBLE PRECISION,
  input_token_price_usd DOUBLE PRECISION,
  input_tokens DOUBLE PRECISION,
  lead_email TEXT,
  lead_name TEXT,
  lead_phone_number TEXT,
  llm_question_answers_str TEXT,
  output_token_price_usd DOUBLE PRECISION,
  output_tokens DOUBLE PRECISION,
  polarity TEXT,
  polarity_reasoning TEXT,
  reviewed BOOLEAN,
  start_time_unix_secs BIGINT,
  status TEXT,
  termination_reason TEXT,
  total_usd_llm_price DOUBLE PRECISION,
  full_transcript_text TEXT,
  transcript_summary TEXT,
  features_usage_voicemail_detection_enabled BOOLEAN,
  features_usage_voicemail_detection_used BOOLEAN,
  CONSTRAINT pk_n11_labs_phone_call_information PRIMARY KEY (conversation_id)
);

-- [11 Labs] Transcript Segment  (Foundry apiName: _11LabsTranscriptSegment)
CREATE TABLE n11_labs_transcript_segment (
  conversation_id TEXT,
  label TEXT,
  message TEXT,
  message_english TEXT,
  next_node_id TEXT,
  next_segment_pk TEXT,
  node_id TEXT,
  previous_node_id TEXT,
  previous_segment_pk TEXT,
  review_status TEXT,
  reviewed BOOLEAN,
  role TEXT,
  segment_number INTEGER,
  segment_pk TEXT,
  timestamp TIMESTAMPTZ,
  CONSTRAINT pk_n11_labs_transcript_segment PRIMARY KEY (segment_pk)
);

-- [11 Labs] Transcript Segment Review  (Foundry apiName: _11LabsTranscriptSegmentReview)
CREATE TABLE n11_labs_transcript_segment_review (
  actions_taken TEXT[],
  actions_to_take TEXT[],
  reviewed_at TIMESTAMPTZ,
  reviewed_by TEXT,
  segment_pk TEXT,
  primary_key TEXT,
  segment_review_title TEXT,
  status TEXT,
  wrong_agent_response BOOLEAN,
  wrong_node_transition BOOLEAN,
  wrong_rag_usage BOOLEAN,
  wrong_tool_calling BOOLEAN,
  CONSTRAINT pk_n11_labs_transcript_segment_review PRIMARY KEY (primary_key)
);

-- Agent Prompt [AST]  (Foundry apiName: agentPrompt)
CREATE TABLE agent_prompt (
  content TEXT,
  created_at TIMESTAMPTZ,
  primary_key TEXT,
  prompt_type TEXT,
  updated_at TIMESTAMPTZ,
  CONSTRAINT pk_agent_prompt PRIMARY KEY (primary_key)
);

-- Contact [AST]  (Foundry apiName: contact)
CREATE TABLE contact (
  email TEXT,
  name TEXT,
  note TEXT,
  phone TEXT,
  primary_key TEXT,
  CONSTRAINT pk_contact PRIMARY KEY (primary_key)
);

-- Context [AST]  (Foundry apiName: context)
CREATE TABLE context (
  description TEXT,
  name TEXT,
  primary_key TEXT,
  CONSTRAINT pk_context PRIMARY KEY (primary_key)
);

-- Inbox Item [AST]  (Foundry apiName: inboxItem)
CREATE TABLE inbox_item (
  captured_at TIMESTAMPTZ,
  context_tag TEXT,
  primary_key TEXT,
  raw_content TEXT,
  title TEXT,
  CONSTRAINT pk_inbox_item PRIMARY KEY (primary_key)
);

-- Initiative [AST]  (Foundry apiName: initiative)
CREATE TABLE initiative (
  check_in_next_date DATE,
  completed_at TIMESTAMPTZ,
  context_tag TEXT,
  created_at TIMESTAMPTZ,
  description TEXT,
  due_date DATE,
  primary_key TEXT,
  status TEXT,
  title TEXT,
  CONSTRAINT pk_initiative PRIMARY KEY (primary_key)
);

-- Lead Profile  (Foundry apiName: leadProfilev2)
CREATE TABLE lead_profilev2 (
  contact_id TEXT,
  all_insights_string TEXT,
  pain_duration TEXT,
  past_treatments TEXT[],
  profile_summary TEXT,
  symptoms TEXT[],
  warm_lead_ai_flag BOOLEAN,
  CONSTRAINT pk_lead_profilev2 PRIMARY KEY (contact_id)
);

-- Task [AST]  (Foundry apiName: task)
CREATE TABLE task (
  assignee_user_id TEXT,
  check_in_date DATE,
  completed_at TIMESTAMPTZ,
  context_tag TEXT,
  created_at TIMESTAMPTZ,
  description TEXT,
  due_date DATE,
  primary_key TEXT,
  status TEXT,
  title TEXT,
  CONSTRAINT pk_task PRIMARY KEY (primary_key)
);
