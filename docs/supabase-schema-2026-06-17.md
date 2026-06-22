# Supabase Schema — All Tables and Columns

**Date**: 2026-06-17
**Project**: rahyvpnjpkgukepefrur
**Tables**: 67 public

---

## accounting_sync_events

| Column | Type |
|---|---|
| `id` | string |
| `provider` | string |
| `entity_type` | string |
| `entity_id` | string |
| `action` | string |
| `status` | string |
| `provider_entity_type` | string |
| `provider_entity_id` | string |
| `request_payload` | jsonb |
| `response_payload` | jsonb |
| `error_message` | string |
| `attempt_count` | integer |
| `last_attempt_at` | string |
| `synced_at` | string |
| `created_at` | string |
| `updated_at` | string |

## affiliate_attributions

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `affiliate_id` | string |
| `chain_snapshot` | jsonb |
| `created_at` | string |
| `plan_snapshot` | jsonb |
| `tracking_code` | string |

## affiliate_click_events

| Column | Type |
|---|---|
| `id` | string |
| `affiliate_id` | string |
| `tracking_code` | string |
| `page_url` | string |
| `referrer` | string |
| `ip_address` | string |
| `user_agent` | string |
| `fingerprint` | string |
| `is_suspicious` | boolean |
| `metadata` | jsonb |
| `created_at` | string |

## affiliate_clicks

| Column | Type |
|---|---|
| `id` | string |
| `affiliate_id` | string |
| `page_url` | string |
| `referrer` | string |
| `created_at` | string |
| `user_agent` | string |
| `ip_hash` | string |
| `session_id` | string |

## affiliate_payouts

| Column | Type |
|---|---|
| `id` | string |
| `affiliate_id` | string |
| `order_id` | string |
| `level` | integer |
| `amount_cents` | integer |
| `status` | string |
| `paid_at` | string |
| `created_at` | string |

## affiliates

| Column | Type |
|---|---|
| `id` | string |
| `user_id` | string |
| `email` | string |
| `name` | string |
| `tracking_code` | string |
| `parent_id` | string |
| `commission_plan_id` | string |
| `payout_details` | jsonb |
| `status` | string |
| `social_handle` | string |
| `audience_size` | string |
| `reason` | string |
| `created_at` | string |
| `account_type` | string |
| `rank` | string |
| `paid_as_rank` | string |
| `career_rank` | string |
| `enterprise_level` | integer |
| `active_customer_count` | integer |
| `personal_volume_cents` | integer |
| `team_volume_cents` | integer |
| `enrollment_count` | integer |
| `kit_enrollment_count_30d` | integer |
| `group_cv_30d` | integer |
| `custom_slug` | string |
| `participation_tier` | string |
| `show_peptides_link` | boolean |
| `elite_qualified_at` | string |
| `elite_qualification_source` | string |
| `elite_promo_window_ends_at` | string |
| `elite_last_maintained_period` | string |
| `monthly_pv_cv_cents` | integer |
| `monthly_gv_cv_cents` | integer |
| `personal_customer_count` | integer |
| `can_enroll_wholesale` | boolean |
| `wholesale_slug` | string |
| `wholesale_volume_cents` | integer |
| `rank_override` | string |
| `rank_override_until` | string |
| `converted_to_ambassador_at` | string |
| `conversion_source` | string |
| `signup_session_id` | string |
| `reparent_locked` | boolean |
| `phone` | string |
| `needs_sponsor_review` | boolean |

## ambassador_milestone_awards

| Column | Type |
|---|---|
| `id` | string |
| `ambassador_id` | string |
| `milestone_code` | string |
| `qualifying_period` | string |
| `gv_cv_cents` | integer |
| `bonus_amount_cents` | integer |
| `ledger_entry_id` | string |
| `paid_at` | string |
| `created_at` | string |

## attribution_failures

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `email` | string |
| `ref_code` | string |
| `attribution_source` | string |
| `reason` | string |
| `error_message` | string |
| `resolved` | boolean |
| `created_at` | string |

## commission_config_versions

