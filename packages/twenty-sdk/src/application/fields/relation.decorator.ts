import { type SyncableEntityOptions } from '@/application/syncable-entity-options.type';

import {
  type RelationOnDeleteAction,
  type RelationType,
} from 'twenty-shared/types';

interface WorkspaceRelationMinimumBaseOptions<TClass> {
  label: string;
  description?: string;
  icon?: string;
  inverseSideTargetUniversalIdentifier: string;
  inverseSideFieldKey?: keyof TClass;
  onDelete?: RelationOnDeleteAction;
}

interface WorkspaceRegularRelationBaseOptions<TClass>
  extends WorkspaceRelationMinimumBaseOptions<TClass> {
  isMorphRelation?: false;
}

interface WorkspaceMorphRelationBaseOptions<TClass>
  extends WorkspaceRelationMinimumBaseOptions<TClass> {
  isMorphRelation: true;
  morphId: string;
}

type WorkspaceRelationBaseOptions<TClass> =
  | WorkspaceRegularRelationBaseOptions<TClass>
  | WorkspaceMorphRelationBaseOptions<TClass>;

type WorkspaceOtherRelationOptions<TClass> =
  WorkspaceRelationBaseOptions<TClass> & {
    type: RelationType.ONE_TO_MANY;
  };

type WorkspaceManyToOneRelationOptions<TClass extends object> =
  WorkspaceRelationBaseOptions<TClass> & {
    type: RelationType.MANY_TO_ONE;
    inverseSideFieldKey: keyof TClass;
  };

type RelationOptions<T extends object> = SyncableEntityOptions &
  (WorkspaceOtherRelationOptions<T> | WorkspaceManyToOneRelationOptions<T>);

export const Relation = <T extends object>(
  _: RelationOptions<T>,
): PropertyDecorator => {
  return () => {};
};
