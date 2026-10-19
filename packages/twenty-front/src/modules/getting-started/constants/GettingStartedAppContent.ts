import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS,
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/application';
import {
  IconClock,
  type IconComponent,
  IconMicrophone,
  IconSparkles,
} from 'twenty-ui/icon';

export const GETTING_STARTED_APP_CONTENT: Record<
  (typeof GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS)[number],
  {
    label: MessageDescriptor;
    description: MessageDescriptor;
    Icon: IconComponent;
  }
> = {
  [TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.CALL_RECORDER]: {
    label: msg`Call recorder`,
    description: msg`Record calls and keep meeting notes in Twenty.`,
    Icon: IconMicrophone,
  },
  [TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.PEOPLE_DATA_LABS]: {
    label: msg`Enrichment`,
    description: msg`Enrich people and companies with People Data Labs.`,
    Icon: IconSparkles,
  },
  [TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.LAST_CONTACT]: {
    label: msg`Last contact`,
    description: msg`See when you last spoke with each contact.`,
    Icon: IconClock,
  },
};
