import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCheckbox,
  type IconComponent,
  IconMail,
  IconTarget,
} from 'twenty-ui/icon';

export const GETTING_STARTED_WORKFLOW_NODES: {
  label: MessageDescriptor;
  title: MessageDescriptor;
  Icon: IconComponent;
}[] = [
  { label: msg`Trigger`, title: msg`A deal is won`, Icon: IconTarget },
  {
    label: msg`Action`,
    title: msg`Create a kickoff task`,
    Icon: IconCheckbox,
  },
  { label: msg`Action`, title: msg`Email the account owner`, Icon: IconMail },
];
