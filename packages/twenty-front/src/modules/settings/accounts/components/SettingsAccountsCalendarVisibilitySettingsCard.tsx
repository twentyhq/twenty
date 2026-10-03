import { styled } from '@linaria/react';

import { SettingsAccountsVisibilityIcon } from '@/settings/accounts/components/SettingsAccountsVisibilityIcon';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { msg } from '@lingui/core/macro';
import { CalendarChannelVisibility } from '~/generated/graphql';
import { themeCssVariables } from 'twenty-ui/theme';

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
    title: msg`Shared with everyone`,
    description: msg`Everyone in your workspace can read the title and description.`,
    value: CalendarChannelVisibility.SHARE_EVERYTHING,
    cardMedia: (
      <StyledCardMediaContainer>
        <SettingsAccountsVisibilityIcon subject="active" body="active" />
      </StyledCardMediaContainer>
    ),
  },
  {
    title: msg`Private`,
    description: msg`Only you can read the title and description. Your workspace sees who took part and when.`,
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
