import { gql } from '@apollo/client';

export const UPDATE_PIPELINE_STAGE = gql`
  mutation UpdatePipelineStage($id: String, $name: String) {
    updateOnePipelineStage(where: { id: $id }, data: { name: { set: $name } }) {
      id
      name
    }
  }
`;
