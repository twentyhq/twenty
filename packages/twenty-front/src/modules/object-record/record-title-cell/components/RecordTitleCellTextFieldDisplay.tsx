import { FieldContext } from '@/object-record/record-field/ui/contexts/FieldContext';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecordTitleCell } from '@/object-record/record-title-cell/hooks/useRecordTitleCell';
import { type RecordTitleCellContainerType } from '@/object-record/record-title-cell/types/RecordTitleCellContainerType';
import { getRecordFieldInputInstanceId } from '@/object-record/utils/getRecordFieldInputId';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { OverflowingTextWithTooltip } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

export const RecordTitleCellSingleTextDisplayMode = ({
  containerType,
}: {
  containerType: RecordTitleCellContainerType;
}) => {
  const { recordId, fieldDefinition } = useContext(FieldContext);

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const fieldValue = recordStore?.[fieldDefinition.metadata.fieldName];
  const isEmpty = !isDefined(fieldValue) || fieldValue.trim() === '';

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
        <OverflowingTextWithTooltip
          text={
            recordStore?.[fieldDefinition.metadata.fieldName] ||
            fieldDefinition.label
          }
        />
      )}
    </StyledDiv>
  );
};
