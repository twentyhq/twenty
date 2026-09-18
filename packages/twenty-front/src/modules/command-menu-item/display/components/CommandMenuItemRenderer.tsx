import { AppMenuItem } from '@/applications/components/AppMenuItem';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandListItemLoader } from '@/command-menu-item/display/components/CommandListItemLoader';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { MenuItem } from 'twenty-ui/components';
import { useIcons } from 'twenty-ui/icon';
import { Loader } from 'twenty-ui/primitives/feedback';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

const StyledPreviewWrapper = styled.div`
  cursor: not-allowed;

  & * {
    pointer-events: none;
  }
`;

type CommandMenuItemRendererProps = {
  item: CommandMenuItemDefinition;
  isPrimaryAction?: boolean;
  shouldHideLabel?: boolean;
};

type CommandMenuItemButtonRendererProps = CommandMenuItemRendererProps;

const CommandMenuItemButtonRenderer = ({
  item,
  isPrimaryAction = false,
  shouldHideLabel = false,
}: CommandMenuItemButtonRendererProps) => {
  const isAsyncCsvExportEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ASYNC_CSV_EXPORT_ENABLED,
  );
  const { commandMenuContextApi, isInPreviewMode } =
    useContext(CommandMenuContext);
  const { getIcon } = useIcons();

  const { iconKey, label, shortLabel } = interpolateCommandMenuItemFields(
    item,
    commandMenuContextApi,
  );

  const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

  const { handleClick, disabled, progress, showDisabledLoader } =
    useCommandMenuItemClick({
      item,
      Icon,
      label,
    });

  const command = {
    key: item.id,
    label,
    shortLabel,
    Icon,
    hotKeys: item.hotKeys,
  };

  if (isInPreviewMode) {
    return (
      <StyledPreviewWrapper>
        <CommandMenuButton
          command={command}
          isPrimaryAction={isPrimaryAction}
          shouldHideLabel={shouldHideLabel}
        />
      </StyledPreviewWrapper>
    );
  }

  return (
    <CommandMenuButton
      command={command}
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
      progress={isAsyncCsvExportEnabled ? progress : undefined}
      loading={isAsyncCsvExportEnabled && showDisabledLoader}
      isPrimaryAction={isPrimaryAction}
      shouldHideLabel={shouldHideLabel}
    />
  );
};

const CommandMenuItemSelectableRenderer = ({
  item,
  displayType,
}: CommandMenuItemRendererProps & {
  displayType: 'listItem' | 'dropdownItem';
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

  const selectableListInstanceId = useAvailableComponentInstanceIdOrThrow(
    SelectableListComponentInstanceContext,
  );

  const isSelectedItemId = useAtomComponentFamilyStateValue(
    isSelectedItemIdComponentFamilyState,
    item.id,
    selectableListInstanceId,
  );

  const isThirdPartyApp = useIsThirdPartyApplication(item.applicationId);

  const onItemClick = () => {
    if (disabled) {
      return;
    }
    handleClick();
  };

  const loaderComponent =
    isAsyncCsvExportEnabled && disabled && showDisabledLoader ? (
      isDefined(progress) ? (
        <CommandListItemLoader progress={progress} />
      ) : (
        <Loader />
      )
    ) : undefined;

  if (isThirdPartyApp) {
    return (
      <SelectableListItem itemId={item.id} onEnter={onItemClick}>
        <AppMenuItem
          applicationId={item.applicationId}
          text={label}
          onClick={disabled ? undefined : handleClick}
          focused={!disabled && isSelectedItemId}
          disabled={disabled}
          RightComponent={loaderComponent}
        />
      </SelectableListItem>
    );
  }

  if (displayType === 'listItem') {
    return (
      <SelectableListItem itemId={item.id} onEnter={onItemClick}>
        <CommandMenuItem
          id={item.id}
          Icon={Icon}
          label={label}
          onClick={disabled ? undefined : handleClick}
          hotKeys={item.hotKeys}
          disabled={disabled}
          RightComponent={loaderComponent}
        />
      </SelectableListItem>
    );
  }

  return (
    <SelectableListItem itemId={item.id} onEnter={onItemClick}>
      <MenuItem
        focused={isSelectedItemId}
        LeftIcon={Icon}
        onClick={onItemClick}
        text={label}
        RightComponent={loaderComponent}
        disabled={disabled}
      />
    </SelectableListItem>
  );
};

// oxlint-disable-next-line twenty/effect-components
export const CommandMenuItemRenderer = ({
  item,
  isPrimaryAction,
  shouldHideLabel,
}: CommandMenuItemRendererProps) => {
  const { displayType } = useContext(CommandMenuContext);

  if (displayType === 'button') {
    return (
      <CommandMenuItemButtonRenderer
        item={item}
        isPrimaryAction={isPrimaryAction}
        shouldHideLabel={shouldHideLabel}
      />
    );
  }

  if (displayType === 'listItem' || displayType === 'dropdownItem') {
    return (
      <CommandMenuItemSelectableRenderer
        item={item}
        displayType={displayType}
      />
    );
  }

  return assertUnreachable(displayType, 'Unsupported display type');
};
