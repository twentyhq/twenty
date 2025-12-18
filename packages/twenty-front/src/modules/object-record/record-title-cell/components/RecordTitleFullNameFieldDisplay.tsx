import { t } from '@lingui/core/macro';
import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameFieldDisplay';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { withTheme, type Theme } from '@emotion/react';
import styled from '@emotion/styled';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';

const StyledDiv = styled.div`
  background: inherit;
  border: none;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 24px;
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

export const RecordTitleFullNameFieldDisplay = ({
  containerType,
}: {
  containerType: string;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const { openRecordTitleCell } = useRecordTitleCell();

  const { fieldValue } = useFullNameFieldDisplay();

  const content = [fieldValue?.firstName, fieldValue?.lastName]
    .filter(isNonEmptyString)
    .join(' ')
    .trim();

  const { pushFocusItemToFocusStack } = usePushFocusItemToFocusStack();

  const recordTitleCellId = getRecordFieldInputInstanceId({
    recordId,
    fieldName: fieldDefinition.metadata.fieldName,
    prefix: containerType,
  });

  return (
    <StyledDiv
      onClick={() => {
        pushFocusItemToFocusStack({
          focusId: recordTitleCellId,
          component: {
            type: FocusComponentType.OPENED_FIELD_INPUT,
            instanceId: recordTitleCellId,
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        });

        openRecordTitleCell({
          recordId,
          fieldName: fieldDefinition.metadata.fieldName,
          instanceId: getRecordFieldInputInstanceId({
            recordId,
            fieldName: fieldDefinition.metadata.fieldName,
            prefix: containerType,
          }),
        });
      }}
    >
      {!content ? (
        <StyledEmptyText>{t`Untitled`}</StyledEmptyText>
      ) : (
        <OverflowingTextWithTooltip
          text={isNonEmptyString(content) ? content : fieldDefinition.label}
        />
      )}
    </StyledDiv>
  );
};
