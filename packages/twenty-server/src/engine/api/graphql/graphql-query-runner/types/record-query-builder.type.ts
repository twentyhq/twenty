import { type Brackets, type ObjectLiteral } from 'typeorm';
import { type ObjectsPermissions } from 'twenty-shared/types';

type WhereCondition = string | Brackets;

// The slice of a query builder the shared parsers drive. Declared structurally rather
// than against a class so both ORM implementations satisfy it without a cast.
export type RecordQueryBuilder = {
  objectRecordsPermissions: ObjectsPermissions;
  expressionMap: {
    joinAttributes: {
      alias: { name: string };
      relation?: { isOneToMany: boolean; isManyToMany: boolean };
    }[];
  };
  where(condition: WhereCondition, parameters?: ObjectLiteral): unknown;
  andWhere(condition: WhereCondition, parameters?: ObjectLiteral): unknown;
  orWhere(condition: WhereCondition, parameters?: ObjectLiteral): unknown;
  select(selection?: string | string[], selectionAliasName?: string): unknown;
  addSelect(selection: string, selectionAliasName?: string): unknown;
  orderBy(
    sort?: string | Record<string, unknown>,
    order?: 'ASC' | 'DESC',
    nulls?: 'NULLS FIRST' | 'NULLS LAST',
  ): unknown;
  addOrderBy(
    sort: string,
    order?: 'ASC' | 'DESC',
    nulls?: 'NULLS FIRST' | 'NULLS LAST',
  ): unknown;
  leftJoin(
    entityOrProperty: string,
    alias: string,
    condition?: string,
    parameters?: ObjectLiteral,
  ): unknown;
  withDeleted(): unknown;
};

// What a read runner additionally needs to execute the query it just composed.
export type ReadRecordQueryBuilder = RecordQueryBuilder & {
  clone(): ReadRecordQueryBuilder;
  setFindOptions(findOptions: { select?: Record<string, boolean> }): unknown;
  limit(count?: number): unknown;
  offset(count?: number): unknown;
  getMany(): Promise<ObjectLiteral[]>;
  getRawAndEntities(): Promise<{
    entities: ObjectLiteral[];
    raw: Record<string, unknown>[];
  }>;
  getRawOne<T extends Record<string, unknown> = ObjectLiteral>(): Promise<
    T | undefined
  >;
};
