import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';

import { DraggableItem } from '@/ui/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/dropdown/components/StyledDropdownMenuSubheader';
import { IconMinus, IconPlus } from '@/ui/icon';
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
  title: string;
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
};

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  title,
  isDraggable,
  onDragEnd,
}: ViewFieldsVisibilityDropdownSectionProps) => {
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
  };

  const [openToolTipIndex, setOpenToolTipIndex] = useState<number>();

  const handleInfoButtonClick = (index: number) => {
    if (index === openToolTipIndex) setOpenToolTipIndex(undefined);
    else setOpenToolTipIndex(index);
  };

  const getIconButtons = (index: number, field: ViewFieldForVisibility) => {
    if (field.infoTooltipContent) {
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
    if (!field.infoTooltipContent) {
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
      <DropdownMenuItemsContainer>
        {isDraggable ? (
          <DraggableList
            onDragEnd={handleOnDrag}
            draggableItems={
              <>
                {fields
                  .filter(({ index, size }) => index !== 0 || !size)
                  .map((field, index) => (
                    <DraggableItem
                      key={field.key}
                      draggableId={field.key}
                      index={index + 1}
                      itemComponent={
                        <MenuItemDraggable
                          key={field.key}
                          LeftIcon={field.Icon}
                          iconButtons={getIconButtons(index + 1, field)}
                          isTooltipOpen={openToolTipIndex === index + 1}
                          text={field.name}
                          className={`${title}-draggable-item-tooltip-anchor-${
                            index + 1
                          }`}
                        />
                      }
                    />
                  ))}
              </>
            }
          />
        ) : (
          fields.map((field, index) => (
            <MenuItem
              key={field.key}
              LeftIcon={field.Icon}
              iconButtons={getIconButtons(index, field)}
              isTooltipOpen={openToolTipIndex === index}
              text={field.name}
              className={`${title}-fixed-item-tooltip-anchor-${index}`}
            />
          ))
        )}
      </DropdownMenuItemsContainer>
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
