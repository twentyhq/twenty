import { TIPTAP_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { convertWorkflowRichTextStepsToTiptap } from 'src/database/commands/upgrade-version-command/2-51/utils/convert-workflow-rich-text-steps-to-tiptap.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const recordStep = (
  objectRecord: Record<string, unknown>,
  type:
    | WorkflowActionType.CREATE_RECORD
    | WorkflowActionType.UPDATE_RECORD
    | WorkflowActionType.UPSERT_RECORD = WorkflowActionType.CREATE_RECORD,
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

const paragraph = {
  type: 'paragraph',
  content: [
    { type: 'text', text: 'Hello ' },
    { type: 'variableTag', attrs: { variable: '{{trigger.name}}' } },
  ],
};

describe('convertWorkflowRichTextStepsToTiptap', () => {
  it('should store TipTap blocks held under the BlockNote key as a TipTap document', () => {
    const blocknote = JSON.stringify([paragraph]);

    expect(
      convertWorkflowRichTextStepsToTiptap([
        recordStep({
          title: 'Meeting',
          bodyV2: { blocknote, markdown: null },
        }),
      ]),
    ).toEqual({
      value: [
        recordStep({
          title: 'Meeting',
          bodyV2: {
            blocknote,
            markdown: null,
            tiptap: JSON.stringify({
              type: 'doc',
              content: [paragraph],
              attrs: { schemaVersion: TIPTAP_DOCUMENT_SCHEMA_VERSION },
            }),
          },
        }),
      ],
      hasChanged: true,
    });
  });

  it('should leave BlockNote blocks, variables, markdown and converted values untouched', () => {
    const steps = [
      recordStep(
        {
          bodyV2: {
            blocknote: JSON.stringify([
              {
                id: 'block-1',
                type: 'paragraph',
                props: {},
                content: [{ type: 'text', text: 'Hi', styles: {} }],
                children: [],
              },
            ]),
            markdown: null,
          },
        },
        WorkflowActionType.UPDATE_RECORD,
      ),
      recordStep({ bodyV2: '{{trigger.body}}' }),
      recordStep({ bodyV2: { blocknote: null, markdown: '**Hi**' } }),
      recordStep(
        {
          bodyV2: {
            blocknote: JSON.stringify([paragraph]),
            markdown: null,
            tiptap: '{"type":"doc"}',
          },
        },
        WorkflowActionType.UPSERT_RECORD,
      ),
    ];

    expect(convertWorkflowRichTextStepsToTiptap(steps)).toEqual({
      value: steps,
      hasChanged: false,
    });
  });
});