| Column | Type |
|---|---|
| `id` | string |
| `effective_start_date` | string |
| `effective_end_date` | string |
| `commissionable_rate` | number |
| `fast_start_enabled` | boolean |
| `fast_start_full_threshold_cents` | integer |
| `fast_start_full_l1_pct` | number |
| `fast_start_full_l2_pct` | number |
| `fast_start_full_l3_pct` | number |
| `fast_start_limited_l1_pct` | number |
| `fast_start_limited_l2_pct` | number |
| `fast_start_limited_l3_pct` | number |
| `fast_start_unlock_enrollment_count` | integer |
| `fast_start_cap_pct` | number |
| `fast_start_compression_mode` | string |
| `fast_start_l1_pct` | number |
| `fast_start_l2_pct` | number |
| `fast_start_l3_pct` | number |
| `accelerator_enabled` | boolean |
| `accelerator_bonus_cents` | integer |
| `accelerator_enrollment_count` | integer |
| `accelerator_require_kit` | boolean |
| `accelerator_min_group_cv_cents` | integer |
| `accelerator_window_days` | integer |
| `ongoing_enabled` | boolean |
| `ongoing_l1_pct` | number |
| `ongoing_l2_pct` | number |
| `ongoing_l3_pct` | number |
| `personal_sub_enabled` | boolean |
| `personal_sub_tier1_customers` | integer |
| `personal_sub_tier1_volume_cents` | integer |
| `personal_sub_tier1_pct` | number |
| `personal_sub_tier2_customers` | integer |
| `personal_sub_tier2_volume_cents` | integer |
| `personal_sub_tier2_pct` | number |
| `personal_sub_tier3_customers` | integer |
| `personal_sub_tier3_volume_cents` | integer |
| `personal_sub_tier3_pct` | number |
| `personal_sub_cap_pct` | number |
| `personal_sub_pct` | number |
| `personal_sub_min_customers` | integer |
| `generation_enabled` | boolean |
| `generation_levels` | integer |
| `generation_l2_pct` | number |
| `generation_l3_pct` | number |
| `generation_l4_pct` | number |
| `generation_l5_pct` | number |
| `generation_cap_pct` | number |
| `generation_compression_mode` | string |
| `generation_threshold_rank` | string |
| `generation_g1_pct` | number |
| `generation_g2_pct` | number |
| `generation_g3_pct` | number |
| `generation_g4_pct` | number |
| `generation_g5_pct` | number |
| `generation_pool_cap_pct` | number |
| `direct_bonus_enabled` | boolean |
| `direct_bonus_tier1_pct` | number |
| `direct_bonus_tier1_volume_cents` | integer |
| `direct_bonus_tier2_pct` | number |
| `direct_bonus_tier2_volume_cents` | integer |
| `direct_bonus_tier_mode` | string |
| `customer_commission_enabled` | boolean |
| `customer_commission_eligible_event_types` | array |
| `bonus_pool_enabled` | boolean |
| `bonus_pool_tracking_only` | boolean |
| `commission_hold_days` | integer |
| `clawback_enabled` | boolean |
| `compression_enabled` | boolean |
| `created_at` | string |
| `updated_at` | string |
| `fast_start_min_personal_volume_cents` | integer |
| `level_l1_pct` | number |
| `level_l2_pct` | number |
| `level_l3_pct` | number |
| `level_l4_pct` | number |
| `elite_l1_pct` | number |
| `elite_l2_pct` | number |
| `elite_l3_pct` | number |
| `elite_l4_pct` | number |
| `referral_pct` | number |
| `referral_enabled` | boolean |
| `unlock_l2_signups` | integer |
| `unlock_l3_signups` | integer |
| `unlock_l4_signups` | integer |
| `level_pool_cap_pct` | number |
| `elite_qualifying_pack_cents` | integer |
| `elite_maintenance_personal_order_cents` | integer |
| `elite_maintenance_active_customers` | integer |
| `elite_maintenance_gv_cents` | integer |
| `referral_tier_bands` | jsonb |
| `referral_one_time_only` | boolean |
| `level_rollup_enabled` | boolean |
| `fast_start_pool_pct` | number |
| `fast_start_pool_window_days` | integer |
| `milestone_enabled` | boolean |
| `milestone_bronze_threshold_cents` | integer |
| `milestone_bronze_bonus_cents` | integer |
| `milestone_silver_threshold_cents` | integer |
| `milestone_silver_bonus_cents` | integer |
| `milestone_gold_threshold_cents` | integer |
| `milestone_gold_bonus_cents` | integer |
| `milestone_stacking_enabled` | boolean |
| `min_payout_cents` | integer |
| `max_total_payout_pct` | number |
| `change_notes` | string |
| `elite_promo_window_days` | integer |
| `elite_longterm_active_customers` | integer |
| `elite_longterm_gv_cents` | integer |
| `elite_longterm_pv_cents` | integer |
| `elite_natural_only_bonus` | boolean |
| `elite_bonus_cents` | integer |
| `payout_day_of_week` | integer |
| `payout_timezone` | string |
| `ordering_affiliate_l2_l4_payable` | boolean |
| `elite_qualify_enrollments` | integer |
| `generation_per_order_enabled` | boolean |
| `elite_pack_sku` | string |
| `elite_pack_mode` | string |
| `rank_team_rates` | jsonb |
| `elite_qualify_pv_cents` | integer |
| `elite_qualify_gv_cents` | integer |
| `elite_accelerator_window_days` | integer |

