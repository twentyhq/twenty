-- Add userWorkspaceId column to all event tables
-- This provides workspace-scoped user identity for filtering
-- Old records will have empty string (ClickHouse default), new records will have the value

ALTER TABLE pageview ADD COLUMN IF NOT EXISTS `userWorkspaceId` String DEFAULT '';

ALTER TABLE workspaceEvent ADD COLUMN IF NOT EXISTS `userWorkspaceId` String DEFAULT '';

ALTER TABLE objectEvent ADD COLUMN IF NOT EXISTS `userWorkspaceId` String DEFAULT '';

