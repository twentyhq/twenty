import { buildNonCanonicalDomainNameCondition } from 'src/database/commands/upgrade-version-command/2-38/utils/build-non-canonical-domain-name-condition.util';
import { COMPANY_DOMAIN_NAME_COLUMNS } from 'src/database/commands/upgrade-version-command/2-38/utils/company-domain-name-columns.constant';

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
  company."${COMPANY_DOMAIN_NAME_COLUMNS.primaryLinkUrl}" AS "primaryLinkUrl",
  company."${COMPANY_DOMAIN_NAME_COLUMNS.secondaryLinks}" AS "secondaryLinks"
FROM "${schemaName}"."company" company
WHERE company."id" > $1
  AND ${buildNonCanonicalDomainNameCondition('company')}
ORDER BY company."id"
LIMIT $2
`,
  parameters: [afterCompanyId, batchSize],
});
