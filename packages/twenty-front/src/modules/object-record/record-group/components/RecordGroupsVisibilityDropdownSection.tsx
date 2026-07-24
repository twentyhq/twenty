import { type DraggableListDropResult } from '@/ui/layout/draggable-list/types/DraggableListDropResult';
import { useRef } from 'react';

import { RecordGroupMenuItemDraggable } from '@/object-record/record-group/components/RecordGroupMenuItemDraggable';
import { type RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';

type RecordGroupsVisibilityDropdownSectionProps = {
  recordGroupIds: string[];
  isDraggable: boolean;
  onDragEnd?: (result: DraggableListDropResult) => void;
  onVisibilityChange: (recordGroup: RecordGroupDefinition) => void;
  title: string;
  showSubheader?: boolean;
  showDragGrip: boolean;
  isVisibleLimitReached?: boolean;
};

export const RecordGroupsVisibilityDropdownSection = ({
  recordGroupIds,
  isDraggable,
  onDragEnd,
  onVisibilityChange,
  title,
  showSubheader = true,
  showDragGrip,
  isVisibleLimitReached = false,
}: RecordGroupsVisibilityDropdownSectionProps) => {
  const handleOnDrag = (result: DraggableListDropResult) => {
    onDragEnd?.(result);
  };

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      {showSubheader && (
        <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      )}
      <DropdownMenuItemsContainer hasMaxHeight>
        {recordGroupIds.length > 0 && (
          <>
            {!isDraggable ? (
              recordGroupIds.map((recordGroupId) => (
                <RecordGroupMenuItemDraggable
                  key={recordGroupId}
                  recordGroupId={recordGroupId}
                  onVisibilityChange={onVisibilityChange}
                  showDragGrip={showDragGrip}
                  isDraggable={isDraggable}
                  isVisibleLimitReached={isVisibleLimitReached}
                />
              ))
            ) : (
              <DraggableList
                onDragEnd={handleOnDrag}
                draggableItems={
                  <>
                    {recordGroupIds.map((recordGroupId, index) => (
                      <DraggableItem
                        key={recordGroupId}
                        draggableId={recordGroupId}
                        index={index + 1}
                        itemComponent={
                          <RecordGroupMenuItemDraggable
                            recordGroupId={recordGroupId}
                            onVisibilityChange={onVisibilityChange}
                            showDragGrip={showDragGrip}
                            isDraggable={isDraggable}
                            isVisibleLimitReached={isVisibleLimitReached}
                          />
                        }
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
