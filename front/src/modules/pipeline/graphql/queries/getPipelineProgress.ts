import { gql } from '@apollo/client';

export const GET_PIPELINE_PROGRESS = gql`
  query GetPipelineProgress(
    $where: PipelineProgressWhereInput
    $orderBy: [PipelineProgressOrderByWithRelationInput!]
  ) {
    findManyPipelineProgress(where: $where, orderBy: $orderBy) {
      id
      pipelineStageId
      companyId
      personId
      amount
      closeDate
      pointOfContactId
      pointOfContact {
        id
        firstName
        lastName
        displayName
        avatarUrl
      }
      probability
    }
  }
`;
