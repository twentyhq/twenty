import { type LogicFunctionConfig } from 'twenty-sdk/define';

import { getOperation, queryCompanyEnrich } from './companyenrich-client';
import { executeOperation } from './companyenrich-error';
import { toToolSchema } from './to-tool-schema';
import {
  toResearchInput,
  type ActionInput,
  type ResearchActionInput,
} from './to-action-input';

export const createResearchFunction = (name: string): LogicFunctionConfig => {
  const operation = getOperation(name);
  const free =
    name.startsWith('count-') ||
    name.startsWith('preview-') ||
    name === 'autocomplete-companies';
  const arrayResponse = [
    'enrich-companies-batch',
    'person-education',
    'autocomplete-companies',
  ].includes(name);
  const properties: Record<
    string,
    {
      type: 'string' | 'object' | 'array' | 'boolean';
      label: string;
      description: string;
      items?: { type: 'string'; enum?: string[] };
      multiline?: boolean;
      enum?: string[];
    }
  > = {};

  for (const key of Object.keys(operation.inputSchema.properties)) {
    const schema = toToolSchema(
      operation.inputSchema.properties[
        key as keyof typeof operation.inputSchema.properties
      ],
    );
    properties[key === 'body' ? 'bodyJson' : key] = {
      type:
        key === 'body'
          ? 'string'
          : key === 'expand'
            ? 'array'
            : key === 'waitForEnrichment'
              ? 'boolean'
              : 'string',
      label: key === 'body' ? 'Request body (JSON)' : key,
      description:
        key === 'body'
          ? `CompanyEnrich request body. Example: ${JSON.stringify(operation.example.body ?? {})}. Full filters: https://docs.companyenrich.com/reference.`
          : key === 'expand'
            ? 'Optional paid expansion: workforce for companies, education for people.'
            : key === 'waitForEnrichment'
              ? 'Wait for new domains to enrich. Defaults to true; false returns a 404 if data is not yet available.'
              : key === 'id'
                ? 'CompanyEnrich ID, not a Twenty record ID. Pass person IDs as exact decimal strings.'
                : 'Company domain or website URL.',
      ...(key === 'expand'
        ? {
            items: {
              type: 'string',
              enum: schema.items?.enum?.filter(
                (value): value is string => typeof value === 'string',
              ),
            },
          }
        : {}),
      ...(key === 'body' ? { multiline: true } : {}),
    };
  }

  return {
    universalIdentifier: operation.universalIdentifier,
    name: `companyenrich-${name}`,
    description: `${operation.label} using your CompanyEnrich account. ${free ? 'This endpoint is free; preview actions require the Scale plan.' : 'Consumes CompanyEnrich credits.'} Returns the full provider response without changing CRM records. People search returns professional profiles, not email addresses.`,
    timeoutSeconds: 60,
    handler: (input: ActionInput<ResearchActionInput>) =>
      executeOperation(() => queryCompanyEnrich(name, toResearchInput(input))),
    httpRouteTriggerSettings: {
      path: `/companyenrich/${name}`,
      httpMethod: 'POST',
      isAuthRequired: true,
    },
    workflowActionTriggerSettings: {
      label: `CompanyEnrich: ${operation.label}`,
      icon: 'IconSearch',
      inputSchema: [{ type: 'object', properties }],
      outputSchema: [
        {
          type: 'object',
          properties: {
            success: { type: 'boolean', label: 'Success' },
            error: { type: 'string', label: 'Error (when unsuccessful)' },
            data: {
              type: name.startsWith('count-')
                ? 'number'
                : arrayResponse
                  ? 'array'
                  : 'object',
              label: 'Provider data',
              ...(arrayResponse ? { items: { type: 'object' } } : {}),
            },
            creditsConsumed: {
              type: 'number',
              label: 'Credits consumed (when reported)',
            },
          },
        },
      ],
    },
    toolTriggerSettings: {
      inputSchema: toToolSchema(operation.inputSchema),
    },
  };
};
