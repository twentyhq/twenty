# n8n Workflow Action Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add an n8n workflow action to Twenty CRM that triggers n8n workflows via webhook URLs (fire-and-forget).

**Architecture:** Simple HTTP POST action that sends JSON payload to n8n webhook URL. Follows existing HTTP Request action pattern but simplified for fire-and-forget use case. User configures webhook URL and optional JSON payload with variable placeholders.

**Tech Stack:** NestJS (backend), React/TypeScript (frontend), Zod (validation), Emotion (styling)

---

## Task 1: Add N8N to WorkflowActionType Enum (Backend)

**Files:**
- Modify: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum.ts`

**Step 1: Add N8N enum value**

```typescript
export enum WorkflowActionType {
  CODE = 'CODE',
  SEND_EMAIL = 'SEND_EMAIL',
  CREATE_RECORD = 'CREATE_RECORD',
  UPDATE_RECORD = 'UPDATE_RECORD',
  DELETE_RECORD = 'DELETE_RECORD',
  UPSERT_RECORD = 'UPSERT_RECORD',
  FIND_RECORDS = 'FIND_RECORDS',
  FORM = 'FORM',
  FILTER = 'FILTER',
  IF_ELSE = 'IF_ELSE',
  HTTP_REQUEST = 'HTTP_REQUEST',
  AI_AGENT = 'AI_AGENT',
  ITERATOR = 'ITERATOR',
  EMPTY = 'EMPTY',
  DELAY = 'DELAY',
  N8N = 'N8N',
}
```

**Step 2: Verify change**

Run: `npx nx typecheck twenty-server`
Expected: No errors related to the enum

**Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum.ts
git commit -m "feat(workflow): add N8N to WorkflowActionType enum"
```

---

## Task 2: Create N8N Action Settings Type (Backend)

**Files:**
- Create: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action-input.type.ts`
- Create: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action-settings.type.ts`

**Step 1: Create input type file**

Create `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action-input.type.ts`:

```typescript
export type WorkflowN8nActionInput = {
  webhookUrl: string;
  payload?: Record<string, unknown>;
};
```

**Step 2: Create settings type file**

Create `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action-settings.type.ts`:

```typescript
import { type BaseWorkflowActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type';

import { type WorkflowN8nActionInput } from './workflow-n8n-action-input.type';

export type WorkflowN8nActionSettings = BaseWorkflowActionSettings & {
  input: WorkflowN8nActionInput;
};
```

**Step 3: Verify types compile**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/
git commit -m "feat(workflow): add n8n action input and settings types"
```

---

## Task 3: Create N8N Guard Function (Backend)

**Files:**
- Create: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/guards/is-workflow-n8n-action.guard.ts`

**Step 1: Create guard file**

Create `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/guards/is-workflow-n8n-action.guard.ts`:

```typescript
import { type WorkflowAction, WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

import { type WorkflowN8nAction } from '../types/workflow-n8n-action.type';

export const isWorkflowN8nAction = (
  action: WorkflowAction,
): action is WorkflowN8nAction => {
  return action.type === WorkflowActionType.N8N;
};
```

**Step 2: Create WorkflowN8nAction type**

Create `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action.type.ts`:

```typescript
import { WorkflowActionType } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-type.enum';

import { type WorkflowN8nActionSettings } from './workflow-n8n-action-settings.type';

type BaseWorkflowAction = {
  id: string;
  name: string;
  type: WorkflowActionType;
  position?: {
    x: number;
    y: number;
  };
  valid: boolean;
  nextStepIds?: string[];
};

export type WorkflowN8nAction = BaseWorkflowAction & {
  type: WorkflowActionType.N8N;
  settings: WorkflowN8nActionSettings;
};
```

**Step 3: Verify compilation**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/
git commit -m "feat(workflow): add n8n action guard and action type"
```

---

## Task 4: Create N8N Workflow Action Class (Backend)

**Files:**
- Create: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n.workflow-action.ts`

**Step 1: Create action class**

