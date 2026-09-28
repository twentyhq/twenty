import { defineWorkflow } from 'twenty-sdk/define';
import gallery from './all-steps.workflow';

const CREATE_STEP_ID = '8689d5e3-2b2e-5e53-9901-c552ff3e2d38';
const ITERATOR_STEP_ID = '136ca3b7-c3cb-5245-afa7-6f6bb33e24ae';
const validationId = (id: string) => `11111111${id.slice(8)}`;
const STEP_TYPES = ['CREATE_RECORD', 'ITERATOR', 'DELAY', 'DELETE_RECORD', 'EMPTY'];

export default defineWorkflow({
  universalIdentifier: 'b6c9a401-44f8-443f-88f4-13e9f20b0d11',
  name: 'Workflow gallery — loop and cleanup validation',
  version: {
    universalIdentifier: '88d3ce93-10c7-4899-b5cf-b23f7c076628',
    trigger: {
      universalIdentifier: '7bc7a38d-bae9-4fe9-a936-030596790774',
      type: 'MANUAL',
      nextStepIds: [validationId(CREATE_STEP_ID)],
    },
    steps: gallery.config.version.steps
      .filter((step) => STEP_TYPES.includes(step.type))
      .map((step) =>
        step.type === 'CREATE_RECORD'
          ? {
              ...step,
              input: {
                ...step.input,
                objectRecord: { name: 'Workflow gallery loop validation' },
              },
              nextStepIds: [ITERATOR_STEP_ID],
            }
          : step,
      )
      .map((step) => ({
        ...step,
        universalIdentifier: validationId(step.universalIdentifier),
        nextStepIds: step.nextStepIds.map(validationId),
        ...(step.type === 'ITERATOR'
          ? { input: { ...step.input, initialLoopStepIds: step.input.initialLoopStepIds.map(validationId) } }
          : step.type === 'DELETE_RECORD'
            ? { input: { ...step.input, objectRecordId: `{{${validationId(CREATE_STEP_ID)}.id}}` } }
            : {}),
      })),
  },
});
