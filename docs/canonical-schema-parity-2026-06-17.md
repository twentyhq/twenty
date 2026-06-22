
# XO Pure Canonical Schema — Supabase ↔ Twenty Full Parity

**Date**: 2026-06-17
**Sources**: Supabase REST API (68 public tables), Twenty GraphQL introspection (5 custom + standard objects)
**Project**: rahyvpnjpkgukepefrur (Supabase), crm.xopure.com (Twenty)

---

## Custom Objects — Supabase ↔ Twenty Field Parity

### 1. Ambassador ← affiliates

| Twenty Field | Type | Supabase Column | Type | Synced? |
|---|---|---|---|---|
| supabaseId | UUID | id | string (uuid) | ✓ |
| name | String | name | string | ✓ |
| ambassadorCode | String | tracking_code | string | ✓ |
| status | Enum | status | string | ✓ |
| enrolledAt | DateTime | created_at | string | ✓ |
| eliteQualifiedAt | DateTime | elite_qualified_at | string | ✓ |
| eliteMaintainedAt | DateTime | — | — | Twenty-only |
| eliteMaintained | Boolean | — | — | Twenty-only |
| eliteLapsedThisPeriod | Boolean | — | — | Twenty-only |
| currentTier | Enum | participation_tier | string | ✓ |
| qualifiedRank | Enum | rank_override | string | Partial |
| paidAsRank | Enum | paid_as_rank | string | ✓ |
| activeCustomerCount | Float | active_customer_count | integer | ✓ |
| personalOrderCV | Currency | personal_volume_cents | integer | Type conv |
| personalEnrollments | Float | enrollment_count | integer | ✓ |
| customerCV | Currency | personal_customer_count*CV | — | Computed |
| groupCV | Currency | team_volume_cents | integer | Type conv |
| lifetimeEarnings | Currency | — | — | Twenty-only |
| communicationPreferences | Enum | — | — | Twenty-only |
| complianceHoldReason | String | reason | string | Partial |
| onboardingStage | Enum | — | — | Twenty-only |
| internalNotes | RichText | — | — | Twenty-only |
| crmTags | Enum | — | — | Twenty-only |
| path | Enum | account_type | string | Partial |
| personId | ID | user_id | string | Relational |
| sponsorId | ID | parent_id | string | Relational |
| fullName | FullName | (via user) | — | Relational |
| emails | Emails | email | string | ✓ |
| phones | Phones | phone | string | ✓ |

**Not in Twenty**: rank, career_rank, enterprise_level, kit_enrollment_count_30d, group_cv_30d, custom_slug, show_peptides_link, elite_qualification_source, elite_promo_window_ends_at, elite_last_maintained_period, monthly_pv_cv_cents, monthly_gv_cv_cents, personal_customer_count, can_enroll_wholesale, wholesale_slug, wholesale_volume_cents, rank_override_until, converted_to_ambassador_at, conversion_source, signup_session_id, reparent_locked, needs_sponsor_review, payout_details (JSONB)

### 2. Customer ← profiles / auth.users

| Twenty Field | Type | Supabase Column | Type | Synced? |
|---|---|---|---|---|
| supabaseId | UUID | id (profiles) | string | ✓ |
| name | String | (auth.users raw_user_meta_data->>'name') | JSON | ✓ |
| customerCode | String | — | — | Twenty-only |
| emails | Emails | email (auth.users) | string | ✓ |
| phones | Phones | phone (profiles) | string? | Partial |
| lifetimeSpend | Currency | — | — | Twenty-only |
| lifetimeCV | Currency | — | — | Twenty-only |
| orderCount | Float | — | — | Twenty-only |
| lastOrderAt | DateTime | — | — | Twenty-only |
| enrolledAt | DateTime | created_at (profiles) | string | ✓ |
| isActive | Boolean | — | — | Twenty-only |
| subscriptionStatus | Enum | — | — | Twenty-only |
| acquisitionSource | Enum | — | — | Twenty-only |
| shippingAddress | Address | — | — | Twenty-only |
| communicationPreferences | Enum | — | — | Twenty-only |
| customerNotes | RichText | — | — | Twenty-only |
| crmTags | Enum | — | — | Twenty-only |
| personId | ID | user_id (profiles) | string | Relational |
| referrerId | ID | affiliate_id (referral attrib.) | string | Relational |

**Not in Twenty**: customer_expertise.*, quiz_results.*, notification_preferences.*, product_waitlist.*, customer_referral_attributions.*

### 3. XoOrder ← orders

