import { RelationOnDeleteAction } from 'twenty-shared/types';

type ForeignKeyOnDelete = {
  sqlAction: 'CASCADE' | 'SET NULL' | 'RESTRICT' | 'NO ACTION';
  onDeleteCode: string;
};

const FOREIGN_KEY_ON_DELETE_BY_ACTION: Record<
  RelationOnDeleteAction,
  ForeignKeyOnDelete
> = {
  [RelationOnDeleteAction.CASCADE]: { sqlAction: 'CASCADE', onDeleteCode: 'c' },
  [RelationOnDeleteAction.SET_NULL]: {
    sqlAction: 'SET NULL',
    onDeleteCode: 'n',
  },
  [RelationOnDeleteAction.RESTRICT]: {
    sqlAction: 'RESTRICT',
    onDeleteCode: 'r',
  },
  [RelationOnDeleteAction.NO_ACTION]: {
    sqlAction: 'NO ACTION',
    onDeleteCode: 'a',
  },
};

export const computeExpectedForeignKeyOnDelete = ({
  onDelete,
}: {
  onDelete: RelationOnDeleteAction | undefined;
}): ForeignKeyOnDelete =>
  FOREIGN_KEY_ON_DELETE_BY_ACTION[onDelete ?? RelationOnDeleteAction.CASCADE];
