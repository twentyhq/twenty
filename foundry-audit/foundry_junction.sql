-- ==========================================================================
-- Junction tables for Foundry many-to-many link types
-- ==========================================================================

-- cvkdqgky.new-object-type-22bffe-new-object-type-8d5cf8
CREATE TABLE jt_n11_labs_insight_question_n11_labs_insight_queue (
  n11_labs_insight_question_primary_key TEXT NOT NULL,
  n11_labs_insight_queue_primary_key TEXT NOT NULL,
  CONSTRAINT pk_jt_n11_labs_insight_question_n11_labs_insight_queue PRIMARY KEY (n11_labs_insight_question_primary_key, n11_labs_insight_queue_primary_key),
  CONSTRAINT fk_jt_n11_labs_insight_question_n11_labs_insight_queue_n11_labs_insight_question FOREIGN KEY (n11_labs_insight_question_primary_key) REFERENCES n11_labs_insight_question (primary_key),
  CONSTRAINT fk_jt_n11_labs_insight_question_n11_labs_insight_queue_n11_labs_insight_queue FOREIGN KEY (n11_labs_insight_queue_primary_key) REFERENCES n11_labs_insight_queue (primary_key)
);

-- cvkdqgky.id-eb8e5124-f9b3-69b4-43b6-2a748051ebd5
CREATE TABLE jt_subscription_temp_opportunities_for_alerts (
  subscription_subscription_id TEXT NOT NULL,
  temp_opportunities_for_alerts_id TEXT NOT NULL,
  CONSTRAINT pk_jt_subscription_temp_opportunities_for_alerts PRIMARY KEY (subscription_subscription_id, temp_opportunities_for_alerts_id),
  CONSTRAINT fk_jt_subscription_temp_opportunities_for_alerts_subscription FOREIGN KEY (subscription_subscription_id) REFERENCES subscription (subscription_id),
  CONSTRAINT fk_jt_subscription_temp_opportunities_for_alerts_temp_opportunities_for_alerts FOREIGN KEY (temp_opportunities_for_alerts_id) REFERENCES temp_opportunities_for_alerts (id)
);

-- cvkdqgky.subscription-contract
CREATE TABLE jt_contract_subscription (
  contract_contract_id TEXT NOT NULL,
  subscription_subscription_id TEXT NOT NULL,
  CONSTRAINT pk_jt_contract_subscription PRIMARY KEY (contract_contract_id, subscription_subscription_id),
  CONSTRAINT fk_jt_contract_subscription_contract FOREIGN KEY (contract_contract_id) REFERENCES contract (contract_id),
  CONSTRAINT fk_jt_contract_subscription_subscription FOREIGN KEY (subscription_subscription_id) REFERENCES subscription (subscription_id)
);

-- cvkdqgky.id-ba05adff-cd2e-8728-2c3c-3b157ce618c6
CREATE TABLE jt_subscription_temp_opportunities_for_alerts (
  subscription_subscription_id TEXT NOT NULL,
  temp_opportunities_for_alerts_id TEXT NOT NULL,
  CONSTRAINT pk_jt_subscription_temp_opportunities_for_alerts PRIMARY KEY (subscription_subscription_id, temp_opportunities_for_alerts_id),
  CONSTRAINT fk_jt_subscription_temp_opportunities_for_alerts_subscription FOREIGN KEY (subscription_subscription_id) REFERENCES subscription (subscription_id),
  CONSTRAINT fk_jt_subscription_temp_opportunities_for_alerts_temp_opportunities_for_alerts FOREIGN KEY (temp_opportunities_for_alerts_id) REFERENCES temp_opportunities_for_alerts (id)
);

-- cvkdqgky.insight-scope-run-call-insight-question
CREATE TABLE jt_call_insight_question_insight_scope_run (
  call_insight_question_question_id TEXT NOT NULL,
  insight_scope_run_primary_key TEXT NOT NULL,
  CONSTRAINT pk_jt_call_insight_question_insight_scope_run PRIMARY KEY (call_insight_question_question_id, insight_scope_run_primary_key),
  CONSTRAINT fk_jt_call_insight_question_insight_scope_run_call_insight_question FOREIGN KEY (call_insight_question_question_id) REFERENCES call_insight_question (question_id),
  CONSTRAINT fk_jt_call_insight_question_insight_scope_run_insight_scope_run FOREIGN KEY (insight_scope_run_primary_key) REFERENCES insight_scope_run (primary_key)
);

