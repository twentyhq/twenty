import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { useContext } from 'react';
import { useIcons } from 'twenty-ui/icon';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCommandMenuItemDisplay = (item: CommandMenuItemDefinition) => {
  const isAsyncCsvExportEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
  );
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { getIcon } = useIcons();

  const { iconKey, label, shortLabel } = interpolateCommandMenuItemFields(
    item,
    commandMenuContextApi,
  );

  const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

  const { handleClick, disabled, progress, showDisabledLoader } =
    useCommandMenuItemClick({ item, Icon, label });

  return {
    Icon,
    label,
    shortLabel,
    handleClick,
    disabled,
    progress: isAsyncCsvExportEnabled ? progress : undefined,
    isLoading: isAsyncCsvExportEnabled && showDisabledLoader,
  };
};
