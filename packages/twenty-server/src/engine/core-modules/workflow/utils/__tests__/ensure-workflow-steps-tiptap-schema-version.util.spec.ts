import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { ensureWorkflowStepsTipTapSchemaVersion } from 'src/engine/core-modules/workflow/utils/ensure-workflow-steps-tiptap-schema-version.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const recordStep = (
  objectRecord: Record<string, unknown>,
  type: WorkflowActionType = WorkflowActionType.CREATE_RECORD,
): WorkflowAction =>
  ({
    id: 'step-1',
    name: 'Create note',
    type,
    valid: true,
    settings: {
      input: { objectName: 'note', objectRecord },
      outputSchema: {},
      errorHandlingOptions: {
        retryOnFailure: { value: 0 },
        continueOnFailure: { value: false },
      },
    },
  }) as WorkflowAction;

const content = [
  {
    type: 'paragraph',
    content: [
      { type: 'text', text: 'Hello ' },
      { type: 'variableTag', attrs: { variable: '{{trigger.name}}' } },
    ],
  },
];

const versionedTipTap = JSON.stringify({
  type: 'doc',
  attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
  content,
});

describe('ensureWorkflowStepsTipTapSchemaVersion', () => {
  it('should stamp the schema version on record step TipTap sent without one', () => {
    const [step] =
      ensureWorkflowStepsTipTapSchemaVersion([
        recordStep({
          title: 'Meeting',
          bodyV2: {
            blocknote: null,
            markdown: null,
            tiptap: JSON.stringify({ type: 'doc', content }),
          },
        }),
      ]) ?? [];
    const objectRecord = (
      step as Extract<
        WorkflowAction,
        { type: WorkflowActionType.CREATE_RECORD }
      >
    ).settings.input.objectRecord;

    expect(objectRecord.title).toBe('Meeting');
    expect(JSON.parse(objectRecord.bodyV2.tiptap)).toEqual(
      JSON.parse(versionedTipTap),
    );
  });

  it('should keep steps whose TipTap is already versioned or absent', () => {
    const steps = [
      recordStep({
        bodyV2: { blocknote: null, markdown: null, tiptap: versionedTipTap },
      }),
      recordStep({ bodyV2: { markdown: '{{trigger.body}}' } }),
      recordStep(
        { bodyV2: { tiptap: JSON.stringify({ type: 'doc', content }) } },
        WorkflowActionType.CODE,
      ),
    ];

    expect(ensureWorkflowStepsTipTapSchemaVersion(steps)).toEqual(steps);
  });

  it('should return null steps as is', () => {
    expect(ensureWorkflowStepsTipTapSchemaVersion(null)).toBeNull();
  });
});
