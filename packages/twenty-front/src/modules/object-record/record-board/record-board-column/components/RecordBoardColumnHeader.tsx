import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { IconDotsVertical, IconPlus, Tag } from 'twenty-ui';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCard } from '@/object-record/record-board/record-board-card/components/RecordBoardCard';
import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { useColumnNewCardActions } from '@/object-record/record-board/record-board-column/hooks/useColumnNewCardActions';
import { useIsOpportunitiesCompanyFieldDisabled } from '@/object-record/record-board/record-board-column/hooks/useIsOpportunitiesCompanyFieldDisabled';
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
  background: ${({ theme }) => theme.background.primary};
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

const StyledColumn = styled.div<{ isFirstColumn: boolean }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-left: 1px solid
    ${({ theme, isFirstColumn }) =>
      isFirstColumn ? 'none' : theme.border.color.light};
  display: flex;
  flex-direction: column;
  max-width: 200px;
  min-width: 200px;

  padding: ${({ theme }) => theme.spacing(2)};

  position: relative;
`;

export const RecordBoardColumnHeader = () => {
  const { columnDefinition, isFirstColumn, recordCount } = useContext(
    RecordBoardColumnContext,
  );
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

  const boardColumnTotal = 0;

  const {
    newRecord,
    handleNewButtonClick,
    handleCreateSuccess,
    handleEntitySelect,
  } = useColumnNewCardActions(columnDefinition?.id ?? '');

  const { isOpportunitiesCompanyFieldDisabled } =
    useIsOpportunitiesCompanyFieldDisabled();

  const isOpportunity =
    objectMetadataItem.nameSingular === CoreObjectNameSingular.Opportunity &&
    !isOpportunitiesCompanyFieldDisabled;

  return (
    <StyledColumn isFirstColumn={isFirstColumn}>
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
                  onClick={() => handleNewButtonClick('first', isOpportunity)}
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
      {newRecord?.isCreating &&
        newRecord.position === 'first' &&
        (newRecord.isOpportunity ? (
          <SingleEntitySelect
            disableBackgroundBlur
            onCancel={() => handleCreateSuccess('first', columnDefinition.id)}
            onEntitySelected={(company) =>
              company && handleEntitySelect('first', company)
            }
            relationObjectNameSingular={CoreObjectNameSingular.Company}
            relationPickerScopeId="relation-picker"
            selectedRelationRecordIds={[]}
          />
        ) : (
          <RecordBoardCard
            isCreating={true}
            onCreateSuccess={() => handleCreateSuccess('first')}
            position="first"
          />
        ))}
    </StyledColumn>
  );
};
