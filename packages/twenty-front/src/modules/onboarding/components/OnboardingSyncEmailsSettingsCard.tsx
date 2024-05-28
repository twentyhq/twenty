import styled from '@emotion/styled';

import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';

export enum InboxSyncEmailsValue {
  Everything = 'share_everything',
  SubjectMetadata = 'subject',
  Metadata = 'metadata',
}

const StyledCardMedia = styled(SettingsAccountsVisibilitySettingCardMedia)`
  width: ${({ theme }) => theme.spacing(10)};
`;

type OnboardingSyncEmailsSettingsCardProps = {
  onChange: (nextValue: InboxSyncEmailsValue) => void;
  value?: InboxSyncEmailsValue;
};

const onboardingSyncEmailsOptions = [
  {
    title: 'Everything',
    description:
      'Your emails and events content will be shared with your team.',
    value: InboxSyncEmailsValue.Everything,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="active" />
    ),
  },
  {
    title: 'Subject and metadata',
    description:
      'Your email subjects and meeting titles will be shared with your team.',
    value: InboxSyncEmailsValue.SubjectMetadata,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="active" body="inactive" />
    ),
  },
  {
    title: 'Metadata',
    description:
      'Only the timestamp & participants will be shared with your team.',
    value: InboxSyncEmailsValue.Metadata,
    cardMedia: (
      <StyledCardMedia metadata="active" subject="inactive" body="inactive" />
    ),
  },
];

export const OnboardingSyncEmailsSettingsCard = ({
  onChange,
  value = InboxSyncEmailsValue.Everything,
}: OnboardingSyncEmailsSettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={onboardingSyncEmailsOptions}
    value={value}
    onChange={onChange}
  />
);
