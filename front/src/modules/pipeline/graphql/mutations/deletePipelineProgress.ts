import { gql } from '@apollo/client';

export const DELETE_PIPELINE_PROGRESS = gql`
  mutation DeleteManyPipelineProgress($ids: [String!]) {
    deleteManyPipelineProgress(where: { id: { in: $ids } }) {
      count
    }
  }
`;
