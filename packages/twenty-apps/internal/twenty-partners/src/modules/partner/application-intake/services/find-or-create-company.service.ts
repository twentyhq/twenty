import type { CoreApiClient, CoreSchema } from 'twenty-client-sdk/core';

import { isNonEmptyString } from 'src/modules/shared/utils/is-non-empty-string.util';
import { createCompany } from 'src/modules/partner/application-intake/graphql/mutations/create-company';
import { findCompaniesByDomain } from 'src/modules/partner/application-intake/graphql/queries/find-companies-by-domain';
import { type SubmitPartnerApplicationInput } from 'src/modules/partner/application-intake/services/submit-partner-application-input.schema';

function normalizeDomainHost(
  value: string | null | undefined,
): string | undefined {
  if (!isNonEmptyString(value)) return undefined;
  const host = value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/[/:?#].*$/, '');
  return host.length > 0 ? host : undefined;
}

// ponytail: matches active rows only — soft-deleted companies still hold the unique index; clear those with `yarn purge:prod`.
export async function findOrCreateCompanyId(
  client: CoreApiClient,
  input: SubmitPartnerApplicationInput,
): Promise<string> {
  const domain = isNonEmptyString(input.domainName)
    ? input.domainName.trim()
    : undefined;
  const host = normalizeDomainHost(domain);

  if (host !== undefined) {
    // Broad ilike catches every stored URL form (bare, any protocol, paths, www).
    // Paginate to exhaustion so the real match is never paged out; client-side
    // normalization rejects false positives on each page.
    let cursor: string | null = null;
    do {
      const existing = await findCompaniesByDomain(client, host, cursor);
      const match = existing.companies?.edges?.find(
        (edge) => normalizeDomainHost(edge.node.domainName?.primaryLinkUrl) === host,
      );
      if (match !== undefined) {
        return match.node.id;
      }
      const pageInfo = existing.companies?.pageInfo;
      cursor = pageInfo?.hasNextPage ? (pageInfo.endCursor ?? null) : null;
    } while (cursor !== null);
  }

  const companyData: CoreSchema.CompanyCreateInput = {
    name: input.companyName.trim(),
  };
  if (domain !== undefined) {
    companyData.domainName = { primaryLinkUrl: domain };
  }
  const companyResult = await createCompany(client, companyData);
  const companyId = companyResult.createCompany?.id;
  if (companyId === undefined) {
    throw new Error('createCompany did not return an id');
  }
  return companyId;
}
