import { type LinksMetadata } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const buildCompanyDomainNameUpdateQuery = ({
  schemaName,
  updates,
}: {
  schemaName: string;
  updates: { id: string; domainName: LinksMetadata }[];
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
