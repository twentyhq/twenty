import styled from '@emotion/styled';

import { CalendarChannelVisibilityValue } from '@/accounts/types/CalendarChannel';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';

type SettingsAccountsEventVisibilitySettingsCardProps = {
  onChange: (nextValue: CalendarChannelVisibilityValue) => void;
  value?: CalendarChannelVisibilityValue;
};

const StyledCardMedia = styled(SettingsAccountsVisibilitySettingCardMedia)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const eventSettingsVisibilityOptions = [
  {
    title: 'Everything',
    description: 'The whole event details will be shared with your team.',
    value: CalendarChannelVisibilityValue.Everything,
    cardMedia: <StyledCardMedia subject="active" body="active" />,
  },
  {
    title: 'Metadata',
    description: 'Only date & participants will be shared with your team.',
    value: CalendarChannelVisibilityValue.Metadata,
    cardMedia: <StyledCardMedia subject="active" body="inactive" />,
  },
];

export const SettingsAccountsEventVisibilitySettingsCard = ({
  onChange,
  value = CalendarChannelVisibilityValue.Everything,
}: SettingsAccountsEventVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={eventSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
