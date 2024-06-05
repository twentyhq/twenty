import styled from '@emotion/styled';

import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilitySettingCardMedia } from '@/settings/accounts/components/SettingsAccountsVisibilitySettingCardMedia';
import { CalendarChannelVisibility } from '~/generated/graphql';

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
    value: CalendarChannelVisibility.ShareEverything,
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
  value = CalendarChannelVisibility.ShareEverything,
}: SettingsAccountsEventVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    options={eventSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
