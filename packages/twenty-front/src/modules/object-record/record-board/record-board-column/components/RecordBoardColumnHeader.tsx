import styled from '@emotion/styled';
import { useContext, useState } from 'react';

import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAggregateRecordsForRecordBoardColumn } from '@/object-record/record-board/record-board-column/hooks/useAggregateRecordsForRecordBoardColumn';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { useCreateNewIndexRecord } from '@/object-record/record-table/hooks/useCreateNewIndexRecord';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { useToggleDropdown } from '@/ui/layout/dropdown/hooks/useToggleDropdown';
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
  max-width: 200px;
  min-width: 200px;

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

  const { aggregateValue, aggregateLabel } =
    useAggregateRecordsForRecordBoardColumn();

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  const { createNewIndexRecord } = useCreateNewIndexRecord({
    objectMetadataItem: objectMetadataItem,
  });

  const { toggleDropdown } = useToggleDropdown();

  const dropdownId = `record-board-column-dropdown-${columnDefinition.id}`;

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
              aggregateValue={aggregateValue}
              dropdownId={`record-board-column-aggregate-dropdown-${columnDefinition.id}`}
              objectMetadataItem={objectMetadataItem}
              aggregateLabel={aggregateLabel}
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
                {hasObjectUpdatePermissions && (
                  <LightIconButton
                    accent="tertiary"
                    Icon={IconPlus}
                    onClick={() => {
                      createNewIndexRecord({
                        position: 'first',
                        [selectFieldMetadataItem.name]: columnDefinition.value,
                      });
                    }}
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
