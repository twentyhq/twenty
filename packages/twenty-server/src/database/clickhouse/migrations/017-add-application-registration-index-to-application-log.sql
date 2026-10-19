ALTER TABLE applicationLog ADD INDEX IF NOT EXISTS idx_application_registration_id applicationRegistrationId TYPE bloom_filter GRANULARITY 4;
