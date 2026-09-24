import { COMPANY_DOMAIN_NAME_COLUMNS } from 'src/database/commands/upgrade-version-command/2-38/utils/company-domain-name-columns.constant';

const nonCanonicalDomain = (expression: string) => `(
    ${expression} <> lower(${expression})
    OR ${expression} ~ '[:/?#@]|\\s|[^[:ascii:]]'
    OR ${expression} LIKE 'www.%'
    OR ${expression} LIKE '%.'
  )`;

export const buildNonCanonicalDomainNameCondition = (alias: string): string => {
  const primaryLinkUrl = `"${alias}"."${COMPANY_DOMAIN_NAME_COLUMNS.primaryLinkUrl}"`;
  const secondaryLinks = `"${alias}"."${COMPANY_DOMAIN_NAME_COLUMNS.secondaryLinks}"`;

  return `(
  ${nonCanonicalDomain(primaryLinkUrl)}
  OR (
    jsonb_typeof(${secondaryLinks}) = 'array'
    AND EXISTS (
      SELECT 1
      FROM jsonb_array_elements(${secondaryLinks}) AS link
      WHERE link->>'url' IS NOT NULL AND ${nonCanonicalDomain(`link->>'url'`)}
    )
  )
)`;
};
