import { type QueryCompileError } from 'src/engine/core-modules/record-query-language/types/query-compile-result.type';
import {
  type QueryComparisonNode,
  type QueryFilterNode,
} from 'src/engine/core-modules/record-query-language/types/query-ast.type';
import {
  buildNestedTree,
  type QueryFieldResolver,
} from 'src/engine/core-modules/record-query-language/compiler/resolve-query-field.util';

export type CompiledFilterNode = {
  filter?: Record<string, unknown>;
  errors: QueryCompileError[];
};

const compileComparison = (
  node: QueryComparisonNode,
  resolver: QueryFieldResolver,
  astPath: string,
): CompiledFilterNode => {
  const resolution = resolver.resolve(node.field, `${astPath}.field`);

  if (!resolution.ok) {
    return { errors: [resolution.error] };
  }

  const { columnPath, allowedOperators, leafSchema } = resolution.resolved;

  if (!allowedOperators.includes(node.op)) {
    return {
      errors: [
        {
          path: `${astPath}.op`,
          code: 'operator_not_allowed',
          message: `Operator "${node.op}" is not allowed on "${node.field}". Allowed: ${allowedOperators.join(', ')}.`,
        },
      ],
    };
  }

  if (node.value === undefined) {
    return {
      errors: [
        {
          path: `${astPath}.value`,
          code: 'value_type_mismatch',
          message: `Operator "${node.op}" on "${node.field}" requires a value.`,
        },
      ],
    };
  }

  const parsed = leafSchema.safeParse({ [node.op]: node.value });

  if (!parsed.success) {
    return {
      errors: [
        {
          path: `${astPath}.value`,
          code: 'value_type_mismatch',
          message: `Invalid value for "${node.op}" on "${node.field}": ${parsed.error.issues[0]?.message ?? 'type mismatch'}.`,
        },
      ],
    };
  }

  const leaf = {
    [node.op]: (parsed.data as Record<string, unknown>)[node.op],
  };

  return { filter: buildNestedTree(columnPath, leaf), errors: [] };
};

// Walks the filter AST, resolving and validating each comparison against the
// object's own field schemas, and assembles the existing ObjectRecordFilter
// tree. Returns no filter when any node fails so callers surface every error at
// once.
export const compileQueryFilterNode = (
  node: QueryFilterNode,
  resolver: QueryFieldResolver,
  astPath: string,
): CompiledFilterNode => {
  switch (node.type) {
    case 'cmp':
      return compileComparison(node, resolver, astPath);
    case 'and':
    case 'or': {
      const errors: QueryCompileError[] = [];
      const compiled: Record<string, unknown>[] = [];

      node.of.forEach((child, index) => {
        const result = compileQueryFilterNode(
          child,
          resolver,
          `${astPath}.of[${index}]`,
        );

        errors.push(...result.errors);

        if (result.filter !== undefined) {
          compiled.push(result.filter);
        }
      });

      if (errors.length > 0) {
        return { errors };
      }

      return { filter: { [node.type]: compiled }, errors: [] };
    }
    case 'not': {
      const result = compileQueryFilterNode(
        node.node,
        resolver,
        `${astPath}.node`,
      );

      if (result.errors.length > 0) {
        return { errors: result.errors };
      }

      return { filter: { not: result.filter }, errors: [] };
    }
  }
};
