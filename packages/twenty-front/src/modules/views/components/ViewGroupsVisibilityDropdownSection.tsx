import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { useRef } from 'react';
import { IconEye, IconEyeOff, Tag } from 'twenty-ui';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { MenuItemDraggable } from '@/ui/navigation/menu-item/components/MenuItemDraggable';
import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { isDefined } from '~/utils/isDefined';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';

type ViewGroupsVisibilityDropdownSectionProps = {
  viewGroups: RecordGroupDefinition[];
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
  onVisibilityChange: (viewGroup: RecordGroupDefinition) => void;
  title: string;
  showSubheader: boolean;
  showDragGrip: boolean;
};

export const ViewGroupsVisibilityDropdownSection = ({
  viewGroups,
  isDraggable,
  onDragEnd,
  onVisibilityChange,
  title,
  showSubheader = true,
  showDragGrip,
}: ViewGroupsVisibilityDropdownSectionProps) => {
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
  };

  const getIconButtons = (index: number, viewGroup: RecordGroupDefinition) => {
    const iconButtons = [
      {
        Icon: viewGroup.isVisible ? IconEyeOff : IconEye,
        onClick: () => onVisibilityChange(viewGroup),
      },
    ].filter(isDefined);

    return iconButtons.length ? iconButtons : undefined;
  };

  const ref = useRef<HTMLDivElement>(null);

  const renderItem = (
    viewGroup: RecordGroupDefinition,
    viewGroupIndex: number,
  ) => {
    const isNoValueType = viewGroup.type === RecordGroupDefinitionType.NoValue;

    return (
      <MenuItemDraggable
        key={viewGroup.id}
        text={
          <Tag
            variant={!isNoValueType ? 'solid' : 'outline'}
            color={!isNoValueType ? viewGroup.color : 'transparent'}
            text={viewGroup.title}
            weight={!isNoValueType ? 'regular' : 'medium'}
          />
        }
        iconButtons={getIconButtons(viewGroupIndex, viewGroup)}
        accent={showDragGrip ? 'placeholder' : 'default'}
        showGrip={showDragGrip}
        isDragDisabled={!isDraggable}
      />
    );
  };

  return (
    <div ref={ref}>
      {showSubheader && (
        <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      )}
      <DropdownMenuItemsContainer>
        {!!viewGroups.length && (
          <>
            {!isDraggable ? (
              viewGroups.map((viewGroup, viewGroupIndex) =>
                renderItem(viewGroup, viewGroupIndex),
              )
            ) : (
              <DraggableList
                onDragEnd={handleOnDrag}
                draggableItems={
                  <>
                    {viewGroups.map((viewGroup, viewGroupIndex) => (
                      <DraggableItem
                        key={viewGroup.id}
                        draggableId={viewGroup.id}
                        index={viewGroupIndex + 1}
                        itemComponent={renderItem(viewGroup, viewGroupIndex)}
                      />
                    ))}
                  </>
                }
              />
            )}
          </>
        )}
      </DropdownMenuItemsContainer>
    </div>
  );
};