Create `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n.workflow-action.ts`:

```typescript
import { Injectable, Logger } from '@nestjs/common';

import { resolveInput } from 'twenty-shared/utils';

import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/interfaces/workflow-action.interface';
import { type WorkflowActionInput } from 'src/modules/workflow/workflow-executor/types/workflow-action-input';
import { type WorkflowActionOutput } from 'src/modules/workflow/workflow-executor/types/workflow-action-output.type';

import { isWorkflowN8nAction } from './guards/is-workflow-n8n-action.guard';

@Injectable()
export class N8nWorkflowAction implements WorkflowAction {
  private readonly logger = new Logger(N8nWorkflowAction.name);

  async execute({
    currentStepId,
    steps,
    context,
  }: WorkflowActionInput): Promise<WorkflowActionOutput> {
    const step = steps.find((s) => s.id === currentStepId);

    if (!step) {
      return {
        error: `Step ${currentStepId} not found`,
      };
    }

    if (!isWorkflowN8nAction(step)) {
      return {
        error: `Step ${currentStepId} is not an n8n action`,
      };
    }

    const { webhookUrl, payload } = step.settings.input;

    if (!webhookUrl) {
      return {
        error: 'Webhook URL is required',
      };
    }

    const resolvedPayload = payload
      ? (resolveInput(payload, context) as Record<string, unknown>)
      : {};

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolvedPayload),
        signal: AbortSignal.timeout(10000), // 10 second timeout
      });

      this.logger.log(
        `n8n webhook triggered: ${webhookUrl} - Status: ${response.status}`,
      );

      return {
        result: {
          triggered: true,
          statusCode: response.status,
        },
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';

      this.logger.error(`n8n webhook failed: ${webhookUrl} - ${errorMessage}`);

      return {
        error: `Failed to trigger n8n workflow: ${errorMessage}`,
      };
    }
  }
}
```

**Step 2: Verify compilation**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n.workflow-action.ts
git commit -m "feat(workflow): implement n8n workflow action executor"
```

---

## Task 5: Create N8N Action Module (Backend)

**Files:**
- Create: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n-action.module.ts`

**Step 1: Create module file**

Create `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n-action.module.ts`:

```typescript
import { Module } from '@nestjs/common';

import { N8nWorkflowAction } from './n8n.workflow-action';

@Module({
  providers: [N8nWorkflowAction],
  exports: [N8nWorkflowAction],
})
export class N8nActionModule {}
```

