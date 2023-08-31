import { gql } from '@apollo/client';

export const CREATE_PIPELINE_STAGE = gql`
  mutation CreatePipelineStage($data: PipelineStageCreateInput!) {
    pipelineStage: createOnePipelineStage(data: $data) {
      id
      name
      color
    }
  }
`;
