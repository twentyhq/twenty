import styled from '@emotion/styled';

import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';

export enum EventSettingsVisibilityValue {
  Everything = 'share_everything',
  Metadata = 'metadata',
}

type SettingsAccountsEventVisibilitySettingsCardProps = {
  onChange: (nextValue: EventSettingsVisibilityValue) => void;
  value?: EventSettingsVisibilityValue;
};

const StyledCardMedia = styled(SettingsAccountsVisibilitySettingCardMedia)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const eventSettingsVisibilityOptions = [
  {
    title: 'Everything',
    description: 'The whole event details will be shared with your team.',
    value: EventSettingsVisibilityValue.Everything,
    cardMedia: <StyledCardMedia subject="active" body="active" />,
  },
  {
    title: 'Metadata',
    description: 'Only date & participants will be shared with your team.',
    value: EventSettingsVisibilityValue.Metadata,
    cardMedia: <StyledCardMedia subject="active" body="inactive" />,
  },
];

export const SettingsAccountsEventVisibilitySettingsCard = ({
  onChange,
  value = EventSettingsVisibilityValue.Everything,
}: SettingsAccountsEventVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={eventSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
