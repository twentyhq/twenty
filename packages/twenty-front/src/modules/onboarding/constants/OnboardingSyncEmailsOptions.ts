import { msg } from '@lingui/core/macro';

import { MessageChannelVisibility } from '~/generated/graphql';

type OnboardingEmailVisibilityProps = {
  metadata: 'active' | 'inactive';
  subject: 'active' | 'inactive';
  body: 'active' | 'inactive';
};

const everythingProps: OnboardingEmailVisibilityProps = {
  metadata: 'active',
  subject: 'active',
  body: 'active',
};

const subjectMetadataProps: OnboardingEmailVisibilityProps = {
  metadata: 'active',
  subject: 'active',
  body: 'inactive',
};

const metadataOnlyProps: OnboardingEmailVisibilityProps = {
  metadata: 'active',
  subject: 'inactive',
  body: 'inactive',
};

export const ONBOARDING_SYNC_EMAILS_OPTIONS = [
  {
    title: msg`Everything`,
    description: msg`Your emails and events content will be shared with your team.`,
    value: MessageChannelVisibility.SHARE_EVERYTHING,
    cardMediaProps: everythingProps,
  },
  {
    title: msg`Subject and metadata`,
    description: msg`Your email subjects and meeting titles will be shared with your team.`,
    value: MessageChannelVisibility.SUBJECT,
    cardMediaProps: subjectMetadataProps,
  },
  {
    title: msg`Metadata`,
    description: msg`Only the timestamp & participants will be shared with your team.`,
    value: MessageChannelVisibility.METADATA,
    cardMediaProps: metadataOnlyProps,
  },
];
