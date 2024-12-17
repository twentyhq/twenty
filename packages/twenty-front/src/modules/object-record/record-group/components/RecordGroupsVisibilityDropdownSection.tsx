import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { useRef } from 'react';

import { RecordGroupMenuItemDraggable } from '@/object-record/record-group/components/RecordGroupMenuItemDraggable';
import { RecordGroupDefinition } from '@/object-record/record-group/types/RecordGroupDefinition';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';

type RecordGroupsVisibilityDropdownSectionProps = {
  recordGroupIds: string[];
  isDraggable: boolean;
  onDragEnd?: OnDragEndResponder;
  onVisibilityChange: (recordGroup: RecordGroupDefinition) => void;
  title: string;
  showSubheader?: boolean;
  showDragGrip: boolean;
};

export const RecordGroupsVisibilityDropdownSection = ({
  recordGroupIds,
  isDraggable,
  onDragEnd,
  onVisibilityChange,
  title,
  showSubheader = true,
  showDragGrip,
}: RecordGroupsVisibilityDropdownSectionProps) => {
  const handleOnDrag = (result: DropResult, provided: ResponderProvided) => {
    onDragEnd?.(result, provided);
  };

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      {showSubheader && (
        <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      )}
      <DropdownMenuItemsContainer>
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
