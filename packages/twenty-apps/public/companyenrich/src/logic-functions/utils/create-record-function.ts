import {
  type LogicFunctionConfig,
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-sdk/define';

import { IDENTIFIERS } from 'src/constants/universal-identifiers';
import { enrichRecord } from './enrich-record';
import { CompanyEnrichError, executeOperation } from './companyenrich-error';
import { toActionInput, type ActionInput } from './to-action-input';

export const createRecordFunction = (
  kind: 'company' | 'person',
): LogicFunctionConfig => ({
  universalIdentifier:
    kind === 'company'
      ? IDENTIFIERS.enrichCompanyRecord
      : IDENTIFIERS.enrichPersonRecord,
  name: `companyenrich-enrich-${kind}-record`,
  description: `Read a Twenty ${kind}'s ${kind === 'company' ? 'domain' : 'known email'}, retrieve its profile, and save dedicated CompanyEnrich fields. Existing CRM fields are preserved. Consumes CompanyEnrich credits.`,
  timeoutSeconds: 60,
  handler: (input: ActionInput<{ recordId: string }>, context) =>
    executeOperation(() => {
      // Only the trusted execution context can establish a delegated member.
      // Reject API-key and background calls because Twenty would otherwise
      // fall back to app-wide access instead of a member's permissions.
      if (!context?.userWorkspaceId || !context.workspaceMemberId) {
        throw new CompanyEnrichError(
          'Saving CRM profiles requires a signed-in workspace member. API-key and background invocations cannot save records.',
        );
      }
      return enrichRecord(kind, toActionInput(input));
    }),
  httpRouteTriggerSettings: {
    path: `/companyenrich/enrich-${kind}-record`,
    httpMethod: 'POST',
    isAuthRequired: true,
  },
  workflowActionTriggerSettings: {
    label: `CompanyEnrich: Enrich ${kind} record`,
    icon: 'IconSparkles',
    inputSchema: [
      {
        type: 'object',
        properties: {
          recordId: {
            type: 'record',
            objectUniversalIdentifier:
              STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS[kind].universalIdentifier,
            label: 'Record',
          },
        },
      },
    ],
    outputSchema: [
      {
        type: 'object',
        properties: {
          success: { type: 'boolean', label: 'Success' },
          error: { type: 'string', label: 'Error (when unsuccessful)' },
          recordId: { type: 'string', label: 'Record ID' },
          data: { type: 'object', label: 'Full CompanyEnrich profile' },
          updatedFields: {
            type: 'array',
            items: { type: 'string' },
            label: 'Updated CompanyEnrich fields',
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
    inputSchema: {
      type: 'object',
      properties: {
        recordId: {
          type: 'string',
          description:
            'Twenty record ID to enrich. This action saves dedicated CompanyEnrich fields.',
        },
      },
      required: ['recordId'],
      additionalProperties: false,
    },
  },
});
