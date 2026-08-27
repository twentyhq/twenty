import { isDefined } from 'twenty-shared/utils';

import { type DomainNameLinks } from 'src/database/commands/upgrade-version-command/2-37/utils/normalize-domain-name-links.util';

export const buildCompanyDomainNameUpdateQuery = ({
  schemaName,
  updates,
}: {
  schemaName: string;
  updates: { id: string; domainName: DomainNameLinks }[];
}): { sql: string; parameters: unknown[] } => ({
  sql: `
UPDATE "${schemaName}"."company" company
SET
  "domainNamePrimaryLinkUrl" = source."primaryLinkUrl",
  "domainNameSecondaryLinks" = source."secondaryLinks"
FROM unnest($1::uuid[], $2::text[], $3::jsonb[])
  AS source("id", "primaryLinkUrl", "secondaryLinks")
WHERE company."id" = source."id"
`,
  parameters: [
    updates.map(({ id }) => id),
    updates.map(({ domainName }) => domainName.primaryLinkUrl),
    updates.map(({ domainName }) =>
      isDefined(domainName.secondaryLinks)
        ? JSON.stringify(domainName.secondaryLinks)
        : null,
    ),
  ],
});
