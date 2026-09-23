import { AppChip } from '@/applications/components/AppChip';
import { useApplicationChipData } from '@/applications/hooks/useApplicationChipData';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandListItemLoader } from '@/command-menu-item/display/components/CommandListItemLoader';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledAppIconContainer = styled.span`
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  padding: ${themeCssVariables.spacing[1]};
`;

export const CommandMenuDropdownActionItem = ({
  item,
}: {
  item: CommandMenuItemDefinition;
}) => {
  const isAsyncCsvExportEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
  );
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { getIcon } = useIcons();
  const { iconKey, label } = interpolateCommandMenuItemFields(
    item,
    commandMenuContextApi,
  );
  const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);
  const { handleClick, disabled, progress, showDisabledLoader } =
    useCommandMenuItemClick({ item, Icon, label });
  const isThirdPartyApp = useIsThirdPartyApplication(item.applicationId);
  const { applicationChipData } = useApplicationChipData({
    applicationId: item.applicationId,
  });
  const loaderComponent =
    isAsyncCsvExportEnabled && disabled && showDisabledLoader ? (
      isDefined(progress) ? (
        <CommandListItemLoader progress={progress} />
      ) : (
        <Loader />
      )
    ) : undefined;

  return (
    <Dropdown.ActionItem
      disabled={disabled}
      onClick={handleClick}
      closeOnClick={false}
      startIcon={
        isThirdPartyApp ? (
          <StyledAppIconContainer>
            <AppChip applicationId={item.applicationId} size="md" chipOnly />
          </StyledAppIconContainer>
        ) : (
          <Icon />
        )
      }
      description={isThirdPartyApp ? applicationChipData.name : undefined}
      endIcon={loaderComponent}
    >
      {label}
    </Dropdown.ActionItem>
  );
};
