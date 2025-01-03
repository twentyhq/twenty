import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import {
  AppTooltip,
  IconEye,
  IconEyeOff,
  IconInfoCircle,
  MenuItemDraggable,
  useIcons,
} from 'twenty-ui';

import { FieldMetadata } from '@/object-record/record-field/types/FieldMetadata';
import { ColumnDefinition } from '@/object-record/record-table/types/ColumnDefinition';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { groupArrayItemsBy } from '~/utils/array/groupArrayItemsBy';
import { isDefined } from '~/utils/isDefined';

type ViewFieldsVisibilityDropdownSectionProps = {
  fields: Omit<ColumnDefinition<FieldMetadata>, 'size'>[];
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
  onVisibilityChange: (
    field: Omit<ColumnDefinition<FieldMetadata>, 'size' | 'position'>,
  ) => void;
  title: string;
  showSubheader: boolean;
  showDragGrip: boolean;
};

export const ViewFieldsVisibilityDropdownSection = ({
  fields,
  isDraggable,
  onDragEnd,
  onVisibilityChange,
  title,
  showSubheader = true,
  showDragGrip,
}: ViewFieldsVisibilityDropdownSectionProps) => {
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
  };

  const [openToolTipIndex, setOpenToolTipIndex] = useState<number>();

  const handleInfoButtonClick = (index: number) => {
    setOpenToolTipIndex(index === openToolTipIndex ? undefined : index);
  };

  const { getIcon } = useIcons();

  const getIconButtons = (
    index: number,
    field: Omit<ColumnDefinition<FieldMetadata>, 'size' | 'position'>,
  ) => {
    const iconButtons = [
      field.infoTooltipContent
        ? {
            Icon: IconInfoCircle,
            onClick: () => handleInfoButtonClick(index),
            isActive: openToolTipIndex === index,
          }
        : null,
      field.isLabelIdentifier
        ? null
        : {
            Icon: field.isVisible ? IconEyeOff : IconEye,
            onClick: () => onVisibilityChange(field),
          },
    ].filter(isDefined);

    return iconButtons.length ? iconButtons : undefined;
  };

  const { nonDraggableItems = [], draggableItems = [] } = isDraggable
    ? groupArrayItemsBy(fields, ({ isLabelIdentifier }) =>
        isLabelIdentifier ? 'nonDraggableItems' : 'draggableItems',
      )
    : { nonDraggableItems: fields, draggableItems: [] };

  return (
    <>
      {showSubheader && (
        <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      )}
      <DropdownMenuItemsContainer>
        {nonDraggableItems.map((field, fieldIndex) => (
          <MenuItemDraggable
            key={field.fieldMetadataId}
            LeftIcon={getIcon(field.iconName)}
            iconButtons={getIconButtons(fieldIndex, field)}
            isTooltipOpen={openToolTipIndex === fieldIndex}
            text={field.label}
            className={`${title}-fixed-item-tooltip-anchor-${fieldIndex}`}
            accent={showDragGrip ? 'placeholder' : 'default'}
            showGrip={showDragGrip}
            isDragDisabled
          />
        ))}
        {!!draggableItems.length && (
          <DraggableList
            onDragEnd={handleOnDrag}
            draggableItems={
              <>
                {draggableItems.map((field, index) => {
                  const fieldIndex = index + nonDraggableItems.length;

                  return (
                    <DraggableItem
                      key={field.fieldMetadataId}
                      draggableId={field.fieldMetadataId}
                      index={fieldIndex + 1}
                      itemComponent={
                        <MenuItemDraggable
                          key={field.fieldMetadataId}
                          LeftIcon={getIcon(field.iconName)}
                          iconButtons={getIconButtons(fieldIndex, field)}
                          isTooltipOpen={openToolTipIndex === fieldIndex}
                          text={field.label}
                          className={`${title}-draggable-item-tooltip-anchor-${fieldIndex}`}
                          showGrip
                        />
                      }
                    />
                  );
                })}
              </>
            }
          />
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
            hidden={false}
          />,
          document.body,
        )}
    </>
  );
};