## commission_ledger

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `order_item_id` | string |
| `attribution_id` | string |
| `affiliate_id` | string |
| `level` | integer |
| `percentage_bps` | integer |
| `amount_cents` | integer |
| `status` | string |
| `hold_until` | string |
| `pay_area` | string |
| `period_id` | string |
| `batch_id` | string |
| `base_cv_amount` | integer |
| `rate_used` | number |
| `config_version_id` | string |
| `source_affiliate_id` | string |
| `compressed_from_id` | string |
| `compression_reason` | string |
| `explanation` | string |
| `calculation_trace_json` | jsonb |
| `plan_snapshot_json` | jsonb |
| `created_at` | string |
| `updated_at` | string |
| `cap_adjustment_cents` | integer |
| `hold_starts_at` | string |
| `release_at` | string |
| `clawback_source_id` | string |
| `paid_at` | string |

## commission_periods

| Column | Type |
|---|---|
| `id` | string |
| `period_id` | string |
| `config_version_id` | string |
| `status` | string |
| `total_eligible_cv_cents` | integer |
| `total_generation_cv_cents` | integer |
| `generation_scale_factor` | number |
| `completed_at` | string |
| `created_at` | string |
| `updated_at` | string |

## commission_plans

| Column | Type |
|---|---|
| `id` | string |
| `name` | string |
| `tiers_enabled` | integer |
| `tier_percentages` | array |
| `scope` | string |
| `scope_ref` | string |
| `is_default` | boolean |
| `created_at` | string |

## customer_expertise

| Column | Type |
|---|---|
| `id` | string |
| `customer_id` | string |
| `expertise_data` | jsonb |
| `recommendation_cache` | jsonb |
| `drip_state` | jsonb |
| `created_at` | string |
| `updated_at` | string |

## customer_referral_attributions

| Column | Type |
|---|---|
| `id` | string |
| `email` | string |
| `affiliate_id` | string |
| `tracking_code` | string |
| `first_seen_at` | string |
| `source` | string |
| `user_agent` | string |
| `ip_hash` | string |
| `created_at` | string |
| `session_id` | string |

## discount_codes

| Column | Type |
|---|---|
| `id` | string |
| `code` | string |
| `type` | string |
| `value` | integer |
| `min_order_cents` | integer |
| `max_uses` | integer |
| `current_uses` | integer |
| `affiliate_id` | string |
| `expires_at` | string |
| `active` | boolean |
| `created_at` | string |
| `updated_at` | string |
| `first_order_only` | boolean |

## elite_qualifications

| Column | Type |
|---|---|
| `id` | string |
| `ambassador_id` | string |
| `qualification_source` | string |
| `qualified_at` | string |
| `promo_window_ends_at` | string |
| `elite_pack_order_id` | string |
| `bonus_paid_cents` | integer |
| `bonus_ledger_id` | string |
| `created_at` | string |

## email_log

| Column | Type |
|---|---|
| `id` | string |
| `template_name` | string |
| `recipient_email` | string |
| `subject` | string |
| `related_order_id` | string |
| `related_affiliate_id` | string |
| `related_user_id` | string |
| `trigger_source` | string |
| `trigger_event_id` | string |
| `resend_message_id` | string |
| `status` | string |
| `delivered_at` | string |
| `opened_at` | string |
| `clicked_at` | string |
| `bounced_at` | string |
| `complained_at` | string |
| `error_message` | string |
| `payload` | jsonb |
| `idempotency_key` | string |
| `created_at` | string |
| `updated_at` | string |

