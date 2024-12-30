import styled from '@emotion/styled';
import { useContext, useState } from 'react';

import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { useCreateNewBoardRecord } from '@/object-record/record-board/hooks/useCreateNewBoardRecord';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAggregateRecordsForRecordBoardColumn } from '@/object-record/record-board/record-board-column/hooks/useAggregateRecordsForRecordBoardColumn';
import { RecordBoardColumnHotkeyScope } from '@/object-record/record-board/types/BoardColumnHotkeyScope';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { IconDotsVertical, IconPlus, LightIconButton, Tag } from 'twenty-ui';

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
`;

const StyledRecordCountChildren = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 24px;
  justify-content: center;
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  width: 22px;
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

export const RecordBoardColumnHeader = () => {
  const { columnDefinition } = useContext(RecordBoardColumnContext);
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const { objectMetadataItem, recordBoardId } = useContext(RecordBoardContext);
  const { createNewBoardRecord } = useCreateNewBoardRecord(recordBoardId);

  const {
    setHotkeyScopeAndMemorizePreviousScope,
    goBackToPreviousHotkeyScope,
  } = usePreviousHotkeyScope();

  const handleBoardColumnMenuOpen = () => {
    setIsBoardColumnMenuOpen(true);
    setHotkeyScopeAndMemorizePreviousScope(
      RecordBoardColumnHotkeyScope.BoardColumn,
      {
        goto: false,
      },
    );
  };

  const handleBoardColumnMenuClose = () => {
    goBackToPreviousHotkeyScope();
    setIsBoardColumnMenuOpen(false);
  };

  const { aggregateValue, aggregateLabel } =
    useAggregateRecordsForRecordBoardColumn();

  const isAggregateQueryEnabled = useIsFeatureEnabled(
    'IS_AGGREGATE_QUERY_ENABLED',
  );

  return (
    <StyledColumn>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <StyledHeaderContainer>
          <StyledLeftContainer>
            <Tag
              onClick={handleBoardColumnMenuOpen}
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
            {isAggregateQueryEnabled ? (
              <RecordBoardColumnHeaderAggregateDropdown
                aggregateValue={aggregateValue}
                dropdownId={`record-board-column-aggregate-dropdown-${columnDefinition.id}`}
                objectMetadataItem={objectMetadataItem}
                aggregateLabel={aggregateLabel}
              />
            ) : (
              <StyledRecordCountChildren>
                {aggregateValue}
              </StyledRecordCountChildren>
            )}
          </StyledLeftContainer>
          <StyledRightContainer>
            {isHeaderHovered && (
              <StyledHeaderActions>
                <LightIconButton
                  accent="tertiary"
                  Icon={IconDotsVertical}
                  onClick={handleBoardColumnMenuOpen}
                />

                <LightIconButton
                  accent="tertiary"
                  Icon={IconPlus}
                  onClick={() =>
                    createNewBoardRecord(columnDefinition.id, 'first')
                  }
                />
              </StyledHeaderActions>
            )}
          </StyledRightContainer>
        </StyledHeaderContainer>
      </StyledHeader>
      {isBoardColumnMenuOpen && (
        <RecordBoardColumnDropdownMenu
          onClose={handleBoardColumnMenuClose}
          stageId={columnDefinition.id}
        />
      )}
    </StyledColumn>
  );
};
