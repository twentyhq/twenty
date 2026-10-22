import { APPLICATION_VARIABLES_TAB_ID } from '@/settings/applications/constants/ApplicationVariablesTabId';
import { type SettingsMenuItem } from '~/generated-metadata/graphql';

export const getApplicationConfigurationTabId = ({
  hasVariablesTab,
  settingsMenuItems,
}: {
  hasVariablesTab: boolean;
  settingsMenuItems: Pick<SettingsMenuItem, 'universalIdentifier'>[];
}): string | undefined =>
  hasVariablesTab
    ? APPLICATION_VARIABLES_TAB_ID
    : settingsMenuItems.at(0)?.universalIdentifier;
