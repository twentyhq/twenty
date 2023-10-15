import { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled from '@emotion/styled';
import { DropResult } from '@hello-pangea/dnd';

import { IconMinus, IconPencil, IconPlus } from '@/ui/display/icon';
import { AppTooltip } from '@/ui/display/tooltip/AppTooltip';
import { IconInfoCircle } from '@/ui/input/constants/icons';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { MenuItemDraggable } from '@/ui/navigation/menu-item/components/MenuItemDraggable';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';
import { isDefined } from '~/utils/isDefined';

import { ViewFieldForVisibility } from '../types/ViewFieldForVisibility';

const StyledDraggableWrapper = styled.div`
  width: 100%;
`;

type ViewFieldsVisibilityDropdownSectionProps = {
  fields: ViewFieldForVisibility[];
  onVisibilityChange: (field: ViewFieldForVisibility) => void;
  editField?: (field: ViewFieldForVisibility) => void;
  title: string;
  isDraggable: boolean;
  onDragEnd?: (field: ViewFieldForVisibility[]) => void;
};

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  onVisibilityChange,
  editField,
  title,
  isDraggable,
  onDragEnd,
}: ViewFieldsVisibilityDropdownSectionProps) => {
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

    const editIcon = editField
      ? [
          {
            Icon: IconPencil,
            onClick: () => editField(field),
          },
        ]
      : [];
    if (field.infoTooltipContent) {
      return [infoTooltipIcon, ...editIcon, visibilityIcon];
    }
    if (!field.infoTooltipContent) {
      return [...editIcon, visibilityIcon];
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
    <StyledDraggableWrapper ref={ref}>
      <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      <DropdownMenuItemsContainer>
        {isDraggable ? (
          <DraggableList
            onDragEnd={handleOnDrag}
            draggableItems={
              <>
                {fields
                  .filter(({ index }) => index !== 0)
                  .map((field, index) => (
                    <DraggableItem
                      key={field.key}
                      draggableId={field.key}
                      index={index + 1}
                      itemComponent={
                        <MenuItemDraggable
                          key={field.key}
                          LeftIcon={field.Icon}
                          isTooltipOpen={openToolTipIndex === index + 1}
                          iconButtons={getIconButtons(index + 1, field)}
                          text={field.name}
                          textColor={field.colorCode}
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
              textColor={field.colorCode}
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
    </StyledDraggableWrapper>
  );
};
