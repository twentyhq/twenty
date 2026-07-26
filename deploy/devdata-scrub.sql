\set ON_ERROR_STOP on

-- Turns a staging clone into a dataset that may live on developer laptops.
--
-- The rule this file implements: CRM records the team authored (people,
-- companies, fellows, mentors, notes, tasks) are kept, because reproducing
-- their shape synthetically is what makes local schema work unrealistic.
-- Synced mailbox and calendar content is not kept, because it belongs to
-- thousands of third parties who never interacted with the CRM.
--
-- Row counts, foreign keys and column types survive everywhere, so migrations
-- and workspace upgrades are exercised against production-scale structure.
--
-- This never runs against staging or production. deploy/devdata-publish.sh
-- restores a snapshot into a throwaway build database first.

DO $$
BEGIN
  IF current_database() <> 'devdata_build' THEN
    RAISE EXCEPTION
      'devdata-scrub.sql must run against devdata_build, not %',
      current_database();
  END IF;
END
$$;

-- Credentials and signing material.
DELETE FROM core."signingKey";
DELETE FROM core."appToken";
DELETE FROM core."apiKey";
DELETE FROM core."twoFactorAuthenticationMethod";
DELETE FROM core."workspaceSSOIdentityProvider";

UPDATE core."connectedAccount"
SET
  "accessToken" = NULL,
  "refreshToken" = NULL,
  "connectionParameters" = NULL,
  "oidcTokenClaims" = NULL;

UPDATE core."connectionProvider" SET "oauthConfig" = NULL;

UPDATE core."applicationVariable"
SET value = 'scrubbed'
WHERE "isSecret";

-- A check constraint requires either an empty string or an enc:v2: payload.
UPDATE core."applicationRegistrationVariable"
SET "encryptedValue" = ''
WHERE "isSecret";

-- Every account gets the same documented local password. Teammates who have no
-- production account still need to sign in to the mirror.
UPDATE core."user"
SET "passwordHash" = '$2b$10$QBHr8n8bWa.0NaOJBPM4CeOr52kTh5li4xP5lICcmn.CUlmJIWX7S';

-- External side effects, in case a mirror is restored somewhere with network
-- access to the real providers.
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

UPDATE core."workflowVersion"
SET status = 'DEACTIVATED'
WHERE status = 'ACTIVE';

-- A stale cursor would make a re-enabled channel resume mid-history.
UPDATE core."messageFolder" SET "syncCursor" = '';

UPDATE core."webhook"
SET
  "targetUrl" = 'http://127.0.0.1:9/devdata-disabled',
  secret = 'devdata-disabled'
WHERE "deletedAt" IS NULL;

UPDATE core.workspace
SET
  "customDomain" = NULL,
  "isCustomDomainEnabled" = false;

-- Unsubscribe records are addresses of people outside the CRM.
UPDATE core."messageSuppression"
SET "emailAddress" =
  'contact-' || substr(md5("emailAddress"), 1, 12) || '@example.invalid';

-- Assistant conversations quote whatever the operator pasted into them.
UPDATE core."agentChatThread" SET title = 'Scrubbed thread';
UPDATE core."agentMessagePart"
SET
  "textContent" = CASE WHEN "textContent" IS NULL THEN NULL ELSE 'scrubbed' END,
  "reasoningContent" =
    CASE WHEN "reasoningContent" IS NULL THEN NULL ELSE 'scrubbed' END,
  "toolInput" = CASE WHEN "toolInput" IS NULL THEN NULL ELSE '{}'::jsonb END,
  "toolOutput" = CASE WHEN "toolOutput" IS NULL THEN NULL ELSE '{}'::jsonb END,
  "errorDetails" = NULL,
  "sourceUrlUrl" = NULL,
  "sourceUrlTitle" = NULL,
  "sourceDocumentTitle" = NULL,
  "sourceDocumentFilename" = NULL,
  "fileFilename" = NULL;

-- Per-workspace tables. Each workspace stores records in its own schema, so
-- the mailbox scrub has to be applied schema by schema.
DO $$
DECLARE
  workspace_schema text;
