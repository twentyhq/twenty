import styled from '@emotion/styled';
import { useContext, useState } from 'react';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';

import { RECORD_BOARD_COLUMN_WIDTH } from '@/object-record/record-board/constants/RecordBoardColumnWidth';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { hasAnySoftDeleteFilterOnViewComponentSelector } from '@/object-record/record-filter/states/hasAnySoftDeleteFilterOnView';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { recordIndexAggregateDisplayLabelComponentState } from '@/object-record/record-index/states/recordIndexAggregateDisplayLabelComponentState';
import { recordIndexAggregateDisplayValueForGroupValueComponentFamilyState } from '@/object-record/record-index/states/recordIndexAggregateDisplayValueForGroupValueComponentFamilyState';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
import { useRecoilComponentFamilyValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentFamilyValue';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { Tag } from 'twenty-ui/components';
import { IconDotsVertical, IconPlus } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: left;
  width: 100%;
  height: 100%;
`;

const StyledHeaderActions = styled.div`
  display: flex;
  margin-left: auto;
`;

const StyledHeaderContainer = styled.div`
  background: ${({ theme }) => theme.background.primary};
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledColumn = styled.div`
  background-color: ${({ theme }) => theme.background.primary};
  display: flex;
  flex-direction: column;
  max-width: ${RECORD_BOARD_COLUMN_WIDTH}px;
  min-width: ${RECORD_BOARD_COLUMN_WIDTH}px;

  padding: ${({ theme }) => theme.spacing(2)};

  position: relative;
`;

const StyledTag = styled(Tag)`
  flex-shrink: 0;
`;

export const RecordBoardColumnHeader = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);

  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const { objectMetadataItem, selectFieldMetadataItem } =
    useContext(RecordBoardContext);

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const hasAnySoftDeleteFilterOnView = useRecoilComponentValue(
    hasAnySoftDeleteFilterOnViewComponentSelector,
  );

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  const recordIndexAggregateDisplayValueForGroupValue =
    useRecoilComponentFamilyValue(
      recordIndexAggregateDisplayValueForGroupValueComponentFamilyState,
      { groupValue: columnDefinition?.value ?? '' },
    );

  const recordIndexAggregateDisplayLabel = useRecoilComponentValue(
    recordIndexAggregateDisplayLabelComponentState,
  );

  const { toggleDropdown } = useToggleDropdown();

  const dropdownId = `record-board-column-dropdown-${columnDefinition.id}`;

  const handleCreateNewRecordClick = async () => {
    await createNewIndexRecord({
      position: 'first',
      [selectFieldMetadataItem.name]: columnDefinition.value,
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
            <Dropdown
              dropdownId={dropdownId}
              dropdownPlacement="bottom-start"
              dropdownOffset={{
                x: 0,
                y: 10,
              }}
              clickableComponent={
                <StyledTag
                  variant={
                    columnDefinition.type === RecordGroupDefinitionType.Value
                      ? 'solid'
                      : 'outline'
                  }
                  color={
                    columnDefinition.type === RecordGroupDefinitionType.Value
                      ? columnDefinition.color
                      : 'transparent'
                  }
                  text={columnDefinition.title}
                  weight={
                    columnDefinition.type === RecordGroupDefinitionType.Value
                      ? 'regular'
                      : 'medium'
                  }
                />
              }
              dropdownComponents={<RecordBoardColumnDropdownMenu />}
            />

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
                {hasObjectUpdatePermissions &&
                  !hasAnySoftDeleteFilterOnView && (
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
    </StyledColumn>
  );
};
