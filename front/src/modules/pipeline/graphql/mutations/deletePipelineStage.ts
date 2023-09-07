import { gql } from '@apollo/client';

export const DELETE_PIPELINE_STAGE = gql`
  mutation DeletePipelineStage($where: PipelineStageWhereUniqueInput!) {
    pipelineStage: deleteOnePipelineStage(where: $where) {
      id
      name
      color
    }
  }
`;
