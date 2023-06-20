import { gql } from '@apollo/client';

export const GET_PIPELINES = gql`
  query GetPipelines {
    findManyPipeline {
      id
      name
      pipelineProgressableType
      pipelineStages {
        id
        name
        color
        pipelineProgresses {
          id
          progressableType
          progressableId
        }
      }
    }
  }
`;

export const UPDATE_PIPELINE_STAGE = gql`
  mutation UpdateOnePipelineProgress($id: String, $pipelineStageId: String) {
    updateOnePipelineProgress(
      where: { id: $id }
      data: { pipelineStage: { connect: { id: $pipelineStageId } } }
    ) {
      id
    }
  }
`;
