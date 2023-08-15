import { gql } from '@apollo/client';

export const UPDATE_PIPELINE_STAGE = gql`
  mutation UpdatePipelineStage($id: String, $data: PipelineStageUpdateInput!) {
    updateOnePipelineStage(where: { id: $id }, data: $data) {
      id
      name
      color
    }
  }
`;
