import { msg } from '@lingui/core/macro';

import { GettingStartedStep } from 'src/engine/core-modules/getting-started/enums/getting-started-step.enum';
import { type GettingStartedStepContent } from 'src/engine/core-modules/getting-started/types/getting-started-step-content.type';
import { getGettingStartedDataModelPrompt } from 'src/engine/core-modules/getting-started/utils/get-getting-started-data-model-prompt.util';

export const GETTING_STARTED_STEP_CONTENT: Record<
  GettingStartedStep,
  GettingStartedStepContent
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: {
    title: msg`Connect your mailbox`,
    doneTitle: msg`Mailbox connected`,
    description: msg`Companies and people fill in from your emails and meetings.`,
    icon: 'IconAt',
    iconColor: 'blue',
  },
  [GettingStartedStep.IMPORT_DATA]: {
    title: msg`Import your data`,
    doneTitle: msg`Spreadsheet uploaded`,
    description: msg`Bring your companies, contacts and deals from any CRM export.`,
    icon: 'IconFileImport',
    iconColor: 'gray',
  },
  [GettingStartedStep.CUSTOMIZE_DATA_MODEL]: {
    title: msg`Tailor your workspace`,
    doneTitle: msg`Setup request sent`,
    description: msg`An agent shapes your objects and fields around how you work.`,
    icon: 'IconHierarchy',
    iconColor: 'green',
    prompt: {
      label: msg`Setup instructions`,
      getText: getGettingStartedDataModelPrompt,
    },
  },
  [GettingStartedStep.INSTALL_APP]: {
    title: msg`Install an app`,
    doneTitle: msg`App installed`,
    description: msg`Add tools to your workspace.`,
    icon: 'IconApps',
    iconColor: 'turquoise',
  },
  [GettingStartedStep.INVITE_TEAM]: {
    title: msg`Invite your team`,
    doneTitle: msg`Invitations sent`,
    description: msg`Bring your team into Twenty.`,
    icon: 'IconUsers',
    iconColor: 'orange',
  },
  [GettingStartedStep.HANDOVER_DEALS]: {
    title: msg`Hand over won deals`,
    doneTitle: msg`Workflow enabled`,
    description: msg`Start the handover when a deal is won.`,
    icon: 'IconSettingsAutomation',
    iconColor: 'gray',
  },
  [GettingStartedStep.FOLLOW_UP_DEALS]: {
    title: msg`Follow up on closing deals`,
    doneTitle: msg`Follow-up request sent`,
    description: msg`An agent drafts a follow-up for every deal about to close.`,
    icon: 'IconSparkles',
    iconColor: 'purple',
    prompt: {
      label: msg`Follow-up instructions`,
      getText: () =>
        msg`Every Monday, draft a follow-up email for each deal closing in the next 30 days.`,
    },
  },
};
