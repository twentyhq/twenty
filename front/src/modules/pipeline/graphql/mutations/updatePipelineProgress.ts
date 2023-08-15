import { gql } from '@apollo/client';

export const UPDATE_PIPELINE_PROGRESS = gql`
  mutation UpdateOnePipelineProgress(
    $data: PipelineProgressUpdateInput!
    $where: PipelineProgressWhereUniqueInput!
  ) {
    updateOnePipelineProgress(where: $where, data: $data) {
      id
      amount
      closeDate
      probability
      pointOfContact {
        id
      }
    }
  }
`;
