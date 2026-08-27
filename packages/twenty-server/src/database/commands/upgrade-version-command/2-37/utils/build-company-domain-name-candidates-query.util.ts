const NON_CANONICAL_PRIMARY_LINK_URL = `(
  company."domainNamePrimaryLinkUrl" <> lower(company."domainNamePrimaryLinkUrl")
  OR company."domainNamePrimaryLinkUrl" ~ '[:/?#@]|\\s|[^[:ascii:]]'
  OR company."domainNamePrimaryLinkUrl" LIKE 'www.%'
  OR company."domainNamePrimaryLinkUrl" LIKE '%.'
)`;

export const buildCompanyDomainNameCandidatesQuery = ({
  schemaName,
  batchSize,
  afterCompanyId,
}: {
  schemaName: string;
  batchSize: number;
  afterCompanyId: string;
}): { sql: string; parameters: unknown[] } => ({
  sql: `
SELECT
  company."id" AS "id",
  company."domainNamePrimaryLinkLabel" AS "primaryLinkLabel",
  company."domainNamePrimaryLinkUrl" AS "primaryLinkUrl",
  company."domainNameSecondaryLinks" AS "secondaryLinks"
FROM "${schemaName}"."company" company
WHERE company."id" > $1
  AND (${NON_CANONICAL_PRIMARY_LINK_URL} OR company."domainNameSecondaryLinks" IS NOT NULL)
ORDER BY company."id"
LIMIT $2
`,
  parameters: [afterCompanyId, batchSize],
});
