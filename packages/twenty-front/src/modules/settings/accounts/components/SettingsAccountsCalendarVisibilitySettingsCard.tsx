import styled from '@emotion/styled';

import { CalendarChannelVisibility } from '@/accounts/types/CalendarChannel';
import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';

type SettingsAccountsEventVisibilitySettingsCardProps = {
  onChange: (nextValue: CalendarChannelVisibility) => void;
  value?: CalendarChannelVisibility;
};

const StyledCardMedia = styled(SettingsAccountsVisibilitySettingCardMedia)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const eventSettingsVisibilityOptions = [
  {
    title: 'Everything',
    description: 'The whole event details will be shared with your team.',
    value: CalendarChannelVisibility.Everything,
    cardMedia: <StyledCardMedia subject="active" body="active" />,
  },
  {
    title: 'Metadata',
    description: 'Only date & participants will be shared with your team.',
    value: CalendarChannelVisibility.Metadata,
    cardMedia: <StyledCardMedia subject="active" body="inactive" />,
  },
];

export const SettingsAccountsEventVisibilitySettingsCard = ({
  onChange,
  value = CalendarChannelVisibility.Everything,
}: SettingsAccountsEventVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={eventSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
