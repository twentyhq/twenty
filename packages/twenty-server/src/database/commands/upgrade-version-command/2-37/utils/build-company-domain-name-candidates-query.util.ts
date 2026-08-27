const nonCanonicalDomain = (expression: string) => `(
  ${expression} <> lower(${expression})
  OR ${expression} ~ '[:/?#@]|\\s|[^[:ascii:]]'
  OR ${expression} LIKE 'www.%'
  OR ${expression} LIKE '%.'
)`;

const NON_CANONICAL_SECONDARY_LINKS = `(
  company."domainNameSecondaryLinks" IS NOT NULL
  AND jsonb_typeof(company."domainNameSecondaryLinks") = 'array'
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(company."domainNameSecondaryLinks") AS link
    WHERE link->>'url' IS NOT NULL AND ${nonCanonicalDomain(`link->>'url'`)}
  )
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
  company."domainNamePrimaryLinkUrl" AS "primaryLinkUrl",
  company."domainNameSecondaryLinks" AS "secondaryLinks"
FROM "${schemaName}"."company" company
WHERE company."id" > $1
  AND (
    ${nonCanonicalDomain(`company."domainNamePrimaryLinkUrl"`)}
    OR ${NON_CANONICAL_SECONDARY_LINKS}
  )
ORDER BY company."id"
LIMIT $2
`,
  parameters: [afterCompanyId, batchSize],
});
