import { FieldMetadataType } from 'twenty-shared/types';
import { z } from 'zod';
import { StepStatus } from 'twenty-shared/workflow';

// Base schemas
export const objectRecordSchema = z.record(z.any());

export const baseWorkflowActionSettingsSchema = z.object({
  input: z.object({}).passthrough(),
  outputSchema: z.object({}).passthrough(),
  errorHandlingOptions: z.object({
    retryOnFailure: z.object({
      value: z.boolean(),
    }),
    continueOnFailure: z.object({
      value: z.boolean(),
    }),
  }),
});

export const baseWorkflowActionSchema = z.object({
  id: z.string(),
  name: z.string(),
  valid: z.boolean(),
  nextStepIds: z.array(z.string()).optional().nullable(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
});

export const baseTriggerSchema = z.object({
  name: z.string().optional(),
  type: z.string(),
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  nextStepIds: z.array(z.string()).optional().nullable(),
});

// Action settings schemas
export const workflowCodeActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      serverlessFunctionId: z.string(),
      serverlessFunctionVersion: z.string(),
      serverlessFunctionInput: z.record(z.any()),
    }),
  });

export const workflowSendEmailActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      connectedAccountId: z.string(),
      email: z.string(),
      subject: z.string().optional(),
      body: z.string().optional(),
    }),
  });

export const workflowCreateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
    }),
  });

export const workflowUpdateRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecord: objectRecordSchema,
      objectRecordId: z.string(),
      fieldsToUpdate: z.array(z.string()),
    }),
  });

export const workflowDeleteRecordActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      objectRecordId: z.string(),
    }),
  });

export const workflowFindRecordsActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      objectName: z.string(),
      limit: z.number().optional(),
      filter: z
        .object({
          recordFilterGroups: z.array(z.object({})).optional(),
          recordFilters: z.array(z.object({})).optional(),
          gqlOperationFilter: z.object({}).optional().nullable(),
        })
        .optional(),
    }),
  });

export const workflowFormActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        label: z.string(),
        type: z.union([
          z.literal(FieldMetadataType.TEXT),
          z.literal(FieldMetadataType.NUMBER),
          z.literal(FieldMetadataType.DATE),
          z.literal('RECORD'),
        ]),
        placeholder: z.string().optional(),
        settings: z.record(z.any()).optional(),
        value: z.any().optional(),
      }),
    ),
  });

export const workflowHttpRequestActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      url: z.string(),
      method: z.enum(['GET', 'POST', 'PUT', 'PATCH', 'DELETE']),
      headers: z.record(z.string()).optional(),
      body: z
        .record(
          z.union([
            z.string(),
            z.number(),
            z.boolean(),
            z.null(),
            z.array(z.union([z.string(), z.number(), z.boolean(), z.null()])),
          ]),
        )
        .or(z.string())
        .optional(),
    }),
  });

export const workflowAiAgentActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      agentId: z.string(),
    }),
  });

export const workflowFilterActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      stepFilterGroups: z.array(z.any()),
      stepFilters: z.array(z.any()),
    }),
  });

// Action schemas
export const workflowCodeActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('CODE'),
  settings: workflowCodeActionSettingsSchema,
});

export const workflowSendEmailActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('SEND_EMAIL'),
  settings: workflowSendEmailActionSettingsSchema,
});

export const workflowCreateRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('CREATE_RECORD'),
    settings: workflowCreateRecordActionSettingsSchema,
  },
);

export const workflowUpdateRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('UPDATE_RECORD'),
    settings: workflowUpdateRecordActionSettingsSchema,
  },
);

export const workflowDeleteRecordActionSchema = baseWorkflowActionSchema.extend(
  {
    type: z.literal('DELETE_RECORD'),
    settings: workflowDeleteRecordActionSettingsSchema,
  },
);

export const workflowFindRecordsActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FIND_RECORDS'),
  settings: workflowFindRecordsActionSettingsSchema,
});

export const workflowFormActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FORM'),
  settings: workflowFormActionSettingsSchema,
});

export const workflowHttpRequestActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('HTTP_REQUEST'),
  settings: workflowHttpRequestActionSettingsSchema,
});

