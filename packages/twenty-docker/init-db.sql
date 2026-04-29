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

SELECT 'CCG Central database initialized successfully' AS status;
