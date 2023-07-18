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
    updateOnePipelineStage(where: { id: $id }, data: { name: { set: $name } }) {
      id
      name
    }
  }
`;

export const UPDATE_PIPELINE_PROGRESS = gql`
  mutation UpdateOnePipelineProgress(
    $id: String
    $amount: Int
    $closeDate: DateTime
    $closeConfidence: Int
    $pointOfContactId: String
  ) {
    updateOnePipelineProgress(
      where: { id: $id }
      data: {
        amount: { set: $amount }
        closeDate: { set: $closeDate }
        closeConfidence: { set: $closeConfidence }
        pointOfContact: { connect: { id: $pointOfContactId } }
      }
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
