import styled from '@emotion/styled';

import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { msg } from '@lingui/core/macro';
import { CalendarChannelVisibility } from '~/generated/graphql';

type SettingsAccountsEventVisibilitySettingsCardProps = {
  onChange: (nextValue: CalendarChannelVisibility) => void;
  value?: CalendarChannelVisibility;
};

const StyledCardMedia = styled(SettingsAccountsVisibilityIcon)`
  height: ${({ theme }) => theme.spacing(6)};
`;

const eventSettingsVisibilityOptions = [
  {
    title: msg`Everything`,
    description: msg`The whole event details will be shared with your team.`,
    value: CalendarChannelVisibility.SHARE_EVERYTHING,
    cardMedia: <StyledCardMedia subject="active" body="active" />,
  },
  {
    title: msg`Metadata`,
    description: msg`Only date & participants will be shared with your team.`,
    value: CalendarChannelVisibility.METADATA,
    cardMedia: <StyledCardMedia subject="active" body="inactive" />,
  },
];

export const SettingsAccountsEventVisibilitySettingsCard = ({
  onChange,
  value = CalendarChannelVisibility.SHARE_EVERYTHING,
}: SettingsAccountsEventVisibilitySettingsCardProps) => (
  <SettingsAccountsRadioSettingsCard
    name="event-visibility"
    options={eventSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
