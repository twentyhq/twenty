import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { useFullNameFieldDisplay } from '@/object-record/record-field/ui/meta-types/hooks/useFullNameFieldDisplay';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { usePushFocusItemToFocusStack } from '@/ui/utilities/focus/hooks/usePushFocusItemToFocusStack';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledDiv = styled.div`
  background: inherit;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  overflow: hidden;
  height: 24px;
  padding: ${themeCssVariables.spacing[0]} 5px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  :hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledEmptyText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

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
          fieldMetadataItemId: fieldDefinition.fieldMetadataId,
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