| Twenty Field | Type | Supabase Column | Type | Synced? |
|---|---|---|---|---|
| supabaseId | UUID | id | string | ✓ |
| name | String | — | — | Generated |
| orderCode | String | commerce_order_id? | string | Partial |
| orderedAt | DateTime | created_at | string | ✓ |
| settledAt | DateTime | paid_at | string | ✓ |
| status | Enum | fulfillment_status | string | ✓ |
| totalRetail | Currency | total_cents | integer | Type conv |
| totalCV | Currency | cv_amount | integer | Type conv |
| quantity | Float | (items count) | JSONB | Computed |
| unitPrice | Currency | subtotal_cents/quantity | integer | Computed |
| paymentMethod | Enum | payment_method_code | string | ✓ |
| paypalCaptureId | String | — | — | Twenty-only |
| stripePaymentIntentId | String | stripe_setup_intent_id | string | ✓ |
| isPersonalOrder | Boolean | is_self_order | boolean | ✓ |
| fraudFlagged | Boolean | manual_review_required | boolean | ✓ |
| fraudScore | Float | — | — | Twenty-only |
| discountCode | String | (from discount_codes) | — | Relational |
| customerId | ID | customer_id | string | Relational |
| productId | ID | (from order_items) | — | Relational |
| periodId | ID | (from commission_periods) | — | Relational |
| referringAmbassadorId | ID | credited_ambassador_id | string | Relational |

**Not in Twenty**: 84 columns in orders table — most operational (tracking, tax, warehouse, QBO, Zamp, shiphero, pre-order, payment processing). Only synced fields shown above. Full list in supabase-schema-2026-06-17.md.

### 4. Product ← products

| Twenty Field | Type | Supabase Column | Type | Synced? |
|---|---|---|---|---|
| supabaseId | UUID | id | string | ✓ |
| name | String | name | string | ✓ |
| sku | String | sku | string | ✓ |
| category | Enum | category | string | ✓ |
| format | Enum | — | — | Twenty-only |
| retailPrice | Currency | price_cents | integer | Type conv |
| cvAmount | Currency | cv_amount_cents | integer | Type conv |
| stripePriceId | String | — | — | Twenty-only |
| isActive | Boolean | active | boolean | ✓ |
| commissionEligible | Boolean | — | — | Twenty-only |
| safeDescription | RichText | description | string | ✓ |
| restrictedClaims | Enum | — | — | Twenty-only |
| marketingNotes | RichText | — | — | Twenty-only |
| crmTags | Enum | metadata (JSONB) | jsonb | Partial |

**Not in Twenty**: bundle_components, tax_code, tax_category_label, tax_code_verified, tax_code_notes, image_url, pv_amount_cents

### 5. Period ← commission_periods

| Twenty Field | Type | Supabase Column | Type | Synced? |
|---|---|---|---|---|
| supabaseId | UUID | id | string | ✓ |
| name | String | — | — | Generated |
| periodCode | String | period_id | string | ✓ |
| status | Enum | status | string | ✓ |
| startDate | Date | — | — | Twenty-only |
| endDate | Date | — | — | Twenty-only |
| frozenAt | DateTime | completed_at | string | ✓ |
| totalRetail | Currency | — | — | Twenty-only |
| totalCV | Currency | total_eligible_cv_cents | integer | Type conv |
| totalPayouts | Currency | — | — | Twenty-only |
| payoutPercentOfRetail | Float | — | — | Twenty-only |
| internalNotes | RichText | — | — | Twenty-only |

**Not in Twenty**: total_generation_cv_cents, generation_scale_factor, config_version_id

---

## Standard Twenty Objects — Supabase Coverage

| Twenty Object | Supabase Source | Sync Status |
|---|---|---|
| **Person** | auth.users + profiles | Name, email, phones synced; enrichment tags partial |
| **Company** | Not in Supabase | Twenty-only (manual CRM data) |
| **Opportunity** | Not in Supabase | Twenty-only (manual CRM data) |
| **Note** | Not in Supabase | Twenty native |
| **Task** | Not in Supabase | Twenty native |
| **Activity** (TimelineActivity) | crm.twenty_activity_log (migration) | Bi-directional sync paper trail |
| **Attachment** | Not in Supabase | Twenty native |
| **Blocklist** | Not in Supabase | Twenty-only |

---

## Supabase Tables NOT Synced to Twenty

| Domain | Tables | Why Not Synced |
|---|---|---|
| **Commissions** | commission_ledger (26 cols), commission_config_versions (90+ cols), commission_plans, ambassador_milestone_awards, period_snapshots, affiliate_payouts, referral_l0_payouts | Deep financial data; audit-only in CRM. Period snapshots partially in Period. |
| **Payments** | payments, payment_events, payment_refunds, payment_audit_logs, manual_payment_submissions, order_paid_events | Payment processing data; CRM shows order status only |
| **Tax & Accounting** | tax_rate_fallback, tax_sync_events, accounting_sync_events, integration_credentials | Operational infrastructure |
| **Shipping** | shipping_events, shipping_rates, shipping_routing_rules, shipping_carriers, shipping_warehouses, shipping_sync_queue, fulfillment_sku_mappings, shiphero_sync_events | Operational infrastructure |
| **Fraud** | fraud_reviews, attribution_failures | Recommended for future sync (Section 5) |
| **Support** | support_tickets, ticket_messages, ticket_integration_events, ticket_integration_mappings | Existing bespoke system; twenty-multica-tickets replaces it |
| **Customer Intel** | customer_expertise, quiz_results, customer_referral_attributions, product_waitlist, server_carts | Recommended for customerContext snapshot |
| **Email** | email_log, email_send_log, email_send_state, email_unsubscribe_tokens, suppressed_emails | Operational |
| **Affiliate Tracking** | affiliate_clicks, affiliate_click_events, affiliate_attributions, placement_audit_logs | Attribution data; some referenced via relations |
| **Infrastructure** | sync_logs, webhook_events, store_settings, site_settings, discount_codes, payment_methods, user_roles, system_alerts, wholesale_config, wholesale_accounts, payout_batches, payout_batch_items, rank_definitions, referral_claims, product_volume_alignment_audit | Operational/config/reference |
| **Auth** | auth.users, auth.identities, auth.sessions, auth.refresh_tokens, auth.mfa_factors, auth.mfa_challenges, auth.audit_log_entries, auth.sso_providers, auth.sso_domains, auth.flow_state | Managed by Supabase; email synced to Person |

