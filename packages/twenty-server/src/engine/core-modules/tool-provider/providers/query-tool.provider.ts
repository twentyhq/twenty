import { Injectable } from '@nestjs/common';

import { ToolCategory } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';

import { toToolJsonSchema } from 'src/engine/core-modules/record-crud/utils/to-tool-json-schema.util';
import { QueryToolInputSchema } from 'src/engine/core-modules/record-crud/zod-schemas/query-tool.zod-schema';
import { type GenerateDescriptorOptions } from 'src/engine/core-modules/tool-provider/interfaces/generate-descriptor-options.type';
import { type ToolProviderContext } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider-context.type';
import { type ToolProvider } from 'src/engine/core-modules/tool-provider/interfaces/tool-provider.interface';
import { type ToolDescriptor } from 'src/engine/core-modules/tool-provider/types/tool-descriptor.type';
import { type ToolIndexEntry } from 'src/engine/core-modules/tool-provider/types/tool-index-entry.type';
import { type ToolOutput } from 'src/engine/core-modules/tool/types/tool-output.type';

const QUERY_TOOL_NAME = 'query';

const QUERY_TOOL_DESCRIPTION = [
  'Read records with one structured query covering nested filters, sorting, pagination, field selection and aggregation.',
  'Prefer this over find_many/group_by whenever a request combines several conditions or needs an aggregate.',
  'Shape: { from, select?, where?, orderBy?, limit?, offset?, aggregate? }.',
  'where is a tree: {type:"cmp",field,op,value} | {type:"and"|"or",of:[…]} | {type:"not",node}.',
  'Use field names directly, dot-paths for composite subfields (e.g. "name.firstName"), and the FK column for relations (e.g. "companyId").',
  'Example: {"from":"person","where":{"type":"or","of":[{"type":"cmp","field":"name.firstName","op":"ilike","value":"%ada%"},{"type":"cmp","field":"jobTitle","op":"eq","value":"CEO"}]},"orderBy":[{"field":"createdAt","direction":"desc"}],"limit":10}.',
  'Aggregate example: {"from":"opportunity","aggregate":{"groupBy":[{"field":"stage"}],"operation":"SUM","field":"amount.amountMicros"}}.',
].join(' ');

// Emits a single object-agnostic `query` tool. Its descriptor carries
// `executionRef.kind === 'query'` and is dispatched inline by
// ToolExecutorService, so the static-tool path is unreachable.
@Injectable()
export class QueryToolProvider implements ToolProvider {
  readonly category = ToolCategory.QUERY;

  async isAvailable(_context: ToolProviderContext): Promise<boolean> {
    return true;
  }

  async executeStaticTool(
    toolName: string,
    _args: Record<string, unknown>,
    _context: ToolProviderContext,
  ): Promise<ToolOutput> {
    throw new Error(
      `QueryToolProvider does not emit static-kind descriptors (tool: ${toolName})`,
    );
  }

  async generateDescriptors(
    _context: ToolProviderContext,
    options?: GenerateDescriptorOptions,
  ): Promise<(ToolIndexEntry | ToolDescriptor)[]> {
    const toolNames = options?.toolNames;

    if (isDefined(toolNames) && !toolNames.has(QUERY_TOOL_NAME)) {
      return [];
    }

    const includeSchema = options?.includeSchemas ?? true;

    return [
      {
        name: QUERY_TOOL_NAME,
        description: QUERY_TOOL_DESCRIPTION,
        category: ToolCategory.QUERY,
        ...(includeSchema && {
          inputSchema: toToolJsonSchema(QueryToolInputSchema),
        }),
        executionRef: { kind: 'query' },
        operation: 'query',
      },
    ];
  }
}
