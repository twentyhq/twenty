import {
  DropResult,
  OnDragEndResponder,
  ResponderProvided,
} from '@hello-pangea/dnd';
import { useRef } from 'react';
import { IconEye, IconEyeOff, Tag } from 'twenty-ui';

import {
  RecordGroupDefinition,
  RecordGroupDefinitionType,
} from '@/object-record/record-group/types/RecordGroupDefinition';
import { DraggableItem } from '@/ui/layout/draggable-list/components/DraggableItem';
import { DraggableList } from '@/ui/layout/draggable-list/components/DraggableList';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { MenuItemDraggable } from '@/ui/navigation/menu-item/components/MenuItemDraggable';
import { isDefined } from '~/utils/isDefined';

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

  const noValueViewGroups =
    viewGroups.filter(
      (viewGroup) => viewGroup.type === RecordGroupDefinitionType.NoValue,
    ) ?? [];

  const viewGroupsWithoutNoValueGroups = viewGroups.filter(
    (viewGroup) => viewGroup.type !== RecordGroupDefinitionType.NoValue,
  );

  const ref = useRef<HTMLDivElement>(null);

  return (
    <div ref={ref}>
      {showSubheader && (
        <StyledDropdownMenuSubheader>{title}</StyledDropdownMenuSubheader>
      )}
      <DropdownMenuItemsContainer>
        {!!viewGroups.length && (
          <>
            {!isDraggable ? (
              viewGroupsWithoutNoValueGroups.map(
                (viewGroup, viewGroupIndex) => (
                  <MenuItemDraggable
                    key={viewGroup.id}
                    text={
                      <Tag
                        variant={
                          viewGroup.type !== RecordGroupDefinitionType.NoValue
                            ? 'solid'
                            : 'outline'
                        }
                        color={
                          viewGroup.type !== RecordGroupDefinitionType.NoValue
                            ? viewGroup.color
                            : 'transparent'
                        }
                        text={viewGroup.title}
                        weight={
                          viewGroup.type !== RecordGroupDefinitionType.NoValue
                            ? 'regular'
                            : 'medium'
                        }
                      />
                    }
                    iconButtons={getIconButtons(viewGroupIndex, viewGroup)}
                    accent={showDragGrip ? 'placeholder' : 'default'}
                    showGrip={showDragGrip}
                    isDragDisabled={!isDraggable}
                  />
                ),
              )
            ) : (
              <DraggableList
                onDragEnd={handleOnDrag}
                draggableItems={
                  <>
                    {viewGroupsWithoutNoValueGroups.map(
                      (viewGroup, viewGroupIndex) => (
                        <DraggableItem
                          key={viewGroup.id}
                          draggableId={viewGroup.id}
                          index={viewGroupIndex + 1}
                          itemComponent={
                            <MenuItemDraggable
                              key={viewGroup.id}
                              text={
                                <Tag
                                  variant={
                                    viewGroup.type !==
                                    RecordGroupDefinitionType.NoValue
                                      ? 'solid'
                                      : 'outline'
                                  }
                                  color={
                                    viewGroup.type !==
                                    RecordGroupDefinitionType.NoValue
                                      ? viewGroup.color
                                      : 'transparent'
                                  }
                                  text={viewGroup.title}
                                  weight={
                                    viewGroup.type !==
                                    RecordGroupDefinitionType.NoValue
                                      ? 'regular'
                                      : 'medium'
                                  }
                                />
                              }
                              iconButtons={getIconButtons(
                                viewGroupIndex,
                                viewGroup,
                              )}
                              accent={showDragGrip ? 'placeholder' : 'default'}
                              showGrip={showDragGrip}
                              isDragDisabled={!isDraggable}
                            />
                          }
                        />
                      ),
                    )}
                  </>
                }
              />
            )}
            {noValueViewGroups.map((viewGroup) => (
              <MenuItemDraggable
                key={viewGroup.id}
                text={
                  <Tag
                    variant={
                      viewGroup.type !== RecordGroupDefinitionType.NoValue
                        ? 'solid'
                        : 'outline'
                    }
                    color={
                      viewGroup.type !== RecordGroupDefinitionType.NoValue
                        ? viewGroup.color
                        : 'transparent'
                    }
                    text={viewGroup.title}
                    weight={
                      viewGroup.type !== RecordGroupDefinitionType.NoValue
                        ? 'regular'
                        : 'medium'
                    }
                  />
                }
                accent={showDragGrip ? 'placeholder' : 'default'}
                showGrip={true}
                isDragDisabled={true}
                isHoverDisabled
              />
            ))}
          </>
        )}
      </DropdownMenuItemsContainer>
    </div>
  );
};