**Step 2: Verify compilation**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 3: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n-action.module.ts
git commit -m "feat(workflow): add n8n action NestJS module"
```

---

## Task 6: Update Workflow Action Types Union (Backend)

**Files:**
- Modify: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type.ts`
- Modify: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action-settings.type.ts`

**Step 1: Add import and type to workflow-action.type.ts**

Add to imports section:
```typescript
import { type WorkflowN8nActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action-settings.type';
```

Add new type after `WorkflowDelayAction`:
```typescript
export type WorkflowN8nAction = BaseWorkflowAction & {
  type: WorkflowActionType.N8N;
  settings: WorkflowN8nActionSettings;
};
```

Add to union type:
```typescript
export type WorkflowAction =
  | WorkflowCodeAction
  | WorkflowSendEmailAction
  | WorkflowCreateRecordAction
  | WorkflowUpdateRecordAction
  | WorkflowDeleteRecordAction
  | WorkflowUpsertRecordAction
  | WorkflowFindRecordsAction
  | WorkflowFormAction
  | WorkflowFilterAction
  | WorkflowIfElseAction
  | WorkflowHttpRequestAction
  | WorkflowAiAgentAction
  | WorkflowIteratorAction
  | WorkflowEmptyAction
  | WorkflowDelayAction
  | WorkflowN8nAction;
```

**Step 2: Add to workflow-action-settings.type.ts**

Add import:
```typescript
import { type WorkflowN8nActionSettings } from 'src/modules/workflow/workflow-executor/workflow-actions/n8n/types/workflow-n8n-action-settings.type';
```

Add to union:
```typescript
export type WorkflowActionSettings =
  | WorkflowSendEmailActionSettings
  | WorkflowCodeActionSettings
  | WorkflowCreateRecordActionSettings
  | WorkflowUpdateRecordActionSettings
  | WorkflowDeleteRecordActionSettings
  | WorkflowUpsertRecordActionSettings
  | WorkflowFindRecordsActionSettings
  | WorkflowFormActionSettings
  | WorkflowFilterActionSettings
  | WorkflowIfElseActionSettings
  | WorkflowHttpRequestActionSettings
  | WorkflowAiAgentActionSettings
  | WorkflowDelayActionSettings
  | WorkflowIteratorActionSettings
  | WorkflowN8nActionSettings;
```

**Step 3: Verify compilation**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-actions/types/
git commit -m "feat(workflow): add n8n action to workflow action type unions"
```

---

## Task 7: Register N8N Action in Factory (Backend)

**Files:**
- Modify: `packages/twenty-server/src/modules/workflow/workflow-executor/factories/workflow-action.factory.ts`

**Step 1: Add import**

```typescript
import { N8nWorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n.workflow-action';
```

**Step 2: Add to constructor**

```typescript
constructor(
  // ... existing dependencies
  private readonly n8nWorkflowAction: N8nWorkflowAction,
) {}
```

**Step 3: Add case to switch statement**

Add before `default:`:
```typescript
case WorkflowActionType.N8N:
  return this.n8nWorkflowAction;
```

**Step 4: Verify compilation**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 5: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/factories/workflow-action.factory.ts
git commit -m "feat(workflow): register n8n action in workflow action factory"
```

---

## Task 8: Import N8N Module in Executor (Backend)

**Files:**
- Modify: `packages/twenty-server/src/modules/workflow/workflow-executor/workflow-executor.module.ts`

**Step 1: Find and read the module file**

Check current imports and add:
```typescript
import { N8nActionModule } from 'src/modules/workflow/workflow-executor/workflow-actions/n8n/n8n-action.module';
```

**Step 2: Add to imports array**

```typescript
@Module({
  imports: [
    // ... existing imports
    N8nActionModule,
  ],
  // ...
})
```

**Step 3: Verify compilation**

Run: `npx nx typecheck twenty-server`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-server/src/modules/workflow/workflow-executor/workflow-executor.module.ts
git commit -m "feat(workflow): import n8n action module in workflow executor"
```

---

## Task 9: Add N8N Zod Schema (Shared)

**Files:**
- Create: `packages/twenty-shared/src/workflow/schemas/n8n-action-settings-schema.ts`
- Create: `packages/twenty-shared/src/workflow/schemas/n8n-action-schema.ts`

**Step 1: Create settings schema**

Create `packages/twenty-shared/src/workflow/schemas/n8n-action-settings-schema.ts`:

```typescript
import { z } from 'zod';
import { baseWorkflowActionSettingsSchema } from './base-workflow-action-settings-schema';

export const workflowN8nActionSettingsSchema =
  baseWorkflowActionSettingsSchema.extend({
    input: z.object({
      webhookUrl: z.string(),
      payload: z.record(z.string(), z.unknown()).optional(),
    }),
  });
```

**Step 2: Create action schema**

Create `packages/twenty-shared/src/workflow/schemas/n8n-action-schema.ts`:

```typescript
import { z } from 'zod';
import { baseWorkflowActionSchema } from './base-workflow-action-schema';
import { workflowN8nActionSettingsSchema } from './n8n-action-settings-schema';

export const workflowN8nActionSchema = baseWorkflowActionSchema.extend({
  type: z.literal('N8N'),
  settings: workflowN8nActionSettingsSchema,
});
```

**Step 3: Verify compilation**

Run: `npx nx typecheck twenty-shared`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-shared/src/workflow/schemas/n8n-action-*.ts
git commit -m "feat(workflow): add n8n action Zod schemas"
```

---

## Task 10: Export N8N Schema from Shared Index (Shared)

**Files:**
- Modify: `packages/twenty-shared/src/workflow/index.ts`

**Step 1: Add exports**

Add after other action schema exports:
```typescript
export { workflowN8nActionSchema } from './schemas/n8n-action-schema';
export { workflowN8nActionSettingsSchema } from './schemas/n8n-action-settings-schema';
```

**Step 2: Verify compilation**

Run: `npx nx typecheck twenty-shared`
Expected: Pass

**Step 3: Commit**

```bash
git add packages/twenty-shared/src/workflow/index.ts
git commit -m "feat(workflow): export n8n action schemas from shared index"
```

---

## Task 11: Add N8N to Workflow Action Schema Union (Shared)

**Files:**
- Modify: `packages/twenty-shared/src/workflow/schemas/workflow-action-schema.ts`

**Step 1: Add import**

```typescript
import { workflowN8nActionSchema } from './n8n-action-schema';
```

**Step 2: Add to discriminated union**

```typescript
export const workflowActionSchema = z.discriminatedUnion('type', [
  // ... existing schemas
  workflowN8nActionSchema,
]);
```

**Step 3: Verify compilation**

Run: `npx nx typecheck twenty-shared`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-shared/src/workflow/schemas/workflow-action-schema.ts
git commit -m "feat(workflow): add n8n to workflow action schema union"
```

---

## Task 12: Add N8N Type to Frontend Workflow Types (Frontend)

**Files:**
- Modify: `packages/twenty-front/src/modules/workflow/types/Workflow.ts`

**Step 1: Add import**

```typescript
import {
  // ... existing imports
  type workflowN8nActionSchema,
} from 'twenty-shared/workflow';
```

**Step 2: Add type**

```typescript
export type WorkflowN8nAction = z.infer<typeof workflowN8nActionSchema>;
```

**Step 3: Add to WorkflowAction union**

```typescript
export type WorkflowAction =
  // ... existing types
  | WorkflowN8nAction;
```

**Step 4: Verify compilation**

Run: `npx nx typecheck twenty-front`
Expected: Pass

**Step 5: Commit**

```bash
git add packages/twenty-front/src/modules/workflow/types/Workflow.ts
git commit -m "feat(workflow): add n8n action type to frontend workflow types"
```

---

## Task 13: Create N8N Action Constant (Frontend)

**Files:**
- Create: `packages/twenty-front/src/modules/workflow/workflow-steps/workflow-actions/constants/actions/N8nAction.ts`

**Step 1: Create constant file**

```typescript
import { type WorkflowActionType } from '@/workflow/types/Workflow';

export const N8N_ACTION: {
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'N8N'>;
  icon: string;
} = {
  defaultLabel: 'n8n Workflow',
  type: 'N8N',
  icon: 'IconWebhook',
};
```

**Step 2: Verify compilation**

Run: `npx nx typecheck twenty-front`
Expected: Pass

**Step 3: Commit**

```bash
git add packages/twenty-front/src/modules/workflow/workflow-steps/workflow-actions/constants/actions/N8nAction.ts
git commit -m "feat(workflow): add n8n action constant for frontend"
```

---

## Task 14: Add N8N to CoreActions (Frontend)

**Files:**
- Modify: `packages/twenty-front/src/modules/workflow/workflow-steps/workflow-actions/constants/CoreActions.ts`

**Step 1: Add import**

```typescript
import { N8N_ACTION } from '@/workflow/workflow-steps/workflow-actions/constants/actions/N8nAction';
```

**Step 2: Update type and array**

```typescript
export const CORE_ACTIONS: Array<{
  defaultLabel: string;
  type: Extract<WorkflowActionType, 'CODE' | 'SEND_EMAIL' | 'HTTP_REQUEST' | 'N8N'>;
  icon: string;
}> = [SEND_EMAIL_ACTION, CODE_ACTION, HTTP_REQUEST_ACTION, N8N_ACTION];
```

**Step 3: Verify compilation**

Run: `npx nx typecheck twenty-front`
Expected: Pass

**Step 4: Commit**

```bash
git add packages/twenty-front/src/modules/workflow/workflow-steps/workflow-actions/constants/CoreActions.ts
git commit -m "feat(workflow): add n8n action to core actions list"
```

---

## Task 15: Create N8N Action Form Component (Frontend)

**Files:**
- Create: `packages/twenty-front/src/modules/workflow/workflow-steps/workflow-actions/n8n-action/components/WorkflowEditActionN8n.tsx`

**Step 1: Create component**

```typescript
import { FormRawJsonFieldInput } from '@/object-record/record-field/ui/form-types/components/FormRawJsonFieldInput';
import { FormTextFieldInput } from '@/object-record/record-field/ui/form-types/components/FormTextFieldInput';
import { type WorkflowN8nAction } from '@/workflow/types/Workflow';
import { WorkflowStepBody } from '@/workflow/workflow-steps/components/WorkflowStepBody';
import { WorkflowStepFooter } from '@/workflow/workflow-steps/components/WorkflowStepFooter';
import { WorkflowVariablePicker } from '@/workflow/workflow-variables/components/WorkflowVariablePicker';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useCallback, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';

type WorkflowEditActionN8nProps = {
  action: WorkflowN8nAction;
  actionOptions: {
    readonly?: boolean;
    onActionUpdate?: (action: WorkflowN8nAction) => void;
  };
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const JSON_PAYLOAD_PLACEHOLDER = `{
  "key": "value",
  "email": "{{trigger.email}}"
}`;

export const WorkflowEditActionN8n = ({
  action,
  actionOptions,
}: WorkflowEditActionN8nProps) => {
  const { t } = useLingui();

  const [formData, setFormData] = useState({
    webhookUrl: action.settings.input.webhookUrl ?? '',
    payload: action.settings.input.payload
      ? JSON.stringify(action.settings.input.payload, null, 2)
      : '',
  });

  const saveAction = useDebouncedCallback((newFormData: typeof formData) => {
    if (actionOptions.readonly || !actionOptions.onActionUpdate) {
      return;
    }

    let parsedPayload: Record<string, unknown> | undefined;
    try {
      parsedPayload = newFormData.payload
        ? JSON.parse(newFormData.payload)
        : undefined;
    } catch {
      // Invalid JSON, skip update
      return;
    }

    actionOptions.onActionUpdate({
      ...action,
      settings: {
        ...action.settings,
        input: {
          webhookUrl: newFormData.webhookUrl,
          payload: parsedPayload,
        },
      },
    });
  }, 300);

  const handleFieldChange = useCallback(
    (field: keyof typeof formData, value: string) => {
      const newFormData = { ...formData, [field]: value };
      setFormData(newFormData);
      saveAction(newFormData);
    },
    [formData, saveAction],
  );

  return (
    <>
      <WorkflowStepBody>
        <StyledContainer>
          <FormTextFieldInput
            label={t`Webhook URL`}
            placeholder={t`https://n8n.example.com/webhook/...`}
            readonly={actionOptions.readonly}
            defaultValue={formData.webhookUrl}
            onChange={(value) => handleFieldChange('webhookUrl', value)}
            VariablePicker={WorkflowVariablePicker}
          />

          <FormRawJsonFieldInput
            label={t`Payload (JSON)`}
            placeholder={JSON_PAYLOAD_PLACEHOLDER}
            defaultValue={formData.payload}
            onChange={(value) => handleFieldChange('payload', value)}
            readonly={actionOptions.readonly}
          />
        </StyledContainer>
      </WorkflowStepBody>
      {!actionOptions.readonly && <WorkflowStepFooter stepId={action.id} />}
    </>
  );
};
```

**Step 2: Verify compilation**

Run: `npx nx typecheck twenty-front`
Expected: Pass

**Step 3: Commit**

```bash
git add packages/twenty-front/src/modules/workflow/workflow-steps/workflow-actions/n8n-action/
git commit -m "feat(workflow): add n8n action form component"
```

---

## Task 16: Register N8N in WorkflowStepDetail (Frontend)

**Files:**
- Find and modify the component that renders action forms (likely `WorkflowStepDetail.tsx` or similar)

**Step 1: Find the file**

Run: `find packages/twenty-front -name "WorkflowStepDetail*" -o -name "*StepDetail*" | grep -v node_modules`

**Step 2: Add import**

```typescript
import { WorkflowEditActionN8n } from '@/workflow/workflow-steps/workflow-actions/n8n-action/components/WorkflowEditActionN8n';
```

**Step 3: Add case for N8N**

Find the switch/conditional that renders action forms and add:
```typescript
case 'N8N':
  return (
    <WorkflowEditActionN8n
      action={action as WorkflowN8nAction}
      actionOptions={actionOptions}
    />
  );
