ALTER TABLE applicationMetricEvent ADD COLUMN IF NOT EXISTS occurrenceCount UInt32 DEFAULT 1;
