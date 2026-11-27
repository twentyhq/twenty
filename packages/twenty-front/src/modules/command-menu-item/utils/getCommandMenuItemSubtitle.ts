import { isPathCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isPathCommandMenuItemPayload';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { t } from '@lingui/core/macro';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { EngineComponentKey } from '~/generated-metadata/graphql';

export const getCommandMenuItemSubtitle = (
  item: Pick<CommandMenuItemDefinition, 'engineComponentKey' | 'payload'>,
): string | undefined => {
  const isSettingsSubPageNavigation =
    item.engineComponentKey === EngineComponentKey.NAVIGATION &&
    isDefined(item.payload) &&
    isPathCommandMenuItemPayload(item.payload) &&
    item.payload.path.startsWith(`/${AppPath.Settings}/`) &&
    item.payload.path !== getSettingsPath(SettingsPath.ProfilePage);

  return isSettingsSubPageNavigation ? t`Settings` : undefined;
};
