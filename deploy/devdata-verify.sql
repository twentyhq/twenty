\set ON_ERROR_STOP on

-- Asserts that a database contains a scrubbed mirror and not a raw clone.
--
-- deploy/devdata-publish.sh runs this before writing a dump, and
-- deploy/local-data.sh runs it again after restoring one. The second run is the
-- one that matters: it is what stops an unscrubbed dump from being usable on a
-- laptop, whatever produced it.

DO $$
DECLARE
  workspace_schema text;
  violation_count bigint;
  manifest_version integer;
BEGIN
  IF to_regclass('public.devdata_manifest') IS NULL THEN
    RAISE EXCEPTION
      'No devdata_manifest: this database is not a scrubbed mirror.';
  END IF;

  SELECT scrub_version INTO manifest_version FROM public.devdata_manifest;
  IF manifest_version IS DISTINCT FROM 1 THEN
    RAISE EXCEPTION
      'devdata_manifest reports scrub version %, expected 1.',
      manifest_version;
  END IF;

  SELECT
    (SELECT count(*) FROM core."signingKey")
    + (SELECT count(*) FROM core."appToken")
    + (SELECT count(*) FROM core."apiKey")
    + (SELECT count(*) FROM core."twoFactorAuthenticationMethod")
    + (SELECT count(*) FROM core."connectedAccount"
        WHERE "accessToken" IS NOT NULL OR "refreshToken" IS NOT NULL)
    + (SELECT count(*) FROM core."messageChannel" WHERE "isSyncEnabled")
    + (SELECT count(*) FROM core."calendarChannel" WHERE "isSyncEnabled")
    + (SELECT count(*) FROM core."workflowVersion" WHERE status = 'ACTIVE')
    INTO violation_count;
  IF violation_count > 0 THEN
    RAISE EXCEPTION
      'Found % credential or live-integration row(s) that the scrub removes.',
      violation_count;
  END IF;

  FOR workspace_schema IN
    SELECT "databaseSchema" FROM core.workspace ORDER BY "databaseSchema"
  LOOP
    IF to_regclass(format('%I.message', workspace_schema)) IS NOT NULL THEN
      EXECUTE format(
        'SELECT count(*) FROM %I.message
         WHERE (text IS NOT NULL AND text NOT LIKE ''scrubbed%%'')
            OR (subject IS NOT NULL
                AND subject NOT LIKE ''Scrubbed subject %%'')',
        workspace_schema)
        INTO violation_count;
      IF violation_count > 0 THEN
        RAISE EXCEPTION
          'Schema % has % message(s) with real content.',
          workspace_schema, violation_count;
      END IF;
    END IF;

    IF to_regclass(format('%I."calendarEvent"', workspace_schema)) IS NOT NULL
    THEN
      EXECUTE format(
        'SELECT count(*) FROM %I."calendarEvent"
         WHERE title IS NOT NULL AND title NOT LIKE ''Scrubbed event %%''',
        workspace_schema)
        INTO violation_count;
      IF violation_count > 0 THEN
        RAISE EXCEPTION
          'Schema % has % calendar event(s) with real titles.',
          workspace_schema, violation_count;
      END IF;
    END IF;

    IF to_regclass(format('%I."messageParticipant"', workspace_schema))
      IS NOT NULL
    THEN
      EXECUTE format(
        'SELECT count(*) FROM %I."messageParticipant"
         WHERE "personId" IS NULL AND "workspaceMemberId" IS NULL
           AND handle IS NOT NULL
           AND handle NOT LIKE ''%%@example.invalid''',
        workspace_schema)
        INTO violation_count;
      IF violation_count > 0 THEN
        RAISE EXCEPTION
          'Schema % has % unlinked participant address(es) still in the clear.',
          workspace_schema, violation_count;
      END IF;
    END IF;

    IF to_regclass(format('%I."timelineActivity"', workspace_schema))
      IS NOT NULL
    THEN
      EXECUTE format(
        'SELECT count(*) FROM %I."timelineActivity"
         WHERE properties IS NOT NULL AND properties <> ''{}''::jsonb',
        workspace_schema)
        INTO violation_count;
      IF violation_count > 0 THEN
        RAISE EXCEPTION
          'Schema % has % timeline row(s) still holding field diffs.',
          workspace_schema, violation_count;
      END IF;
    END IF;
  END LOOP;

  RAISE NOTICE 'devdata verification passed';
END
$$;