```

**Step 4: Verify compilation**

Run: `npx nx typecheck twenty-front`
Expected: Pass

**Step 5: Commit**

```bash
git add packages/twenty-front/src/modules/workflow/
git commit -m "feat(workflow): register n8n action in workflow step detail"
```

---

## Task 17: Full Build and Test

**Step 1: Build twenty-shared**

Run: `npx nx build twenty-shared`
Expected: Pass

**Step 2: Build twenty-server**

Run: `npx nx build twenty-server`
Expected: Pass

**Step 3: Build twenty-front**

Run: `npx nx build twenty-front`
Expected: Pass

**Step 4: Run linting**

Run: `npx nx lint:diff-with-main twenty-server && npx nx lint:diff-with-main twenty-front`
Expected: Pass or only minor issues

**Step 5: Commit any lint fixes**

```bash
git add -A
git commit -m "chore: fix linting issues"
```

---

## Task 18: Final Commit and Summary

**Step 1: Create summary commit**

```bash
git add -A
git commit -m "feat(workflow): complete n8n workflow action implementation

- Add N8N action type to backend workflow executor
- Create n8n action class with fire-and-forget HTTP POST
- Add Zod schemas in twenty-shared
- Add frontend form component with webhook URL and payload fields
- Register action in workflow builder UI

