import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  IconCheckbox,
  type IconComponent,
  IconMail,
  IconTarget,
} from 'twenty-ui/icon';

import { GettingStartedStep } from '~/generated-metadata/graphql';

export const GETTING_STARTED_WORKFLOW_NODES: Partial<
  Record<
    GettingStartedStep,
    {
      label: MessageDescriptor;
      title: MessageDescriptor;
      Icon: IconComponent;
    }[]
  >
> = {
  [GettingStartedStep.HANDOVER_DEALS]: [
    { label: msg`Trigger`, title: msg`A deal is won`, Icon: IconTarget },
    {
      label: msg`Action`,
      title: msg`Create a kickoff task`,
      Icon: IconCheckbox,
    },
    { label: msg`Action`, title: msg`Email the account owner`, Icon: IconMail },
  ],
};