### Auth Schema Columns (standard Supabase):

**auth.users**: id (uuid), email (text), encrypted_password (text), email_confirmed_at (timestamptz), invited_at (timestamptz), confirmation_token (text), confirmation_sent_at (timestamptz), recovery_token (text), recovery_sent_at (timestamptz), email_change_token_new (text), email_change (text), email_change_sent_at (timestamptz), last_sign_in_at (timestamptz), raw_app_meta_data (jsonb), raw_user_meta_data (jsonb), is_super_admin (bool), created_at (timestamptz), updated_at (timestamptz), phone (text), phone_confirmed_at (timestamptz), phone_change (text), phone_change_token (text), phone_change_sent_at (timestamptz), confirmed_at (timestamptz), email_change_token_current (text), email_change_confirm_status (int2), banned_until (timestamptz), reauthentication_token (text), reauthentication_sent_at (timestamptz), is_sso_user (bool), deleted_at (timestamptz), is_anonymous (bool)

---

## Unmapped Supabase Tables (Data Points Available)

These 68 tables have FULL column schemas in `docs/supabase-schema-2026-06-17.md`. Below are the key-support-relevant unmapped columns:

### Top Support-Relevant (candidate for future sync or metadata):

| Table | Key Support Fields |
|---|---|
| commission_ledger | affiliate_id, order_id, amount_cents, status, explanation, hold_until, calculation_trace_json |
| fraud_reviews | order_id, affiliate_id, review_type, evidence, status, notes, reviewed_by, reviewed_at |
| customer_expertise | customer_id, expertise_data (JSONB), drip_state (JSONB), total_interactions |
| payment_events | order_id, gateway, event_type, payload (JSONB — Stripe disputes) |
| affiliate_click_events | affiliate_id, tracking_code, page_url, is_suspicious |
| payment_refunds | order_id, amount_cents, reason, status |
| server_carts | customer_id, items (JSONB), affiliate_code, status |
| discount_codes | code, type, value, max_uses, current_uses, expires_at |
| sync_logs | source, rows_synced, status, error_message |
| webhook_events | provider, event_id, event_type, payload (JSONB) |
| referral_claims | claimant_email, claimed_referee_email, review_status, risk_level |
| attribution_failures | order_id, email, ref_code, reason, error_message |

---

## Twenty Relational Graph (from schema)

```
Person ──────── Ambassador (personId)
  │                ├── sponsor (sponsorId)
  │                ├── mentees (Ambassador[])
  │                ├── referredCustomers (Customer[])
  │                └── referredOrders (XoOrder[])
  │
  ├────────── Customer (personId)
  │                ├── referrer (Ambassador)
  │                └── orders (XoOrder[])
  │
XoOrder ───────── Customer (customerId)
  │                ├── Product (productId)
  │                ├── Period (periodId)
  │                └── Ambassador (referringAmbassadorId)
  │
Product ───────── orders (XoOrder[])
Period ─────────── orders (XoOrder[])

TaskTarget ─────── Company | Opportunity | Person | Task | Product | Period | Ambassador | XoOrder | Customer
TimelineActivity ─ Company | Dashboard | Note | Opportunity | Person | Task | Workflow | Product | Period | Ambassador | XoOrder | Customer
NoteTarget ─────── Company | Opportunity | Person | Product | Period | Ambassador | XoOrder | Customer
```

---

## Gaps Summary

| Gap | Description |
|---|---|
| **Commission sync** | commission_ledger not in Twenty — no ticket link to commission disputes |
| **Fraud sync** | fraud_reviews not in Twenty — fraud reviews are in Section 5 recs |
| **Payment event sync** | payment_events (Stripe disputes) not in Twenty |
| **Customer context** | customer_expertise, quiz_results not surfaced — Section 5 rec |
| **Auth user data** | phone, email_confirmed_at not synced to Person |
| **Tracking/funnel** | affiliate_click_events, server_carts — attribution context |
| **Ticketing** | Existing support_tickets table being replaced by twenty-multica-tickets app |
| **Metadata field** | Custom objects lack JSONB-style metadata field for raw Supabase payload |
