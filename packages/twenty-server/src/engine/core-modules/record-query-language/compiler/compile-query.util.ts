import { OrderByDirection } from 'twenty-shared/types';
import { isFieldMetadataDateKind } from 'twenty-shared/utils';

import {
  type ObjectRecordFilter,
  type ObjectRecordGroupBy,
  type ObjectRecordOrderBy,
} from 'src/engine/api/graphql/workspace-query-builder/interfaces/object-record.interface';
import { type ObjectMetadataForToolSchema } from 'src/engine/core-modules/record-crud/types/object-metadata-for-tool-schema.type';
import { type CompiledQuery } from 'src/engine/core-modules/record-query-language/types/compiled-query.type';
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

// Select is field-granularity (a composite is selected by its name, not a
// subfield path), so validate entries against the resolver's field names rather
// than the filter resolver, which would accept subfield paths the find layer
// then silently drops.
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

    const suggestion = resolver.suggest(fieldName);

    errors.push({
      path: `select[${index}]`,
      code: 'unknown_field',
      message: `Unknown field "${fieldName}" in select.`,
      ...(suggestion !== undefined ? { suggestion } : {}),
    });
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

const compileFilter = (
  ast: QueryAst,
  resolver: QueryFieldResolver,
  errors: QueryCompileError[],
): ObjectRecordFilter => {
  if (ast.where === undefined) {
    return {};
  }

  const result = compileQueryFilterNode(ast.where, resolver, 'where');

  errors.push(...result.errors);

  return (result.filter ?? {}) as ObjectRecordFilter;
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

  const filter = compileFilter(ast, resolver, errors);

  const query: CompiledQuery =
    ast.aggregate !== undefined
      ? {
          kind: 'aggregate',
          filter,
          groupBy: compileGroupBy(ast.aggregate.groupBy, resolver, errors),
          operation: ast.aggregate.operation,
          field: ast.aggregate.field,
          limit: ast.limit,
        }
      : {
          kind: 'find',
          filter,
          select: compileSelect(ast.select, resolver, errors),
          orderBy: compileOrderBy(ast.orderBy, resolver, errors),
          limit: ast.limit,
          offset: ast.offset,
        };

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return { ok: true, query };
};
