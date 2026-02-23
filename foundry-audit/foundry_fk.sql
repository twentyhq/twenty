-- ==========================================================================
-- Foreign key constraints from Foundry one-to-many link types
-- ==========================================================================

-- cvkdqgky.form-submissions-v2-customerv2
ALTER TABLE form_submissions_v2 ADD CONSTRAINT fk_form_submissions_v2_email_customer FOREIGN KEY (email) REFERENCES customer (customer_id);

-- cvkdqgky.form-submissions-v2-funnelbox-contact-v2
ALTER TABLE form_submissions_v2 ADD CONSTRAINT fk_form_submissions_v2_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.ghl-form-q-a-id-match
ALTER TABLE ghl_form_qa ADD CONSTRAINT fk_ghl_form_qa_e_mail_id_match FOREIGN KEY (e_mail) REFERENCES id_match (email);

-- cvkdqgky.ghl-form-ghl-form-q-a
ALTER TABLE ghl_form_qa ADD CONSTRAINT fk_ghl_form_qa_form_id_ghl_form FOREIGN KEY (form_id) REFERENCES ghl_form (form_id);

-- cvkdqgky.ghl-form-q-a-funnelbox-contact-v2
ALTER TABLE ghl_form_qa ADD CONSTRAINT fk_ghl_form_qa_ghl_id_funnelbox_contact_v2 FOREIGN KEY (ghl_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.ghl-form-question-ghl-form-q-a
ALTER TABLE ghl_form_qa ADD CONSTRAINT fk_ghl_form_qa_question_id_ghl_form_question FOREIGN KEY (question_id) REFERENCES ghl_form_question (question_id);

-- cvkdqgky.ghl-form-submission-ghl-form-q-a
ALTER TABLE ghl_form_qa ADD CONSTRAINT fk_ghl_form_qa_submission_id_ghl_form_submission FOREIGN KEY (submission_id) REFERENCES ghl_form_submission (submission_id);

-- cvkdqgky.pmf-insight-pmf-app-question
ALTER TABLE pmf_insight ADD CONSTRAINT fk_pmf_insight_question_id_pmf_app_question FOREIGN KEY (question_id) REFERENCES pmf_app_question (id);

-- cvkdqgky.id-e969284c-30f8-3172-b902-dbb90b5e757c
ALTER TABLE structure_analysis_instance ADD CONSTRAINT fk_structure_analysis_instance_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-6c12bed1-d42b-2eed-ce27-ad51e3aa014c
ALTER TABLE structure_analysis_instance ADD CONSTRAINT fk_structure_analysis_instance_user_email_customer FOREIGN KEY (user_email) REFERENCES customer (customer_id);

-- cvkdqgky.id-d1246161-ddf1-a949-ec70-155819b767ae
ALTER TABLE structure_analysis_element ADD CONSTRAINT fk_structure_analysis_element_analysis_id_structure_analysis_in FOREIGN KEY (analysis_id) REFERENCES structure_analysis_instance (analysis_id);

-- cvkdqgky.pmf-insight-pmf-insight-generator
ALTER TABLE pmf_insight ADD CONSTRAINT fk_pmf_insight_insight_generator_id_pmf_insight_generator FOREIGN KEY (insight_generator_id) REFERENCES pmf_insight_generator (id);

-- cvkdqgky.skool-post-skool-post-comment
ALTER TABLE skool_post_comment ADD CONSTRAINT fk_skool_post_comment_post_id_skool_post FOREIGN KEY (post_id) REFERENCES skool_post (post_id);

-- cvkdqgky.skool-member-skool-post
ALTER TABLE skool_post ADD CONSTRAINT fk_skool_post_post_author_user_id_skool_skool_member FOREIGN KEY (post_author_user_id_skool) REFERENCES skool_member (user_id_skool);

-- cvkdqgky.skool-community-skool-post
ALTER TABLE skool_post ADD CONSTRAINT fk_skool_post_community_skool_community FOREIGN KEY (community) REFERENCES skool_community (community);

-- cvkdqgky.id-6f7016e2-678b-ae6a-1fbf-97cd70f201fc
ALTER TABLE foundry_resource_role ADD CONSTRAINT fk_foundry_resource_role_resource_rid_foundry_resource FOREIGN KEY (resource_rid) REFERENCES foundry_resource (rid);

-- cvkdqgky.call-kickscale-lead-kickscale
ALTER TABLE lead_kickscale ADD CONSTRAINT fk_lead_kickscale_call_ids_call_kickscale FOREIGN KEY (call_ids) REFERENCES call_kickscale (call_id);

-- cvkdqgky.speaker-kickscale-call-kickscale
ALTER TABLE speaker_kickscale ADD CONSTRAINT fk_speaker_kickscale_call_id_call_kickscale FOREIGN KEY (call_id) REFERENCES call_kickscale (call_id);

-- cvkdqgky.call-kickscale-insight-kickscale
ALTER TABLE insight_kickscale ADD CONSTRAINT fk_insight_kickscale_call_id_call_kickscale FOREIGN KEY (call_id) REFERENCES call_kickscale (call_id);

-- cvkdqgky.vapi-call-review-vapi-calls
ALTER TABLE vapi_call_review ADD CONSTRAINT fk_vapi_call_review_call_id_vapi_calls FOREIGN KEY (call_id) REFERENCES vapi_calls (id);

-- cvkdqgky.id-301cbd43-3620-7068-6048-ecfdc7cdbe82
ALTER TABLE waha_stream_audio_message_with_transcription ADD CONSTRAINT fk_waha_stream_audio_message_with_transcription_id_waha_message FOREIGN KEY (id) REFERENCES waha_message_no_rv (id);

-- cvkdqgky.id-29b12bb3-ef26-8cb0-895a-1b948f6c78cf
ALTER TABLE waha_edits_no_rv ADD CONSTRAINT fk_waha_edits_no_rv_original_message_id_waha_message_no_rv FOREIGN KEY (original_message_id) REFERENCES waha_message_no_rv (id);

-- cvkdqgky.id-9171914a-61db-690f-472b-b01c6967ad1d
ALTER TABLE waha_message_no_rv ADD CONSTRAINT fk_waha_message_no_rv_conversation_id_waha_conversation FOREIGN KEY (conversation_id) REFERENCES waha_conversation (conversation_id);

-- cvkdqgky.id-319bfc11-eadf-6dda-71c9-608d9af78a55
ALTER TABLE waha_message_no_rv ADD CONSTRAINT fk_waha_message_no_rv_id_waha_image FOREIGN KEY (id) REFERENCES waha_image (id);

-- cvkdqgky.id-209abee5-49a8-6082-a126-1ea50fb1d028
ALTER TABLE audio_message_with_transcription ADD CONSTRAINT fk_audio_message_with_transcription_audio_message_id_waha_messa FOREIGN KEY (audio_message_id) REFERENCES waha_message_no_rv (id);

-- cvkdqgky.id-df46910e-abbb-93f9-2ac6-331d1c3a687e
ALTER TABLE waha_message_deleted_no_rv ADD CONSTRAINT fk_waha_message_deleted_no_rv_original_message_id_waha_message_ FOREIGN KEY (original_message_id) REFERENCES waha_message_no_rv (id);

-- cvkdqgky.new-object-type-c45893-eleven-labs-agent
ALTER TABLE n11_labs_agent_workflow_node ADD CONSTRAINT fk_n11_labs_agent_workflow_node_agent_id_n11_labs_agent FOREIGN KEY (agent_id) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.new-object-type-fb1137-new-object-type-c45893
ALTER TABLE n11_labs_agent_workflow_edge ADD CONSTRAINT fk_n11_labs_agent_workflow_edge_source_n11_labs_agent_workflow_ FOREIGN KEY (source) REFERENCES n11_labs_agent_workflow_node (node_id);

-- cvkdqgky.new-object-type-fb1137-new-object-type-c458931
ALTER TABLE n11_labs_agent_workflow_edge ADD CONSTRAINT fk_n11_labs_agent_workflow_edge_target_n11_labs_agent_workflow_ FOREIGN KEY (target) REFERENCES n11_labs_agent_workflow_node (node_id);

-- cvkdqgky.id-e7e7208d-bc8b-e4ed-b39e-5eed568cb2a3
ALTER TABLE waha_lead_draft ADD CONSTRAINT fk_waha_lead_draft_waha_lead_id_waha_mop_lead FOREIGN KEY (waha_lead_id) REFERENCES waha_mop_lead (waha_lead_id);

-- cvkdqgky.id-f60f84c1-097f-5737-7868-ff22abdc0798
ALTER TABLE waha_lead_draft ADD CONSTRAINT fk_waha_lead_draft_connecting_call_id_close_connecting_call2 FOREIGN KEY (connecting_call_id) REFERENCES close_connecting_call2 (custom_field_call_id);

-- cvkdqgky.zoom-event-session-attendance-id-match
ALTER TABLE zoom_event_session_attendance ADD CONSTRAINT fk_zoom_event_session_attendance_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.zoom-event-session-attendance-funnelbox-contact-v2
ALTER TABLE zoom_event_session_attendance ADD CONSTRAINT fk_zoom_event_session_attendance_fubo_first_id_funnelbox_contac FOREIGN KEY (fubo_first_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.zoom-event-session-attendance-zoom-event-session-mid-2025
ALTER TABLE zoom_event_session_attendance ADD CONSTRAINT fk_zoom_event_session_attendance_session_id_zoom_event_session_ FOREIGN KEY (session_id) REFERENCES zoom_event_session_2 (session_id);

-- cvkdqgky.new-object-type-17c872-new-object-type-8d5cf8
ALTER TABLE n11_labs_insight_answer ADD CONSTRAINT fk_n11_labs_insight_answer_question_foreign_key_n11_labs_insigh FOREIGN KEY (question_foreign_key) REFERENCES n11_labs_insight_question (primary_key);

-- cvkdqgky.call-insight-answer-call-insight-question
ALTER TABLE call_insight_answer ADD CONSTRAINT fk_call_insight_answer_question_id_call_insight_question FOREIGN KEY (question_id) REFERENCES call_insight_question (question_id);

-- cvkdqgky.call-insight-answer-insight-scope-call
ALTER TABLE call_insight_answer ADD CONSTRAINT fk_call_insight_answer_conversation_id_insight_scope_call FOREIGN KEY (conversation_id) REFERENCES insight_scope_call (primary_key);

-- cvkdqgky.call-insight-answer-insight-scope-run
ALTER TABLE call_insight_answer ADD CONSTRAINT fk_call_insight_answer_scope_run_foreign_key_insight_scope_run FOREIGN KEY (scope_run_foreign_key) REFERENCES insight_scope_run (primary_key);

-- cvkdqgky.id-5b039280-1553-18b1-c69f-c8319467598f
ALTER TABLE call_insight_answer ADD CONSTRAINT fk_call_insight_answer_lead_email_id_match FOREIGN KEY (lead_email) REFERENCES id_match (email);

-- cvkdqgky.call-insight-answer-new-object-type-493523
ALTER TABLE call_insight_answer ADD CONSTRAINT fk_call_insight_answer_conversation_id_n11_labs_phone_call_info FOREIGN KEY (conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.id-ff5993ef-0cb1-c9ef-24fc-5d63e9cc6e3f
ALTER TABLE kb_document_chunk ADD CONSTRAINT fk_kb_document_chunk_document_id_kb_document FOREIGN KEY (document_id) REFERENCES kb_document (document_id);

-- cvkdqgky.classified-schmerzfrei-umfrage-unpivotiert-id-match
ALTER TABLE classified_schmerzfrei_umfrage_unpivotiert ADD CONSTRAINT fk_classified_schmerzfrei_umfrage_unpivotiert_e_mail_adresse_id FOREIGN KEY (e_mail_adresse) REFERENCES id_match (email);

-- cvkdqgky.id-2432be3c-c29f-6b03-cfe5-bef17d3f0dc2
ALTER TABLE typed_fact ADD CONSTRAINT fk_typed_fact_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.id-8187f3ca-15fc-c50e-8953-978f99d480a8
ALTER TABLE typed_fact ADD CONSTRAINT fk_typed_fact_source_touchpoint_id_touchpoint_v2_embeddings FOREIGN KEY (source_touchpoint_id) REFERENCES touchpoint_v2_embeddings (primary_key);

-- cvkdqgky.id-299df854-56d3-52ef-7f2e-4196891322c6
ALTER TABLE typed_fact ADD CONSTRAINT fk_typed_fact_email_sales_crm_ausbildung_lead_enriched FOREIGN KEY (email) REFERENCES sales_crm_ausbildung_lead_enriched (email);

-- cvkdqgky.id-77e1d9c0-01cb-9949-cc31-66ba90eb9fe6
ALTER TABLE typed_fact ADD CONSTRAINT fk_typed_fact_source_touchpoint_id_touchpoints_v2_curated FOREIGN KEY (source_touchpoint_id) REFERENCES touchpoints_v2_curated (primary_key);

-- cvkdqgky.log-setup-web-app-user-to-subscription
ALTER TABLE log_setup_web_app_user ADD CONSTRAINT fk_log_setup_web_app_user_subscription_subscription FOREIGN KEY (subscription) REFERENCES subscription (subscription_id);

-- cvkdqgky.subscription-pause-subscription
ALTER TABLE subscription_pause ADD CONSTRAINT fk_subscription_pause_subscription_id_subscription FOREIGN KEY (subscription_id) REFERENCES subscription (subscription_id);

-- cvkdqgky.id-6344ea07-1cc2-8aa4-b3bb-9173c0adf377
ALTER TABLE subscription ADD CONSTRAINT fk_subscription_cohort_slug_cohort FOREIGN KEY (cohort_slug) REFERENCES cohort (cohort_slug);

-- cvkdqgky.subscription-program
ALTER TABLE subscription ADD CONSTRAINT fk_subscription_program_id_program FOREIGN KEY (program_id) REFERENCES program (program_id);

-- cvkdqgky.id-0ec86bda-b52c-df7a-dfe9-c77b51cf14fc
ALTER TABLE session_participation_subscription ADD CONSTRAINT fk_session_participation_subscription_subscription_id_subscript FOREIGN KEY (subscription_id) REFERENCES subscription (subscription_id);

-- cvkdqgky.opportunity-subscription
ALTER TABLE opportunity ADD CONSTRAINT fk_opportunity_subscription_id_subscription FOREIGN KEY (subscription_id) REFERENCES subscription (subscription_id);

-- cvkdqgky.subscription-app-user
ALTER TABLE subscription ADD CONSTRAINT fk_subscription_app_user_id_app_user FOREIGN KEY (app_user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.id-0440c2bb-d864-0073-bec1-1fab8801f72b
ALTER TABLE log_webhook_app_update_subscription_statuses ADD CONSTRAINT fk_log_webhook_app_update_subscription_statuses_subscription_su FOREIGN KEY (subscription) REFERENCES subscription (subscription_id);

-- cvkdqgky.id-445166d8-9bcb-f3d5-8fa7-4f22073c0e6c
ALTER TABLE subscription_module_progress ADD CONSTRAINT fk_subscription_module_progress_subscription_id_subscription FOREIGN KEY (subscription_id) REFERENCES subscription (subscription_id);

-- cvkdqgky.subscription-customerv2
ALTER TABLE subscription ADD CONSTRAINT fk_subscription_customer_id_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id);

-- cvkdqgky.id-9a2a41b9-6fd7-2222-c886-41035a99e11c
ALTER TABLE log_update_subscription_status ADD CONSTRAINT fk_log_update_subscription_status_subscription_subscription FOREIGN KEY (subscription) REFERENCES subscription (subscription_id);

-- cvkdqgky.log-create-subscription-pause-to-subscription
ALTER TABLE log_create_subscription_pause ADD CONSTRAINT fk_log_create_subscription_pause_subscription_subscription FOREIGN KEY (subscription) REFERENCES subscription (subscription_id);

-- cvkdqgky.id-95153c7c-bf80-ab64-de08-2ad318a91fc1
ALTER TABLE zoom_event_session_2 ADD CONSTRAINT fk_zoom_event_session_2_meeting_uuid_zoom_suggested_session_des FOREIGN KEY (meeting_uuid) REFERENCES zoom_suggested_session_description (meeting_uuid);

-- cvkdqgky.vapi-call-transcript-reference-vapi-calls
ALTER TABLE vapi_call_transcript_reference ADD CONSTRAINT fk_vapi_call_transcript_reference_call_id_vapi_calls FOREIGN KEY (call_id) REFERENCES vapi_calls (id);

-- cvkdqgky.insight-scope-call-insight-scope-run
ALTER TABLE insight_scope_call ADD CONSTRAINT fk_insight_scope_call_scope_run_id_insight_scope_run FOREIGN KEY (scope_run_id) REFERENCES insight_scope_run (primary_key);

-- cvkdqgky.zoom-meeting-zoom-summit-transcript
ALTER TABLE zoom_summit_transcipt ADD CONSTRAINT fk_zoom_summit_transcipt_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-video-media-meetings-mid-2025
ALTER TABLE zoom_video_media ADD CONSTRAINT fk_zoom_video_media_recording_meeting_id_meeting_zoom FOREIGN KEY (recording_meeting_id) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-light-chat-message-meetings-mid-2025
ALTER TABLE zoom_light_chat_message ADD CONSTRAINT fk_zoom_light_chat_message_meeting_instance_id_meeting_zoom FOREIGN KEY (meeting_instance_id) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.meeting-transcript-zoom
ALTER TABLE transcript_zoom ADD CONSTRAINT fk_transcript_zoom_download_recording_id_meeting_zoom FOREIGN KEY (download_recording_id) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.meeting-zoom-recording-zoom
ALTER TABLE recording_zoom ADD CONSTRAINT fk_recording_zoom_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-cta-search-meetings-mid-2025
ALTER TABLE zoom_cta_search ADD CONSTRAINT fk_zoom_cta_search_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.id-3713fd1d-6c55-6366-bc6b-a77331c3d494
ALTER TABLE meeting_for_knowledge_base ADD CONSTRAINT fk_meeting_for_knowledge_base_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-meeting-summit-session-chat-participation
ALTER TABLE summit_session_chat_participation ADD CONSTRAINT fk_summit_session_chat_participation_meeting_instance_id_meetin FOREIGN KEY (meeting_instance_id) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.id-bfe0c575-7b57-2aeb-2e6d-0e7bc3b63606
ALTER TABLE complete_survey_text ADD CONSTRAINT fk_complete_survey_text_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-chat-insight-meetings-mid-2025
ALTER TABLE zoom_chat_insight ADD CONSTRAINT fk_zoom_chat_insight_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-audio-media-meetings-mid-2025
ALTER TABLE zoom_audio_media ADD CONSTRAINT fk_zoom_audio_media_recording_meeting_id_meeting_zoom FOREIGN KEY (recording_meeting_id) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-meeting-zoom-meeting-participation
ALTER TABLE meeting_participation_zoom_1 ADD CONSTRAINT fk_meeting_participation_zoom_1_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-stream-chat-message-meetings-mid-2025
ALTER TABLE zoom_stream_chat_message ADD CONSTRAINT fk_zoom_stream_chat_message_object_uuid_meeting_zoom FOREIGN KEY (object_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-event-session-mid-2025-meetings-mid-2025
ALTER TABLE zoom_event_session_2 ADD CONSTRAINT fk_zoom_event_session_2_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-transcript-block-meetings-mid-2025
ALTER TABLE zoom_transcript_block ADD CONSTRAINT fk_zoom_transcript_block_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-meeting-zoom-transcript
ALTER TABLE transcript_zoom ADD CONSTRAINT fk_transcript_zoom_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.meeting-zoom-chat-message
ALTER TABLE chat_message_zoom ADD CONSTRAINT fk_chat_message_zoom_meeting_instance_id_meeting_zoom FOREIGN KEY (meeting_instance_id) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.zoom-transcripts-raw-meetings-mid-2025
ALTER TABLE zoom_transcripts_raw ADD CONSTRAINT fk_zoom_transcripts_raw_meeting_uuid_meeting_zoom FOREIGN KEY (meeting_uuid) REFERENCES meeting_zoom (meeting_uuid);

-- cvkdqgky.insight-call-lead-close
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_closeio_lead_id_lead_close FOREIGN KEY (closeio_lead_id) REFERENCES lead_close (close_lead_id);

-- cvkdqgky.id-128b93c0-eb71-7882-d005-49c7d7fbe486
ALTER TABLE close_transcript ADD CONSTRAINT fk_close_transcript_lead_id_lead_close FOREIGN KEY (lead_id) REFERENCES lead_close (close_lead_id);

-- cvkdqgky.customerv2-lead-close
ALTER TABLE customer ADD CONSTRAINT fk_customer_lead_id_lead_close FOREIGN KEY (lead_id) REFERENCES lead_close (close_lead_id);

-- cvkdqgky.lead-close-call-close
ALTER TABLE call_close ADD CONSTRAINT fk_call_close_close_lead_id_lead_close FOREIGN KEY (close_lead_id) REFERENCES lead_close (close_lead_id);

-- cvkdqgky.lead-close-id-match
ALTER TABLE lead_close ADD CONSTRAINT fk_lead_close_emails_id_match FOREIGN KEY (emails) REFERENCES id_match (email);

-- cvkdqgky.draft-whatsapp-answer-fu-bo-whats-app-message-v2
ALTER TABLE draft_whatsapp_answer ADD CONSTRAINT fk_draft_whatsapp_answer_message_replied_to_whats_app_message_v FOREIGN KEY (message_replied_to) REFERENCES whats_app_message_v4 (message_id);

-- cvkdqgky.draft-whatsapp-answer-whatsapp-draft-generation
ALTER TABLE draft_whatsapp_answer ADD CONSTRAINT fk_draft_whatsapp_answer_generation_id_whatsapp_draft_generatio FOREIGN KEY (generation_id) REFERENCES whatsapp_draft_generation (generation_id);

-- cvkdqgky.draft-whatsapp-answer-funnelbox-contact-v2
ALTER TABLE draft_whatsapp_answer ADD CONSTRAINT fk_draft_whatsapp_answer_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.initiative-task
ALTER TABLE task ADD CONSTRAINT fk_task_primary_key_initiative FOREIGN KEY (primary_key) REFERENCES initiative (primary_key);

-- cvkdqgky.cvkdqgky-insight-type-response-touchpoint
ALTER TABLE insight_type_response ADD CONSTRAINT fk_insight_type_response_touchpoint_id_touchpoint FOREIGN KEY (touchpoint_id) REFERENCES touchpoint (foreign_key);

-- cvkdqgky.zoom-meeting-started-incremental-zoom-messages-incremental
ALTER TABLE zoom_messages_incremental ADD CONSTRAINT fk_zoom_messages_incremental_meeting_instance_id_zoom_meeting_s FOREIGN KEY (meeting_instance_id) REFERENCES zoom_meeting_started_incremental (payload_object_uuid);

-- cvkdqgky.insight-call-close-user
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_closeio_user_id_close_user FOREIGN KEY (closeio_user_id) REFERENCES close_user (id);

-- cvkdqgky.close-transcript-close-user
ALTER TABLE close_transcript ADD CONSTRAINT fk_close_transcript_user_id_close_user FOREIGN KEY (user_id) REFERENCES close_user (id);

-- cvkdqgky.id-9e9e6a1b-2eba-7659-6c92-8ecff6a7c7f9
ALTER TABLE app_module_app_lecture_link ADD CONSTRAINT fk_app_module_app_lecture_link_app_lecture_id_app_lecture FOREIGN KEY (app_lecture_id) REFERENCES app_lecture (app_lecture_id);

-- cvkdqgky.id-28437de3-cd41-d6df-bd04-1ec315b52e85
ALTER TABLE subscription_lecture_progress ADD CONSTRAINT fk_subscription_lecture_progress_app_lecture_id_app_lecture FOREIGN KEY (app_lecture_id) REFERENCES app_lecture (app_lecture_id);

-- cvkdqgky.id-85b59a07-ed7d-722e-f6c7-8120eb2d80ee
ALTER TABLE summit_app_moment ADD CONSTRAINT fk_summit_app_moment_uid_summit_app_user FOREIGN KEY (uid) REFERENCES summit_app_user (uid);

-- cvkdqgky.context-task
ALTER TABLE task ADD CONSTRAINT fk_task_primary_key_context FOREIGN KEY (primary_key) REFERENCES context (primary_key);

-- cvkdqgky.task-contact
ALTER TABLE task ADD CONSTRAINT fk_task_primary_key_contact FOREIGN KEY (primary_key) REFERENCES contact (primary_key);

-- cvkdqgky.id-9c0506b1-7d6b-4e27-f913-62d3a771b49a
ALTER TABLE close_io_task_for_campaign ADD CONSTRAINT fk_close_io_task_for_campaign_campaign_pk_close_io_campaign_cre FOREIGN KEY (campaign_pk) REFERENCES close_io_campaign_creation_job (primary_key);

-- cvkdqgky.id-1bdd107e-71c9-05ba-f5c7-ad8928ca0e17
ALTER TABLE close_io_task_for_campaign ADD CONSTRAINT fk_close_io_task_for_campaign_lead_close_id_close_lead_via_api FOREIGN KEY (lead_close_id) REFERENCES close_lead_via_api (lead_id);

-- cvkdqgky.new-object-type-2d1753-new-object-type-2d1753
ALTER TABLE n11_labs_transcript_segment ADD CONSTRAINT fk_n11_labs_transcript_segment_previous_segment_pk_n11_labs_tra FOREIGN KEY (previous_segment_pk) REFERENCES n11_labs_transcript_segment (segment_pk);

-- cvkdqgky.new-object-type-bb34ae-new-object-type-2d1753
ALTER TABLE n11_labs_transcript_segment_review ADD CONSTRAINT fk_n11_labs_transcript_segment_review_segment_pk_n11_labs_trans FOREIGN KEY (segment_pk) REFERENCES n11_labs_transcript_segment (segment_pk);

-- cvkdqgky.new-object-type-2d1753-new-object-type-493523
ALTER TABLE n11_labs_transcript_segment ADD CONSTRAINT fk_n11_labs_transcript_segment_conversation_id_n11_labs_phone_c FOREIGN KEY (conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.id-423b2f30-ea05-0976-e94f-0fe0276a5b03
ALTER TABLE bulk_contract_creation ADD CONSTRAINT fk_bulk_contract_creation_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.zoom-messages-incremental-zoom-meeting-started-incremental-direct
ALTER TABLE zoom_messages_incremental ADD CONSTRAINT fk_zoom_messages_incremental_meeting_instance_id_zoom_meeting_s FOREIGN KEY (meeting_instance_id) REFERENCES zoom_meeting_started_incremental_direct (payload_object_uuid);

-- cvkdqgky.zoom-stream-chat-message-id-match
ALTER TABLE zoom_stream_chat_message ADD CONSTRAINT fk_zoom_stream_chat_message_sender_email_id_match FOREIGN KEY (sender_email) REFERENCES id_match (email);

-- cvkdqgky.ghl-survey-question-ghl-survey
ALTER TABLE ghl_survey ADD CONSTRAINT fk_ghl_survey_question_ids_ghl_survey_question FOREIGN KEY (question_ids) REFERENCES ghl_survey_question (question_id);

-- cvkdqgky.ghl-survey-question-ghl-survey-q-a
ALTER TABLE ghl_survey_qa ADD CONSTRAINT fk_ghl_survey_qa_question_id_ghl_survey_question FOREIGN KEY (question_id) REFERENCES ghl_survey_question (question_id);

-- cvkdqgky.id-e5916322-320d-d76c-8bf1-6133bcd0fe95
ALTER TABLE bulk_created_submissions ADD CONSTRAINT fk_bulk_created_submissions_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.id-ee6a10ff-ba23-3e6e-a37a-0f51a4a2510b
ALTER TABLE bulk_created_submissions ADD CONSTRAINT fk_bulk_created_submissions_submission_id_contract FOREIGN KEY (submission_id) REFERENCES contract (contract_id);

-- cvkdqgky.id-7a9b41f9-5804-7d43-e7df-f4413a81d4cc
ALTER TABLE bulk_created_submissions ADD CONSTRAINT fk_bulk_created_submissions_bulk_export_job_bulk_export_details FOREIGN KEY (bulk_export_job) REFERENCES bulk_export_details (primary_key);

-- cvkdqgky.id-108b2624-0ffc-c4ab-f883-bd8b6e261f98
ALTER TABLE order ADD CONSTRAINT fk_order_contract_id_contract FOREIGN KEY (contract_id) REFERENCES contract (contract_id);

-- cvkdqgky.order-customerv2
ALTER TABLE order ADD CONSTRAINT fk_order_customer_id_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id);

-- cvkdqgky.id-e08efae7-61b0-50ef-0cfb-b889dd2ef920
ALTER TABLE invoice ADD CONSTRAINT fk_invoice_order_id_order FOREIGN KEY (order_id) REFERENCES order (order_id);

-- cvkdqgky.new-object-type-90b3d0-new-object-type-493523
ALTER TABLE n11_labs_call_review ADD CONSTRAINT fk_n11_labs_call_review_conversation_id_n11_labs_phone_call_inf FOREIGN KEY (conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.new-object-type-22bffe-new-object-type-493523
ALTER TABLE n11_labs_insight_queue ADD CONSTRAINT fk_n11_labs_insight_queue_conversation_id_n11_labs_phone_call_i FOREIGN KEY (conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.new-object-type-17c872-new-object-type-493523
ALTER TABLE n11_labs_insight_answer ADD CONSTRAINT fk_n11_labs_insight_answer_conversation_foreign_key_n11_labs_ph FOREIGN KEY (conversation_foreign_key) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.insight-call-new-object-type-493523
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_conversation_id_n11_labs_phone_call_information FOREIGN KEY (conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.insight-queue-new-object-type-493523
ALTER TABLE insight_queue ADD CONSTRAINT fk_insight_queue_call_foreign_key_n11_labs_phone_call_informati FOREIGN KEY (call_foreign_key) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.new-object-type-493523-eleven-labs-agent
ALTER TABLE n11_labs_phone_call_information ADD CONSTRAINT fk_n11_labs_phone_call_information_agent_id_n11_labs_agent FOREIGN KEY (agent_id) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.new-object-type-493523-eleven-labs-agent-history
ALTER TABLE n11_labs_phone_call_information ADD CONSTRAINT fk_n11_labs_phone_call_information_agent_history_pk_n11_labs_ag FOREIGN KEY (agent_history_pk) REFERENCES n11_labs_agent_history (agent_history_pk);

-- cvkdqgky.new-object-type-ecf7b0-new-object-type-493523
ALTER TABLE n11_labs_evaluation_criteria ADD CONSTRAINT fk_n11_labs_evaluation_criteria_conversation_id_n11_labs_phone_ FOREIGN KEY (conversation_id) REFERENCES n11_labs_phone_call_information (conversation_id);

-- cvkdqgky.insight-kickscale-id-match
ALTER TABLE insight_kickscale ADD CONSTRAINT fk_insight_kickscale_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.whatsapp-draft-generation-whats-app-thread-v2
ALTER TABLE whatsapp_draft_generation ADD CONSTRAINT fk_whatsapp_draft_generation_messages_to_answer_whats_app_threa FOREIGN KEY (messages_to_answer) REFERENCES whats_app_thread_v4 (conversation_id);

-- cvkdqgky.whatsapp-generation-job-queue-whatsapp-draft-generation
ALTER TABLE whatsapp_generation_job_queue ADD CONSTRAINT fk_whatsapp_generation_job_queue_generation_id_whatsapp_draft_g FOREIGN KEY (generation_id) REFERENCES whatsapp_draft_generation (generation_id);

-- cvkdqgky.ghl-form-question-ghl-form
ALTER TABLE ghl_form ADD CONSTRAINT fk_ghl_form_question_ids_ghl_form_question FOREIGN KEY (question_ids) REFERENCES ghl_form_question (question_id);

-- cvkdqgky.close-insight-answer-close-generation-queue
ALTER TABLE close_insight_answer ADD CONSTRAINT fk_close_insight_answer_generation_id_close_generation_queue FOREIGN KEY (generation_id) REFERENCES close_generation_queue (primary_key);

-- cvkdqgky.close-insight-answer-close-insight-question
ALTER TABLE close_insight_answer ADD CONSTRAINT fk_close_insight_answer_question_id_close_insight_question FOREIGN KEY (question_id) REFERENCES close_insight_question (id);

-- cvkdqgky.cvkdqgky-onboarding-tracker-action-item-progress-cvkdqgky-onboarding-tracker-action-item
ALTER TABLE onboarding_tracker_action_item_progress ADD CONSTRAINT fk_onboarding_tracker_action_item_progress_action_id_onboarding FOREIGN KEY (action_id) REFERENCES onboarding_tracker_action_item (action_id);

-- cvkdqgky.cvkdqgky-onboarding-tracker-action-item-progress-cvkdqgky-onboarding-tracker-user
ALTER TABLE onboarding_tracker_action_item_progress ADD CONSTRAINT fk_onboarding_tracker_action_item_progress_email_onboarding_tra FOREIGN KEY (email) REFERENCES onboarding_tracker_user (email);

-- cvkdqgky.cvkdqgky-onboarding-tracker-action-item-progress-cvkdqgky-onboarding-tracker-user-action-matrix
ALTER TABLE onboarding_tracker_action_item_progress ADD CONSTRAINT fk_onboarding_tracker_action_item_progress_progress_id_onboardi FOREIGN KEY (progress_id) REFERENCES onboarding_tracker_user_action_matrix (progress_id);

-- cvkdqgky.zoom-events-zoom-zoom-event-session-1
ALTER TABLE zoom_event_session_2 ADD CONSTRAINT fk_zoom_event_session_2_event_id_zoom_events_zoom_1 FOREIGN KEY (event_id) REFERENCES zoom_events_zoom_1 (event_id);

-- cvkdqgky.zoom-event-session-zoom-survey-question
ALTER TABLE zoom_survey_question ADD CONSTRAINT fk_zoom_survey_question_session_ids_zoom_event_session_2 FOREIGN KEY (session_ids) REFERENCES zoom_event_session_2 (session_id);

-- cvkdqgky.zoom-event-session-zoom-survey-q-a
ALTER TABLE zoom_survey_qa ADD CONSTRAINT fk_zoom_survey_qa_session_id_zoom_event_session_2 FOREIGN KEY (session_id) REFERENCES zoom_event_session_2 (session_id);

-- cvkdqgky.zoom-chat-insight-zoom-cta-search
ALTER TABLE zoom_chat_insight ADD CONSTRAINT fk_zoom_chat_insight_call_to_action_id_zoom_cta_search FOREIGN KEY (call_to_action_id) REFERENCES zoom_cta_search (primary_key);

-- cvkdqgky.id-4e13cb84-17d8-69f9-b894-c2cab0763eb1
ALTER TABLE app_session ADD CONSTRAINT fk_app_session_category_id_app_session_category FOREIGN KEY (category_id) REFERENCES app_session_category (session_category_id);

-- cvkdqgky.id-c0fbd0b4-f5a2-84ec-0b39-62fd1c172ebd
ALTER TABLE session_participation ADD CONSTRAINT fk_session_participation_category_id_app_session_category FOREIGN KEY (category_id) REFERENCES app_session_category (session_category_id);

-- cvkdqgky.session-info-app-event
ALTER TABLE app_event ADD CONSTRAINT fk_app_event_event_id_session_info FOREIGN KEY (event_id) REFERENCES session_info (session_id);

-- cvkdqgky.session-info-session-happened
ALTER TABLE sessions ADD CONSTRAINT fk_sessions_unique_session_id_session_info FOREIGN KEY (unique_session_id) REFERENCES session_info (session_id);

-- cvkdqgky.skool-community-skool-member
ALTER TABLE skool_member ADD CONSTRAINT fk_skool_member_communities_skool_community FOREIGN KEY (communities) REFERENCES skool_community (community);

-- cvkdqgky.skool-member-skool-post-comment
ALTER TABLE skool_post_comment ADD CONSTRAINT fk_skool_post_comment_comment_author_user_id_skool_skool_member FOREIGN KEY (comment_author_user_id_skool) REFERENCES skool_member (user_id_skool);

-- cvkdqgky.part-equipment
ALTER TABLE part ADD CONSTRAINT fk_part_eq_id_equipment FOREIGN KEY (eq_id) REFERENCES equipment (equipment_id);

-- cvkdqgky.jana-draft-funnelbox-contact-v2
ALTER TABLE jana_draft ADD CONSTRAINT fk_jana_draft_target_funnelbox_contact_v2 FOREIGN KEY (target) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-c6752e5b-2bab-31a2-337b-e93e2cd25f1d
ALTER TABLE touchpoint_v2_embeddings ADD CONSTRAINT fk_touchpoint_v2_embeddings_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-4b97de07-4a27-3246-dab1-71282ff25c0e
ALTER TABLE funnelbox_contact_v2 ADD CONSTRAINT fk_funnelbox_contact_v2_email_sales_crm_ausbildung_lead_enriche FOREIGN KEY (email) REFERENCES sales_crm_ausbildung_lead_enriched (email);

-- cvkdqgky.ghl-message-v-2-funnelbox-contact-v2
ALTER TABLE ghl_message_v2 ADD CONSTRAINT fk_ghl_message_v2_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.touchpoints-v2-curated-funnelbox-contact-v2
ALTER TABLE touchpoints_v2_curated ADD CONSTRAINT fk_touchpoints_v2_curated_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-b6d786a3-fedf-b4dd-9319-ddf429c534c2
ALTER TABLE funnelbox_contact_v2 ADD CONSTRAINT fk_funnelbox_contact_v2_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.funnelbox-contact-v2-whats-app-chat-v-2
ALTER TABLE funnelbox_contact_v2 ADD CONSTRAINT fk_funnelbox_contact_v2_id_whats_app_chat_v2 FOREIGN KEY (id) REFERENCES whats_app_chat_v2 (contact_id);

-- cvkdqgky.id-031f76a1-ad04-07ca-9d37-68360239eb3c
ALTER TABLE marketing_offer_participation_daily ADD CONSTRAINT fk_marketing_offer_participation_daily_id_funnelbox_contact_v2 FOREIGN KEY (id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.whats-app-thread-v2-funnelbox-contact-v2
ALTER TABLE whats_app_thread_v4 ADD CONSTRAINT fk_whats_app_thread_v4_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.lead-profile-funnelbox-contact-v2
ALTER TABLE lead_profile ADD CONSTRAINT fk_lead_profile_id_funnelbox_contact_v2 FOREIGN KEY (id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-e17ec6af-d9a2-1e98-b49e-77509fcec304
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_contactv2_uuid_foundry_funnelbox_contact_v2 FOREIGN KEY (contactv2_uuid_foundry) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.funnelbox-email-thread-funnelbox-contact-v2
ALTER TABLE funnelbox_email_thread ADD CONSTRAINT fk_funnelbox_email_thread_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.new-object-type-bc2740-funnelbox-contact-v2
ALTER TABLE lead_mindset_stagesv2 ADD CONSTRAINT fk_lead_mindset_stagesv2_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.sales-alerts-funnelbox-contact-v2
ALTER TABLE sales_alerts ADD CONSTRAINT fk_sales_alerts_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.funnelbox-contact-v2-new-object-type-1505e5
ALTER TABLE funnelbox_contact_v2 ADD CONSTRAINT fk_funnelbox_contact_v2_id_lead_profilev2 FOREIGN KEY (id) REFERENCES lead_profilev2 (contact_id);

-- cvkdqgky.ghl-survey-q-a-funnelbox-contact-v2
ALTER TABLE ghl_survey_qa ADD CONSTRAINT fk_ghl_survey_qa_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.insight-type-response-aggregated-funnelbox-contact-v2
ALTER TABLE insight_type_response_v2 ADD CONSTRAINT fk_insight_type_response_v2_email_funnelbox_contact_v2 FOREIGN KEY (email) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-3d304187-51be-3fa3-7adf-2602df3c8487
ALTER TABLE funnelbox_contact_v2 ADD CONSTRAINT fk_funnelbox_contact_v2_email_customer FOREIGN KEY (email) REFERENCES customer (customer_id);

-- cvkdqgky.id-ce67dcde-1f01-febe-408c-8d12e8f6e3ed
ALTER TABLE structure_analysis_element ADD CONSTRAINT fk_structure_analysis_element_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.funnelbox-video-tracking-funnelbox-contact-v2
ALTER TABLE funnelbox_video_tracking ADD CONSTRAINT fk_funnelbox_video_tracking_email_funnelbox_contact_v2 FOREIGN KEY (email) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.touchpoint-v2-funnelbox-contact-v2
ALTER TABLE touchpoint_v2 ADD CONSTRAINT fk_touchpoint_v2_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.marketing-offer-participation-funnelbox-contact-v2
ALTER TABLE marketing_offer_participation ADD CONSTRAINT fk_marketing_offer_participation_id_funnelbox_contact_v2 FOREIGN KEY (id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.fu-bo-whats-app-message-v2-funnelbox-contact-v2
ALTER TABLE whats_app_message_v4 ADD CONSTRAINT fk_whats_app_message_v4_contact_id_funnelbox_contact_v2 FOREIGN KEY (contact_id) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.id-match-funnelbox-contact-v2
ALTER TABLE id_match ADD CONSTRAINT fk_id_match_ghl_contact_ids_funnelbox_contact_v2 FOREIGN KEY (ghl_contact_ids) REFERENCES funnelbox_contact_v2 (id);

-- cvkdqgky.funnelbox-video-tracking-funnelbox-video
ALTER TABLE funnelbox_video ADD CONSTRAINT fk_funnelbox_video_video_trackings_funnelbox_video_tracking FOREIGN KEY (video_trackings) REFERENCES funnelbox_video_tracking (mariadb_id);

-- cvkdqgky.zoom-contact-zoom-q-a
ALTER TABLE zoom_qa_2 ADD CONSTRAINT fk_zoom_qa_2_email_participant_zoom_1 FOREIGN KEY (email) REFERENCES participant_zoom_1 (email);

-- cvkdqgky.lead-profile-whats-app-chat-v-2
ALTER TABLE lead_profile ADD CONSTRAINT fk_lead_profile_id_whats_app_chat_v2 FOREIGN KEY (id) REFERENCES whats_app_chat_v2 (contact_id);

-- cvkdqgky.marketing-offer-participation-lead-profile
ALTER TABLE marketing_offer_participation ADD CONSTRAINT fk_marketing_offer_participation_id_lead_profile FOREIGN KEY (id) REFERENCES lead_profile (id);

-- cvkdqgky.zoom-survey-question-zoom-survey-q-a
ALTER TABLE zoom_survey_qa ADD CONSTRAINT fk_zoom_survey_qa_question_id_zoom_survey_question FOREIGN KEY (question_id) REFERENCES zoom_survey_question (question_id);

-- cvkdqgky.cvkdqgky-armins-tasks-cvkdqgky-task-kontext-ast
ALTER TABLE armins_tasks ADD CONSTRAINT fk_armins_tasks_context_id_task_kontext_ast FOREIGN KEY (context_id) REFERENCES task_kontext_ast (primary_key);

-- cvkdqgky.lead-to-whatsapp-conversation
ALTER TABLE sales_crm_ausbildung_lead_enriched ADD CONSTRAINT fk_sales_crm_ausbildung_lead_enriched_waha_conversation_id_waha FOREIGN KEY (waha_conversation_id) REFERENCES waha_conversation (conversation_id);

-- cvkdqgky.id-5f8448e8-19fa-d002-5dc7-2c4460829f5b
ALTER TABLE waha_conversation ADD CONSTRAINT fk_waha_conversation_session_name_sales_representative FOREIGN KEY (session_name) REFERENCES sales_representative (user_name);

-- cvkdqgky.id-3b195d44-fed4-7a58-0d74-933c36d41134
ALTER TABLE opportunity_note ADD CONSTRAINT fk_opportunity_note_opportunity_id_opportunity FOREIGN KEY (opportunity_id) REFERENCES opportunity (opportunity_id);

-- cvkdqgky.insight-queue-marketing-campaign
ALTER TABLE insight_queue ADD CONSTRAINT fk_insight_queue_campaign_foreign_key_marketing_campaign FOREIGN KEY (campaign_foreign_key) REFERENCES marketing_campaign (primary_key);

-- cvkdqgky.log-delete-multiple-summit-profile-log-link-type-cvkdqgky-summit-profile
ALTER TABLE log_delete_multiple_summit_profile ADD CONSTRAINT fk_log_delete_multiple_summit_profile_summit_profile_summit_pro FOREIGN KEY (summit_profile) REFERENCES summit_profile (email);

-- cvkdqgky.log-create-summit-profile-from-id-log-link-type-cvkdqgky-summit-profile
ALTER TABLE log_create_summit_profile_from_id ADD CONSTRAINT fk_log_create_summit_profile_from_id_summit_profile_summit_prof FOREIGN KEY (summit_profile) REFERENCES summit_profile (email);

-- cvkdqgky.id-match-cvkdqgky-summit-profile
ALTER TABLE id_match ADD CONSTRAINT fk_id_match_email_summit_profile FOREIGN KEY (email) REFERENCES summit_profile (email);

-- cvkdqgky.ghl-form-submission-ghl-form
ALTER TABLE ghl_form ADD CONSTRAINT fk_ghl_form_submission_ids_ghl_form_submission FOREIGN KEY (submission_ids) REFERENCES ghl_form_submission (submission_id);

-- cvkdqgky.classified-zoom-chats-id-match
ALTER TABLE classified_zoom_chats ADD CONSTRAINT fk_classified_zoom_chats_sender_email_id_match FOREIGN KEY (sender_email) REFERENCES id_match (email);

-- cvkdqgky.ghl-user-whats-app-chat-v2
ALTER TABLE whats_app_chat_v2 ADD CONSTRAINT fk_whats_app_chat_v2_tob_assigned_id_ghl_tob_user_v2 FOREIGN KEY (tob_assigned_id) REFERENCES ghl_tob_user_v2 (id);

-- cvkdqgky.zoom-chat-insight-id-match
ALTER TABLE zoom_chat_insight ADD CONSTRAINT fk_zoom_chat_insight_sender_email_id_match FOREIGN KEY (sender_email) REFERENCES id_match (email);

-- cvkdqgky.ghl-user-id-match
ALTER TABLE ghl_user ADD CONSTRAINT fk_ghl_user_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.zoom-survey-q-a-id-match
ALTER TABLE zoom_survey_qa ADD CONSTRAINT fk_zoom_survey_qa_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.classified-zoom-surveys-2-id-match
ALTER TABLE classified_zoom_surveys ADD CONSTRAINT fk_classified_zoom_surveys_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.classified-whats-app-id-match
ALTER TABLE classified_whats_app ADD CONSTRAINT fk_classified_whats_app_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.id-799d3e5f-dad6-723e-7fa1-8765ea234a42
ALTER TABLE close_lead_via_api ADD CONSTRAINT fk_close_lead_via_api_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.zoom-ticket-mid-2025-id-match
ALTER TABLE zoom_tickets_zoom ADD CONSTRAINT fk_zoom_tickets_zoom_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.id-71f34589-b714-7b2c-3330-1f8fd7b2d1e1
ALTER TABLE lead_typed_facts ADD CONSTRAINT fk_lead_typed_facts_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.email-offer-cohort-id-match
ALTER TABLE email_offer_cohort ADD CONSTRAINT fk_email_offer_cohort_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.schmerzfrei-umfragen-funnelbox-id-match
ALTER TABLE schmerzfrei_umfrage_fu_bo ADD CONSTRAINT fk_schmerzfrei_umfrage_fu_bo_e_mail_adresse_id_match FOREIGN KEY (e_mail_adresse) REFERENCES id_match (email);

-- cvkdqgky.id-ea768597-ace7-4171-9438-e2e2d2136774
ALTER TABLE zoom_meeting_current_attende ADD CONSTRAINT fk_zoom_meeting_current_attende_participant_email_id_match FOREIGN KEY (participant_email) REFERENCES id_match (email);

-- cvkdqgky.id-72070364-fcd8-ce47-8ca6-64b3a48193c7
ALTER TABLE short_lead_profile ADD CONSTRAINT fk_short_lead_profile_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.funnelbox-video-tracking-id-match
ALTER TABLE funnelbox_video_tracking ADD CONSTRAINT fk_funnelbox_video_tracking_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.participant-zoom-mid-2025-id-match
ALTER TABLE participant_zoom_1 ADD CONSTRAINT fk_participant_zoom_1_email_id_match FOREIGN KEY (email) REFERENCES id_match (email);

-- cvkdqgky.id-a2ac2eaf-2022-91a1-f87a-a8c56cbd45b1
ALTER TABLE ki_jana_email_offer_draft ADD CONSTRAINT fk_ki_jana_email_offer_draft_email_address_id_match FOREIGN KEY (email_address) REFERENCES id_match (email);

-- cvkdqgky.log-trigger-summit-profile-creation-log-link-type-id-match
ALTER TABLE log_trigger_summit_profile_creation ADD CONSTRAINT fk_log_trigger_summit_profile_creation_id_match_id_match FOREIGN KEY (id_match) REFERENCES id_match (email);

-- cvkdqgky.chat-message-mid-2025-id-match
ALTER TABLE chat_message_zoom ADD CONSTRAINT fk_chat_message_zoom_sender_email_id_match FOREIGN KEY (sender_email) REFERENCES id_match (email);

-- cvkdqgky.zoom-light-chat-message-id-match
ALTER TABLE zoom_light_chat_message ADD CONSTRAINT fk_zoom_light_chat_message_sender_email_id_match FOREIGN KEY (sender_email) REFERENCES id_match (email);

-- cvkdqgky.id-match-new-object-type-1505e5
ALTER TABLE id_match ADD CONSTRAINT fk_id_match_ghl_contact_ids_lead_profilev2 FOREIGN KEY (ghl_contact_ids) REFERENCES lead_profilev2 (contact_id);

-- cvkdqgky.app-discrepancy-app-user
ALTER TABLE app_discrepancy ADD CONSTRAINT fk_app_discrepancy_app_user_id_app_user FOREIGN KEY (app_user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.session-happened-app-event
ALTER TABLE app_event ADD CONSTRAINT fk_app_event_event_id_sessions FOREIGN KEY (event_id) REFERENCES sessions (unique_session_id);

-- cvkdqgky.recording-zoom-transcript
ALTER TABLE transcript_zoom ADD CONSTRAINT fk_transcript_zoom_meeting_uuid_recording_zoom FOREIGN KEY (meeting_uuid) REFERENCES recording_zoom (meeting_uuid);

-- cvkdqgky.participant-zoom-meeting-participation-zoom
ALTER TABLE meeting_participation_zoom_1 ADD CONSTRAINT fk_meeting_participation_zoom_1_email_participant_zoom_1 FOREIGN KEY (email) REFERENCES participant_zoom_1 (email);

-- cvkdqgky.zoom-meeting-participation-zoom-chat-message
ALTER TABLE chat_message_zoom ADD CONSTRAINT fk_chat_message_zoom_primary_key_sender_meeting_participation_z FOREIGN KEY (primary_key_sender) REFERENCES meeting_participation_zoom_1 (meetinguuid_partuuids);

-- cvkdqgky.zoom-meeting-participation-segment-zoom-meeting-participant
ALTER TABLE meeting_participation_zoom_1 ADD CONSTRAINT fk_meeting_participation_zoom_1_participant_primary_keys_meetin FOREIGN KEY (participant_primary_keys) REFERENCES meeting_participation_segment_zoom_1 (participant_primary_key);

-- cvkdqgky.meeting-participation-zoom-meeting-participation-segment-zoom
ALTER TABLE meeting_participation_segment_zoom_1 ADD CONSTRAINT fk_meeting_participation_segment_zoom_1_participant_primary_key FOREIGN KEY (participant_primary_key) REFERENCES meeting_participation_zoom_1 (meetinguuid_partuuids);

-- cvkdqgky.zoom-user-meeting-participant-zoom-transcript-segment
ALTER TABLE transcript_segment_zoom_1 ADD CONSTRAINT fk_transcript_segment_zoom_1_primary_key_meeting_participation_ FOREIGN KEY (primary_key) REFERENCES meeting_participation_zoom_1 (meetinguuid_partuuids);

-- cvkdqgky.cvkdqgky-onboarding-tracker-user-action-matrix-cvkdqgky-onboarding-tracker-user
ALTER TABLE onboarding_tracker_user_action_matrix ADD CONSTRAINT fk_onboarding_tracker_user_action_matrix_email_onboarding_track FOREIGN KEY (email) REFERENCES onboarding_tracker_user (email);

-- cvkdqgky.id-b9e9e01d-d32c-5061-5d99-6a3435b0be7b
ALTER TABLE app_module_app_lecture_link ADD CONSTRAINT fk_app_module_app_lecture_link_app_module_id_app_module FOREIGN KEY (app_module_id) REFERENCES app_module (app_module_id);

-- cvkdqgky.id-a704c7ba-3777-58b1-f720-e921ab2802c6
ALTER TABLE zoom_transcript_chunks_embedding ADD CONSTRAINT fk_zoom_transcript_chunks_embedding_download_recording_id_trans FOREIGN KEY (download_recording_id) REFERENCES transcript_zoom (download_recording_id);

-- cvkdqgky.email-offer-cohort-new-object-type-1505e5
ALTER TABLE email_offer_cohort ADD CONSTRAINT fk_email_offer_cohort_ghl_contact_ids_lead_profilev2 FOREIGN KEY (ghl_contact_ids) REFERENCES lead_profilev2 (contact_id);

-- cvkdqgky.id-a29fac87-f7d7-3d9e-ea9d-91bbe45f1650
ALTER TABLE close_transcript ADD CONSTRAINT fk_close_transcript_lead_id_close_lead_via_api FOREIGN KEY (lead_id) REFERENCES close_lead_via_api (lead_id);

-- cvkdqgky.id-632b8586-f892-31c2-1bef-3e92c5be6d48
ALTER TABLE note_for_high_quality_close_leads ADD CONSTRAINT fk_note_for_high_quality_close_leads_close_lead_id_close_lead_v FOREIGN KEY (close_lead_id) REFERENCES close_lead_via_api (lead_id);

-- cvkdqgky.id-1352eebc-5e5d-544c-049e-13daeb3a4a9f
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_campaign_close_io_smart_view_creation_job FOREIGN KEY (campaign) REFERENCES close_io_smart_view_creation_job (primary_key);

-- cvkdqgky.zoom-events-zoom-zoom-tickets-zoom-1
ALTER TABLE zoom_tickets_zoom ADD CONSTRAINT fk_zoom_tickets_zoom_event_id_zoom_events_zoom_1 FOREIGN KEY (event_id) REFERENCES zoom_events_zoom_1 (event_id);

-- cvkdqgky.zoom-events-zoom-zoom-ticket
ALTER TABLE zoom_tickets_zoom ADD CONSTRAINT fk_zoom_tickets_zoom_event_id_zoom_events_zoom_1 FOREIGN KEY (event_id) REFERENCES zoom_events_zoom_1 (event_id);

-- cvkdqgky.zoom-chat-insight-chat-message-mid-2025
ALTER TABLE zoom_chat_insight ADD CONSTRAINT fk_zoom_chat_insight_chat_message_id_chat_message_zoom FOREIGN KEY (chat_message_id) REFERENCES chat_message_zoom (message_id);

-- cvkdqgky.call-insight-answer-aggregated-call-insight-question
ALTER TABLE call_insight_answer_aggregated ADD CONSTRAINT fk_call_insight_answer_aggregated_question_id_call_insight_ques FOREIGN KEY (question_id) REFERENCES call_insight_question (question_id);

-- cvkdqgky.insight-type-response-aggregated-cvkdqgky-question
ALTER TABLE insight_type_response_v2 ADD CONSTRAINT fk_insight_type_response_v2_insight_type_id_insight_type FOREIGN KEY (insight_type_id) REFERENCES insight_type (id);

-- cvkdqgky.cvkdqgky-insight-type-response-cvkdqgky-question
ALTER TABLE insight_type_response ADD CONSTRAINT fk_insight_type_response_insight_type_id_insight_type FOREIGN KEY (insight_type_id) REFERENCES insight_type (id);

-- cvkdqgky.id-247f6d3f-c285-ec7e-1c47-fb0dc1784816
ALTER TABLE summit_app_video_watch_data ADD CONSTRAINT fk_summit_app_video_watch_data_uid_summit_app_user FOREIGN KEY (uid) REFERENCES summit_app_user (uid);

-- cvkdqgky.id-81c50dc8-6f11-d4be-f4ad-5130583d3d19
ALTER TABLE summit_app_mindset ADD CONSTRAINT fk_summit_app_mindset_uid_summit_app_user FOREIGN KEY (uid) REFERENCES summit_app_user (uid);

-- cvkdqgky.id-8df6c325-f022-a002-a9a5-146a0aaf79d2
ALTER TABLE summit_app_daily_survey_answer ADD CONSTRAINT fk_summit_app_daily_survey_answer_user_id_summit_app_user FOREIGN KEY (user_id) REFERENCES summit_app_user (uid);

-- cvkdqgky.participant-zoom-meeting-participation-segment-zoom-1
ALTER TABLE meeting_participation_segment_zoom_1 ADD CONSTRAINT fk_meeting_participation_segment_zoom_1_participant_primary_key FOREIGN KEY (participant_primary_key) REFERENCES participant_zoom_1 (email);

-- cvkdqgky.fu-bo-whats-app-message-v2-whats-app-thread-v2
ALTER TABLE whats_app_message_v4 ADD CONSTRAINT fk_whats_app_message_v4_conversation_id_whats_app_thread_v4 FOREIGN KEY (conversation_id) REFERENCES whats_app_thread_v4 (conversation_id);

-- cvkdqgky.insight-call-close-transcript
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_conversation_id_close_transcript FOREIGN KEY (conversation_id) REFERENCES close_transcript (call_id);

-- cvkdqgky.id-2d122d78-e7c5-a980-67a5-b9e7af11dc47
ALTER TABLE close_transcript ADD CONSTRAINT fk_close_transcript_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.id-0c638601-b0b9-f661-670d-923606711127
ALTER TABLE close_call_transcript_chunks_embbeding ADD CONSTRAINT fk_close_call_transcript_chunks_embbeding_call_id_close_transcr FOREIGN KEY (call_id) REFERENCES close_transcript (call_id);

-- cvkdqgky.product-module-product-lecture
ALTER TABLE product_lecture ADD CONSTRAINT fk_product_lecture_zuordnung_modul_id_product_module FOREIGN KEY (zuordnung_modul_id) REFERENCES product_module (modul_id);

-- cvkdqgky.id-8aaa7718-c1f8-d084-a363-e8501e7b7b87
ALTER TABLE funnelbox_email_thread ADD CONSTRAINT fk_funnelbox_email_thread_contact_email_customer FOREIGN KEY (contact_email) REFERENCES customer (customer_id);

-- cvkdqgky.ghl-message-v-2-funnelbox-email-thread
ALTER TABLE ghl_message_v2 ADD CONSTRAINT fk_ghl_message_v2_thread_id_funnelbox_email_thread FOREIGN KEY (thread_id) REFERENCES funnelbox_email_thread (thread_id);

-- cvkdqgky.cvkdqgky-armins-tasks-cvkdqgky-initiative-ast
ALTER TABLE armins_tasks ADD CONSTRAINT fk_armins_tasks_task_initiative_initiative_ast FOREIGN KEY (task_initiative) REFERENCES initiative_ast (primary_key);

-- cvkdqgky.id-9e3ca5ab-6c03-c6bc-5d85-eb074166ed2c
ALTER TABLE invoice_debt_collection_actions ADD CONSTRAINT fk_invoice_debt_collection_actions_invoice_id_invoice FOREIGN KEY (invoice_id) REFERENCES invoice (invoice_id);

-- cvkdqgky.id-5b880e9d-5ac1-c750-1a43-ff67175ad1f3
ALTER TABLE invoice_comment ADD CONSTRAINT fk_invoice_comment_invoice_id_invoice FOREIGN KEY (invoice_id) REFERENCES invoice (invoice_id);

-- cvkdqgky.invoice-customerv2
ALTER TABLE invoice ADD CONSTRAINT fk_invoice_customer_id_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id);

-- cvkdqgky.id-07e2ff67-47a4-ddd3-cdd1-e1f3bc09ec74
ALTER TABLE invoice_reminder ADD CONSTRAINT fk_invoice_reminder_kb_invoice_id_invoice FOREIGN KEY (kb_invoice_id) REFERENCES invoice (invoice_id);

-- cvkdqgky.product-lecture-product-session-type
ALTER TABLE product_session_type ADD CONSTRAINT fk_product_session_type_session_id_product_lecture FOREIGN KEY (session_id) REFERENCES product_lecture (lektion_id);

-- cvkdqgky.ticket-fluent-ticket-response-fluent
ALTER TABLE ticket_activity_fluent ADD CONSTRAINT fk_ticket_activity_fluent_ticket_id_ticket_fluent FOREIGN KEY (ticket_id) REFERENCES ticket_fluent (ticket_id);

-- cvkdqgky.log-fluent-api-respond-ticket-log-link-type-ticket-response-fluent
ALTER TABLE log_fluent_api_respond_ticket ADD CONSTRAINT fk_log_fluent_api_respond_ticket_ticket_response_fluent_ticket_ FOREIGN KEY (ticket_response_fluent) REFERENCES ticket_activity_fluent (response_id);

-- cvkdqgky.cvkdqgky-onboarding-tracker-user-action-matrix-cvkdqgky-onboarding-tracker-action-item
ALTER TABLE onboarding_tracker_user_action_matrix ADD CONSTRAINT fk_onboarding_tracker_user_action_matrix_action_id_onboarding_t FOREIGN KEY (action_id) REFERENCES onboarding_tracker_action_item (action_id);

-- cvkdqgky.id-c1c1f50f-9470-4798-8869-c81a9ed23baf
ALTER TABLE session_participation_subscription ADD CONSTRAINT fk_session_participation_subscription_session_id_app_session FOREIGN KEY (session_id) REFERENCES app_session (session_id);

-- cvkdqgky.id-f29f1981-5748-b31f-090e-6facf9e9d6df
ALTER TABLE session_participation_subscription ADD CONSTRAINT fk_session_participation_subscription_session_participation_id_ FOREIGN KEY (session_participation_id) REFERENCES session_participation (session_participation_id);

-- cvkdqgky.customer-opportunities
ALTER TABLE opportunity ADD CONSTRAINT fk_opportunity_customer_id_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id);

-- cvkdqgky.opportunity-contract
ALTER TABLE opportunity ADD CONSTRAINT fk_opportunity_contract_id_contract FOREIGN KEY (contract_id) REFERENCES contract (contract_id);

-- cvkdqgky.id-017a8c3b-a252-239c-d666-5a3b17b6b3a7
ALTER TABLE log_update_opportunity ADD CONSTRAINT fk_log_update_opportunity_opportunity_opportunity FOREIGN KEY (opportunity) REFERENCES opportunity (opportunity_id);

-- cvkdqgky.id-c5630d13-6645-0ef3-582e-cc993f74a68f
ALTER TABLE short_lead_profile ADD CONSTRAINT fk_short_lead_profile_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.marketing-offer-participation-marketing-offer
ALTER TABLE marketing_offer_participation ADD CONSTRAINT fk_marketing_offer_participation_marketing_offer_id_marketing_o FOREIGN KEY (marketing_offer_id) REFERENCES marketing_offer (marketing_offer_id);

-- cvkdqgky.id-fd0694e4-4b03-b60c-deb8-d53a870d6a02
ALTER TABLE marketing_offer_participation ADD CONSTRAINT fk_marketing_offer_participation_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.id-dd0d31f6-d0fe-09ae-bf5e-99470db260e3
ALTER TABLE marketing_offer_participation ADD CONSTRAINT fk_marketing_offer_participation_email_sales_crm_ausbildung_lea FOREIGN KEY (email) REFERENCES sales_crm_ausbildung_lead_enriched (email);

-- cvkdqgky.id-522f44c5-0d0a-0b34-0735-c90bd29e3296
ALTER TABLE summit_app_daily_survey_answer ADD CONSTRAINT fk_summit_app_daily_survey_answer_question_id_summit_app_daily_ FOREIGN KEY (question_id) REFERENCES summit_app_daily_survey_question (question_id);

-- cvkdqgky.cvkdqgky-armins-tasks-cvkdqgky-armins-tasks-contacts
ALTER TABLE armins_tasks ADD CONSTRAINT fk_armins_tasks_primary_key_armins_tasks_contacts FOREIGN KEY (primary_key) REFERENCES armins_tasks_contacts (primary_key);

-- cvkdqgky.zoom-transcript-zoom-transcript-segment
ALTER TABLE transcript_segment_zoom_1 ADD CONSTRAINT fk_transcript_segment_zoom_1_recording_id_transcript_zoom FOREIGN KEY (recording_id) REFERENCES transcript_zoom (download_recording_id);

-- cvkdqgky.id-334cfb93-dfe6-1cb9-3499-c42b1c889a64
ALTER TABLE program_app_module_link ADD CONSTRAINT fk_program_app_module_link_app_module_id_app_module FOREIGN KEY (app_module_id) REFERENCES app_module (app_module_id);

-- cvkdqgky.id-fb914590-08ab-5933-6f04-c82f3715263b
ALTER TABLE program_app_module_link ADD CONSTRAINT fk_program_app_module_link_program_id_program FOREIGN KEY (program_id) REFERENCES program (program_id);

-- cvkdqgky.id-0d1c3c33-8b68-c0e6-dd35-43d9bea7879e
ALTER TABLE subscription_module_progress ADD CONSTRAINT fk_subscription_module_progress_app_module_id_app_module FOREIGN KEY (app_module_id) REFERENCES app_module (app_module_id);

-- cvkdqgky.id-6b5de61b-bdec-f704-18e9-2b2e55977282
ALTER TABLE subscription_lecture_progress ADD CONSTRAINT fk_subscription_lecture_progress_subscription_module_progress_i FOREIGN KEY (subscription_module_progress_id) REFERENCES subscription_module_progress (subscription_module_progress_id);

-- cvkdqgky.vapi-calls-vapi-assistants-latest
ALTER TABLE vapi_calls ADD CONSTRAINT fk_vapi_calls_assistant_id_vapi_assistants_latest FOREIGN KEY (assistant_id) REFERENCES vapi_assistants_latest (id);

-- cvkdqgky.reason-to-call-per-touchpoint-touchpoints-v2-curated
ALTER TABLE reason_to_call_per_touchpoint ADD CONSTRAINT fk_reason_to_call_per_touchpoint_primary_key_touchpoints_v2_cur FOREIGN KEY (primary_key) REFERENCES touchpoints_v2_curated (primary_key);

-- cvkdqgky.eleven-labs-agent-history-eleven-labs-agent
ALTER TABLE n11_labs_agent_history ADD CONSTRAINT fk_n11_labs_agent_history_agent_id_n11_labs_agent FOREIGN KEY (agent_id) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.id-5ed6f465-7528-16f1-1ddf-167590aeb962
ALTER TABLE user_media_reference ADD CONSTRAINT fk_user_media_reference_ticket_id_ticket_fluent FOREIGN KEY (ticket_id) REFERENCES ticket_fluent (ticket_id);

-- cvkdqgky.id-7fc033fb-5366-ad0b-0ecb-6ad56074cdb6
ALTER TABLE ticket_fluent ADD CONSTRAINT fk_ticket_fluent_customer_app_user_id_app_user FOREIGN KEY (customer_app_user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.id-7a731db3-c485-fb62-abed-202aac0dadc3
ALTER TABLE ticket_fluent ADD CONSTRAINT fk_ticket_fluent_customer_email_customer FOREIGN KEY (customer_email) REFERENCES customer (customer_id);

-- cvkdqgky.ghl-survey-q-a-ghl-survey-submission
ALTER TABLE ghl_survey_submission ADD CONSTRAINT fk_ghl_survey_submission_qa_ids_ghl_survey_qa FOREIGN KEY (qa_ids) REFERENCES ghl_survey_qa (qa_id);

-- cvkdqgky.ghl-survey-ghl-survey-q-a
ALTER TABLE ghl_survey_qa ADD CONSTRAINT fk_ghl_survey_qa_form_id_ghl_survey FOREIGN KEY (form_id) REFERENCES ghl_survey (form_id);

-- cvkdqgky.id-29bcc491-9fb4-6208-5ec8-c94f36b2fbc7
ALTER TABLE sales_crm_ausbildung_lead_enriched ADD CONSTRAINT fk_sales_crm_ausbildung_lead_enriched_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.id-bc9afb24-f6b9-1ff7-ce32-c8c52194d26d
ALTER TABLE touchpoint_v2_embeddings ADD CONSTRAINT fk_touchpoint_v2_embeddings_email_lead_typed_facts FOREIGN KEY (email) REFERENCES lead_typed_facts (email);

-- cvkdqgky.id-57f64743-baad-a2a3-e810-369427bb73bd
ALTER TABLE form_submission_answer ADD CONSTRAINT fk_form_submission_answer_form_submission_id_form_submission FOREIGN KEY (form_submission_id) REFERENCES form_submission (form_submission_id);

-- cvkdqgky.whatsapp-generation-job-queue-whats-app-thread-v2
ALTER TABLE whatsapp_generation_job_queue ADD CONSTRAINT fk_whatsapp_generation_job_queue_thread_to_answer_whats_app_thr FOREIGN KEY (thread_to_answer) REFERENCES whats_app_thread_v4 (conversation_id);

-- cvkdqgky.id-601b2fdf-dda1-66ca-9c0a-a0b6564314d4
ALTER TABLE log_assign_lead_to_waha_conversation ADD CONSTRAINT fk_log_assign_lead_to_waha_conversation_id_41658b15_33ed_995a_9 FOREIGN KEY (id_41658b15_33ed_995a_9db2_7a094b251336) REFERENCES sales_crm_ausbildung_lead_enriched (email);

-- cvkdqgky.id-e8e4ab06-368e-5782-c80c-14f322bf4f3b
ALTER TABLE session_participation ADD CONSTRAINT fk_session_participation_session_id_app_session FOREIGN KEY (session_id) REFERENCES app_session (session_id);

-- cvkdqgky.id-bd34f25f-be72-f96e-1ec0-664ca55b92d2
ALTER TABLE foundry_resource_alert ADD CONSTRAINT fk_foundry_resource_alert_rid_foundry_resource FOREIGN KEY (rid) REFERENCES foundry_resource (rid);

-- cvkdqgky.id-9001346d-3d86-3237-8129-c820882118b5
ALTER TABLE touchpoints_v2_curated ADD CONSTRAINT fk_touchpoints_v2_curated_primary_key_touchpoint_v2_embeddings FOREIGN KEY (primary_key) REFERENCES touchpoint_v2_embeddings (primary_key);

-- cvkdqgky.id-8bcbd0f8-9e89-72eb-0979-50c89c0d07ea
ALTER TABLE session_participation ADD CONSTRAINT fk_session_participation_user_id_app_user FOREIGN KEY (user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.id-7b71e663-abd0-c67d-b115-68d764070ffa
ALTER TABLE user_media_reference ADD CONSTRAINT fk_user_media_reference_app_user_id_app_user FOREIGN KEY (app_user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.customerv2-app-user
ALTER TABLE customer ADD CONSTRAINT fk_customer_app_user_id_app_user FOREIGN KEY (app_user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.id-2444353d-50c9-8371-4862-160ed7488f71
ALTER TABLE form_submission ADD CONSTRAINT fk_form_submission_user_id_app_user FOREIGN KEY (user_id) REFERENCES app_user (app_user_id);

-- cvkdqgky.insight-call-eleven-labs-agent
ALTER TABLE insight_call ADD CONSTRAINT fk_insight_call_elevenlabs_agent_id_n11_labs_agent FOREIGN KEY (elevenlabs_agent_id) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.insight-scope-call-insight-call
ALTER TABLE insight_scope_call ADD CONSTRAINT fk_insight_scope_call_conversation_id_insight_call FOREIGN KEY (conversation_id) REFERENCES insight_call (primary_key);

-- cvkdqgky.jana-draft-ghl-message-v-2
ALTER TABLE jana_draft ADD CONSTRAINT fk_jana_draft_foreign_key_ghl_message_v2 FOREIGN KEY (foreign_key) REFERENCES ghl_message_v2 (mariadb_id);

-- cvkdqgky.id-3d518eaa-80b2-4fae-7b6d-af41c9c0673d
ALTER TABLE close_connecting_call2 ADD CONSTRAINT fk_close_connecting_call2_activity_user_id_sales_agent FOREIGN KEY (activity_user_id) REFERENCES sales_agent (close_user_id);

-- cvkdqgky.ghl-survey-ghl-survey-submission
ALTER TABLE ghl_survey_submission ADD CONSTRAINT fk_ghl_survey_submission_form_id_ghl_survey FOREIGN KEY (form_id) REFERENCES ghl_survey (form_id);

-- cvkdqgky.id-d9cde716-1db9-6b44-ef9a-f972afc765ec
ALTER TABLE foundry_resource_daily_cost ADD CONSTRAINT fk_foundry_resource_daily_cost_resource_rid_foundry_resource FOREIGN KEY (resource_rid) REFERENCES foundry_resource (rid);

-- cvkdqgky.new-object-type-17c872-eleven-labs-agent1
ALTER TABLE n11_labs_insight_answer ADD CONSTRAINT fk_n11_labs_insight_answer_agent_foreign_key_n11_labs_agent FOREIGN KEY (agent_foreign_key) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.new-object-type-17c872-eleven-labs-agent
ALTER TABLE n11_labs_insight_answer ADD CONSTRAINT fk_n11_labs_insight_answer_agent_foreign_key_n11_labs_agent FOREIGN KEY (agent_foreign_key) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.id-21e720c3-f0ea-76c5-4a8b-061c6650ffc0
ALTER TABLE ghl_message_v2 ADD CONSTRAINT fk_ghl_message_v2_contact_email_customer FOREIGN KEY (contact_email) REFERENCES customer (customer_id);

-- cvkdqgky.new-object-type-fb1137-eleven-labs-agent
ALTER TABLE n11_labs_agent_workflow_edge ADD CONSTRAINT fk_n11_labs_agent_workflow_edge_agent_id_n11_labs_agent FOREIGN KEY (agent_id) REFERENCES n11_labs_agent (agent_id);

-- cvkdqgky.contract-program
ALTER TABLE contract ADD CONSTRAINT fk_contract_program_id_program FOREIGN KEY (program_id) REFERENCES program (program_id);

-- cvkdqgky.contract-first-subscription
ALTER TABLE contract ADD CONSTRAINT fk_contract_first_subscription_contract_id_contract FOREIGN KEY (first_subscription_contract_id) REFERENCES contract (contract_id);

-- cvkdqgky.contract-customerv2
ALTER TABLE contract ADD CONSTRAINT fk_contract_customer_id_customer FOREIGN KEY (customer_id) REFERENCES customer (customer_id);

-- cvkdqgky.id-1245f285-b2c8-6dc2-8d53-d837983f8348
ALTER TABLE structure_analysis_element ADD CONSTRAINT fk_structure_analysis_element_user_email_customer FOREIGN KEY (user_email) REFERENCES customer (customer_id);
