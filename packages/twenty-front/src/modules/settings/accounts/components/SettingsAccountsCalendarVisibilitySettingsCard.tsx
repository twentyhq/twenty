import { styled } from '@linaria/react';

import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { msg } from '@lingui/core/macro';
import { CalendarChannelVisibility } from '~/generated/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';

type SettingsAccountsEventVisibilitySettingsCardProps = {
  onChange: (nextValue: CalendarChannelVisibility) => void;
  value?: CalendarChannelVisibility;
};

const StyledCardMediaContainer = styled.div`
  > * {
    height: ${themeCssVariables.spacing[8]};
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
  <SettingsRadioSettingsCard
    name="event-visibility"
    options={eventSettingsVisibilityOptions}
    value={value}
    onChange={onChange}
  />
);
