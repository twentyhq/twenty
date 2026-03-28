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
 * data. Uses OR filters on email and name (case-insensitive) to find
 * potential matches.
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

  const query = gql`
    query FindLeadCandidates($filter: ${capitalizedSingular}FilterInput, $first: Int) {
      ${targetObjectNamePlural}(filter: $filter, first: $first) {
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
            addressCustom {
              addressCity
              addressState
            }
          }
        }
      }
    }
  `;

  try {
    const { data } = await apolloClient.query({
      query,
      variables: {
        filter: { or: orConditions },
        first: CANDIDATE_BATCH_SIZE,
      },
      fetchPolicy: 'network-only',
    });

    const queryData = data as Record<string, any>;
    const edges = queryData?.[targetObjectNamePlural]?.edges ?? [];

    return edges
      .map((edge: any) => edge.node)
      .filter(isDefined)
      .map(
        (node: any): LeadCandidate => ({
          id: node.id,
          nameFirstName: node.name?.firstName,
          nameLastName: node.name?.lastName,
          emailsPrimaryEmail: node.emails?.primaryEmail,
          phonesPrimaryPhoneNumber: node.phones?.primaryPhoneNumber,
          addressCity: node.addressCustom?.addressCity,
          addressState: node.addressCustom?.addressState,
        }),
      );
  } catch (error) {
    console.warn('[findLeadCandidates] Query failed:', error);

    return [];
  }
};