export const workflowAiAgentActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('AI_AGENT'),
  settings: workflowAiAgentActionSettingsSchema,
});

export const workflowFilterActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('FILTER'),
  settings: workflowFilterActionSettingsSchema,
});

// Combined action schema
export const workflowActionSchema = z.discriminatedUnion('type', [
  workflowCodeActionSchema,
  workflowSendEmailActionSchema,
  workflowCreateRecordActionSchema,
  workflowUpdateRecordActionSchema,
  workflowDeleteRecordActionSchema,
  workflowFindRecordsActionSchema,
  workflowFormActionSchema,
  workflowHttpRequestActionSchema,
  workflowAiAgentActionSchema,
  workflowFilterActionSchema,
]);

// Trigger schemas
export const workflowDatabaseEventTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('DATABASE_EVENT'),
  settings: z.object({
    eventName: z.string(),
    input: z.object({}).passthrough().optional(),
    outputSchema: z.object({}).passthrough(),
    objectType: z.string().optional(),
    fields: z.array(z.string()).optional().nullable(),
  }),
});

export const workflowManualTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('MANUAL'),
  settings: z.object({
    objectType: z.string().optional(),
    outputSchema: z.object({}).passthrough(),
    icon: z.string().optional(),
  }),
});

export const workflowCronTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('CRON'),
  settings: z.discriminatedUnion('type', [
    z.object({
      type: z.literal('DAYS'),
      schedule: z.object({
        day: z.number().min(1),
        hour: z.number().min(0).max(23),
        minute: z.number().min(0).max(59),
      }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('HOURS'),
      schedule: z.object({
        hour: z.number().min(1),
        minute: z.number().min(0).max(59),
      }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('MINUTES'),
      schedule: z.object({ minute: z.number().min(1) }),
      outputSchema: z.object({}).passthrough(),
    }),
    z.object({
      type: z.literal('CUSTOM'),
      pattern: z.string(),
      outputSchema: z.object({}).passthrough(),
    }),
  ]),
});

export const workflowWebhookTriggerSchema = baseTriggerSchema.extend({
  type: z.literal('WEBHOOK'),
  settings: z.discriminatedUnion('httpMethod', [
    z.object({
      outputSchema: z.object({}).passthrough(),
      httpMethod: z.literal('GET'),
      authentication: z.literal('API_KEY').nullable(),
    }),
    z.object({
      outputSchema: z.object({}).passthrough(),
      httpMethod: z.literal('POST'),
      expectedBody: z.object({}).passthrough(),
      authentication: z.literal('API_KEY').nullable(),
    }),
  ]),
});

// Combined trigger schema
export const workflowTriggerSchema = z.discriminatedUnion('type', [
  workflowDatabaseEventTriggerSchema,
  workflowManualTriggerSchema,
  workflowCronTriggerSchema,
  workflowWebhookTriggerSchema,
]);

export const workflowRunStepStatusSchema = z.nativeEnum(StepStatus);

export const workflowRunStateStepInfoSchema = z.object({
  result: z.any().optional(),
  error: z.any().optional(),
  status: workflowRunStepStatusSchema,
});

export const workflowRunStateStepInfosSchema = z.record(
  workflowRunStateStepInfoSchema,
);

export const workflowRunStateSchema = z.object({
  flow: z.object({
    trigger: workflowTriggerSchema,
    steps: z.array(workflowActionSchema),
  }),
  stepInfos: workflowRunStateStepInfosSchema,
  workflowRunError: z.any().optional(),
});

export const workflowRunStatusSchema = z.enum([
  'NOT_STARTED',
  'RUNNING',
  'COMPLETED',
  'FAILED',
  'ENQUEUED',
]);

export const workflowRunSchema = z
  .object({
    __typename: z.literal('WorkflowRun'),
    id: z.string(),
    workflowVersionId: z.string(),
    workflowId: z.string(),
    state: workflowRunStateSchema.nullable(),
    status: workflowRunStatusSchema,
    createdAt: z.string(),
    deletedAt: z.string().nullable(),
    endedAt: z.string().nullable(),
    name: z.string(),
  })
  .passthrough();
