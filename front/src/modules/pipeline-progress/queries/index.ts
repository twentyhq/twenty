import { gql } from '@apollo/client';

export const GET_PIPELINES = gql`
  query GetPipelines($where: PipelineWhereInput) {
    findManyPipeline(where: $where) {
      id
      name
      pipelineProgressableType
      pipelineStages {
        id
        name
        color
        index
        pipelineProgresses {
          id
        }
      }
    }
  }
`;

export const GET_PIPELINE_PROGRESS = gql`
  query GetPipelineProgress($where: PipelineProgressWhereInput) {
    findManyPipelineProgress(where: $where) {
      id
      progressableType
      progressableId
      amount
      closeDate
    }
  }
`;

export const UPDATE_PIPELINE_PROGRESS = gql`
  mutation UpdateOnePipelineProgress(
    $id: String
    $amount: Int
    $closeDate: DateTime
  ) {
    updateOnePipelineProgress(
      where: { id: $id }
      data: { amount: { set: $amount }, closeDate: { set: $closeDate } }
    ) {
      id
      amount
      closeDate
    }
  }
`;

export const UPDATE_PIPELINE_PROGRESS_STAGE = gql`
  mutation UpdateOnePipelineProgressStage(
    $id: String
    $pipelineStageId: String
  ) {
    updateOnePipelineProgress(
      where: { id: $id }
      data: { pipelineStage: { connect: { id: $pipelineStageId } } }
    ) {
      id
    }
  }
`;

export const ADD_ENTITY_TO_PIPELINE = gql`
  mutation CreateOnePipelineProgress(
    $uuid: String!
    $entityType: PipelineProgressableType!
    $entityId: String!
    $pipelineId: String!
    $pipelineStageId: String!
  ) {
    createOnePipelineProgress(
      data: {
        id: $uuid
        progressableType: $entityType
        progressableId: $entityId
        pipeline: { connect: { id: $pipelineId } }
        pipelineStage: { connect: { id: $pipelineStageId } }
      }
    ) {
      id
    }
  }
`;