The n8n action allows users to trigger n8n workflows by webhook URL
from within Twenty CRM workflows."
```

**Step 2: Verify everything works**

Start the dev environment: `yarn start`
- Navigate to a workflow
- Verify "n8n Workflow" appears in the action list
- Create an n8n action and verify the form renders

---

## Files Changed Summary

**Backend (twenty-server):**
- `workflow-actions/types/workflow-action-type.enum.ts` - Add N8N enum
- `workflow-actions/n8n/types/workflow-n8n-action-input.type.ts` - New
- `workflow-actions/n8n/types/workflow-n8n-action-settings.type.ts` - New
- `workflow-actions/n8n/types/workflow-n8n-action.type.ts` - New
- `workflow-actions/n8n/guards/is-workflow-n8n-action.guard.ts` - New
- `workflow-actions/n8n/n8n.workflow-action.ts` - New
- `workflow-actions/n8n/n8n-action.module.ts` - New
- `workflow-actions/types/workflow-action.type.ts` - Add N8N to union
- `workflow-actions/types/workflow-action-settings.type.ts` - Add N8N settings
- `factories/workflow-action.factory.ts` - Register N8N action
- `workflow-executor.module.ts` - Import N8N module

**Shared (twenty-shared):**
- `workflow/schemas/n8n-action-settings-schema.ts` - New
- `workflow/schemas/n8n-action-schema.ts` - New
- `workflow/schemas/workflow-action-schema.ts` - Add to union
- `workflow/index.ts` - Export schemas

**Frontend (twenty-front):**
- `workflow/types/Workflow.ts` - Add N8N type
- `workflow-actions/constants/actions/N8nAction.ts` - New
- `workflow-actions/constants/CoreActions.ts` - Add N8N
- `workflow-actions/n8n-action/components/WorkflowEditActionN8n.tsx` - New
- Step detail component - Add N8N case