BEGIN
  FOR workspace_schema IN
    SELECT "databaseSchema" FROM core.workspace ORDER BY "databaseSchema"
  LOOP
    IF to_regclass(format('%I.message', workspace_schema)) IS NOT NULL THEN
      -- Body length is preserved approximately so list rendering, pagination
      -- and search behave like they do in production.
      EXECUTE format(
        'UPDATE %I.message SET
           subject = ''Scrubbed subject '' || left(md5(id::text), 8),
           text = CASE
             WHEN text IS NULL THEN NULL
             ELSE repeat(''scrubbed '', greatest(1, least(400, length(text) / 9)))
           END,
           "headerMessageId" = ''scrubbed-'' || left(md5(id::text), 16)',
        workspace_schema);
    END IF;

    IF to_regclass(format('%I."messageThread"', workspace_schema)) IS NOT NULL
    THEN
      EXECUTE format(
        'UPDATE %I."messageThread"
         SET subject = ''Scrubbed subject '' || left(md5(id::text), 8)',
        workspace_schema);
    END IF;

    -- A participant already linked to a person or workspace member exposes
    -- nothing new: that address is in the CRM records the mirror keeps.
    -- Everyone else becomes a stable pseudonym so threading still works.
    IF to_regclass(format('%I."messageParticipant"', workspace_schema))
      IS NOT NULL
    THEN
      EXECUTE format(
        'UPDATE %I."messageParticipant" SET
           handle = ''contact-'' || substr(md5(handle), 1, 12)
             || ''@example.invalid'',
           "displayName" = ''Contact '' || substr(md5(handle), 1, 6)
         WHERE "personId" IS NULL AND "workspaceMemberId" IS NULL',
        workspace_schema);
    END IF;

    IF to_regclass(format('%I."calendarEvent"', workspace_schema)) IS NOT NULL
    THEN
      EXECUTE format(
        'UPDATE %I."calendarEvent" SET
           title = ''Scrubbed event '' || left(md5(id::text), 8),
           description = CASE
             WHEN description IS NULL THEN NULL ELSE ''scrubbed'' END,
           location = CASE WHEN location IS NULL THEN NULL ELSE ''scrubbed'' END,
           "iCalUid" = ''scrubbed-'' || left(md5(id::text), 16),
           "conferenceLinkPrimaryLinkLabel" = NULL,
           "conferenceLinkPrimaryLinkUrl" = NULL,
           "conferenceLinkSecondaryLinks" = NULL',
        workspace_schema);
    END IF;

    IF to_regclass(format('%I."calendarEventParticipant"', workspace_schema))
      IS NOT NULL
    THEN
      EXECUTE format(
        'UPDATE %I."calendarEventParticipant" SET
           handle = ''contact-'' || substr(md5(handle), 1, 12)
             || ''@example.invalid'',
           "displayName" = ''Contact '' || substr(md5(handle), 1, 6)
         WHERE "personId" IS NULL AND "workspaceMemberId" IS NULL',
        workspace_schema);
    END IF;

    -- Timeline properties hold before/after values of every edited field, so
    -- they reintroduce scrubbed content. Rows stay for volume.
    IF to_regclass(format('%I."timelineActivity"', workspace_schema))
      IS NOT NULL
    THEN
      EXECUTE format(
        'UPDATE %I."timelineActivity" SET
           properties = ''{}''::jsonb,
           "linkedRecordCachedName" = ''Scrubbed''',
        workspace_schema);
    END IF;

    -- Blobs are not shipped with the mirror, so the paths would dangle anyway.
    IF to_regclass(format('%I.attachment', workspace_schema)) IS NOT NULL THEN
      EXECUTE format(
        'UPDATE %I.attachment SET
           name = ''scrubbed-'' || left(md5(id::text), 8),
           "fullPath" = ''scrubbed'',
           file = NULL',
        workspace_schema);
    END IF;
  END LOOP;
END
$$;

DROP TABLE IF EXISTS public.devdata_manifest;
CREATE TABLE public.devdata_manifest (
  scrub_version integer NOT NULL,
  scrubbed_at timestamptz NOT NULL DEFAULT now(),
  source_host text NOT NULL,
  git_sha text NOT NULL,
  dev_password text NOT NULL
);
