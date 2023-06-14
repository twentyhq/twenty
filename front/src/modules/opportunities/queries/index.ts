import { gql } from '@apollo/client';

export const GET_PIPELINES = gql`
  query GetPipelines {
    findManyPipeline(skip: 1) {
      id
      name
      pipelineStages {
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
