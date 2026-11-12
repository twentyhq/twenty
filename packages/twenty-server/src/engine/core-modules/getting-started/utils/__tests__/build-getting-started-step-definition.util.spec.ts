import { setupI18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';

import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { buildGettingStartedStepDefinition } from 'src/engine/core-modules/getting-started/utils/build-getting-started-step-definition.util';

const translate = (descriptor: { message?: string }) =>
  descriptor.message ?? '';

const i18n = setupI18n();

i18n.setMessagesCompiler(compileMessage);
i18n.load('en', {});
i18n.activate('en');

describe('buildGettingStartedStepDefinition', () => {
  it('should define a step with a workflow template as a workflow step', () => {
    expect(
      buildGettingStartedStepDefinition({
        stepActionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
        companyEnrichment: null,
        doneChatThreadId: null,
        doneWorkflowId: null,
        translate,
      }),
    ).toEqual({
      actionKey: GettingStartedStepActionKey.HANDOVER_DEALS,
      kind: GettingStartedStepKind.WORKFLOW,
      title: 'Hand over won deals',
      doneTitle: 'Handover ready',
      description: 'Start the handover when a deal is won.',
      doneDescription:
        'Turn it on and won deals move to delivery on their own.',
      icon: 'IconSettingsAutomation',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
      doneChatThreadId: null,
      doneWorkflowId: null,
    });
  });

  it('should return the chat thread the step was completed with', () => {
    expect(
      buildGettingStartedStepDefinition({
        stepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        companyEnrichment: null,
        doneChatThreadId: '20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90',
        doneWorkflowId: null,
        translate,
      }).doneChatThreadId,
    ).toBe('20202020-8d1c-4b5e-9a3f-6c2e1b7d4f90');
  });

  it('should define a step with a prompt as a prompt step', () => {
    expect(
      buildGettingStartedStepDefinition({
        stepActionKey: GettingStartedStepActionKey.FOLLOW_UP_DEALS,
        companyEnrichment: null,
        doneChatThreadId: null,
        doneWorkflowId: null,
        translate,
      }),
    ).toMatchObject({
      kind: GettingStartedStepKind.PROMPT,
      promptLabel: 'Follow-up instructions',
      prompt:
        'Every Monday, draft a follow-up email for each deal closing in the next 30 days.',
    });
  });

  it('should fill the data model prompt from the company enrichment', () => {
    expect(
      buildGettingStartedStepDefinition({
        stepActionKey: GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
        companyEnrichment: {
          domain: 'acme.com',
          enrichedAt: '2026-10-29T12:00:00.000Z',
          name: 'Acme',
          website: 'acme.com',
          industry: 'computer software',
          employeeCount: 40,
          size: null,
          founded: null,
          headline: null,
          summary: null,
          tags: [],
          locality: null,
          region: null,
          country: null,
        },
        doneChatThreadId: null,
        doneWorkflowId: null,
        translate: (descriptor) => i18n._(descriptor),
      }).prompt,
    ).toBe(
      "We're Acme, a company in computer software. Look at the data I imported and suggest the objects, fields and views we need to run our business. Ask me before creating anything.",
    );
  });

  it('should fall back to a generic data model prompt without enrichment', () => {
    expect(
      buildGettingStartedStepDefinition({
        stepActionKey: GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL,
        companyEnrichment: null,
        doneChatThreadId: null,
        doneWorkflowId: null,
        translate: (descriptor) => i18n._(descriptor),
      }).prompt,
    ).toBe(
      'Look at the data I imported and suggest the objects, fields and views I need to run my business. Ask me what I want to track before creating anything.',
    );
  });

  it('should keep the mailbox done description apart from its description', () => {
    const mailboxStepDefinition = buildGettingStartedStepDefinition({
      stepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
      companyEnrichment: null,
      doneChatThreadId: null,
      doneWorkflowId: null,
      translate,
    });

    expect(mailboxStepDefinition.description).toBe(
      'Connect your email and calendar to see your entire network instantly. Takes only 30 seconds.',
    );
    expect(mailboxStepDefinition.doneDescription).toBe(
      'Companies and people fill in from your emails and meetings.',
    );
  });

  it('should define any other step as a custom step', () => {
    expect(
      buildGettingStartedStepDefinition({
        stepActionKey: GettingStartedStepActionKey.CONNECT_MAILBOX,
        companyEnrichment: null,
        doneChatThreadId: null,
        doneWorkflowId: null,
        translate,
      }),
    ).toMatchObject({
      kind: GettingStartedStepKind.CUSTOM,
      prompt: null,
    });
  });
});
