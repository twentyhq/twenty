import { gql } from '@apollo/client';

import { SelectedSortType } from '@/ui/filter-n-sort/types/interface';
import {
  PipelineProgressOrderByWithRelationInput as PipelineProgresses_Order_By,
  SortOrder as Order_By,
} from '~/generated/graphql';

export type PipelineProgressesSelectedSortType =
  SelectedSortType<PipelineProgresses_Order_By>;

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
      }
    }
  }
`;

export const GET_PIPELINE_PROGRESS = gql`
  query GetPipelineProgress(
    $where: PipelineProgressWhereInput
    $orderBy: [PipelineProgressOrderByWithRelationInput!]
  ) {
    findManyPipelineProgress(where: $where, orderBy: $orderBy) {
      id
      pipelineStageId
      progressableType
      progressableId
      amount
      closeDate
      pointOfContactId
      pointOfContact {
        id
        firstName
        lastName
      }
      probability
    }
  }
`;

export const UPDATE_PIPELINE_PROGRESS = gql`
  mutation UpdateOnePipelineProgress(
    $id: String
    $amount: Int
    $closeDate: DateTime
    $probability: Int
    $pointOfContactId: String
  ) {
    updateOnePipelineProgress(
      where: { id: $id }
      data: {
        amount: $amount
        closeDate: $closeDate
        probability: $probability
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

export const defaultPipelineProgressOrderBy: PipelineProgresses_Order_By[] = [
  {
    createdAt: Order_By.Asc,
  },
];