## email_send_log

| Column | Type |
|---|---|
| `id` | string |
| `message_id` | string |
| `template_name` | string |
| `recipient_email` | string |
| `status` | string |
| `error_message` | string |
| `metadata` | jsonb |
| `created_at` | string |

## email_send_state

| Column | Type |
|---|---|
| `id` | integer |
| `retry_after_until` | string |
| `batch_size` | integer |
| `send_delay_ms` | integer |
| `auth_email_ttl_minutes` | integer |
| `transactional_email_ttl_minutes` | integer |
| `updated_at` | string |

## email_unsubscribe_tokens

| Column | Type |
|---|---|
| `id` | string |
| `token` | string |
| `email` | string |
| `created_at` | string |
| `used_at` | string |

## fraud_reviews

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `affiliate_id` | string |
| `review_type` | string |
| `evidence` | jsonb |
| `status` | string |
| `reviewed_by` | string |
| `reviewed_at` | string |
| `notes` | string |
| `created_at` | string |
| `updated_at` | string |

## fulfillment_sku_mappings

| Column | Type |
|---|---|
| `id` | string |
| `product_id` | string |
| `internal_sku` | string |
| `provider` | string |
| `provider_sku` | string |
| `active` | boolean |
| `created_at` | string |
| `updated_at` | string |

## integration_credentials

| Column | Type |
|---|---|
| `id` | string |
| `provider` | string |
| `access_token` | string |
| `refresh_token` | string |
| `realm_id` | string |
| `expires_at` | string |
| `scope` | string |
| `token_type` | string |
| `config` | jsonb |
| `connected_by` | string |
| `connected_at` | string |
| `disconnected_at` | string |
| `created_at` | string |
| `updated_at` | string |

## manual_payment_submissions

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `payment_id` | string |
| `method_code` | string |
| `sender_name` | string |
| `sender_contact` | string |
| `amount_cents` | integer |
| `reference_text` | string |
| `screenshot_url` | string |
| `notes` | string |
| `status` | string |
| `reviewed_at` | string |
| `reviewed_by` | string |
| `review_note` | string |
| `created_at` | string |

## notification_preferences

| Column | Type |
|---|---|
| `user_id` | string |
| `referral_order_emails` | boolean |
| `product_news_emails` | boolean |
| `created_at` | string |
| `updated_at` | string |

## order_items

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `product_id` | string |
| `sku` | string |
| `name` | string |
| `unit_price_cents` | integer |
| `quantity` | integer |
| `line_total_cents` | integer |
| `category` | string |
| `created_at` | string |
| `updated_at` | string |

## order_paid_events

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `source` | string |
| `event_id` | string |
| `payload` | jsonb |
| `processed_at` | string |

## orders

