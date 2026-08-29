import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';

export const buildDomainNameSettingsPatchQuery = (
  workspaceId: string,
): { sql: string; parameters: unknown[] } => ({
  sql: `
UPDATE "core"."fieldMetadata"
SET "settings" = COALESCE("settings", '{}'::jsonb) || jsonb_build_object('type', 'domain')
WHERE "workspaceId" = $1
  AND "universalIdentifier" = $2::uuid
  AND COALESCE("settings" ->> 'type', '') <> 'domain'
`,
  parameters: [
    workspaceId,
    STANDARD_OBJECT_FIELDS.company.domainName.universalIdentifier,
  ],
});
