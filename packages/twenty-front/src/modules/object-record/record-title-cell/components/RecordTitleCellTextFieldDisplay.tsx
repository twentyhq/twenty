import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/object-record/record-inline-cell/constants/InlineCellHotkeyScopeMemoizeKey';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { useRecordValue } from '@/object-record/record-store/contexts/RecordFieldValueSelectorContext';
import { TitleInputHotkeyScope } from '@/ui/input/types/TitleInputHotkeyScope';
import { usePreviousHotkeyScope } from '@/ui/utilities/hotkey/hooks/usePreviousHotkeyScope';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledDiv = styled.div`
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 28px;
  padding: ${({ theme }) => theme.spacing(0, 1.25)};
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const RecordTitleCellSingleTextDisplayMode = () => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useRecordValue(recordId);

  const { openInlineCell } = useInlineCell();

  const { setHotkeyScopeAndMemorizePreviousScope } = usePreviousHotkeyScope(
    INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY,
  );

  return (
    <StyledDiv
      onClick={() => {
        setHotkeyScopeAndMemorizePreviousScope(
          TitleInputHotkeyScope.TitleInput,
        );
        openInlineCell();
      }}
    >
      <OverflowingTextWithTooltip
        text={
          recordValue?.[fieldDefinition.metadata.fieldName] ||
          fieldDefinition.label
        }
      />
    </StyledDiv>
  );
};