| Column | Type |
|---|---|
| `id` | string |
| `user_email` | string |
| `subtotal_cents` | integer |
| `currency` | string |
| `affiliate_chain` | array |
| `commission_plan_id` | string |
| `commission_amounts` | array |
| `payment_gateway` | string |
| `payment_status` | string |
| `gateway_payload` | jsonb |
| `shipping_address` | jsonb |
| `items` | jsonb |
| `created_at` | string |
| `event_type` | string |
| `buyer_type` | string |
| `cv_amount` | integer |
| `total_cents` | integer |
| `customer_id` | string |
| `pv_amount` | integer |
| `payment_method_code` | string |
| `manual_review_required` | boolean |
| `fulfillment_status` | string |
| `tracking_number` | string |
| `tracking_carrier` | string |
| `tracking_url` | string |
| `shipped_at` | string |
| `delivered_at` | string |
| `shipstation_order_id` | string |
| `shipping_method_code` | string |
| `shipping_method_label` | string |
| `shipping_cost_cents` | integer |
| `warehouse_id` | string |
| `tracking_emailed_at` | string |
| `return_label_url` | string |
| `void_requested_at` | string |
| `pre_order_locked_at` | string |
| `pre_order_expires_at` | string |
| `pre_order_charge_scheduled_at` | string |
| `pre_order_charged_at` | string |
| `pre_order_canceled_at` | string |
| `pre_order_cancel_reason` | string |
| `stripe_setup_intent_id` | string |
| `stripe_payment_method_id` | string |
| `stripe_customer_id` | string |
| `card_brand` | string |
| `card_last4` | string |
| `payment_link_token` | string |
| `tax_cents` | integer |
| `discount_cents` | integer |
| `qbo_sales_receipt_id` | string |
| `qbo_synced_at` | string |
| `qbo_sync_error` | string |
| `fulfillment_provider` | string |
| `shiphero_order_id` | string |
| `shiphero_order_number` | string |
| `shiphero_synced_at` | string |
| `fulfillment_error` | string |
| `is_self_order` | boolean |
| `is_guest_checkout` | boolean |
| `counts_toward_pv` | boolean |
| `counts_toward_pcv` | boolean |
| `counts_toward_gv` | boolean |
| `counts_as_personal_customer` | boolean |
| `pays_l1_commission` | boolean |
| `credited_ambassador_id` | string |
| `order_type` | string |
| `wholesale_account_id` | string |
| `wholesale_discount_cents` | integer |
| `tax_provider` | string |
| `tax_calculation_payload` | jsonb |
| `tax_transaction_payload` | jsonb |
| `zamp_transaction_id` | string |
| `zamp_transaction_committed_at` | string |
| `zamp_transaction_error` | string |
| `zamp_address_payload` | jsonb |
| `qbo_realm_id` | string |
| `qbo_transaction_type` | string |
| `qbo_payload` | jsonb |
| `paid_at` | string |

## payment_audit_logs

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `payment_id` | string |
| `actor_type` | string |
| `actor_id` | string |
| `action` | string |
| `before_state` | jsonb |
| `after_state` | jsonb |
| `notes` | string |
| `created_at` | string |

## payment_events

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `gateway` | string |
| `gateway_event_id` | string |
| `event_type` | string |
| `payload` | jsonb |
| `processed` | boolean |
| `processed_at` | string |
| `created_at` | string |

## payment_methods

| Column | Type |
|---|---|
| `id` | string |
| `code` | string |
| `label` | string |
| `description` | string |
| `provider` | string |
| `rail` | string |
| `mode` | string |
| `enabled` | boolean |
| `visible` | boolean |
| `priority` | integer |
| `requires_admin_verification` | boolean |
| `instructions` | string |
| `icon` | string |
| `config` | jsonb |
| `created_at` | string |
| `updated_at` | string |

## payment_refunds

| Column | Type |
|---|---|
| `id` | string |
| `payment_id` | string |
| `order_id` | string |
| `provider` | string |
| `provider_refund_id` | string |
| `amount_cents` | integer |
| `currency` | string |
| `reason` | string |
| `status` | string |
| `requested_by` | string |
| `raw_provider_payload` | jsonb |
| `created_at` | string |
| `updated_at` | string |
| `zamp_refund_transaction_id` | string |
| `zamp_refund_payload` | jsonb |
| `zamp_refund_committed_at` | string |
| `zamp_refund_error` | string |
| `qbo_refund_receipt_id` | string |
| `qbo_refund_payload` | jsonb |
| `qbo_refund_synced_at` | string |
| `qbo_refund_error` | string |

## payments

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `provider` | string |
| `rail` | string |
| `method_code` | string |
| `provider_payment_id` | string |
| `amount_cents` | integer |
| `currency` | string |
| `status` | string |
| `return_code` | string |
| `tx_hash` | string |
| `payment_url` | string |
| `customer_email` | string |
| `raw_provider_payload` | jsonb |
| `created_at` | string |
| `updated_at` | string |
| `confirmed_at` | string |
| `fulfillment_released` | boolean |

## payout_batch_items

| Column | Type |
|---|---|
| `id` | string |
| `batch_id` | string |
| `affiliate_id` | string |
| `amount_cents` | integer |
| `method` | string |
| `destination` | string |
| `provider_item_id` | string |
| `status` | string |
| `ledger_ids` | array |
| `error` | string |
| `created_at` | string |
| `updated_at` | string |

## payout_batches

