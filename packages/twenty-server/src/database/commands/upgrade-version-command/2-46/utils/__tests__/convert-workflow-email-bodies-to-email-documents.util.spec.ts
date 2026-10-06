import { EMAIL_DOCUMENT_SCHEMA_VERSION } from 'twenty-shared/utils';
import { WorkflowActionType } from 'twenty-shared/workflow';

import { convertWorkflowEmailBodiesToEmailDocuments } from 'src/database/commands/upgrade-version-command/2-46/utils/convert-workflow-email-bodies-to-email-documents.util';
import { type WorkflowAction } from 'src/modules/workflow/workflow-executor/workflow-actions/types/workflow-action.type';

const emailStep = (
  body: string,
  type:
    | WorkflowActionType.SEND_EMAIL
    | WorkflowActionType.DRAFT_EMAIL = WorkflowActionType.SEND_EMAIL,
): WorkflowAction => ({
  id: 'step-1',
  name: 'Send',
  type,
  valid: true,
  settings: {
    input: {
      connectedAccountId: 'account-1',
      recipients: { to: 'ada@acme.com' },
      subject: 'Hello',
      body,
    },
    outputSchema: {},
    errorHandlingOptions: {
      retryOnFailure: { value: 0 },
      continueOnFailure: { value: false },
    },
  },
});

const canonicalDocument = (content: unknown[]) =>
  JSON.stringify({
    type: 'doc',
    attrs: { schemaVersion: EMAIL_DOCUMENT_SCHEMA_VERSION },
    content,
  });

describe('convertWorkflowEmailBodiesToEmailDocuments', () => {
  it('should stamp a versionless document and keep the rest of the step', () => {
    const content = [
      { type: 'paragraph', content: [{ type: 'text', text: 'Hi' }] },
    ];

    expect(
      convertWorkflowEmailBodiesToEmailDocuments([
        emailStep(JSON.stringify({ type: 'doc', content })),
      ]).value,
    ).toEqual([emailStep(canonicalDocument(content))]);
  });

  it('should leave canonical, empty and invalid bodies untouched', () => {
    const steps = [
      emailStep(canonicalDocument([])),
      emailStep('  '),
      emailStep(JSON.stringify({ type: 'doc', content: [{ type: 'nope' }] })),
    ];

    expect(convertWorkflowEmailBodiesToEmailDocuments(steps)).toEqual({
      value: steps,
      hasChanged: false,
    });
  });

  it('should skip a stored email step that has no input instead of failing', () => {
    const stepWithoutInput: WorkflowAction = JSON.parse(
      '{"id":"step-2","name":"Send","type":"SEND_EMAIL","valid":false,"settings":{}}',
    );
    const steps = [stepWithoutInput, emailStep('<b>Hi</b>')];

    const { value } = convertWorkflowEmailBodiesToEmailDocuments(steps);

    expect(value?.[0]).toBe(stepWithoutInput);
    expect(value?.[1]).not.toBe(steps[1]);
  });

  it('should convert send and draft bodies and change nothing when run a second time', () => {
    const { value } = convertWorkflowEmailBodiesToEmailDocuments([
      emailStep('Hello\nWorld'),
      emailStep('<b>Hi</b>', WorkflowActionType.DRAFT_EMAIL),
    ]);

    expect(value).toEqual([
      emailStep(
        canonicalDocument([
          {
            type: 'paragraph',
            content: [
              { type: 'text', text: 'Hello' },
              { type: 'hardBreak' },
              { type: 'text', text: 'World' },
            ],
          },
        ]),
      ),
      emailStep(
        canonicalDocument([
          { type: 'htmlDocument', attrs: { html: '<b>Hi</b>' } },
        ]),
        WorkflowActionType.DRAFT_EMAIL,
      ),
    ]);
    expect(convertWorkflowEmailBodiesToEmailDocuments(value).hasChanged).toBe(
      false,
    );
  });
});
