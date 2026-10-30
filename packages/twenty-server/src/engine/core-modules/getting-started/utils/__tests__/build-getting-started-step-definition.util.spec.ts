import { setupI18n } from '@lingui/core';
import { compileMessage } from '@lingui/message-utils/compileMessage';

import { GettingStartedStepKind } from 'src/engine/core-modules/getting-started/enums/getting-started-step-kind.enum';
import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
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
        step: GettingStartedStep.HANDOVER_DEALS,
        companyEnrichment: null,
        translate,
      }),
    ).toEqual({
      step: GettingStartedStep.HANDOVER_DEALS,
      kind: GettingStartedStepKind.WORKFLOW,
      title: 'Hand over won deals',
      doneTitle: 'Workflow enabled',
      description: 'Start the handover when a deal is won.',
      icon: 'IconSettingsAutomation',
      iconColor: 'gray',
      promptLabel: null,
      prompt: null,
    });
  });

  it('should define a step with a prompt as a prompt step', () => {
    expect(
      buildGettingStartedStepDefinition({
        step: GettingStartedStep.FOLLOW_UP_DEALS,
        companyEnrichment: null,
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
        step: GettingStartedStep.CUSTOMIZE_DATA_MODEL,
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
        translate: (descriptor) => i18n._(descriptor),
      }).prompt,
    ).toBe(
      "We're Acme, a company in computer software. Look at the data I imported and suggest the objects, fields and views we need to run our business. Ask me before creating anything.",
    );
  });

  it('should fall back to a generic data model prompt without enrichment', () => {
    expect(
      buildGettingStartedStepDefinition({
        step: GettingStartedStep.CUSTOMIZE_DATA_MODEL,
        companyEnrichment: null,
        translate: (descriptor) => i18n._(descriptor),
      }).prompt,
    ).toBe(
      'Look at the data I imported and suggest the objects, fields and views I need to run my business. Ask me what I want to track before creating anything.',
    );
  });

  it('should define any other step as a custom step', () => {
    expect(
      buildGettingStartedStepDefinition({
        step: GettingStartedStep.CONNECT_MAILBOX,
        companyEnrichment: null,
        translate,
      }),
    ).toMatchObject({
      kind: GettingStartedStepKind.CUSTOM,
      prompt: null,
    });
  });
});
