import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandListItemLoader } from '@/command-menu-item/display/components/CommandListItemLoader';
import { interpolateCommandMenuItemFields } from '@/command-menu-item/display/utils/interpolateCommandMenuItemFields';
import { useCommandMenuItemClick } from '@/command-menu-item/hooks/useCommandMenuItemClick';
import { getCommandMenuItemLabel } from '@/command-menu-item/utils/getCommandMenuItemLabel';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { useContext } from 'react';
import { assertUnreachable, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { Loader } from 'twenty-ui/feedback';
import { MenuItem } from 'twenty-ui/navigation';
import { type CommandMenuItemFieldsFragment } from '~/generated-metadata/graphql';

type CommandMenuItemRendererProps = {
  item: CommandMenuItemFieldsFragment;
};

type CommandMenuItemButtonRendererProps = CommandMenuItemRendererProps;

const CommandMenuItemButtonRenderer = ({
  item,
}: CommandMenuItemButtonRendererProps) => {
  const { commandMenuContextApi } = useContext(CommandMenuContext);
  const { getIcon } = useIcons();

  const { iconKey, label, shortLabel } = interpolateCommandMenuItemFields(
    item,
    commandMenuContextApi,
  );

  const Icon = getIcon(iconKey, COMMAND_MENU_DEFAULT_ICON);

  const { handleClick, disabled } = useCommandMenuItemClick({
    item,
    Icon,
    label,
  });

  return (
    <CommandMenuButton
      command={{
        key: item.id,
        label,
        shortLabel,
        Icon,
      }}
      onClick={disabled ? undefined : handleClick}
      disabled={disabled}
    />
  );
};

const CommandMenuItemSelectableRenderer = ({
  item,
  displayType,
}: CommandMenuItemRendererProps & {
  displayType: 'listItem' | 'dropdownItem';
}) => {
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

  const onItemClick = () => {
    if (disabled) {
      return;
    }
    handleClick();
  };

  if (displayType === 'listItem') {
    const loaderComponent =
      disabled && showDisabledLoader ? (
        isDefined(progress) ? (
          <CommandListItemLoader progress={progress} />
        ) : (
          <Loader />
        )
      ) : undefined;

    return (
      <SelectableListItem itemId={item.id} onEnter={onItemClick}>
        <CommandMenuItem
          id={item.id}
          Icon={Icon}
          label={getCommandMenuItemLabel(label)}
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
        text={getCommandMenuItemLabel(label)}
        disabled={disabled}
      />
    </SelectableListItem>
  );
};

// oxlint-disable-next-line twenty/effect-components
export const CommandMenuItemRenderer = ({
  item,
}: CommandMenuItemRendererProps) => {
  const { displayType } = useContext(CommandMenuContext);

  if (displayType === 'button') {
    return <CommandMenuItemButtonRenderer item={item} />;
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
