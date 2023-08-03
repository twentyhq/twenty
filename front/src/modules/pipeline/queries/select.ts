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
      companyId
      personId
      amount
      closeDate
      pointOfContactId
      pointOfContact {
        id
        firstName
        lastName
        displayName
        avatarUrl
      }
      probability
    }
  }
`;

export const defaultPipelineProgressOrderBy: PipelineProgresses_Order_By[] = [
  {
    createdAt: Order_By.Asc,
  },
];
