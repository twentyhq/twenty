import { gql } from '@apollo/client';

export const DELETE_PIPELINE_PROGRESS = gql`
  mutation DeleteManyPipelineProgress($ids: [String!]) {
    deleteManyPipelineProgress(where: { id: { in: $ids } }) {
      count
    }
  }
`;

export const UPDATE_PIPELINE_STAGE = gql`
  mutation UpdatePipelineStage($id: String, $name: String) {
    updateOnePipelineStage(where: { id: $id }, data: { name: $name }) {
      id
      name
    }
  }
`;
