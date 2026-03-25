import { styled } from '@linaria/react';

import { SettingsAccountsRadioSettingsCard } from '@/settings/accounts/components/SettingsAccountsRadioSettingsCard';
import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { msg } from '@lingui/core/macro';
import { CalendarChannelVisibility } from '~/generated/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsEventVisibilitySettingsCardProps = {
  onChange: (nextValue: CalendarChannelVisibility) => void;
  value?: CalendarChannelVisibility;
};

const StyledCardMediaContainer = styled.div`
  > * {
    height: ${themeCssVariables.spacing[6]};
  }
`;

const eventSettingsVisibilityOptions = [
  {
    title: msg`Everything`,
    description: msg`The whole event details will be shared with your team.`,
    value: CalendarChannelVisibility.SHARE_EVERYTHING,
    cardMedia: (
      <StyledCardMediaContainer>
        <SettingsAccountsVisibilityIcon subject="active" body="active" />
      </StyledCardMediaContainer>
    ),
  },
  {
    title: msg`Metadata`,
    description: msg`Only date & participants will be shared with your team.`,
    value: CalendarChannelVisibility.METADATA,
    cardMedia: (
      <StyledCardMediaContainer>
        <SettingsAccountsVisibilityIcon subject="active" body="inactive" />
      </StyledCardMediaContainer>
    ),
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
