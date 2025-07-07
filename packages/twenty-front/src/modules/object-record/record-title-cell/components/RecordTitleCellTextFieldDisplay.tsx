import { FieldContext } from '@/object-record/record-field/contexts/FieldContext';
import { INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY } from '@/object-record/record-inline-cell/constants/InlineCellHotkeyScopeMemoizeKey';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { getRecordFieldInputId } from '@/object-record/utils/getRecordFieldInputId';
import { TitleInputHotkeyScope } from '@/ui/input/types/TitleInputHotkeyScope';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { Theme, withTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
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

const StyledEmptyText = withTheme(styled.div<{ theme: Theme }>`
  color: ${({ theme }) => theme.font.color.tertiary};
`);

export const RecordTitleCellSingleTextDisplayMode = ({
  containerType,
}: {
  containerType: string;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordValue = useRecoilValue(recordStoreFamilyState(recordId));

  const isEmpty =
    recordValue?.[fieldDefinition.metadata.fieldName]?.trim() === '';

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  return (
    <StyledDiv
      onClick={() => {
        pushFocusItemToFocusStack({
          focusId: getRecordFieldInputId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
            prefix: containerType,
          }),
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: getRecordFieldInputId({
              recordId,
              fieldName: fieldDefinition.metadata.fieldName,
              prefix: containerType,
            }),
          },
          hotkeyScope: {
            scope: TitleInputHotkeyScope.TitleInput,
          },
          memoizeKey: INLINE_CELL_HOTKEY_SCOPE_MEMOIZE_KEY,
        });
      }}
    >
      {isEmpty ? (
        <StyledEmptyText>Untitled</StyledEmptyText>
      ) : (
        <OverflowingTextWithTooltip
          text={
            recordValue?.[fieldDefinition.metadata.fieldName] ||
            fieldDefinition.label
          }
        />
      )}
    </StyledDiv>
  );
};
