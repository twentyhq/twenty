import { msg } from '@lingui/core/macro';
import {
  IconAt,
  IconFileImport,
  IconApps,
  IconUsers,
  IconSettingsAutomation,
  IconSparkles,
} from 'twenty-ui/icon';

export const GETTING_STARTED_STEP_CONTENT = {
  connectMailbox: {
    title: msg`Connect your mailbox`,
    doneTitle: msg`Mailbox connected`,
    description: msg`Companies and people fill in from your emails and meetings.`,
    Icon: IconAt,
    reward: 1,
  },
  importData: {
    title: msg`Import your data`,
    doneTitle: msg`Spreadsheet uploaded`,
    description: msg`Bring your contacts into Twenty from a spreadsheet.`,
    Icon: IconFileImport,
    reward: 0,
  },
  installApp: {
    title: msg`Install an app`,
    doneTitle: msg`App installation requested`,
    description: msg`Add tools to your workspace.`,
    Icon: IconApps,
    reward: 0,
  },
  inviteTeam: {
    title: msg`Invite your team`,
    doneTitle: msg`Invitations sent`,
    description: msg`Bring your team into Twenty.`,
    Icon: IconUsers,
    reward: 0.5,
  },
  handoverDeals: {
    title: msg`Hand over won deals`,
    doneTitle: msg`Workflow enabled`,
    description: msg`Start the handover when a deal is won.`,
    Icon: IconSettingsAutomation,
    reward: 0,
  },
  followUpDeals: {
    title: msg`Follow up on closing deals`,
    doneTitle: msg`Follow-up request sent`,
    description: msg`An agent drafts a follow-up for every deal about to close.`,
    Icon: IconSparkles,
    reward: 0,
  },
};
