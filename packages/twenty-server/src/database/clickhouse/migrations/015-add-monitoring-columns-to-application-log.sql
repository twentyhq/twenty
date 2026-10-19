ALTER TABLE applicationLog ADD COLUMN IF NOT EXISTS applicationRegistrationId String DEFAULT '';

ALTER TABLE applicationLog ADD COLUMN IF NOT EXISTS applicationVersion String DEFAULT '';

ALTER TABLE applicationLog ADD COLUMN IF NOT EXISTS source LowCardinality(String) DEFAULT 'LOGIC_FUNCTION';

ALTER TABLE applicationLog ADD COLUMN IF NOT EXISTS errorCode LowCardinality(String) DEFAULT '';
