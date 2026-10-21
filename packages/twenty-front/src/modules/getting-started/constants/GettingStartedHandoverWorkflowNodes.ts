import { msg } from '@lingui/core/macro';
import { IconCheckbox, IconMail, IconTarget } from 'twenty-ui/icon';

export const GETTING_STARTED_HANDOVER_WORKFLOW_NODES = [
  { label: msg`Trigger`, title: msg`A deal is won`, Icon: IconTarget },
  { label: msg`Action`, title: msg`Create a kickoff task`, Icon: IconCheckbox },
  { label: msg`Action`, title: msg`Email the account owner`, Icon: IconMail },
];
