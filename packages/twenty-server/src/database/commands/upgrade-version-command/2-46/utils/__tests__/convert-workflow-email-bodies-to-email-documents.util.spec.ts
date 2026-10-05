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
  it('should keep a legacy HTML draft body verbatim in an HTML document block', () => {
    const html = '<p>Hi {{trigger.name}}</p>';

    const { value } = convertWorkflowEmailBodiesToEmailDocuments([
      emailStep(html, WorkflowActionType.DRAFT_EMAIL),
    ]);

    expect(value).toEqual([
      emailStep(
        canonicalDocument([{ type: 'htmlDocument', attrs: { html } }]),
        WorkflowActionType.DRAFT_EMAIL,
      ),
    ]);
  });

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

  it('should change nothing when run a second time', () => {
    const { value } = convertWorkflowEmailBodiesToEmailDocuments([
      emailStep('Hello\nWorld'),
      emailStep('<b>Hi</b>'),
    ]);

    expect(convertWorkflowEmailBodiesToEmailDocuments(value).hasChanged).toBe(
      false,
    );
  });
});