| Column | Type |
|---|---|
| `id` | string |
| `provider` | string |
| `provider_batch_id` | string |
| `status` | string |
| `total_cents` | integer |
| `item_count` | integer |
| `request_payload` | jsonb |
| `response_payload` | jsonb |
| `error` | string |
| `created_by` | string |
| `created_at` | string |
| `updated_at` | string |

## period_snapshots

| Column | Type |
|---|---|
| `id` | string |
| `period_id` | string |
| `affiliate_id` | string |
| `sponsor_id` | string |
| `active_flag` | boolean |
| `paid_as_rank` | string |
| `career_rank` | string |
| `enterprise_level` | integer |
| `unlocked_generations` | integer |
| `active_customer_count` | integer |
| `personal_volume_cents` | integer |
| `team_volume_cents` | integer |
| `enrollment_count` | integer |
| `created_at` | string |
| `personal_retail_cents` | integer |
| `team_retail_cents` | integer |

## placement_audit_logs

| Column | Type |
|---|---|
| `id` | string |
| `affected_affiliate_id` | string |
| `affected_user_id` | string |
| `old_sponsor_affiliate_id` | string |
| `new_sponsor_affiliate_id` | string |
| `reason` | string |
| `source` | string |
| `source_ticket_id` | string |
| `source_claim_id` | string |
| `changed_by` | string |
| `metadata` | jsonb |
| `created_at` | string |

## product_volume_alignment_audit

| Column | Type |
|---|---|
| `id` | string |
| `sku` | string |
| `name` | string |
| `price_cents` | integer |
| `pv_amount_cents` | integer |
| `cv_amount_cents` | integer |
| `pv_ok` | boolean |
| `cv_ok` | boolean |

## product_waitlist

| Column | Type |
|---|---|
| `id` | string |
| `email` | string |
| `product_id` | string |
| `product_name` | string |
| `source` | string |
| `notified_at` | string |
| `created_at` | string |

## products

| Column | Type |
|---|---|
| `id` | string |
| `sku` | string |
| `name` | string |
| `description` | string |
| `price_cents` | integer |
| `currency` | string |
| `image_url` | string |
| `category` | string |
| `active` | boolean |
| `metadata` | jsonb |
| `created_at` | string |
| `updated_at` | string |
| `pv_amount_cents` | integer |
| `cv_amount_cents` | integer |
| `bundle_components` | jsonb |
| `tax_code` | string |
| `tax_category_label` | string |
| `tax_code_verified` | boolean |
| `tax_code_notes` | string |

## quiz_results

| Column | Type |
|---|---|
| `id` | string |
| `customer_id` | string |
| `session_id` | string |
| `answers` | jsonb |
| `recommended_products` | array |
| `discount_code_id` | string |
| `created_at` | string |

## rank_definitions

| Column | Type |
|---|---|
| `id` | string |
| `rank_code` | string |
| `rank_name` | string |
| `rank_order` | integer |
| `is_active` | boolean |
| `min_signups` | integer |
| `min_personal_volume_cents` | integer |
| `min_team_volume_cents` | integer |
| `min_active_customers` | integer |
| `requires_subscription` | boolean |
| `customer_commission_pct` | number |
| `unlocked_generations` | integer |
| `generation_rate_pct` | number |
| `created_at` | string |
| `updated_at` | string |
| `pv_monthly_required_cents` | integer |

## referral_claims

| Column | Type |
|---|---|
| `id` | string |
| `ticket_id` | string |
| `claimant_user_id` | string |
| `claimant_affiliate_id` | string |
| `claimant_email` | string |
| `claimed_referee_email` | string |
| `claimed_referee_phone` | string |
| `claimed_referee_name` | string |
| `claimed_signup_date` | string |
| `claimed_referral_method` | string |
| `claimed_referral_code` | string |
| `claimed_context` | string |
| `matched_referee_user_id` | string |
| `matched_referee_affiliate_id` | string |
| `matched_referee_email` | string |
| `current_sponsor_affiliate_id` | string |
| `recommended_action` | string |
| `review_status` | string |
| `risk_level` | string |
| `evidence_summary` | jsonb |
| `reviewed_by` | string |
| `reviewed_at` | string |
| `decision_reason` | string |
| `created_at` | string |
| `updated_at` | string |

## referral_l0_payouts

| Column | Type |
|---|---|
| `id` | string |
| `affiliate_id` | string |
| `customer_email` | string |
| `order_id` | string |
| `amount_cents` | integer |
| `tier_name` | string |
| `created_at` | string |

