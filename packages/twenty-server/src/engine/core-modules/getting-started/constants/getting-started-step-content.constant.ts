import { msg } from '@lingui/core/macro';

import { GettingStartedStepActionKey } from 'src/engine/core-modules/getting-started/enums/getting-started-step-action-key.enum';
import { type GettingStartedStepContent } from 'src/engine/core-modules/getting-started/types/getting-started-step-content.type';
import { getGettingStartedDataModelPrompt } from 'src/engine/core-modules/getting-started/utils/get-getting-started-data-model-prompt.util';

export const GETTING_STARTED_STEP_CONTENT: Record<
  GettingStartedStepActionKey,
  GettingStartedStepContent
> = {
  [GettingStartedStepActionKey.CONNECT_MAILBOX]: {
    title: msg`Import your contacts`,
    doneTitle: msg`Mailbox connected`,
    description: msg`Connect your email and calendar to see your entire network instantly. Takes only 30 seconds.`,
    doneDescription: msg`Companies and people fill in from your emails and meetings.`,
    icon: 'IconAt',
    iconColor: 'blue',
  },
  [GettingStartedStepActionKey.IMPORT_DATA]: {
    title: msg`Import your data`,
    doneTitle: msg`Data imported`,
    description: msg`Bring your companies, contacts and deals from any CRM export.`,
    doneDescription: msg`Your records are in, organized around how you work.`,
    icon: 'IconFileImport',
    iconColor: 'gray',
  },
  [GettingStartedStepActionKey.CUSTOMIZE_DATA_MODEL]: {
    title: msg`Tailor your workspace`,
    doneTitle: msg`Workspace fit to your process`,
    description: msg`An agent shapes your objects and fields around how you work.`,
    doneDescription: msg`Objects, fields and views adapt to the way your team works.`,
    icon: 'IconHierarchy',
    iconColor: 'green',
    prompt: {
      label: msg`Setup instructions`,
      getText: getGettingStartedDataModelPrompt,
    },
  },
  [GettingStartedStepActionKey.INSTALL_APP]: {
    title: msg`Install an app`,
    doneTitle: msg`App installed`,
    description: msg`Add tools to your workspace.`,
    doneDescription: msg`Manage your apps in settings.`,
    icon: 'IconApps',
    iconColor: 'turquoise',
  },
  [GettingStartedStepActionKey.INVITE_TEAM]: {
    title: msg`Invite your team`,
    doneTitle: msg`Invitations sent`,
    description: msg`Bring your team into Twenty.`,
    doneDescription: msg`Invites are out. Bring in more people anytime.`,
    icon: 'IconUsers',
    iconColor: 'orange',
  },
  [GettingStartedStepActionKey.HANDOVER_DEALS]: {
    title: msg`Hand over won deals`,
    doneTitle: msg`Handover ready`,
    description: msg`Start the handover when a deal is won.`,
    doneDescription: msg`Turn it on and won deals move to delivery on their own.`,
    icon: 'IconSettingsAutomation',
    iconColor: 'gray',
  },
  [GettingStartedStepActionKey.FOLLOW_UP_DEALS]: {
    title: msg`Follow up on closing deals`,
    doneTitle: msg`Deal follow-ups on track`,
    description: msg`An agent drafts a follow-up for every deal about to close.`,
    doneDescription: msg`Each week, every deal about to close gets a follow-up draft.`,
    icon: 'IconSparkles',
    iconColor: 'purple',
    prompt: {
      label: msg`Follow-up instructions`,
      getText: () =>
        msg`Every Monday, draft a follow-up email for each deal closing in the next 30 days.`,
    },
  },
};
