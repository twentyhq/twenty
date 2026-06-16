import { OrderByDirection } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import {
  type QueryCompileError,
  type QueryCompileResult,
} from 'src/engine/core-modules/record-query-language/types/query-compile-result.type';
import {
  type QueryAst,
  type QueryGroupByItem,
  type QueryOrderByItem,
} from 'src/engine/core-modules/record-query-language/types/query-ast.type';
import { compileQueryFilterNode } from 'src/engine/core-modules/record-query-language/compiler/compile-query-filter.util';
import {
  buildNestedTree,
  createQueryFieldResolver,
  type QueryFieldResolver,
} from 'src/engine/core-modules/record-query-language/compiler/resolve-query-field.util';

const toOrderByDirection = (
  direction: 'asc' | 'desc',
  nulls?: 'first' | 'last',
): OrderByDirection => {
  if (direction === 'asc') {
    return nulls === 'last'
      ? OrderByDirection.AscNullsLast
      : OrderByDirection.AscNullsFirst;
  }

  return nulls === 'first'
    ? OrderByDirection.DescNullsFirst
    : OrderByDirection.DescNullsLast;
};

const compileSelect = (
  select: string[] | undefined,
  resolver: QueryFieldResolver,
  errors: QueryCompileError[],
): string[] => {
  if (select === undefined || select.includes('*')) {
    return ['*'];
  }

  select.forEach((fieldName, index) => {
    if (resolver.fieldNames.includes(fieldName)) {
      return;
    }

    const resolution = resolver.resolve(fieldName, `select[${index}]`);

    if (!resolution.ok) {
      errors.push(resolution.error);
    }
  });

  return select;
};

const compileOrderBy = (
  items: QueryOrderByItem[] | undefined,
  resolver: QueryFieldResolver,
  errors: QueryCompileError[],
): ObjectRecordOrderBy => {
  if (items === undefined) {
    return [];
  }

  const orderBy: ObjectRecordOrderBy = [];

  items.forEach((item, index) => {
    const resolution = resolver.resolve(item.field, `orderBy[${index}].field`);

    if (!resolution.ok) {
      errors.push(resolution.error);

      return;
    }

    orderBy.push(
      buildNestedTree(
        resolution.resolved.columnPath,
        toOrderByDirection(item.direction, item.nulls),
      ) as ObjectRecordOrderBy[number],
    );
  });

  return orderBy;
};

const compileGroupBy = (
  items: QueryGroupByItem[],
  resolver: QueryFieldResolver,
  errors: QueryCompileError[],
): ObjectRecordGroupBy => {
  const groupBy: ObjectRecordGroupBy = [];

  items.forEach((item, index) => {
    const resolution = resolver.resolve(
      item.field,
      `aggregate.groupBy[${index}].field`,
    );

    if (!resolution.ok) {
      errors.push(resolution.error);

      return;
    }

    const { columnPath, field } = resolution.resolved;

    if (item.granularity !== undefined && isFieldMetadataDateKind(field.type)) {
      const dateLeaf = {
        granularity: item.granularity,
        ...(item.timeZone !== undefined ? { timeZone: item.timeZone } : {}),
        ...(item.weekStartDay !== undefined
          ? { weekStartDay: item.weekStartDay }
          : {}),
      };

      groupBy.push(
        buildNestedTree(columnPath, dateLeaf) as ObjectRecordGroupBy[number],
      );

      return;
    }

    groupBy.push(
      buildNestedTree(columnPath, true) as ObjectRecordGroupBy[number],
    );
  });

  return groupBy;
};

// Validates a parsed query AST against the object's metadata and lowers it into
// the existing ObjectRecordFilter / orderBy / groupBy shapes. All capability
// and permission enforcement happens downstream in the Common API runners; this
// only translates and reports field-level errors.
export const compileQuery = (
  ast: QueryAst,
  objectMetadata: ObjectMetadataForToolSchema,
): QueryCompileResult => {
  const resolver = createQueryFieldResolver(objectMetadata);
  const errors: QueryCompileError[] = [];
  const warnings: string[] = [];

  let filter: ObjectRecordFilter = {};

  if (ast.where !== undefined) {
    const result = compileQueryFilterNode(ast.where, resolver, 'where');

    errors.push(...result.errors);

    if (result.filter !== undefined) {
      filter = result.filter as ObjectRecordFilter;
    }
  }

  const select = compileSelect(ast.select, resolver, errors);
  const orderBy = compileOrderBy(ast.orderBy, resolver, errors);

  if (ast.aggregate !== undefined) {
    const groupBy = compileGroupBy(ast.aggregate.groupBy, resolver, errors);

    if (errors.length > 0) {
      return { ok: false, errors };
    }

    return {
      ok: true,
      warnings,
      query: {
        kind: 'aggregate',
        filter,
        groupBy,
        operation: ast.aggregate.operation,
        field: ast.aggregate.field,
        limit: ast.limit,
      },
    };
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    warnings,
    query: {
      kind: 'find',
      filter,
      orderBy,
      select,
      limit: ast.limit,
      offset: ast.offset,
    },
  };
};
