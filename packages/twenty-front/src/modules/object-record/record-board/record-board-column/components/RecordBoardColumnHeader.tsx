import { styled } from '@linaria/react';
import { useContext, useState } from 'react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getRecordGroupByFieldColumnName } from '@/object-metadata/utils/getRecordGroupByFieldColumnName';
import { isManyToOneRelationToWorkspaceMember } from '@/object-metadata/utils/isManyToOneRelationToWorkspaceMember';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME } from '@/object-record/record-board/constants/RecordBoardColumnWidthCssVariableName';
import { RecordBoardColumnResizeHandler } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnResizeHandler';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { canCreateRecordsForObjectMetadataItem } from '@/object-record/utils/canCreateRecordsForObjectMetadataItem';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { Avatar, Tag } from 'twenty-ui/data-display';
import { IconDotsVertical, IconPlus } from 'twenty-ui/icon';
import { LightIconButton } from 'twenty-ui/input';

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  height: 100%;
  justify-content: left;
  width: 100%;
`;

const StyledHeaderActions = styled.div`
  display: flex;
  margin-left: auto;
`;

const StyledHeaderContainer = styled.div`
  background: ${themeCssVariables.background.primary};
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  overflow: hidden;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledColumn = styled.div`
  background-color: ${themeCssVariables.background.primary};
  display: flex;
  flex-direction: column;
  max-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );
  min-width: var(
    ${RECORD_BOARD_COLUMN_WIDTH_CSS_VARIABLE_NAME},
    ${RECORD_BOARD_COLUMN_WIDTH}px
  );

  padding: ${themeCssVariables.spacing[2]};

  position: relative;
`;

const StyledTagContainer = styled.div`
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledPersonChip = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
  max-width: 100%;
  min-width: 0;
  overflow: hidden;
`;

const StyledPersonName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledDropdownContainer = styled.div`
  min-width: 0;
  overflow: hidden;
`;

export const RecordBoardColumnHeader = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const canCreateRecords = canCreateRecordsForObjectMetadataItem({
    objectPermissions,
    objectMetadataItem,
  });

  const hasAnySoftDeleteFilterOnView = useAtomComponentSelectorValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  const recordIndexAggregateDisplayValueForGroupValue =
    useAtomComponentFamilyStateValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: columnDefinition?.value ?? '' },
    );

  const recordIndexAggregateDisplayLabel = useAtomComponentStateValue(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const { toggleDropdown } = useToggleDropdown();

  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );

  const isValueGroup =
    columnDefinition.type === RecordGroupDefinitionType.Value;

  const isGroupedByWorkspaceMemberRelation =
    isManyToOneRelationToWorkspaceMember(selectFieldMetadataItem);

  const groupWorkspaceMember =
    isGroupedByWorkspaceMemberRelation && isValueGroup
      ? currentWorkspaceMembers.find(
          (workspaceMember) => workspaceMember.id === columnDefinition.value,
        )
      : undefined;

  const dropdownId = `record-board-column-dropdown-${columnDefinition.id}`;

  const handleCreateNewRecordClick = async () => {
    await createNewIndexRecord({
      position: 'first',
      [getRecordGroupByFieldColumnName(selectFieldMetadataItem)]:
        columnDefinition.value,
    });
  };

  return (
    <StyledColumn>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <StyledHeaderContainer>
          <StyledLeftContainer>
            <StyledDropdownContainer>
              <Dropdown
                dropdownId={dropdownId}
                dropdownPlacement="bottom-start"
                dropdownOffset={{
                  x: 0,
                  y: 10,
                }}
                clickableComponent={
                  isGroupedByWorkspaceMemberRelation && isValueGroup ? (
                    <StyledPersonChip>
                      <Avatar
                        avatarUrl={groupWorkspaceMember?.avatarUrl}
                        placeholder={columnDefinition.title}
                        placeholderColorSeed={
                          columnDefinition.value ?? undefined
                        }
                        size="md"
                        type="rounded"
                      />
                      <StyledPersonName>
                        {columnDefinition.title}
                      </StyledPersonName>
                    </StyledPersonChip>
                  ) : (
                    <StyledTagContainer>
                      <Tag
                        variant={isValueGroup ? 'solid' : 'outline'}
                        color={
                          isValueGroup ? columnDefinition.color : 'transparent'
                        }
                        text={columnDefinition.title}
                        weight={isValueGroup ? 'regular' : 'medium'}
                      />
                    </StyledTagContainer>
                  )
                }
                dropdownComponents={<RecordBoardColumnDropdownMenu />}
              />
            </StyledDropdownContainer>

            <RecordBoardColumnHeaderAggregateDropdown
              aggregateValue={recordIndexAggregateDisplayValueForGroupValue}
              dropdownId={`record-board-column-aggregate-dropdown-${columnDefinition.id}`}
              objectMetadataItem={objectMetadataItem}
              aggregateLabel={recordIndexAggregateDisplayLabel}
            />
          </StyledLeftContainer>
          <StyledRightContainer>
            {isHeaderHovered && (
              <StyledHeaderActions>
                <LightIconButton
                  accent="tertiary"
                  Icon={IconDotsVertical}
                  onClick={() => {
                    toggleDropdown({
                      dropdownComponentInstanceIdFromProps: dropdownId,
                    });
                  }}
                />
                {canCreateRecords && !hasAnySoftDeleteFilterOnView && (
                  <LightIconButton
                    accent="tertiary"
                    Icon={IconPlus}
                    onClick={handleCreateNewRecordClick}
                  />
                )}
              </StyledHeaderActions>
            )}
          </StyledRightContainer>
        </StyledHeaderContainer>
      </StyledHeader>
      <RecordBoardColumnResizeHandler />
    </StyledColumn>
  );
};
