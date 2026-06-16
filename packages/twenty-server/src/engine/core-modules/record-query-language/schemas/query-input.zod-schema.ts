import {
  AggregateOperations,
  ObjectRecordGroupByDateGranularity,
} from 'twenty-shared/types';
import { z } from 'zod';

import {
  type QueryFilterNode,
  QUERY_FILTER_OPERATORS,
} from 'src/engine/core-modules/record-query-language/types/query-ast.type';

const operatorEnum = z.enum(QUERY_FILTER_OPERATORS);

const comparisonNodeSchema = z
  .object({
    type: z.literal('cmp'),
    field: z
      .string()
      .min(1)
      .describe(
        'Field name. Use a dot-path for composite subfields (e.g. "name.firstName") and the FK column for relations (e.g. "companyId").',
      ),
    op: operatorEnum.describe('Comparison operator.'),
    value: z
      .unknown()
      .describe(
        'Comparison value. An array for "in"; "NULL" or "NOT_NULL" for "is"; a boolean for "isEmptyArray".',
      ),
  })
  .strict();

// Recursive filter tree. Annotated with the hand-written AST type because Zod
// cannot infer the recursion through z.lazy on its own.
const filterNodeSchema: z.ZodType<QueryFilterNode> = z.lazy(() =>
  z.discriminatedUnion('type', [
    comparisonNodeSchema,
    z
      .object({ type: z.literal('and'), of: z.array(filterNodeSchema).min(1) })
      .strict(),
    z
      .object({ type: z.literal('or'), of: z.array(filterNodeSchema).min(1) })
      .strict(),
    z.object({ type: z.literal('not'), node: filterNodeSchema }).strict(),
  ]),
);

const dateGranularityValues = Object.values(
  ObjectRecordGroupByDateGranularity,
).filter((value) => value !== ObjectRecordGroupByDateGranularity.NONE) as [
  string,
  ...string[],
];

const orderByItemSchema = z
  .object({
    field: z.string().min(1),
    direction: z.enum(['asc', 'desc']),
    nulls: z.enum(['first', 'last']).optional(),
  })
  .strict();

const groupByItemSchema = z
  .object({
    field: z.string().min(1),
    granularity: z
      .enum(dateGranularityValues)
      .optional()
      .describe('Date bucket size. Honoured for date fields only.'),
    timeZone: z.string().optional(),
    weekStartDay: z.string().optional(),
  })
  .strict();

const aggregateSchema = z
  .object({
    groupBy: z
      .array(groupByItemSchema)
      .min(1)
      .max(2)
      .describe('One or two dimensions to group by.'),
    operation: z
      .enum(Object.keys(AggregateOperations) as [string, ...string[]])
      .describe(
        'Aggregate to compute per group (COUNT, SUM, AVG, MIN, MAX, …).',
      ),
    field: z
      .string()
      .optional()
      .describe(
        'Field to aggregate. Required for every operation other than COUNT.',
      ),
  })
  .strict();

export const QueryInputSchema = z
  .object({
    from: z
      .string()
      .min(1)
      .describe('Object to query by its singular API name (e.g. "person").'),
    select: z
      .array(z.string())
      .optional()
      .describe(
        'Fields to return. "*" for all (the default). Relations are referenced by their FK column (e.g. "companyId").',
      ),
    where: filterNodeSchema
      .optional()
      .describe(
        'Filter tree. Nodes are {type:"cmp",field,op,value}, {type:"and"|"or",of:[…]} or {type:"not",node}.',
      ),
    orderBy: z
      .array(orderByItemSchema)
      .optional()
      .describe('Sort order, applied in array order.'),
    limit: z
      .number()
      .int()
      .positive()
      .max(100)
      .optional()
      .describe('Maximum records to return (default 10, max 100).'),
    offset: z.number().int().nonnegative().optional(),
    aggregate: aggregateSchema
      .optional()
      .describe('Group and aggregate instead of returning individual records.'),
  })
  .strict();
