import { type ApolloClient } from '@apollo/client';
import gql from 'graphql-tag';
import {
  type LeadCsvData,
  type MatchResult,
  AUTO_RESOLVE_THRESHOLD,
  REVIEW_THRESHOLD,
} from '@/spreadsheet-import/utils/scoreLeadMatch';
import { capitalize } from 'twenty-shared/utils';

export type LeadResolution = {
  policyId: string;
  existingLeadId?: string;
  action: 'update' | 'reassign' | 'create' | 'review' | 'skip';
  matchedLeadId?: string;
  matchScore?: number;
  matchBreakdown?: Record<string, number>;
  csvData: LeadCsvData;
};

export type LeadResolutionResult = {
  autoResolved: number;
  created: number;
  flaggedForReview: LeadResolution[];
  errors: Array<{ policyId: string; error: string }>;
};

const buildLeadUpdateData = (csvData: LeadCsvData): Record<string, any> => {
  const data: Record<string, any> = {};

  if (csvData.firstName || csvData.lastName) {
    data.name = {};
    if (csvData.firstName) data.name.firstName = csvData.firstName;
    if (csvData.lastName) data.name.lastName = csvData.lastName;
  }

  if (csvData.email) {
    data.emails = { primaryEmail: csvData.email };
  }

  if (csvData.phone) {
    data.phones = { primaryPhoneNumber: csvData.phone };
  }

  if (csvData.city || csvData.state) {
    data.addressCustom = {};
    if (csvData.city) data.addressCustom.addressCity = csvData.city;
    if (csvData.state) data.addressCustom.addressState = csvData.state;
  }

  return data;
};

export const applyLeadResolutions = async ({
  apolloClient,
  resolutions,
  parentObjectNameSingular,
  targetObjectNameSingular,
}: {
  apolloClient: ApolloClient;
  resolutions: LeadResolution[];
  parentObjectNameSingular: string;
  targetObjectNameSingular: string;
}): Promise<LeadResolutionResult> => {
  const result: LeadResolutionResult = {
    autoResolved: 0,
    created: 0,
    flaggedForReview: [],
    errors: [],
  };

  for (const resolution of resolutions) {
    try {
      switch (resolution.action) {
        case 'update': {
          // Update the existing Lead's data
          if (!resolution.matchedLeadId) break;

          const updateData = buildLeadUpdateData(resolution.csvData);

          if (Object.keys(updateData).length > 0) {
            const mutation = gql`
              mutation UpdateLead($idToUpdate: ID!, $input: ${capitalize(targetObjectNameSingular)}UpdateInput!) {
                update${capitalize(targetObjectNameSingular)}(id: $idToUpdate, data: $input) {
                  id
                }
              }
            `;

            await apolloClient.mutate({
              mutation,
              variables: {
                idToUpdate: resolution.matchedLeadId,
                input: updateData,
              },
            });
          }

          result.autoResolved++;
          break;
        }

        case 'reassign': {
          // Change Policy's leadId to matched Lead, then update that Lead
          if (!resolution.matchedLeadId || !resolution.policyId) break;

          // Reassign Policy
          const reassignMutation = gql`
            mutation ReassignPolicyLead($idToUpdate: ID!, $input: ${capitalize(parentObjectNameSingular)}UpdateInput!) {
              update${capitalize(parentObjectNameSingular)}(id: $idToUpdate, data: $input) {
                id
              }
            }
          `;

          await apolloClient.mutate({
            mutation: reassignMutation,
            variables: {
              idToUpdate: resolution.policyId,
              input: { leadId: resolution.matchedLeadId },
            },
          });

          // Update Lead data
          const updateData = buildLeadUpdateData(resolution.csvData);

          if (Object.keys(updateData).length > 0) {
            const updateMutation = gql`
              mutation UpdateReassignedLead($idToUpdate: ID!, $input: ${capitalize(targetObjectNameSingular)}UpdateInput!) {
                update${capitalize(targetObjectNameSingular)}(id: $idToUpdate, data: $input) {
                  id
                }
              }
            `;

            await apolloClient.mutate({
              mutation: updateMutation,
              variables: {
                idToUpdate: resolution.matchedLeadId,
                input: updateData,
              },
            });
          }

          result.autoResolved++;
          break;
        }

        case 'create': {
          // Create new Lead and assign to Policy
          const createData = buildLeadUpdateData(resolution.csvData);

          const createMutation = gql`
            mutation CreateLead($input: ${capitalize(targetObjectNameSingular)}CreateInput!) {
              create${capitalize(targetObjectNameSingular)}(data: $input) {
                id
              }
            }
          `;

          const createResult = await apolloClient.mutate({
            mutation: createMutation,
            variables: { input: createData },
          });

          const resultData = createResult.data as Record<string, any>;
          const newLeadId =
            resultData?.[
              `create${capitalize(targetObjectNameSingular)}`
            ]?.id;

          if (newLeadId && resolution.policyId) {
            const assignMutation = gql`
              mutation AssignNewLead($idToUpdate: ID!, $input: ${capitalize(parentObjectNameSingular)}UpdateInput!) {
                update${capitalize(parentObjectNameSingular)}(id: $idToUpdate, data: $input) {
                  id
                }
              }
            `;

            await apolloClient.mutate({
              mutation: assignMutation,
              variables: {
                idToUpdate: resolution.policyId,
                input: { leadId: newLeadId },
              },
            });
          }

          result.created++;
          break;
        }

        case 'review':
          result.flaggedForReview.push(resolution);
          break;

        case 'skip':
          break;
      }
    } catch (error) {
      result.errors.push({
        policyId: resolution.policyId,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  return result;
};

/**
 * Determines the resolution action based on the best match score and whether
 * the matched Lead is already linked to the Policy.
 */
export const decideResolution = ({
  bestMatch,
  existingLeadId,
  policyId,
  csvData,
}: {
  bestMatch: MatchResult | null;
  existingLeadId?: string;
  policyId: string;
  csvData: LeadCsvData;
}): LeadResolution => {
  if (!bestMatch || bestMatch.score < REVIEW_THRESHOLD) {
    return { policyId, existingLeadId, action: 'create', csvData };
  }

  if (bestMatch.score >= AUTO_RESOLVE_THRESHOLD) {
    const isSameAsExisting = bestMatch.candidateId === existingLeadId;

    return {
      policyId,
      existingLeadId,
      action: isSameAsExisting ? 'update' : 'reassign',
      matchedLeadId: bestMatch.candidateId,
      matchScore: bestMatch.score,
      matchBreakdown: bestMatch.breakdown,
      csvData,
    };
  }

  // 70-94: flag for review
  return {
    policyId,
    existingLeadId,
    action: 'review',
    matchedLeadId: bestMatch.candidateId,
    matchScore: bestMatch.score,
    matchBreakdown: bestMatch.breakdown,
    csvData,
  };
};
