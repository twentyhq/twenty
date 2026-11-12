import { MUTATION_MAX_MERGE_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import { z } from 'zod';

import { MCP_DATABASE_CRUD_TOOL_ANNOTATIONS } from 'src/engine/api/mcp/constants/mcp-database-crud-tool-annotations.constant';
import { type McpAnnotatedTool } from 'src/engine/api/mcp/types/mcp-annotated-tool.type';
import { type McpToolSet } from 'src/engine/api/mcp/types/mcp-tool-set.type';
import { FIND_RECORDS_TOOL_DEFAULT_LIMIT } from 'src/engine/core-modules/record-crud/constants/find-records-tool-default-limit.constant';
import { GROUP_BY_RECORDS_TOOL_DEFAULT_LIMIT } from 'src/engine/core-modules/record-crud/constants/group-by-records-tool-default-limit.constant';
import { GROUP_BY_RECORDS_TOOL_MAX_DIMENSIONS } from 'src/engine/core-modules/record-crud/constants/group-by-records-tool-max-dimensions.constant';
import { WRITE_RECORDS_TOOL_MAX_RECORDS } from 'src/engine/core-modules/record-crud/constants/write-records-tool-max-records.constant';
import { type DatabaseCrudOperation } from 'src/engine/core-modules/tool-provider/constants/database-crud-operation.const';
import { type ToolRegistryService } from 'src/engine/core-modules/tool-provider/services/tool-registry.service';
import { type ToolContext } from 'src/engine/core-modules/tool-provider/types/tool-context.type';
import { buildInvalidToolArgumentsOutput } from 'src/engine/core-modules/tool-provider/utils/build-invalid-tool-arguments-output.util';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const FIELD_NAMES_HINT =
  'Call get_field_metadata({ objectName }) for the field names and types of an object.';

const FILTER_DESCRIPTION =
  'Conditions keyed by field name, each holding one operator object: { <field>: { eq | neq | in | gt | gte | lt | lte | like | ilike | startsWith | endsWith | is: "NULL" | "NOT_NULL" } }. ' +
  'Composite fields take their sub-field: { name: { firstName: { ilike: "%ada%" } } }, { emails: { primaryEmail: { eq: "a@b.com" } } }, { amount: { amountMicros: { gt: 1000000 } } }. ' +
  'Filter a relation by its join column: { companyId: { eq: "<uuid>" } }. Multi-select and array fields use containsAny, containsIlike or isEmptyArray. ' +
  'Combine with { and: [...] }, { or: [...] }, { not: {...} }.';

const objectName = z
  .string()
  .min(1)
  .describe(
    'Object to operate on, singular or plural (e.g. "company" or "companies"). list_object_metadata_names lists the objects of this workspace.',
  );

const filter = z.record(z.string(), z.unknown());

const record = z.record(z.string(), z.unknown());

const records = z
  .array(record)
  .min(1)
  .max(WRITE_RECORDS_TOOL_MAX_RECORDS)
  .describe(
    `Records keyed by field name. Maximum ${WRITE_RECORDS_TOOL_MAX_RECORDS} per call. Composite fields take an object of sub-fields, relations take <name>Id. ${FIELD_NAMES_HINT}`,
  );

const findRecordsInputSchema = z.object({
  objectName,
  select: z
    .array(z.string())
    .min(1)
    .describe(
      "Fields to include in the response. Use '*' to return all fields, or list specific field names. Relation fields resolve to related records as {id, label} summaries.",
    ),
  filter: filter.optional().describe(FILTER_DESCRIPTION),
  orderBy: z
    .array(z.record(z.string(), z.unknown()))
    .optional()
    .describe(
      'Sort criteria, one field per item: [{ createdAt: "DescNullsLast" }]. Directions: AscNullsFirst, AscNullsLast, DescNullsFirst, DescNullsLast. Composite fields take an object with one sub-field.',
    ),
  limit: z
    .number()
    .int()
    .positive()
    .default(FIND_RECORDS_TOOL_DEFAULT_LIMIT)
    .describe(
      `Maximum number of records to return (default: ${FIND_RECORDS_TOOL_DEFAULT_LIMIT}, max: 100). Start small and increase only if needed.`,
    ),
  offset: z
    .number()
    .int()
    .optional()
    .describe('Number of records to skip (default: 0).'),
});

const groupRecordsInputSchema = z.object({
  objectName,
  groupBy: z
    .array(z.record(z.string(), z.unknown()))
    .min(1)
    .max(GROUP_BY_RECORDS_TOOL_MAX_DIMENSIONS)
    .describe(
      `Fields to group by (max ${GROUP_BY_RECORDS_TOOL_MAX_DIMENSIONS}), one field per item: {"stage": true}, {"companyId": true}, {"createdAt": {"granularity": "MONTH", "timeZone": "UTC"}}, {"name": {"firstName": true}}.`,
    ),
  aggregateOperation: z
    .string()
    .optional()
    .describe(
      'Aggregate to compute per group: COUNT (default), SUM, AVG, MIN, MAX and others. Any operation other than COUNT requires aggregateFieldName.',
    ),
  aggregateFieldName: z
    .string()
    .optional()
    .describe(
      'Field to aggregate, with its sub-field for composites (e.g. "amount.amountMicros").',
    ),
  filter: filter.optional().describe(FILTER_DESCRIPTION),
  limit: z
    .number()
    .int()
    .positive()
    .default(GROUP_BY_RECORDS_TOOL_DEFAULT_LIMIT)
    .describe(
      `Maximum number of groups to return (default: ${GROUP_BY_RECORDS_TOOL_DEFAULT_LIMIT}, max: 100).`,
    ),
  orderBy: z
    .enum(['ASC', 'DESC'])
    .optional()
    .describe('Order groups by aggregate value. DESC (default) gives top N.'),
});

const createRecordsInputSchema = z.object({ objectName, records });

const updateRecordInputSchema = z.object({
  objectName,
  id: z.uuid().describe('The UUID of the record to update.'),
  data: record.describe(
    `Field values to change, keyed by field name. Unspecified fields stay unchanged. ${FIELD_NAMES_HINT}`,
  ),
});

const updateRecordsInputSchema = z.object({
  objectName,
  filter: filter.describe(
    `Selects the records to update. A broad filter updates many records at once: verify its scope with find_records first. ${FILTER_DESCRIPTION}`,
  ),
  data: record.describe(
    'Field values applied identically to every matching record.',
  ),
});

const deleteRecordsInputSchema = z.object({
  objectName,
  filter: filter.describe(
    `Selects the records to delete; use { id: { in: [...] } } to delete by id. A broad filter deletes many records at once: verify its scope with find_records first. ${FILTER_DESCRIPTION}`,
  ),
});

const mergeRecordsInputSchema = z.object({
  objectName,
  ids: z
    .array(z.uuid())
    .min(2)
    .max(MUTATION_MAX_MERGE_RECORDS)
    .describe('The UUIDs of the duplicate records to merge into one.'),
  conflictPriorityIndex: z
    .number()
    .int()
    .min(0)
    .describe(
      'The position in ids of the record to keep. Its values win when the records have conflicting values.',
    ),
  dryRun: z
    .boolean()
    .optional()
    .describe(
      'When true, returns the merged record as it would be saved without changing any data.',
    ),
});

type GenericRecordToolFactory = {
  name: string;
  create: (args: {
    toolRegistry: Pick<ToolRegistryService, 'resolveAndExecuteDatabaseCrud'>;
    context: ToolContext;
  }) => McpAnnotatedTool;
};

const defineGenericRecordTool = <
  TSchema extends z.ZodType<{
    objectName: string;
    filter?: Record<string, unknown>;
  }>,
>({
  name,
  operation,
  description,
  inputSchema,
  argumentNamesReadBesideFilter = [],
  toOperationArguments,
}: {
  name: string;
  operation: DatabaseCrudOperation;
  description: string;
  inputSchema: TSchema;
  // The operation reads these from the same object as the filter fields, so a field sharing a name cannot be filtered
  argumentNamesReadBesideFilter?: string[];
  toOperationArguments: (input: z.infer<TSchema>) => Record<string, unknown>;
}): GenericRecordToolFactory => ({
  name,
  create: ({ toolRegistry, context }) => ({
    description,
    inputSchema,
    annotations: MCP_DATABASE_CRUD_TOOL_ANNOTATIONS[operation],
    execute: async (parameters: unknown): Promise<ToolOutput> => {
      const parsed = await inputSchema.safeParseAsync(parameters);

      if (!parsed.success) {
        return buildInvalidToolArgumentsOutput({
          toolName: name,
          error: parsed.error,
        });
      }

      const unfilterableFieldName = argumentNamesReadBesideFilter.find(
        (argumentName) => argumentName in (parsed.data.filter ?? {}),
      );

      if (isDefined(unfilterableFieldName)) {
        return {
          success: false,
          message: `Cannot filter ${name} on "${unfilterableFieldName}"`,
          error: `A field named "${unfilterableFieldName}" cannot be used in the filter of ${name} because it is also an argument of the tool. Filter on another field.`,
        };
      }

      return toolRegistry.resolveAndExecuteDatabaseCrud({
        objectName: parsed.data.objectName,
        operation,
        args: toOperationArguments(parsed.data),
        context,
      });
    },
  }),
});

// Same definitions in every workspace: the object is an argument, so clients that snapshot tools/list stay valid
const GENERIC_RECORD_TOOL_FACTORIES: GenericRecordToolFactory[] = [
  defineGenericRecordTool({
    name: 'find_records',
    operation: 'find_many',
    description:
      'Search the records of an object with filters, sorting and pagination. Returns the matching records, a "count" of total matches and a "hasNextPage" flag: when it is true, continue with a higher offset before concluding a record is absent or answering count questions.',
    inputSchema: findRecordsInputSchema,
    argumentNamesReadBesideFilter: ['limit', 'offset', 'orderBy', 'select'],
    toOperationArguments: ({
      objectName: _objectName,
      filter: recordFilter,
      ...rest
    }) => ({ ...recordFilter, ...rest }),
  }),
  defineGenericRecordTool({
    name: 'group_records',
    operation: 'group_by',
    description:
      'Group the records of an object by one or two fields and compute an aggregate per group. Use for questions like "how many deals per stage?" or "total revenue by company".',
    inputSchema: groupRecordsInputSchema,
    argumentNamesReadBesideFilter: [
      'groupBy',
      'aggregateOperation',
      'aggregateFieldName',
      'limit',
      'orderBy',
    ],
    toOperationArguments: ({
      objectName: _objectName,
      filter: recordFilter,
      ...rest
    }) => ({ ...recordFilter, ...rest }),
  }),
  defineGenericRecordTool({
    name: 'create_records',
    operation: 'create_many',
    description:
      'Create one or more records of an object. Returns the created records.',
    inputSchema: createRecordsInputSchema,
    toOperationArguments: (input) => ({ records: input.records }),
  }),
  defineGenericRecordTool({
    name: 'update_record',
    operation: 'update_one',
    description:
      'Update one record by id. Only the fields passed in data change.',
    inputSchema: updateRecordInputSchema,
    toOperationArguments: ({ id, data }) => ({ ...data, id }),
  }),
  defineGenericRecordTool({
    name: 'update_records',
    operation: 'update_many',
    description:
      'Apply the SAME field values to every record matching a filter (e.g. a bulk status change). When each record needs its own values, use upsert_records.',
    inputSchema: updateRecordsInputSchema,
    toOperationArguments: (input) => ({
      filter: input.filter,
      data: input.data,
    }),
  }),
  defineGenericRecordTool({
    name: 'upsert_records',
    operation: 'upsert_many',
    description:
      'Insert or update several records, each with its own values. Existing records are matched by id or unique fields and updated; the others are created.',
    inputSchema: createRecordsInputSchema,
    toOperationArguments: (input) => ({ records: input.records }),
  }),
  defineGenericRecordTool({
    name: 'delete_records',
    operation: 'delete_many',
    description:
      'Soft-delete the records matching a filter. Deleted records are hidden from normal queries and can be restored.',
    inputSchema: deleteRecordsInputSchema,
    toOperationArguments: (input) => ({ filter: input.filter }),
  }),
  defineGenericRecordTool({
    name: 'merge_records',
    operation: 'merge_many',
    description: `Merge 2 to ${MUTATION_MAX_MERGE_RECORDS} duplicate records into one, like the Merge action in the app. The record at conflictPriorityIndex is kept, its empty fields are filled from the others, and every linked record is moved to it. The other records are permanently deleted. Call it with dryRun: true first to preview the result.`,
    inputSchema: mergeRecordsInputSchema,
    toOperationArguments: ({ ids, conflictPriorityIndex, dryRun }) => ({
      ids,
      conflictPriorityIndex,
      dryRun,
    }),
  }),
];

export const GENERIC_RECORD_TOOL_NAMES = GENERIC_RECORD_TOOL_FACTORIES.map(
  ({ name }) => name,
);

export const createGenericRecordTools = ({
  toolRegistry,
  context,
}: {
  toolRegistry: Pick<ToolRegistryService, 'resolveAndExecuteDatabaseCrud'>;
  context: ToolContext;
}): McpToolSet =>
  Object.fromEntries(
    GENERIC_RECORD_TOOL_FACTORIES.map(({ name, create }) => [
      name,
      create({ toolRegistry, context }),
    ]),
  );
