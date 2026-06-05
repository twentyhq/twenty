import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { isFieldFullNameValue } from '@/object-record/record-field/ui/types/guards/isFieldFullNameValue';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { type RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

const StyledDiv = styled.div`
  align-items: center;
  background: inherit;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  height: 24px;
  justify-content: center;
  overflow: hidden;
  padding: ${themeCssVariables.spacing[0]} 5px;
  &:hover {
    background: ${themeCssVariables.background.transparent.light};
  }
`;

const StyledEmptyText = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
`;

const parseRecordTitleTextFieldValue = (fieldValue: unknown): string => {
  if (isNonEmptyString(fieldValue)) {
    return fieldValue;
  }

  if (isFieldFullNameValue(fieldValue)) {
    return [fieldValue.firstName, fieldValue.lastName]
      .filter(isNonEmptyString)
      .join(' ');
  }

  return '';
};

export const RecordTitleCellSingleTextDisplayMode = ({
  containerType,
}: {
  containerType: RecordTitleCellContainerType;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const fieldValue = parseRecordTitleTextFieldValue(
    recordStore?.[fieldDefinition.metadata.fieldName],
  );
  const isEmpty = fieldValue.trim() === '';

  const { openRecordTitleCell } = useRecordTitleCell();

  return (
    <StyledDiv
      onClick={() => {
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
      {isEmpty ? (
        <StyledEmptyText>{t`Untitled`}</StyledEmptyText>
      ) : (
        <OverflowingTextWithTooltip text={fieldValue || fieldDefinition.label} />
      )}
    </StyledDiv>
  );
};
