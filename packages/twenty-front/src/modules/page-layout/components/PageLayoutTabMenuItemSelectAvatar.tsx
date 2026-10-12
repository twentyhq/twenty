import { TabAvatar } from '@/ui/layout/tab-list/components/TabAvatar';
import { type SingleTabProps } from '@/ui/layout/tab-list/types/SingleTabProps';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { DragDropItemSortableHandleRefContext } from '@/ui/utilities/drag-and-drop/context/DragDropItemSortableHandleRefContext';
import { LightIconButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconGripVertical, IconPencil } from 'twenty-ui/icon';

type PageLayoutTabMenuItemSelectAvatarProps = {
  tab: SingleTabProps;
  selected: boolean;
  onSelect?: () => void;
  closeOnSelect?: boolean;
  disabled?: boolean;
  showEditButton?: boolean;
  onEditClick?: (tabId: string) => void;
  testId?: string;
};

export const PageLayoutTabMenuItemSelectAvatar = ({
  tab,
  selected,
  onSelect,
  closeOnSelect,
  disabled,
  showEditButton = false,
  onEditClick,
  testId,
}: PageLayoutTabMenuItemSelectAvatarProps) => {
  const handleRef = useContext(DragDropItemSortableHandleRefContext);

  return (
    <Dropdown.OptionItem
      render={<div />}
      role="button"
      onSelect={onSelect}
      closeOnSelect={closeOnSelect}
      disabled={disabled}
      data-testid={testId}
      startIcon={<TabAvatar tab={tab} />}
      selected={selected}
      actionsVisibility="hover"
      actions={
        !disabled || showEditButton ? (
          <>
            {!disabled && (
              <LightIconButton
                ref={handleRef}
                data-dnd-sortable-handle
                size="sm"
                emphasis="subtle"
                aria-label={t`Reorder ${tab.title} tab`}
                onClick={(event) => event.stopPropagation()}
              >
                <IconGripVertical />
              </LightIconButton>
            )}
            {showEditButton && (
              <LightIconButton
                tabIndex={-1}
                onPointerDownCapture={(event) => event.stopPropagation()}
                size="sm"
                emphasis="subtle"
                aria-label={t`Edit tab icon`}
                onClick={(event) => {
                  event.stopPropagation();
                  onEditClick?.(tab.id);
                }}
              >
                <IconPencil />
              </LightIconButton>
            )}
          </>
        ) : undefined
      }
    >
      {tab.title}
    </Dropdown.OptionItem>
  );
};
