import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';

import { DraggableItem } from '@/ui/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/draggable-list/components/DraggableList';
import { StyledDropdownMenuItemsContainer } from '@/ui/dropdown/components/StyledDropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import { IconMinus, IconPencil, IconPlus } from '@/ui/icon';
import { MenuItem } from '@/ui/menu-item/components/MenuItem';
import { MenuItemDraggable } from '@/ui/menu-item/components/MenuItemDraggable';
import { MenuItemTag } from '@/ui/menu-item/components/MenuItemTag';
import { IconInfoCircle } from '@/ui/input/constants/icons';
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
  fieldAsTag?: boolean;
  onDragEnd?: (field: ViewFieldForVisibility[]) => void;
};

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  editFieldComponent,
  title,
  isDraggable,
  fieldAsTag = false,
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
    const visibilityIcons = {
      Icon: field.isVisible ? IconMinus : IconPlus,
      onClick: () => onVisibilityChange(field),
    };
    // if (index !== 0) {
    //   return editFieldComponent
    //     ? [
    //         visibilityIcons,
    //         {
    //           Icon: IconPencil,
    //           onClick: () => setSelectedField(field),
    //         },
    //       ]
    //     : [visibilityIcons];
    const isFirstColumn = isDraggable && index === 0;
    if (isFirstColumn && field.infoTooltipContent) {
      return [
        {
          Icon: IconInfoCircle,
          onClick: () => handleInfoButtonClick(index),
          isActive: openToolTipIndex === index,
        },
      ];
    }
    if (!isFirstColumn && field.infoTooltipContent) {
      return [
        {
          Icon: IconInfoCircle,
          onClick: () => handleInfoButtonClick(index),
          isActive: openToolTipIndex === index,
        },
        {
          Icon: field.isVisible ? IconMinus : IconPlus,
          onClick: () => onVisibilityChange(field),
        },
      ];
    }
    if (!isFirstColumn && !field.infoTooltipContent) {
      return [
        {
          Icon: field.isVisible ? IconMinus : IconPlus,
          onClick: () => onVisibilityChange(field),
        },
      ];
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
                        fieldAsTag ? (
                          <MenuItemTag
                            key={field.key}
                            color={field.colorCode ?? 'gray'}
                            iconButtons={getIconButtons(index, field)}
                            text={field.name}
                            isTooltipOpen={openToolTipIndex === index}
                            isDragDisabled={index=== 0}
                            className={`${title}-draggable-item-tooltip-anchor-${index}`}
                          />
                        ) : (
                          <MenuItemDraggable
                            key={field.key}
                            LeftIcon={field.Icon}
                            isTooltipOpen={openToolTipIndex === index}
                            iconButtons={getIconButtons(index, field)}
                            text={field.name}
                            isDragDisabled={index === 0}
                            className={`${title}-draggable-item-tooltip-anchor-${index}`}
                          />
                        )
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
          fields.map((field, index) =>
            fieldAsTag ? (
              <MenuItemTag
                key={field.key}
                color={field.colorCode ?? 'gray'}
                iconButtons={getIconButtons(index, field)}
                isTooltipOpen={openToolTipIndex === index}
                text={field.name}
                className={`${title}-fixed-item-tooltip-anchor-${index}`}
              />
            ) : (
              <MenuItem
                key={field.key}
                LeftIcon={field.Icon}
                iconButtons={getIconButtons(index, field)}
                isTooltipOpen={openToolTipIndex === index}
                text={field.name}
                className={`${title}-fixed-item-tooltip-anchor-${index}`}
              />
            ))
          }
      </StyledDropdownMenuItemsContainer>
      
    </div>
  );
};
