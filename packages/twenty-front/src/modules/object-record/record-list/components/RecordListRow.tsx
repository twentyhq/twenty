import { RecordChip } from '@/object-record/components/RecordChip';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordListRowField } from '@/object-record/record-list/components/RecordListRowField';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { recordListDisplayedFieldCountComponentState } from '@/object-record/record-list/states/recordListDisplayedFieldCountComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { isDefined } from 'twenty-shared/utils';
import { ChipVariant } from 'twenty-ui/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledRowContainer = styled.div`
  cursor: pointer;
  padding-bottom: 2px;

  &:hover > div {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  &:active > div {
    background: ${themeCssVariables.accent.quaternary};
  }
`;

const StyledRow = styled.div`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  height: 32px;
  justify-content: space-between;
  padding: 0 6px;
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  min-width: 176px;
  overflow: hidden;
`;

const StyledFieldsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: flex-end;
  overflow: hidden;
`;

const StyledHiddenFieldCountChip = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.transparent.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  flex-shrink: 0;
  font-size: ${themeCssVariables.font.size.md};
  gap: 2px;
  height: 20px;
  padding: 0 ${themeCssVariables.spacing[1]};

  &::before {
    color: ${themeCssVariables.font.color.secondary};
    content: '+';
    font-size: ${themeCssVariables.font.size.sm};
  }
`;

type RecordListRowProps = {
  recordId: string;
};

export const RecordListRow = ({ recordId }: RecordListRowProps) => {
  const { objectNameSingular } = useRecordListContextOrThrow();
  const {
    labelIdentifierFieldMetadataItem,
    fieldDefinitionByFieldMetadataItemId,
  } = useRecordIndexContextOrThrow();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const visibleRecordFields = useAtomComponentSelectorValue(
    visibleRecordFieldsComponentSelector,
  );

  const recordListDisplayedFieldCount = useAtomComponentStateValue(
    recordListDisplayedFieldCountComponentState,
  );

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  if (!isDefined(recordStore)) {
    return null;
  }

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const nonEmptyRecordFields = visibleRecordFieldsExceptLabelIdentifier.filter(
    (recordField) => {
      const fieldDefinition =
        fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

      return !isFieldValueEmpty({
        fieldDefinition,
        fieldValue: recordStore[fieldDefinition.metadata.fieldName],
      });
    },
  );

  const displayedRecordFields = nonEmptyRecordFields.slice(
    0,
    recordListDisplayedFieldCount,
  );

  const hiddenFieldCount =
    nonEmptyRecordFields.length - displayedRecordFields.length;

  return (
    <StyledRowContainer onClick={() => openRecordFromIndexView({ recordId })}>
      <StyledRow>
        <StyledRecordChipContainer>
          <StopPropagationContainer>
            <RecordChip
              objectNameSingular={objectNameSingular}
              record={recordStore}
              variant={ChipVariant.Transparent}
              onClick={() => openRecordFromIndexView({ recordId })}
              triggerEvent={'CLICK'}
            />
          </StopPropagationContainer>
        </StyledRecordChipContainer>
        <StyledFieldsContainer>
          {displayedRecordFields.map((recordField) => (
            <RecordListRowField
              key={recordField.fieldMetadataItemId}
              recordId={recordId}
              recordField={recordField}
            />
          ))}
          {hiddenFieldCount > 0 && (
            <StyledHiddenFieldCountChip>
              {hiddenFieldCount}
            </StyledHiddenFieldCountChip>
          )}
        </StyledFieldsContainer>
      </StyledRow>
    </StyledRowContainer>
  );
};
