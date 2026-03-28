import { type ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import {
  type LeadCsvData,
  type LeadCandidate,
} from '@/spreadsheet-import/utils/scoreLeadMatch';
import { isDefined } from 'twenty-shared/utils';

const CANDIDATE_BATCH_SIZE = 200;

/**
 * Searches for candidate Lead/Person records that might match the given CSV
 * data. Uses a two-step query: first fetches candidates by email/name using
 * guaranteed fields, then enriches with address data if available.
 */
export const findLeadCandidates = async ({
  apolloClient,
  targetObjectNameSingular,
  targetObjectNamePlural,
  csvDataRows,
}: {
  apolloClient: ApolloClient;
  targetObjectNameSingular: string;
  targetObjectNamePlural: string;
  csvDataRows: LeadCsvData[];
}): Promise<LeadCandidate[]> => {
  const emails = new Set<string>();
  const namePairs: Array<{ firstName: string; lastName: string }> = [];
  const seenNames = new Set<string>();

  for (const row of csvDataRows) {
    if (row.email) {
      emails.add(row.email.toLowerCase());
    }
    if (row.firstName && row.lastName) {
      const key = `${row.firstName.toLowerCase()}|${row.lastName.toLowerCase()}`;
      if (!seenNames.has(key)) {
        seenNames.add(key);
        namePairs.push({ firstName: row.firstName, lastName: row.lastName });
      }
    }
  }

  if (emails.size === 0 && namePairs.length === 0) {
    return [];
  }

  const orConditions: Record<string, unknown>[] = [];

  if (emails.size > 0) {
    for (const email of emails) {
      orConditions.push({
        emails: { primaryEmail: { ilike: email } },
      });
    }
  }

  for (const { firstName, lastName } of namePairs) {
    orConditions.push({
      and: [
        { name: { firstName: { ilike: `%${firstName}%` } } },
        { name: { lastName: { ilike: `%${lastName}%` } } },
      ],
    });
  }

  const capitalizedSingular =
    targetObjectNameSingular.charAt(0).toUpperCase() +
    targetObjectNameSingular.slice(1);

  // Step 1: Query with guaranteed standard fields only
  const baseQuery = gql`
    query FindLeadCandidates($filter: ${capitalizedSingular}FilterInput, $limit: Int) {
      ${targetObjectNamePlural}(filter: $filter, limit: $limit) {
        edges {
          node {
            id
            name {
              firstName
              lastName
            }
            emails {
              primaryEmail
            }
            phones {
              primaryPhoneNumber
            }
          }
        }
      }
    }
  `;

  let candidates: LeadCandidate[];

  try {
    const { data } = await apolloClient.query({
      query: baseQuery,
      variables: {
        filter: { or: orConditions },
        limit: CANDIDATE_BATCH_SIZE,
      },
      fetchPolicy: 'network-only',
    });

    const queryData = data as Record<string, any>;
    const edges = queryData?.[targetObjectNamePlural]?.edges ?? [];

    candidates = edges
      .map((edge: any) => edge.node)
      .filter(isDefined)
      .map(
        (node: any): LeadCandidate => ({
          id: node.id,
          nameFirstName: node.name?.firstName,
          nameLastName: node.name?.lastName,
          emailsPrimaryEmail: node.emails?.primaryEmail,
          phonesPrimaryPhoneNumber: node.phones?.primaryPhoneNumber,
        }),
      );
  } catch (error) {
    console.warn('[findLeadCandidates] Base query failed:', error);

    return [];
  }

  if (candidates.length === 0) {
    return candidates;
  }

  // Step 2: Enrich with address data (separate query so it can't break step 1)
  try {
    const addressQuery = gql`
      query FindLeadAddresses($filter: ${capitalizedSingular}FilterInput, $limit: Int) {
        ${targetObjectNamePlural}(filter: $filter, limit: $limit) {
          edges {
            node {
              id
              addressCustom {
                addressCity
                addressState
              }
            }
          }
        }
      }
    `;

    const candidateIds = candidates.map((c) => c.id);
    const { data } = await apolloClient.query({
      query: addressQuery,
      variables: {
        filter: { id: { in: candidateIds } },
        limit: candidateIds.length,
      },
      fetchPolicy: 'network-only',
    });

    const queryData = data as Record<string, any>;
    const edges = queryData?.[targetObjectNamePlural]?.edges ?? [];
    const addressById = new Map<string, { city?: string; state?: string }>();

    for (const edge of edges) {
      if (edge.node?.id) {
        addressById.set(edge.node.id, {
          city: edge.node.addressCustom?.addressCity,
          state: edge.node.addressCustom?.addressState,
        });
      }
    }

    // Merge address data into candidates
    for (const candidate of candidates) {
      const address = addressById.get(candidate.id);

      if (address) {
        candidate.addressCity = address.city;
        candidate.addressState = address.state;
      }
    }
  } catch {
    // Address enrichment failed — continue with basic fields only.
    // Scoring will just skip the address component.
  }

  return candidates;
};
