import styled from '@emotion/styled';

import { InboxSettingsVisibilityValue } from '@/settings/accounts/components/SettingsAccountsInboxVisibilitySettingsCard';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';

const StyledCardMedia = styled(SettingsAccountsVisibilitySettingCardMedia)`
  width: ${({ theme }) => theme.spacing(10)};
`;

type OnboardingSyncEmailsSettingsCardProps = {
  onChange: (nextValue: InboxSettingsVisibilityValue) => void;
  value?: InboxSettingsVisibilityValue;
};

const onboardingSyncEmailsOptions = [
  {
    title: 'Everything',
    description:
      'Your emails and events content will be shared with your team.',
    value: InboxSettingsVisibilityValue.Everything,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="active" />
    ),
  },
  {
    title: 'Subject and metadata',
    description:
      'Your email subjects and meeting titles will be shared with your team.',
    value: InboxSettingsVisibilityValue.SubjectMetadata,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="inactive" />
    ),
  },
  {
    title: 'Metadata',
    description:
      'Only the timestamp & participants will be shared with your team.',
    value: InboxSettingsVisibilityValue.Metadata,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="inactive" body="inactive" />
    ),
  },
];

export const OnboardingSyncEmailsSettingsCard = ({
  onChange,
  value = InboxSettingsVisibilityValue.Everything,
}: OnboardingSyncEmailsSettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={onboardingSyncEmailsOptions}
    value={value}
    onChange={onChange}
  />
);
