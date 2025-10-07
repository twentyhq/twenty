import { type MessageDescriptor } from '@lingui/core';
import { msg } from '@lingui/core/macro';
import { type ComponentType } from 'react';

import { type CalendarChannel } from '@/accounts/types/CalendarChannel';
import { type MessageChannel } from '@/accounts/types/MessageChannel';
import { SettingsAccountsCalendarChannelDetails } from '@/settings/accounts/components/SettingsAccountsCalendarChannelDetails';
import { SettingsAccountsMessageChannelDetails } from '@/settings/accounts/components/SettingsAccountsMessageChannelDetails';
import { isDefined } from 'twenty-shared/utils';

export enum SettingsAccountsConfigurationStep {
  Email = 'email',
  Calendar = 'calendar',
}

type StepConfig = {
  type: SettingsAccountsConfigurationStep;
  label: MessageDescriptor;
  Component: ComponentType<{
    messageChannel?: MessageChannel;
    calendarChannel?: CalendarChannel;
  }>;
  shouldRender: (data: {
    messageChannel?: MessageChannel;
    calendarChannel?: CalendarChannel;
  }) => boolean;
};

export const SETTINGS_ACCOUNTS_CONFIGURATION_STEPS: StepConfig[] = [
  {
    type: SettingsAccountsConfigurationStep.Email,
    label: msg`Email`,
    Component: ({ messageChannel }) =>
      isDefined(messageChannel) ? (
        <SettingsAccountsMessageChannelDetails
          messageChannel={messageChannel}
        />
      ) : null,
    shouldRender: ({ messageChannel }) => isDefined(messageChannel),
  },
  {
    type: SettingsAccountsConfigurationStep.Calendar,
    label: msg`Calendar`,
    Component: ({ calendarChannel }) =>
      isDefined(calendarChannel) ? (
        <SettingsAccountsCalendarChannelDetails
          calendarChannel={calendarChannel}
        />
      ) : null,
    shouldRender: ({ calendarChannel }) => isDefined(calendarChannel),
  },
];
