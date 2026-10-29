import { isDefined } from 'twenty-shared/utils';

import {
  type StoredWorkflowNode,
  type StoredWorkflowVersionDefinition,
} from 'src/engine/core-modules/application/application-manifest/types/stored-workflow-version-definition.type';
import { isSameWorkflowVersionDefinition } from 'src/engine/core-modules/application/application-manifest/utils/is-same-workflow-version-definition.util';

const STEP_ID = '40000000-0000-4000-8000-000000000000';

const buildDefinition = ({
  trigger = {},
  step = {},
}: {
  trigger?: Partial<StoredWorkflowNode>;
  step?: Partial<StoredWorkflowNode>;
}): StoredWorkflowVersionDefinition => ({
  triggers: [
    {
      name: 'Launch manually',
      type: 'MANUAL',
      position: { x: 0, y: 0 },
      nextStepIds: [STEP_ID],
      settings: { outputSchema: {}, availability: { type: 'GLOBAL' } },
      ...trigger,
    },
  ],
  steps: [
    {
      id: STEP_ID,
      name: 'Create Record',
      type: 'CREATE_RECORD',
      valid: true,
      position: { x: 0, y: 180 },
      nextStepIds: [],
      settings: {
        outputSchema: {},
        errorHandlingOptions: {
          retryOnFailure: { value: 0 },
          continueOnFailure: { value: false },
        },
        input: { objectName: 'ticket', objectRecord: {} },
      },
      ...step,
    },
  ],
});

describe('isSameWorkflowVersionDefinition', () => {
  it.each([
    { description: 'the step valid flag', step: { valid: false } },
    { description: 'null next steps', step: { nextStepIds: null } },
    { description: 'missing next steps', step: { nextStepIds: undefined } },
    {
      description: 'Apollo typenames',
      step: {
        __typename: 'WorkflowAction',
        position: { x: 0, y: 180, __typename: 'WorkflowStepPosition' },
      },
    },
    {
      description: 'a retry count stored as a boolean',
      step: {
        settings: {
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: false },
            continueOnFailure: { value: false },
          },
          input: { objectName: 'ticket', objectRecord: {} },
        },
      },
    },
    {
      description: 'the objectType of a manual trigger',
      trigger: {
        settings: {
          outputSchema: {},
          availability: { type: 'GLOBAL' },
          objectType: 'ticket',
        },
      },
    },
  ])('ignores $description, which no run reads', ({ trigger, step }) => {
    expect(
      isSameWorkflowVersionDefinition({
        left: buildDefinition({}),
        right: buildDefinition({ trigger, step }),
      }),
    ).toBe(true);
  });

  it.each(['SEND_EMAIL', 'DRAFT_EMAIL'])(
    'treats a %s step without files as one with no files',
    (type) => {
      const emailStep = (files?: unknown[]): Partial<StoredWorkflowNode> => ({
        type,
        settings: {
          outputSchema: {},
          input: {
            connectedAccountId: '{{trigger.connectedAccountId}}',
            recipients: { to: 'tim@apple.dev', cc: '', bcc: '' },
            ...(isDefined(files) ? { files } : {}),
          },
        },
      });

      expect(
        isSameWorkflowVersionDefinition({
          left: buildDefinition({ step: emailStep([]) }),
          right: buildDefinition({ step: emailStep() }),
        }),
      ).toBe(true);
      expect(
        isSameWorkflowVersionDefinition({
          left: buildDefinition({ step: emailStep(['{{trigger.files}}']) }),
          right: buildDefinition({ step: emailStep() }),
        }),
      ).toBe(false);
    },
  );

  it('treats a null position as a missing one', () => {
    expect(
      isSameWorkflowVersionDefinition({
        left: buildDefinition({ step: { position: null } }),
        right: buildDefinition({ step: { position: undefined } }),
      }),
    ).toBe(true);
  });

  it.each([
    { description: 'a moved step', step: { position: { x: 10, y: 180 } } },
    { description: 'a renamed trigger', trigger: { name: 'Run it' } },
    {
      description: 'a step retried twice',
      step: {
        settings: {
          outputSchema: {},
          errorHandlingOptions: {
            retryOnFailure: { value: 2 },
            continueOnFailure: { value: false },
          },
          input: { objectName: 'ticket', objectRecord: {} },
        },
      },
    },
  ])('tells apart $description', ({ trigger, step }) => {
    expect(
      isSameWorkflowVersionDefinition({
        left: buildDefinition({}),
        right: buildDefinition({ trigger, step }),
      }),
    ).toBe(false);
  });
});
