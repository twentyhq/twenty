import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { DropResult } from '@hello-pangea/dnd';

import { DraggableItem } from '@/ui/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/draggable-list/components/DraggableList';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import { IconMinus, IconPencil, IconPlus } from '@/ui/icon';
import { IconInfoCircle } from '@/ui/input/constants/icons';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemDraggable } from '@/ui/menu-item/components/MenuItemDraggable';
import { AppTooltip } from '@/ui/tooltip/AppTooltip';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

import { ViewFieldForVisibility } from '../types/ViewFieldForVisibility';

type ViewFieldsVisibilityDropdownSectionProps = {
  fields: ViewFieldForVisibility[];
  onVisibilityChange: (field: ViewFieldForVisibility) => void;
  editFieldComponent?: (field: ViewFieldForVisibility) => JSX.Element;
  title: string;
  isDraggable: boolean;
  onDragEnd?: (field: ViewFieldForVisibility[]) => void;
};

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  editFieldComponent,
  title,
  isDraggable,
  onDragEnd,
}: ViewFieldsVisibilityDropdownSectionProps) => {
  const [selectedField, setSelectedField] = useState<ViewFieldForVisibility>();
  const handleOnDrag = (result: DropResult) => {
    if (!result.destination || result.destination.index === 0) {
      return;
    }
    const reorderFields = Array.from(fields);
    const [removed] = reorderFields.splice(result.source.index, 1);
    reorderFields.splice(result.destination.index, 0, removed);

    onDragEnd?.(reorderFields);
  };

  const [openToolTipIndex, setOpenToolTipIndex] = useState<number>();

  const handleInfoButtonClick = (index: number) => {
    if (index === openToolTipIndex) setOpenToolTipIndex(undefined);
    else setOpenToolTipIndex(index);
  };

  const getIconButtons = (index: number, field: ViewFieldForVisibility) => {
    const visibilityIcon = {
      Icon: field.isVisible ? IconMinus : IconPlus,
      onClick: () => onVisibilityChange(field),
    };

    const infoTooltipIcon = {
      Icon: IconInfoCircle,
      onClick: () => handleInfoButtonClick(index),
      isActive: openToolTipIndex === index,
    };

    const isFirstColumn = isDraggable && index === 0;

    if (isFirstColumn && field.infoTooltipContent) {
      return [infoTooltipIcon];
    }
    if (!isFirstColumn && field.infoTooltipContent) {
      return [infoTooltipIcon, visibilityIcon];
    }
    if (!isFirstColumn && !field.infoTooltipContent) {
      return editFieldComponent
        ? [
            visibilityIcon,
            {
              Icon: IconPencil,
              onClick: () => setSelectedField(field),
            },
          ]
        : [visibilityIcon];
    }
  };

  const ref = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [ref],
    callback: () => {
      setOpenToolTipIndex(undefined);
    },
  });

  return (
    <div ref={ref}>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <StyledDropdownMenuItemsContainer>
        {isDraggable && (
          <DraggableList
            onDragEnd={handleOnDrag}
            draggableItems={
              <>
                {fields.map((field, index) => (
                  <>
                    <DraggableItem
                      key={field.key}
                      draggableId={field.key}
                      index={index}
                      isDragDisabled={index === 0}
                      itemComponent={
                        <MenuItemDraggable
                          key={field.key}
                          LeftIcon={field.Icon}
                          isTooltipOpen={openToolTipIndex === index}
                          iconButtons={getIconButtons(index, field)}
                          text={field.name}
                          textColor={field.colorCode}
                          isDragDisabled={index === 0}
                          className={`${title}-draggable-item-tooltip-anchor-${index}`}
                        />
                      }
                    />
                    {selectedField === field &&
                      editFieldComponent &&
                      editFieldComponent(field)}
                  </>
                ))}
              </>
            }
          />
        )}
        {!isDraggable &&
          fields.map((field, index) => (
            <MenuItem
              key={field.key}
              LeftIcon={field.Icon}
              iconButtons={getIconButtons(index, field)}
              isTooltipOpen={openToolTipIndex === index}
              text={field.name}
              textColor={field.colorCode}
              className={`${title}-fixed-item-tooltip-anchor-${index}`}
            />
          ))}
      </StyledDropdownMenuItemsContainer>
      {isDefined(openToolTipIndex) &&
        createPortal(
          <AppTooltip
            anchorSelect={`.${title}-${
              isDraggable ? 'draggable' : 'fixed'
            }-item-tooltip-anchor-${openToolTipIndex}`}
            place="left"
            content={fields[openToolTipIndex].infoTooltipContent}
            isOpen={true}
          />,
          document.body,
        )}
    </div>
  );
};
