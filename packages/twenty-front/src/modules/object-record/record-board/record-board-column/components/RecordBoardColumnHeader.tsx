import styled from '@emotion/styled';
import { useContext, useState } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnHeaderAggregateDropdown } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnHeaderAggregateDropdown';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAggregateRecordsForRecordBoardColumn } from '@/object-record/record-board/record-board-column/hooks/useAggregateRecordsForRecordBoardColumn';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
import { RecordBoardColumnHotkeyScope } from '@/object-record/record-board/types/BoardColumnHotkeyScope';
import { RecordGroupDefinitionType } from '@/object-record/record-group/types/RecordGroupDefinition';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
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
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

  const { objectMetadataItem } = useContext(RecordBoardContext);

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

  const { handleNewButtonClick } = useColumnNewCardActions(
    columnDefinition.id ?? '',
  );

  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();

  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity &&
    !isOpportunitiesCompanyFieldDisabled;

  return (
    <StyledColumn>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <StyledHeaderContainer>
          <StyledLeftContainer>
            <StyledTag
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
                  onClick={handleBoardColumnMenuOpen}
                />

                <LightIconButton
                  accent="tertiary"
                  Icon={IconPlus}
                  onClick={() => handleNewButtonClick('first', isOpportunity)}
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