-- cvkdqgky.marketing-campaign-new-object-type-493523
CREATE TABLE jt_n11_labs_phone_call_information_marketing_campaign (
  n11_labs_phone_call_information_conversation_id TEXT NOT NULL,
  marketing_campaign_primary_key TEXT NOT NULL,
  CONSTRAINT pk_jt_n11_labs_phone_call_information_marketing_campaign PRIMARY KEY (n11_labs_phone_call_information_conversation_id, marketing_campaign_primary_key),
  CONSTRAINT fk_jt_n11_labs_phone_call_information_marketing_campaign_n11_labs_phone_call_information FOREIGN KEY (n11_labs_phone_call_information_conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id),
  CONSTRAINT fk_jt_n11_labs_phone_call_information_marketing_campaign_marketing_campaign FOREIGN KEY (marketing_campaign_primary_key) REFERENCES marketing_campaign (primary_key)
);

-- cvkdqgky.zoom-meeting-participant-zoom-chat-message
CREATE TABLE jt_meeting_participation_zoom_1_chat_message_zoom (
  meeting_participation_zoom_1_meetinguuid_partuuids TEXT NOT NULL,
  chat_message_zoom_message_id TEXT NOT NULL,
  CONSTRAINT pk_jt_meeting_participation_zoom_1_chat_message_zoom PRIMARY KEY (meeting_participation_zoom_1_meetinguuid_partuuids, chat_message_zoom_message_id),
  CONSTRAINT fk_jt_meeting_participation_zoom_1_chat_message_zoom_meeting_participation_zoom_1 FOREIGN KEY (meeting_participation_zoom_1_meetinguuid_partuuids) REFERENCES meeting_participation_zoom_1 (meetinguuid_partuuids),
  CONSTRAINT fk_jt_meeting_participation_zoom_1_chat_message_zoom_chat_message_zoom FOREIGN KEY (chat_message_zoom_message_id) REFERENCES chat_message_zoom (message_id)
);

-- cvkdqgky.id-f57de63d-8fbb-f8b7-c219-a05e5a24b739
CREATE TABLE jt_close_connecting_call2_waha_mop_lead (
  close_connecting_call2_custom_field_call_id TEXT NOT NULL,
  waha_mop_lead_waha_lead_id TEXT NOT NULL,
  CONSTRAINT pk_jt_close_connecting_call2_waha_mop_lead PRIMARY KEY (close_connecting_call2_custom_field_call_id, waha_mop_lead_waha_lead_id),
  CONSTRAINT fk_jt_close_connecting_call2_waha_mop_lead_close_connecting_call2 FOREIGN KEY (close_connecting_call2_custom_field_call_id) REFERENCES close_connecting_call2 (custom_field_call_id),
  CONSTRAINT fk_jt_close_connecting_call2_waha_mop_lead_waha_mop_lead FOREIGN KEY (waha_mop_lead_waha_lead_id) REFERENCES waha_mop_lead (waha_lead_id)
);

-- cvkdqgky.id-0ce7962d-cd7b-9189-a935-3e9a6621a7bb
CREATE TABLE jt_contract_temp_opportunities_for_alerts (
  contract_contract_id TEXT NOT NULL,
  temp_opportunities_for_alerts_id TEXT NOT NULL,
  CONSTRAINT pk_jt_contract_temp_opportunities_for_alerts PRIMARY KEY (contract_contract_id, temp_opportunities_for_alerts_id),
  CONSTRAINT fk_jt_contract_temp_opportunities_for_alerts_contract FOREIGN KEY (contract_contract_id) REFERENCES contract (contract_id),
  CONSTRAINT fk_jt_contract_temp_opportunities_for_alerts_temp_opportunities_for_alerts FOREIGN KEY (temp_opportunities_for_alerts_id) REFERENCES temp_opportunities_for_alerts (id)
);

