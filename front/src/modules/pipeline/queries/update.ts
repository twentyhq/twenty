import { gql } from '@apollo/client';

export const DELETE_PIPELINE_PROGRESS = gql`
  mutation DeleteManyPipelineProgress($ids: [String!]) {
    deleteManyPipelineProgress(where: { id: { in: $ids } }) {
      count
    }
  }
`;

export const UPDATE_PIPELINE_STAGE = gql`
  mutation UpdatePipelineStage($id: String, $data: PipelineStageUpdateInput!) {
    updateOnePipelineStage(where: { id: $id }, data: $data) {
      id
      name
      color
    }
  }
`;

export const UPDATE_PIPELINE_PROGRESS = gql`
  mutation UpdateOnePipelineProgress(
    $data: PipelineProgressUpdateInput!
    $where: PipelineProgressWhereUniqueInput!
  ) {
    updateOnePipelineProgress(where: $where, data: $data) {
      id
      amount
      closeDate
      probability
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

export const CREATE_COMPANY_PIPELINE_PROGRESS = gql`
  mutation CreateOneCompanyPipelineProgress(
    $uuid: String!
    $companyId: String!
    $pipelineId: String!
    $pipelineStageId: String!
  ) {
    createOnePipelineProgress(
      data: {
        id: $uuid
        company: { connect: { id: $companyId } }
        pipeline: { connect: { id: $pipelineId } }
        pipelineStage: { connect: { id: $pipelineStageId } }
      }
    ) {
      id
    }
  }
`;
