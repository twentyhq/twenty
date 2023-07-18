import { CommentableType, PipelineProgressableType } from '~/generated/graphql';

export enum Entity {
  Company = 'Company',
  Person = 'Person',
  User = 'User',
}

export type EntityTypeForSelect =
  | CommentableType
  | PipelineProgressableType
  | Entity;
