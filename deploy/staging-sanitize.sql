\set ON_ERROR_STOP on

-- This file runs only against the staging clone after a production restore.
-- Preserve CRM records and configuration, but prevent the clone from acting as
-- production against external systems.

-- Signing keys are encrypted with the instance encryption key. Never copy the
-- production private key into staging; the staging server creates its own.
DELETE FROM core."signingKey";

UPDATE core."messageChannel"
SET
  "isSyncEnabled" = false,
  "webhookSubscriptionExternalId" = NULL,
  "webhookSubscriptionClientState" = NULL,
  "webhookSubscriptionExpiresAt" = NULL;

UPDATE core."calendarChannel"
SET
  "isSyncEnabled" = false,
  "webhookSubscriptionExternalId" = NULL,
  "webhookSubscriptionExternalResourceId" = NULL,
  "webhookSubscriptionClientState" = NULL,
  "webhookSubscriptionExpiresAt" = NULL;

UPDATE core."connectedAccount"
SET
  "accessToken" = NULL,
  "refreshToken" = NULL,
  "connectionParameters" = NULL,
  "oidcTokenClaims" = NULL;

UPDATE core."workflowVersion"
SET status = 'DEACTIVATED'
WHERE status = 'ACTIVE';

UPDATE core."webhook"
SET
  "targetUrl" = 'http://127.0.0.1:9/staging-disabled',
  secret = 'staging-disabled'
WHERE "deletedAt" IS NULL;

-- A production custom domain/subdomain must never be treated as staging's
-- canonical address. SERVER_URL/FRONTEND_URL provide staging's real endpoint.
UPDATE core.workspace
SET
  "customDomain" = NULL,
  "isCustomDomainEnabled" = false;
