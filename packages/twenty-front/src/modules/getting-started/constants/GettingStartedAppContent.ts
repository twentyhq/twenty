import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import {
  type GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS,
  TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/application';
import {
  IconBlockquote,
  type IconComponent,
  IconMessage,
  IconVideo,
} from 'twenty-ui/icon';

export const GETTING_STARTED_APP_CONTENT: Record<
  (typeof GETTING_STARTED_APP_UNIVERSAL_IDENTIFIERS)[number],
  {
    label: MessageDescriptor;
    description: MessageDescriptor;
    Icon: IconComponent;
  }
> = {
  [TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.SLACK]: {
    label: msg`Slack`,
    description: msg`Ask Twenty from Slack and post to Slack from your workflows.`,
    Icon: IconMessage,
  },
  [TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.TEAMS]: {
    label: msg`Microsoft Teams`,
    description: msg`Bring your Teams meeting transcripts into Twenty.`,
    Icon: IconBlockquote,
  },
  [TWENTY_PUBLIC_APP_UNIVERSAL_IDENTIFIERS.FATHOM]: {
    label: msg`Fathom`,
    description: msg`Bring your Fathom recordings, summaries and action items into Twenty.`,
    Icon: IconVideo,
  },
};