## server_carts

| Column | Type |
|---|---|
| `id` | string |
| `customer_id` | string |
| `session_id` | string |
| `items` | jsonb |
| `affiliate_code` | string |
| `status` | string |
| `updated_at` | string |
| `created_at` | string |

## shiphero_sync_events

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `direction` | string |
| `event_type` | string |
| `provider_event_id` | string |
| `request_id` | string |
| `status` | string |
| `payload` | jsonb |
| `response` | jsonb |
| `error` | string |
| `created_at` | string |

## shipping_carriers

| Column | Type |
|---|---|
| `id` | string |
| `code` | string |
| `label` | string |
| `description` | string |
| `mode` | string |
| `provider` | string |
| `enabled` | boolean |
| `visible` | boolean |
| `priority` | integer |
| `tracking_url_template` | string |
| `icon` | string |
| `config` | jsonb |
| `created_at` | string |
| `updated_at` | string |

## shipping_events

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `event_type` | string |
| `carrier_code` | string |
| `tracking_number` | string |
| `payload` | jsonb |
| `notes` | string |
| `actor_type` | string |
| `actor_id` | string |
| `created_at` | string |

## shipping_rates

| Column | Type |
|---|---|
| `id` | string |
| `code` | string |
| `label` | string |
| `description` | string |
| `amount_cents` | integer |
| `free_over_cents` | integer |
| `min_subtotal_cents` | integer |
| `countries` | array |
| `regions` | array |
| `enabled` | boolean |
| `priority` | integer |
| `estimated_days_min` | integer |
| `estimated_days_max` | integer |
| `created_at` | string |
| `updated_at` | string |

## shipping_routing_rules

| Column | Type |
|---|---|
| `id` | string |
| `warehouse_id` | string |
| `match_countries` | array |
| `match_regions` | array |
| `match_skus` | array |
| `priority` | integer |
| `enabled` | boolean |
| `created_at` | string |

## shipping_sync_queue

| Column | Type |
|---|---|
| `id` | string |
| `order_id` | string |
| `provider` | string |
| `status` | string |
| `attempts` | integer |
| `max_attempts` | integer |
| `last_error` | string |
| `next_retry_at` | string |
| `triggered_by` | string |
| `created_at` | string |
| `updated_at` | string |
| `parent_job_id` | string |

## shipping_warehouses

| Column | Type |
|---|---|
| `id` | string |
| `code` | string |
| `label` | string |
| `shipstation_warehouse_id` | string |
| `address` | jsonb |
| `is_default` | boolean |
| `enabled` | boolean |
| `priority` | integer |
| `created_at` | string |
| `updated_at` | string |

## site_settings

| Column | Type |
|---|---|
| `id` | boolean |
| `purchasing_enabled` | boolean |
| `purchasing_disabled_message` | string |
| `updated_at` | string |
| `updated_by` | string |
| `pre_orders_enabled` | boolean |
| `pre_order_default_window_days` | integer |
| `pre_order_charge_warning_hours` | integer |
| `referral_promo_enabled` | boolean |
| `referral_promo_code` | string |
| `referral_promo_label` | string |
| `live_call_url` | string |

## store_settings

| Column | Type |
|---|---|
| `id` | string |
| `key` | string |
| `value` | jsonb |
| `description` | string |
| `created_at` | string |
| `updated_at` | string |

## support_tickets

| Column | Type |
|---|---|
| `id` | string |
| `ticket_number` | string |
| `status` | string |
| `priority` | string |
| `category` | string |
| `channel` | string |
| `subject` | string |
| `body` | string |
| `requester_type` | string |
| `requester_user_id` | string |
| `requester_affiliate_id` | string |
| `requester_email` | string |
| `requester_name` | string |
| `requester_phone` | string |
| `related_order_id` | string |
| `related_product_id` | string |
| `assigned_admin_id` | string |
| `tags` | array |
| `source_metadata` | jsonb |
| `message_count` | integer |
| `internal_notes_count` | integer |
| `first_response_at` | string |
| `resolved_at` | string |
| `closed_at` | string |
| `last_activity_at` | string |
| `created_at` | string |
| `updated_at` | string |

## suppressed_emails

