import { RecordChip } from '@/object-record/components/RecordChip';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { visibleRecordFieldsComponentSelector } from '@/object-record/record-field/states/visibleRecordFieldsComponentSelector';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { RecordListRowField } from '@/object-record/record-list/components/RecordListRowField';
import { RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH } from '@/object-record/record-list/constants/RecordListRowLabelIdentifierWidth';
import { RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH } from '@/object-record/record-list/constants/RecordListRowOverflowChipSlotWidth';
import { useRecordListContextOrThrow } from '@/object-record/record-list/contexts/RecordListContext';
import { recordListRowWidthComponentState } from '@/object-record/record-list/states/recordListRowWidthComponentState';
import { computeRecordListDisplayedFields } from '@/object-record/record-list/utils/computeRecordListDisplayedFields';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentSelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentSelectorValue';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { plural, t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Chip, ChipVariant, LinkChip } from 'twenty-ui/data-display';
import { TooltipPosition } from 'twenty-ui/surfaces';
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
  flex: 1 1 ${RECORD_LIST_ROW_LABEL_IDENTIFIER_WIDTH}px;
  min-width: 0;
  overflow: hidden;
`;

const StyledFieldsContainer = styled.div`
  align-items: center;
  display: flex;
  flex-shrink: 0;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: flex-end;
  overflow: hidden;
`;

const StyledOverflowChipContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: flex-end;
  width: ${RECORD_LIST_ROW_OVERFLOW_CHIP_SLOT_WIDTH}px;
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

  const recordListRowWidth = useAtomComponentStateValue(
    recordListRowWidthComponentState,
  );

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  if (!isDefined(recordStore)) {
    return null;
  }

  const visibleRecordFieldsExceptLabelIdentifier = visibleRecordFields.filter(
    (recordField) =>
      recordField.fieldMetadataItemId !== labelIdentifierFieldMetadataItem?.id,
  );

  const nonEmptyRecordFields = visibleRecordFieldsExceptLabelIdentifier.flatMap(
    (recordField) => {
      const fieldDefinition =
        fieldDefinitionByFieldMetadataItemId[recordField.fieldMetadataItemId];

      if (
        !isDefined(fieldDefinition) ||
        isFieldValueEmpty({
          fieldDefinition,
          fieldValue: recordStore[fieldDefinition.metadata.fieldName],
        })
      ) {
        return [];
      }

      return [{ recordField, fieldDefinition }];
    },
  );

  const displayedFieldsLayout = computeRecordListDisplayedFields({
    rowWidth: recordListRowWidth,
    populatedFieldCount: nonEmptyRecordFields.length,
  });

  const displayedRecordFields = nonEmptyRecordFields.slice(
    0,
    displayedFieldsLayout.displayedFieldCount,
  );

  const hiddenFieldCount =
    nonEmptyRecordFields.length - displayedRecordFields.length;

  const openRecord = () => openRecordFromIndexView({ recordId });

  const linkToRecord = getLinkToShowPage(objectNameSingular, recordStore);

  const overflowChipLabel = `+${hiddenFieldCount}`;
  const overflowChipTooltipLabel = plural(hiddenFieldCount, {
    one: '# more populated field available',
    other: '# more populated fields available',
  });

  return (
    <StyledRowContainer
      role="button"
      tabIndex={0}
      aria-label={t`Open record`}
      onClick={openRecord}
      onKeyDown={(event) => {
        if (event.target !== event.currentTarget) {
          return;
        }

        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openRecord();
        }
      }}
    >
      <StyledRow>
        <StyledRecordChipContainer>
          <StopPropagationContainer>
            <RecordChip
              objectNameSingular={objectNameSingular}
              record={recordStore}
              to={linkToRecord}
              variant={ChipVariant.Transparent}
              isBold
              onClick={openRecord}
              triggerEvent={'CLICK'}
            />
          </StopPropagationContainer>
        </StyledRecordChipContainer>
        <StyledFieldsContainer>
          {displayedRecordFields.map(({ recordField, fieldDefinition }) => (
            <RecordListRowField
              key={recordField.fieldMetadataItemId}
              recordId={recordId}
              recordField={recordField}
              fieldDefinition={fieldDefinition}
              maxWidth={displayedFieldsLayout.displayedFieldMaxWidth}
            />
          ))}
          {hiddenFieldCount > 0 && (
            <StyledOverflowChipContainer>
              {isNonEmptyString(linkToRecord) ? (
                <LinkChip
                  label={overflowChipLabel}
                  to={linkToRecord}
                  onClick={openRecord}
                  triggerEvent="CLICK"
                  tooltipLabel={overflowChipTooltipLabel}
                  tooltipPlace={TooltipPosition.Top}
                  alwaysShowTooltip
                  variant={ChipVariant.Highlighted}
                />
              ) : (
                <Chip
                  label={overflowChipLabel}
                  tooltipLabel={overflowChipTooltipLabel}
                  tooltipPlace={TooltipPosition.Top}
                  alwaysShowTooltip
                  variant={ChipVariant.Highlighted}
                />
              )}
            </StyledOverflowChipContainer>
          )}
        </StyledFieldsContainer>
      </StyledRow>
    </StyledRowContainer>
  );
};
