import { ListItem } from 'twenty-ui/primitives/navigation';
import { type CommandMenuItemDefinition } from '@/command-menu-item/types/CommandMenuItemDefinition';
import { AppMenuItem } from '@/applications/components/AppMenuItem';
import { useIsThirdPartyApplication } from '@/applications/hooks/useIsThirdPartyApplication';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CommandListItemLoader } from '@/command-menu-item/display/components/CommandListItemLoader';
import { useCommandMenuItemDisplay } from '@/command-menu-item/display/hooks/useCommandMenuItemDisplay';
import { CommandMenuButton } from '@/command-menu/components/CommandMenuButton';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { SelectableListComponentInstanceContext } from '@/ui/layout/selectable-list/states/contexts/SelectableListComponentInstanceContext';
import { isSelectedItemIdComponentFamilyState } from '@/ui/layout/selectable-list/states/isSelectedItemIdComponentFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { assertUnreachable } from 'twenty-shared/utils';
import { CommandMenuItemVariant } from '~/generated-metadata/graphql';

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
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const {
    Icon,
    label,
    shortLabel,
    handleClick,
    disabled,
    progress,
    isLoading,
  } = useCommandMenuItemDisplay(item);

  const isPrimary =
    isPrimaryAction || item.variant === CommandMenuItemVariant.PRIMARY;

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
          isPrimaryAction={isPrimary}
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
      progress={progress}
      loading={isLoading}
      isPrimaryAction={isPrimary}
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
  const { Icon, label, handleClick, disabled, progress, isLoading } =
    useCommandMenuItemDisplay(item);

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

  const loaderComponent = isLoading ? (
    <CommandListItemLoader progress={progress} />
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
      <ListItem
        focused={isSelectedItemId}
        startIcon={<Icon />}
        onClick={onItemClick}
        endIcon={loaderComponent}
        disabled={disabled}
      >
        {label}
      </ListItem>
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
