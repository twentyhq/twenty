import { PaginatedObjectTypeResults } from './PaginatedObjectTypeResults';

export type PaginatedObjectType<ObjectType extends { id: string }> = {
  [objectNamePlural: string]: PaginatedObjectTypeResults<ObjectType>;
};