| Column | Type |
|---|---|
| `id` | string |
| `email` | string |
| `reason` | string |
| `metadata` | jsonb |
| `created_at` | string |

## sync_logs

| Column | Type |
|---|---|
| `id` | string |
| `source` | string |
| `rows_synced` | integer |
| `rows_changed` | integer |
| `status` | string |
| `duration_ms` | integer |
| `error_message` | string |
| `created_at` | string |

## system_alerts

| Column | Type |
|---|---|
| `id` | string |
| `severity` | string |
| `source` | string |
| `title` | string |
| `detail` | jsonb |
| `order_id` | string |
| `dedupe_key` | string |
| `status` | string |
| `created_at` | string |
| `resolved_at` | string |

## tax_rate_fallback

| Column | Type |
|---|---|
| `state_code` | string |
| `combined_rate_bps` | integer |
| `supplements_taxable` | boolean |
| `source` | string |
| `updated_at` | string |

## tax_sync_events

| Column | Type |
|---|---|
| `id` | string |
| `provider` | string |
| `entity_type` | string |
| `entity_id` | string |
| `action` | string |
| `status` | string |
| `provider_transaction_id` | string |
| `request_payload` | jsonb |
| `response_payload` | jsonb |
| `error_message` | string |
| `attempts` | integer |
| `last_attempt_at` | string |
| `synced_at` | string |
| `created_at` | string |
| `updated_at` | string |

## ticket_integration_events

| Column | Type |
|---|---|
| `id` | string |
| `event_type` | string |
| `ticket_id` | string |
| `message_id` | string |
| `payload` | jsonb |
| `status` | string |
| `attempts` | integer |
| `last_error` | string |
| `processed_at` | string |
| `created_at` | string |
| `updated_at` | string |

## ticket_integration_mappings

| Column | Type |
|---|---|
| `id` | string |
| `source_type` | string |
| `source_id` | string |
| `provider` | string |
| `provider_record_id` | string |
| `created_at` | string |
| `updated_at` | string |

## ticket_messages

| Column | Type |
|---|---|
| `id` | string |
| `ticket_id` | string |
| `author_user_id` | string |
| `author_email` | string |
| `author_name` | string |
| `author_kind` | string |
| `body` | string |
| `is_internal_note` | boolean |
| `attachments` | jsonb |
| `created_at` | string |

## user_roles

| Column | Type |
|---|---|
| `id` | string |
| `user_id` | string |
| `role` | string |

## webhook_events

| Column | Type |
|---|---|
| `id` | string |
| `provider` | string |
| `event_id` | string |
| `event_type` | string |
| `received_at` | string |
| `payload` | jsonb |

## wholesale_accounts

| Column | Type |
|---|---|
| `id` | string |
| `user_id` | string |
| `enrolled_by_affiliate_id` | string |
| `business_name` | string |
| `ein` | string |
| `phone` | string |
| `website` | string |
| `billing_address` | jsonb |
| `shipping_address` | jsonb |
| `status` | string |
| `approved_at` | string |
| `approved_by` | string |
| `rejection_reason` | string |
| `lifetime_volume_cents` | integer |
| `created_at` | string |
| `updated_at` | string |
| `business_profile_completed_at` | string |
| `activated_at` | string |
| `initial_qualified_at` | string |
| `initial_qualified_order_id` | string |
| `needs_enroller_review` | boolean |

## wholesale_config

| Column | Type |
|---|---|
| `id` | string |
| `discount_pct` | number |
| `moq_cents` | integer |
| `enroller_commission_pct` | number |
| `upline_rollup_enabled` | boolean |
| `counts_toward_personal_volume` | boolean |
| `counts_toward_group_volume` | boolean |
| `counts_toward_rank` | boolean |
| `effective_start_date` | string |
| `effective_end_date` | string |
| `created_at` | string |
| `first_order_min_wholesale_cents` | integer |
| `ongoing_min_wholesale_cents` | integer |
| `profile_auto_approve` | boolean |
| `direct_commission_pct` | number |
| `network_pool_pct` | number |
| `total_commission_cap_pct` | number |
| `network_distribution_mode` | string |
| `network_walk_start` | string |
| `self_business_network_enabled` | boolean |
| `network_weight_mode` | string |
| `network_unallocated_handling` | string |

