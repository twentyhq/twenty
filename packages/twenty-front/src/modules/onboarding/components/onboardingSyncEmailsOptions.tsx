import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import styled from '@emotion/styled';

import { MessageChannelVisibility } from '~/generated/graphql';

const StyledCardMedia = styled(SettingsAccountsVisibilityIcon)`
  width: ${({ theme }) => theme.spacing(10)};
`;

export const onboardingSyncEmailsOptions = [
  {
    title: 'Everything',
    description:
      'Your emails and events content will be shared with your team.',
    value: MessageChannelVisibility.ShareEverything,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="active" />
    ),
  },
  {
    title: 'Subject and metadata',
    description:
      'Your email subjects and meeting titles will be shared with your team.',
    value: MessageChannelVisibility.Subject,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="inactive" />
    ),
  },
  {
    title: 'Metadata',
    description:
      'Only the timestamp & participants will be shared with your team.',
    value: MessageChannelVisibility.Metadata,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="inactive" body="inactive" />
    ),
  },
];