-- cvkdqgky.id-d262b933-1b8a-140a-17f0-13cde6953746
CREATE TABLE jt_temp_opportunities_for_alerts_temp_opportunities_for_alerts (
  temp_opportunities_for_alerts_id TEXT NOT NULL,
  temp_opportunities_for_alerts_id TEXT NOT NULL,
  CONSTRAINT pk_jt_temp_opportunities_for_alerts_temp_opportunities_for_alerts PRIMARY KEY (temp_opportunities_for_alerts_id, temp_opportunities_for_alerts_id),
  CONSTRAINT fk_jt_temp_opportunities_for_alerts_temp_opportunities_for_alerts_temp_opportunities_for_alerts FOREIGN KEY (temp_opportunities_for_alerts_id) REFERENCES temp_opportunities_for_alerts (id),
  CONSTRAINT fk_jt_temp_opportunities_for_alerts_temp_opportunities_for_alerts_temp_opportunities_for_alerts FOREIGN KEY (temp_opportunities_for_alerts_id) REFERENCES temp_opportunities_for_alerts (id)
);

-- cvkdqgky.id-9609089c-c8c3-3102-d91d-471318de1218
CREATE TABLE jt_contract_temp_opportunities_for_alerts (
  contract_contract_id TEXT NOT NULL,
  temp_opportunities_for_alerts_id TEXT NOT NULL,
  CONSTRAINT pk_jt_contract_temp_opportunities_for_alerts PRIMARY KEY (contract_contract_id, temp_opportunities_for_alerts_id),
  CONSTRAINT fk_jt_contract_temp_opportunities_for_alerts_contract FOREIGN KEY (contract_contract_id) REFERENCES contract (contract_id),
  CONSTRAINT fk_jt_contract_temp_opportunities_for_alerts_temp_opportunities_for_alerts FOREIGN KEY (temp_opportunities_for_alerts_id) REFERENCES temp_opportunities_for_alerts (id)
);

-- cvkdqgky.call-insight-question-insight-queue
CREATE TABLE jt_insight_queue_call_insight_question (
  insight_queue_primary_key TEXT NOT NULL,
  call_insight_question_question_id TEXT NOT NULL,
  CONSTRAINT pk_jt_insight_queue_call_insight_question PRIMARY KEY (insight_queue_primary_key, call_insight_question_question_id),
  CONSTRAINT fk_jt_insight_queue_call_insight_question_insight_queue FOREIGN KEY (insight_queue_primary_key) REFERENCES insight_queue (primary_key),
  CONSTRAINT fk_jt_insight_queue_call_insight_question_call_insight_question FOREIGN KEY (call_insight_question_question_id) REFERENCES call_insight_question (question_id)
);

-- cvkdqgky.id-0a3e1bc5-2d71-18b3-3e25-90b4ec82dfc6
CREATE TABLE jt_form_submission_answer_user_media_reference (
  form_submission_answer_form_submission_answer_id TEXT NOT NULL,
  user_media_reference_id TEXT NOT NULL,
  CONSTRAINT pk_jt_form_submission_answer_user_media_reference PRIMARY KEY (form_submission_answer_form_submission_answer_id, user_media_reference_id),
  CONSTRAINT fk_jt_form_submission_answer_user_media_reference_form_submission_answer FOREIGN KEY (form_submission_answer_form_submission_answer_id) REFERENCES form_submission_answer (form_submission_answer_id),
  CONSTRAINT fk_jt_form_submission_answer_user_media_reference_user_media_reference FOREIGN KEY (user_media_reference_id) REFERENCES user_media_reference (id)
);

-- cvkdqgky.id-d3cc75ad-be34-2137-b1b2-62a71785bddc
CREATE TABLE jt_program_app_session (
  program_program_id TEXT NOT NULL,
  app_session_session_id TEXT NOT NULL,
  CONSTRAINT pk_jt_program_app_session PRIMARY KEY (program_program_id, app_session_session_id),
  CONSTRAINT fk_jt_program_app_session_program FOREIGN KEY (program_program_id) REFERENCES program (program_id),
  CONSTRAINT fk_jt_program_app_session_app_session FOREIGN KEY (app_session_session_id) REFERENCES app_session (session_id)
);

-- cvkdqgky.id-de227231-6d38-ff23-0f2c-7fe659c8a9ce
CREATE TABLE jt_customer_customer (
  customer_customer_id TEXT NOT NULL,
  customer_customer_id TEXT NOT NULL,
  CONSTRAINT pk_jt_customer_customer PRIMARY KEY (customer_customer_id, customer_customer_id),
  CONSTRAINT fk_jt_customer_customer_customer FOREIGN KEY (customer_customer_id) REFERENCES customer (customer_id),
  CONSTRAINT fk_jt_customer_customer_customer FOREIGN KEY (customer_customer_id) REFERENCES customer (customer_id)
);
