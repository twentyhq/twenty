import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconApps,
  IconAt,
  type IconComponent,
  IconFileImport,
  IconSettingsAutomation,
  IconSparkles,
  IconUsers,
} from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { GettingStartedStep } from '~/generated-metadata/graphql';

export const GETTING_STARTED_STEP_CONTENT: Record<
  GettingStartedStep,
  {
    title: MessageDescriptor;
    doneTitle: MessageDescriptor;
    description: MessageDescriptor;
    Icon: IconComponent;
    iconColor: string;
  }
> = {
  [GettingStartedStep.CONNECT_MAILBOX]: {
    title: msg`Connect your mailbox`,
    doneTitle: msg`Mailbox connected`,
    description: msg`Companies and people fill in from your emails and meetings.`,
    Icon: IconAt,
    iconColor: themeCssVariables.tag.text.blue,
  },
  [GettingStartedStep.IMPORT_DATA]: {
    title: msg`Import your data`,
    doneTitle: msg`Spreadsheet uploaded`,
    description: msg`Bring your contacts into Twenty from a spreadsheet.`,
    Icon: IconFileImport,
    iconColor: themeCssVariables.tag.text.gray,
  },
  [GettingStartedStep.INSTALL_APP]: {
    title: msg`Install an app`,
    doneTitle: msg`App installed`,
    description: msg`Add tools to your workspace.`,
    Icon: IconApps,
    iconColor: themeCssVariables.tag.text.turquoise,
  },
  [GettingStartedStep.INVITE_TEAM]: {
    title: msg`Invite your team`,
    doneTitle: msg`Invitations sent`,
    description: msg`Bring your team into Twenty.`,
    Icon: IconUsers,
    iconColor: themeCssVariables.tag.text.orange,
  },
  [GettingStartedStep.HANDOVER_DEALS]: {
    title: msg`Hand over won deals`,
    doneTitle: msg`Workflow enabled`,
    description: msg`Start the handover when a deal is won.`,
    Icon: IconSettingsAutomation,
    iconColor: themeCssVariables.tag.text.gray,
  },
  [GettingStartedStep.FOLLOW_UP_DEALS]: {
    title: msg`Follow up on closing deals`,
    doneTitle: msg`Follow-up request sent`,
    description: msg`An agent drafts a follow-up for every deal about to close.`,
    Icon: IconSparkles,
    iconColor: themeCssVariables.tag.text.purple,
  },
};
