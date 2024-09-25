import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { IconDotsVertical, IconPlus, Tag } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useAddNewOpportunity } from '@/object-record/record-board/record-board-column/hooks/useAddNewOpportunity';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';
import { RecordBoardColumnHotkeyScope } from '@/object-record/record-board/types/BoardColumnHotkeyScope';
import { RecordBoardColumnDefinitionType } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
import { SingleEntitySelect } from '@/object-record/relation-picker/components/SingleEntitySelect';
import { LightIconButton } from '@/ui/input/button/components/LightIconButton';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';

const StyledHeader = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  justify-content: left;
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledAmount = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledNumChildren = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  height: 24px;
  justify-content: center;
  line-height: ${({ theme }) => theme.text.lineHeight.lg};
  width: 16px;
`;

const StyledHeaderActions = styled.div`
  display: flex;
  margin-left: auto;
`;
const StyledHeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const StyledLeftContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledRightContainer = styled.div`
  align-items: center;
  display: flex;
`;

export const RecordBoardColumnHeader = () => {
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);
  const { objectMetadataItem } = useContext(RecordBoardContext);
  const { columnDefinition, recordCount } = useContext(
    RecordBoardColumnContext,
  );

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

  const boardColumnTotal = 0;

  const {
    isCreatingCard,
    handleAddNewOpportunityClick,
    handleCancel,
    handleEntitySelect,
  } = useAddNewOpportunity('first');

  const { newRecord, handleNewButtonClick, handleCreateSuccess } =
    useColumnNewCardActions(columnDefinition.id);

  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity;

  const handleClick = isOpportunity
    ? handleAddNewOpportunityClick
    : () => handleNewButtonClick('first');

  return (
    <>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
        <StyledHeaderContainer>
          <StyledLeftContainer>
            <Tag
              onClick={handleBoardColumnMenuOpen}
              variant={
                columnDefinition.type === RecordBoardColumnDefinitionType.Value
                  ? 'solid'
                  : 'outline'
              }
              color={
                columnDefinition.type === RecordBoardColumnDefinitionType.Value
                  ? columnDefinition.color
                  : 'transparent'
              }
              text={columnDefinition.title}
              weight={
                columnDefinition.type === RecordBoardColumnDefinitionType.Value
                  ? 'regular'
                  : 'medium'
              }
            />
            {!!boardColumnTotal && (
              <StyledAmount>${boardColumnTotal}</StyledAmount>
            )}
            <StyledNumChildren>{recordCount}</StyledNumChildren>
          </StyledLeftContainer>
          <StyledRightContainer>
            {isHeaderHovered && (
              <StyledHeaderActions>
                {columnDefinition.actions.length > 0 && (
                  <LightIconButton
                    accent="tertiary"
                    Icon={IconDotsVertical}
                    onClick={handleBoardColumnMenuOpen}
                  />
                )}

                <LightIconButton
                  accent="tertiary"
                  Icon={IconPlus}
                  onClick={handleClick}
                />
              </StyledHeaderActions>
            )}
          </StyledRightContainer>
        </StyledHeaderContainer>
      </StyledHeader>
      {isBoardColumnMenuOpen && columnDefinition.actions.length > 0 && (
        <RecordBoardColumnDropdownMenu
          onClose={handleBoardColumnMenuClose}
          stageId={columnDefinition.id}
        />
      )}
      {newRecord?.isCreating && newRecord.position === 'first' && (
        <RecordBoardCard
          isCreating={true}
          onCreateSuccess={() => handleCreateSuccess('first')}
          position="first"
        />
      )}
      {isCreatingCard && (
        <SingleEntitySelect
          disableBackgroundBlur
          onCancel={handleCancel}
          onEntitySelected={handleEntitySelect}
          relationObjectNameSingular={CoreObjectNameSingular.Company}
          relationPickerScopeId="relation-picker"
          selectedRelationRecordIds={[]}
        />
      )}
    </>
  );
};
