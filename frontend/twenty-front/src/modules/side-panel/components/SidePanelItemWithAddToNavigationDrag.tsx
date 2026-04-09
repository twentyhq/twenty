import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, lazy, Suspense, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { type IconComponent } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { AddToNavigationDragHandle } from '@/navigation-menu-item/display/dnd/components/AddToNavigationDragHandle';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/common/states/addToNavPayloadRegistryState';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/common/types/add-to-navigation-drag-payload';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const CommandMenuItemWithAddToNavigationDragDndKit = lazy(() =>
  import(
    '@/command-menu/components/CommandMenuItemWithAddToNavigationDragDndKit'
  ).then((m) => ({
    default: m.CommandMenuItemWithAddToNavigationDragDndKit,
  })),
);

type SidePanelItemWithAddToNavigationDragProps = {
  icon?: IconComponent;
  customIconContent?: ReactNode;
  label: string;
  description?: string;
  id: string;
  onClick: () => void;
  payload: AddToNavigationDragPayload;
  dragIndex?: number;
  disabled?: boolean;
  disableDrag?: boolean;
};

const StyledDraggableMenuItem = styled.div<{
  $disabled?: boolean;
  $disableDrag?: boolean;
}>`
  cursor: ${({ $disabled, $disableDrag }) =>
    $disabled || $disableDrag ? 'default' : 'grab'};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  width: 100%;

  &:active {
    cursor: ${({ $disabled, $disableDrag }) =>
      $disabled || $disableDrag ? 'default' : 'grabbing'};
  }
`;

export const SidePanelItemWithAddToNavigationDrag = ({
  icon,
  customIconContent,
  label,
  description,
  id,
  onClick,
  payload,
  dragIndex,
  disabled = false,
  disableDrag = false,
}: SidePanelItemWithAddToNavigationDragProps) => {
  const { t } = useLingui();
  const setAddToNavPayloadRegistry = useSetAtomState(
    addToNavPayloadRegistryState,
  );
  const [isHovered, setIsHovered] = useState(false);

  const showDragAffordance = !disabled && !disableDrag && isHovered;
  const contextualDescription = showDragAffordance
    ? t`Drag to add to navbar`
    : description;

  const DragHandleIcon = () => (
    <AddToNavigationDragHandle
      icon={icon}
      customIconContent={customIconContent}
      payload={payload}
      isHovered={showDragAffordance}
      disabled={disabled}
      disableDrag={disableDrag}
    />
  );

  const registerPayload = () => {
    if (!disabled && !disableDrag && isDefined(dragIndex)) {
      setAddToNavPayloadRegistry((prev) => new Map(prev).set(id, payload));
    }
  };

  const menuItemContent = (
    <StyledDraggableMenuItem
      $disabled={disabled}
      $disableDrag={disableDrag}
      onMouseEnter={() => {
        if (!disabled && !disableDrag) {
          setIsHovered(true);
          registerPayload();
        }
      }}
      onMouseLeave={() => {
        if (!disabled && !disableDrag) setIsHovered(false);
      }}
      onMouseDown={registerPayload}
    >
      <CommandMenuItem
        Icon={DragHandleIcon}
        label={label}
        description={contextualDescription}
        id={id}
        onClick={onClick}
        disabled={disabled}
      />
    </StyledDraggableMenuItem>
  );

  if (!isDefined(dragIndex) || disableDrag) {
    return menuItemContent;
  }

  return (
    <Suspense fallback={menuItemContent}>
      <CommandMenuItemWithAddToNavigationDragDndKit
        id={id}
        dragIndex={dragIndex}
        menuItemContent={menuItemContent}
      />
    </Suspense>
  );
};
