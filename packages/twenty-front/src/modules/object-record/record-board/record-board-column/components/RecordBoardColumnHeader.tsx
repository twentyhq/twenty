import styled from '@emotion/styled';
import { useContext, useState } from 'react';
import { IconDotsVertical, Tag } from 'twenty-ui';

import { RecordBoardColumnDropdownMenu } from '@/object-record/record-board/record-board-column/components/RecordBoardColumnDropdownMenu';
import { RecordBoardColumnContext } from '@/object-record/record-board/record-board-column/contexts/RecordBoardColumnContext';
import { RecordBoardColumnHotkeyScope } from '@/object-record/record-board/types/BoardColumnHotkeyScope';
import { RecordBoardColumnDefinitionType } from '@/object-record/record-board/types/RecordBoardColumnDefinition';
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

export const RecordBoardColumnHeader = () => {
  const [isBoardColumnMenuOpen, setIsBoardColumnMenuOpen] = useState(false);
  const [isHeaderHovered, setIsHeaderHovered] = useState(false);

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

  return (
    <>
      <StyledHeader
        onMouseEnter={() => setIsHeaderHovered(true)}
        onMouseLeave={() => setIsHeaderHovered(false)}
      >
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
        {!!boardColumnTotal && <StyledAmount>${boardColumnTotal}</StyledAmount>}
        <StyledNumChildren>{recordCount}</StyledNumChildren>
        {isHeaderHovered && columnDefinition.actions.length > 0 && (
          <StyledHeaderActions>
            <LightIconButton
              accent="tertiary"
              Icon={IconDotsVertical}
              onClick={handleBoardColumnMenuOpen}
            />
          </StyledHeaderActions>
        )}
      </StyledHeader>
      {isBoardColumnMenuOpen && columnDefinition.actions.length > 0 && (
        <RecordBoardColumnDropdownMenu
          onClose={handleBoardColumnMenuClose}
          stageId={columnDefinition.id}
        />
      )}
    </>
  );
};
