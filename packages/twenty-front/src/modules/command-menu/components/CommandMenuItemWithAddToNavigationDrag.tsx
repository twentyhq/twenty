import styled from '@emotion/styled';
import { Draggable } from '@hello-pangea/dnd';
import { useLingui } from '@lingui/react/macro';
import { type ReactNode, lazy, Suspense, useContext, useState } from 'react';
import { type IconComponent } from 'twenty-ui/display';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { AddToNavigationDragHandle } from '@/navigation-menu-item/components/AddToNavigationDragHandle';
import { addToNavPayloadRegistryState } from '@/navigation-menu-item/states/addToNavPayloadRegistryState';
import type { AddToNavigationDragPayload } from '@/navigation-menu-item/types/add-to-navigation-drag-payload';
import { WorkspaceDndKitContext } from '@/navigation/contexts/WorkspaceDndKitContext';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';

const CommandMenuItemWithAddToNavigationDragDndKit = lazy(() =>
  import(
    '@/command-menu/components/CommandMenuItemWithAddToNavigationDragDndKit'
  ).then((m) => ({
    default: m.CommandMenuItemWithAddToNavigationDragDndKit,
  })),
);

type CommandMenuItemWithAddToNavigationDragProps = {
  icon?: IconComponent;
  customIconContent?: ReactNode;
  label: string;
  description?: string;
  id: string;
  onClick: () => void;
  payload: AddToNavigationDragPayload;
  dragIndex?: number;
};

const StyledDraggableMenuItem = styled.div`
  cursor: grab;
  width: 100%;

  &:active {
    cursor: grabbing;
  }
`;

export const CommandMenuItemWithAddToNavigationDrag = ({
  icon,
  customIconContent,
  label,
  description,
  id,
  onClick,
  payload,
  dragIndex,
}: CommandMenuItemWithAddToNavigationDragProps) => {
  const { t } = useLingui();
  const setAddToNavPayloadRegistry = useSetAtomState(
    addToNavPayloadRegistryState,
  );
  const [isHovered, setIsHovered] = useState(false);

  const contextualDescription = isHovered
    ? t`Drag to add to navbar`
    : description;

  const DragHandleIcon = () => (
    <AddToNavigationDragHandle
      icon={icon}
      customIconContent={customIconContent}
      payload={payload}
      isHovered={isHovered}
    />
  );

  const registerPayload = () => {
    if (dragIndex !== undefined) {
      setAddToNavPayloadRegistry((prev) => new Map(prev).set(id, payload));
    }
  };

  const menuItemContent = (
    <StyledDraggableMenuItem
      onMouseEnter={() => {
        setIsHovered(true);
        registerPayload();
      }}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={registerPayload}
    >
      <CommandMenuItem
        Icon={DragHandleIcon}
        label={label}
        description={contextualDescription}
        id={id}
        onClick={onClick}
      />
    </StyledDraggableMenuItem>
  );

  const isDndKit = useContext(WorkspaceDndKitContext);

  if (dragIndex !== undefined && isDndKit) {
    return (
      <Suspense fallback={menuItemContent}>
        <CommandMenuItemWithAddToNavigationDragDndKit
          id={id}
          dragIndex={dragIndex}
          menuItemContent={menuItemContent}
        />
      </Suspense>
    );
  }

  if (dragIndex !== undefined) {
    return (
      <Draggable draggableId={id} index={dragIndex} isDragDisabled={false}>
        {(provided) => (
          <div
            ref={provided.innerRef}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.draggableProps}
            // eslint-disable-next-line react/jsx-props-no-spreading
            {...provided.dragHandleProps}
          >
            {menuItemContent}
          </div>
        )}
      </Draggable>
    );
  }

  return menuItemContent;
};
