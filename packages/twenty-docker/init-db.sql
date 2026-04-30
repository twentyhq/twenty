-- CCG Central SaaS - Database Initialization
-- Run once on fresh PostgreSQL

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";  -- Fuzzy text search

-- Enable Row Level Security globally
ALTER SYSTEM SET row_security = on;
SELECT pg_reload_conf();

-- Create application role with restricted permissions
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'ccg_app') THEN
        CREATE ROLE ccg_app WITH LOGIN PASSWORD 'app_password_change_me';
    END IF;
END
$$;

GRANT CONNECT ON DATABASE ccg_central TO ccg_app;
GRANT USAGE ON SCHEMA public TO ccg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO ccg_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT USAGE, SELECT ON SEQUENCES TO ccg_app;

-- Audit function for immutable logs
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO audit_log (
        table_name, operation, record_id, old_data, new_data,
        workspace_id, user_id, ip_address, created_at
    ) VALUES (
        TG_TABLE_NAME,
        TG_OP,
        COALESCE(NEW.id, OLD.id),
        CASE WHEN TG_OP IN ('UPDATE', 'DELETE') THEN row_to_json(OLD) ELSE NULL END,
        CASE WHEN TG_OP IN ('INSERT', 'UPDATE') THEN row_to_json(NEW) ELSE NULL END,
        COALESCE(current_setting('app.current_tenant', true), 'system'),
        COALESCE(current_setting('app.current_user', true), 'system'),
        COALESCE(current_setting('app.client_ip', true), '0.0.0.0'),
        NOW()
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Immutable audit log table
CREATE TABLE IF NOT EXISTS audit_log (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_name VARCHAR(100) NOT NULL,
    operation VARCHAR(10) NOT NULL,
    record_id UUID,
    old_data JSONB,
    new_data JSONB,
    workspace_id VARCHAR(100),
    user_id VARCHAR(100),
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Prevent deletion/update of audit logs
CREATE OR REPLACE RULE audit_no_delete AS ON DELETE TO audit_log DO INSTEAD NOTHING;
CREATE OR REPLACE RULE audit_no_update AS ON UPDATE TO audit_log DO INSTEAD NOTHING;

-- Index for fast audit queries
CREATE INDEX IF NOT EXISTS idx_audit_workspace_table ON audit_log (workspace_id, table_name, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_record ON audit_log (record_id, created_at DESC);

-- Partition audit logs by month (for large deployments)
-- CREATE TABLE audit_log_2026_04 PARTITION OF audit_log FOR VALUES FROM ('2026-04-01') TO ('2026-05-01');

-- =============================================================================
-- ROW LEVEL SECURITY POLICIES - Tenant Isolation
-- =============================================================================

-- Accounts Receivable
ALTER TABLE ar_invoice ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_invoice ON ar_invoice
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_payment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_payment ON ar_payment
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_dispute ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_dispute ON ar_dispute
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_dunning_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_dunning_sequence ON ar_dunning_sequence
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_payment_promise ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_payment_promise ON ar_payment_promise
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_portal_access ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_portal_access ON ar_portal_access
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_autopay ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_autopay ON ar_autopay
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_early_payment_discount ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_early_payment_discount ON ar_early_payment_discount
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ar_collection_score ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ar_collection_score ON ar_collection_score
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- IT Asset Management
ALTER TABLE it_asset ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_it_asset ON it_asset
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE software_license ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_software_license ON software_license
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE it_ticket ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_it_ticket ON it_ticket
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE change_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_change_request ON change_request
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Supply Chain
ALTER TABLE purchase_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_purchase_order ON purchase_order
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE shipment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_shipment ON shipment
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE customs_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_customs_entry ON customs_entry
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE landed_cost ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_landed_cost ON landed_cost
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Accounting
ALTER TABLE accounting_connection ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_accounting_connection ON accounting_connection
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE accounting_sync_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_accounting_sync_log ON accounting_sync_log
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE tax_rule ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tax_rule ON tax_rule
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE revenue_recognition ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_revenue_recognition ON revenue_recognition
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sales_commission ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sales_commission ON sales_commission
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE chart_of_account ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_chart_of_account ON chart_of_account
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE journal_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_journal_entry ON journal_entry
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE accounting_period ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_accounting_period ON accounting_period
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Payments & E-Invoicing
ALTER TABLE embedded_payment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_embedded_payment ON embedded_payment
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE electronic_invoice ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_electronic_invoice ON electronic_invoice
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE partner_channel ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_partner_channel ON partner_channel
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE revenue_reconciliation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_revenue_reconciliation ON revenue_reconciliation
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- HR
ALTER TABLE employee ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_employee ON employee
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE recruitment_candidate ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_recruitment_candidate ON recruitment_candidate
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE payroll_record ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_payroll_record ON payroll_record
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE performance_review ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_performance_review ON performance_review
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE leave_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_leave_request ON leave_request
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE employee_satisfaction ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_employee_satisfaction ON employee_satisfaction
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- CLM
ALTER TABLE clm_contract ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_clm_contract ON clm_contract
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE clm_template ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_clm_template ON clm_template
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Field Service
ALTER TABLE work_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_work_order ON work_order
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE technician ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_technician ON technician
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE service_contract ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_service_contract ON service_contract
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Procurement
ALTER TABLE purchase_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_purchase_request ON purchase_request
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE rfq ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_rfq ON rfq
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE vendor_scorecard ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_vendor_scorecard ON vendor_scorecard
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Events
ALTER TABLE crm_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_crm_event ON crm_event
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE event_registration ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_event_registration ON event_registration
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- LMS
ALTER TABLE lms_course ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lms_course ON lms_course
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE lms_enrollment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lms_enrollment ON lms_enrollment
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE retention_quiz ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_retention_quiz ON retention_quiz
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Fleet
ALTER TABLE fleet_vehicle ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fleet_vehicle ON fleet_vehicle
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE fleet_driver ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fleet_driver ON fleet_driver
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE fleet_delivery ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fleet_delivery ON fleet_delivery
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE fleet_route ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fleet_route ON fleet_route
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE fuel_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_fuel_log ON fuel_log
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE maintenance_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_maintenance_order ON maintenance_order
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Asterisk / Telephony
ALTER TABLE asterisk_server ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_asterisk_server ON asterisk_server
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sip_extension ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sip_extension ON sip_extension
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE call_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_call_log ON call_log
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE call_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_call_queue ON call_queue
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ivr_menu ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ivr_menu ON ivr_menu
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE dialer_campaign ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_dialer_campaign ON dialer_campaign
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sip_trunk ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sip_trunk ON sip_trunk
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Partner / Channel
ALTER TABLE partner ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_partner ON partner
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE deal_registration ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_deal_registration ON deal_registration
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE mdf_request ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_mdf_request ON mdf_request
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE partner_spiff ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_partner_spiff ON partner_spiff
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE partner_communication ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_partner_communication ON partner_communication
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- E-commerce
ALTER TABLE ecommerce_product ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ecommerce_product ON ecommerce_product
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ecommerce_order ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ecommerce_order ON ecommerce_order
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE abandoned_cart ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_abandoned_cart ON abandoned_cart
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ecommerce_subscription ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ecommerce_subscription ON ecommerce_subscription
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE loyalty_member ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_loyalty_member ON loyalty_member
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE browse_event ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_browse_event ON browse_event
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE product_review ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_review ON product_review
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- SaaS Multi-tenant
ALTER TABLE saas_tenant_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_saas_tenant_config ON saas_tenant_config
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE saas_tenant_module ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_saas_tenant_module ON saas_tenant_module
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE saas_module_catalog ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_saas_module_catalog ON saas_module_catalog
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE saas_fiscal_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_saas_fiscal_config ON saas_fiscal_config
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE saas_event_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_saas_event_log ON saas_event_log
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Support
ALTER TABLE support_ticket ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_support_ticket ON support_ticket
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sla_policy ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sla_policy ON sla_policy
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE ticket_comment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ticket_comment ON ticket_comment
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Knowledge Base
ALTER TABLE kb_category ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_kb_category ON kb_category
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE kb_article ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_kb_article ON kb_article
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Inventory / Warehouse
ALTER TABLE warehouse ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_warehouse ON warehouse
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE product_stock ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_product_stock ON product_stock
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE stock_movement ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_stock_movement ON stock_movement
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE supplier ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_supplier ON supplier
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Marketing
ALTER TABLE marketing_campaign ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_marketing_campaign ON marketing_campaign
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE lead_score_rule ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_score_rule ON lead_score_rule
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE lead_score ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_lead_score ON lead_score
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE campaign_touchpoint ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_campaign_touchpoint ON campaign_touchpoint
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Gamification
ALTER TABLE leaderboard_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_leaderboard_entry ON leaderboard_entry
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE badge ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_badge ON badge
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sales_challenge ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sales_challenge ON sales_challenge
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Project Management
ALTER TABLE project ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_project ON project
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE project_task ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_project_task ON project_task
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE time_entry ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_time_entry ON time_entry
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE project_risk ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_project_risk ON project_risk
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE project_template ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_project_template ON project_template
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Omnichannel Messaging
ALTER TABLE whatsapp_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsapp_config ON whatsapp_config
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE whatsapp_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsapp_message ON whatsapp_message
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sms_config ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sms_config ON sms_config
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sms_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sms_log ON sms_log
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE email_sequence ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_email_sequence ON email_sequence
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sequence_step ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sequence_step ON sequence_step
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE sequence_enrollment ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sequence_enrollment ON sequence_enrollment
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Unified Conversations
ALTER TABLE unified_conversation ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_unified_conversation ON unified_conversation
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE unified_message ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_unified_message ON unified_message
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE whatsapp_template ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_whatsapp_template ON whatsapp_template
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE chat_widget ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_chat_widget ON chat_widget
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE linkedin_sync ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_linkedin_sync ON linkedin_sync
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE meeting_scheduler ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_meeting_scheduler ON meeting_scheduler
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE social_monitor ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_social_monitor ON social_monitor
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE social_signal ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_social_signal ON social_signal
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Dashboard / Analytics
ALTER TABLE dashboard_widget ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_dashboard_widget ON dashboard_widget
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

ALTER TABLE analytics_report ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_analytics_report ON analytics_report
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Hyper Personalization
ALTER TABLE hyper_personalization ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_hyper_personalization ON hyper_personalization
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- PLG (Product-Led Growth)
ALTER TABLE plg ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_plg ON plg
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Banking
ALTER TABLE banking ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_banking ON banking
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- AI Governance
ALTER TABLE ai_governance ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_ai_governance ON ai_governance
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Incidents
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_incidents ON incidents
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Revenue Waterfall
ALTER TABLE revenue_waterfall ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_revenue_waterfall ON revenue_waterfall
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Sales Coaching
ALTER TABLE sales_coaching ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_sales_coaching ON sales_coaching
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Tenant Wizard
ALTER TABLE tenant_wizard ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_tenant_wizard ON tenant_wizard
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- Mobile Native
ALTER TABLE mobile_native ENABLE ROW LEVEL SECURITY;
CREATE POLICY tenant_isolation_mobile_native ON mobile_native
    USING ("workspaceId" = current_setting('app.current_tenant')::UUID);

-- =============================================================================
-- AUDIT TRIGGERS - Critical Tables
-- =============================================================================

CREATE TRIGGER audit_ar_invoice
    AFTER INSERT OR UPDATE OR DELETE ON ar_invoice
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_employee
    AFTER INSERT OR UPDATE OR DELETE ON employee
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_clm_contract
    AFTER INSERT OR UPDATE OR DELETE ON clm_contract
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_partner
    AFTER INSERT OR UPDATE OR DELETE ON partner
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_ecommerce_order
    AFTER INSERT OR UPDATE OR DELETE ON ecommerce_order
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_saas_tenant_config
    AFTER INSERT OR UPDATE OR DELETE ON saas_tenant_config
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_call_log
    AFTER INSERT OR UPDATE OR DELETE ON call_log
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_work_order
    AFTER INSERT OR UPDATE OR DELETE ON work_order
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

CREATE TRIGGER audit_project
    AFTER INSERT OR UPDATE OR DELETE ON project
    FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

-- =============================================================================
-- ADDITIONAL AUDIT INDEX
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_log (created_at DESC);

SELECT 'CCG Central database initialized successfully' AS status;
