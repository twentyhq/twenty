import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import styled from '@emotion/styled';
import { msg } from '@lingui/core/macro';

import { MessageChannelVisibility } from '~/generated/graphql';

const StyledCardMedia = styled(SettingsAccountsVisibilityIcon)`
  width: ${({ theme }) => theme.spacing(10)};
`;

export const onboardingSyncEmailsOptions = [
  {
    title: msg`Everything`,
    description: msg`Your emails and events content will be shared with your team.`,
    value: MessageChannelVisibility.SHARE_EVERYTHING,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="active" />
    ),
  },
  {
    title: msg`Subject and metadata`,
    description: msg`Your email subjects and meeting titles will be shared with your team.`,
    value: MessageChannelVisibility.SUBJECT,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="inactive" />
    ),
  },
  {
    title: msg`Metadata`,
    description: msg`Only the timestamp & participants will be shared with your team.`,
    value: MessageChannelVisibility.METADATA,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="inactive" body="inactive" />
    ),
  },
];
