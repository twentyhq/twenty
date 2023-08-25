import { gql } from '@apollo/client';

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
