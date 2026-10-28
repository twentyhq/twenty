import { RecordBoardContext } from '@/object-record/record-board/contexts/RecordBoardContext';
import { RecordBoardCardContext } from '@/object-record/record-board/record-board-card/contexts/RecordBoardCardContext';
import { isRecordSelectedComponentFamilyState } from '@/object-record/record-selection/states/isRecordSelectedComponentFamilyState';
import { useToggleRecordSelection } from '@/object-record/record-selection/hooks/useToggleRecordSelection';
import { t } from '@lingui/core/macro';

import { RecordChip } from '@/object-record/components/RecordChip';
import { useActiveRecordBoardCard } from '@/object-record/record-board/hooks/useActiveRecordBoardCard';
import { useFocusedRecordBoardCard } from '@/object-record/record-board/hooks/useFocusedRecordBoardCard';
import { StopPropagationContainer } from '@/object-record/record-board/record-board-card/components/StopPropagationContainer';
import { useRecordBoardCardAmountRecordField } from '@/object-record/record-board/record-board-card/hooks/useRecordBoardCardAmountRecordField';
import { recordBoardCardIsExpandedComponentState } from '@/object-record/record-board/record-board-card/states/recordBoardCardIsExpandedComponentState';
import { RecordCardHeaderContainer } from '@/object-record/record-card/components/RecordCardHeaderContainer';
import { isFieldCurrency } from '@/object-record/record-field/ui/types/guards/isFieldCurrency';
import { isFieldCurrencyValue } from '@/object-record/record-field/ui/types/guards/isFieldCurrencyValue';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useOpenRecordFromIndexView } from '@/object-record/record-index/hooks/useOpenRecordFromIndexView';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { CurrencyDisplay } from '@/ui/field/display/components/CurrencyDisplay';
import { FIELD_DISPLAY_LEADING_ICON_CLASS_NAME } from '@/ui/field/display/constants/FieldDisplayLeadingIconClassName';
import { useAtomComponentFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilyStateValue';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { styled } from '@linaria/react';
import { useContext } from 'react';
import { OpenRecordIn } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconEye, IconEyeOff } from 'twenty-ui/icon';
import { Checkbox } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useIsMobile, useIsTouchDevice } from 'twenty-ui/utilities';

const StyledCompactIconContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  margin-left: ${themeCssVariables.spacing[1]};
`;

const StyledCheckboxContainer = styled.div`
  margin-left: auto;
`;

const StyledRecordChipContainer = styled.div`
  display: flex;
  flex: 1 1 auto;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  min-width: 0;
  overflow: hidden;
`;

const StyledAmount = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  flex-shrink: 0;
  font-variant-numeric: tabular-nums;
  font-weight: ${themeCssVariables.font.weight.medium};
  max-width: 50%;
  padding-left: ${themeCssVariables.spacing[2]};

  .${FIELD_DISPLAY_LEADING_ICON_CLASS_NAME} {
    display: inline-flex;
    margin-right: ${themeCssVariables.spacing[0.5]};
    vertical-align: text-bottom;
  }
`;

export const RecordBoardCardHeader = () => {
  const { recordId } = useContext(RecordBoardCardContext);

  const { objectMetadataItem, recordBoardId } = useContext(RecordBoardContext);
  const { rowIndex, columnIndex } = useContext(RecordBoardCardContext);
  const { activateBoardCard } = useActiveRecordBoardCard(recordBoardId);
  const { unfocusBoardCard } = useFocusedRecordBoardCard(recordBoardId);

  const { currentView } = useGetCurrentViewOnly();

  const isCompactModeActive = currentView?.isCompact ?? false;

  const [recordBoardCardIsExpanded, setRecordBoardCardIsExpanded] =
    useAtomComponentState(recordBoardCardIsExpandedComponentState);

  const isRecordSelected = useAtomComponentFamilyStateValue(
    isRecordSelectedComponentFamilyState,
    recordId,
  );

  const { toggleRecordSelection } = useToggleRecordSelection(recordBoardId);

  const { openRecordFromIndexView } = useOpenRecordFromIndexView();

  const openRecordIn = useResolveOpenRecordIn(objectMetadataItem.nameSingular);

  const isTouchDevice = useIsTouchDevice();
  const isMobile = useIsMobile();

  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  const { fieldDefinitionByFieldMetadataItemId } =
    useRecordIndexContextOrThrow();

  const amountRecordField = useRecordBoardCardAmountRecordField();

  const amountFieldDefinition = isDefined(amountRecordField)
    ? fieldDefinitionByFieldMetadataItemId[
        amountRecordField.fieldMetadataItemId
      ]
    : undefined;

  const amountValue = isDefined(amountFieldDefinition)
    ? recordStore?.[amountFieldDefinition.metadata.fieldName]
    : undefined;

  const triggerEvent =
    openRecordIn === OpenRecordIn.SIDE_PANEL || isTouchDevice
      ? 'CLICK'
      : 'MOUSE_DOWN';

  return (
    <RecordCardHeaderContainer isCompact={isCompactModeActive}>
      <StyledRecordChipContainer>
        <StopPropagationContainer>
          {isDefined(recordStore) && (
            <RecordChip
              objectNameSingular={objectMetadataItem.nameSingular}
              record={recordStore}
              variant="ghost"
              isLabelShortened
              onClick={() => {
                activateBoardCard({ rowIndex, columnIndex });
                unfocusBoardCard();
                openRecordFromIndexView({ recordId });
              }}
              triggerEvent={triggerEvent}
            />
          )}
        </StopPropagationContainer>
      </StyledRecordChipContainer>

      {isDefined(amountFieldDefinition) &&
        isFieldCurrency(amountFieldDefinition) &&
        isFieldCurrencyValue(amountValue) &&
        isDefined(amountValue.amountMicros) && (
          <StyledAmount>
            <CurrencyDisplay
              currencyValue={amountValue}
              fieldDefinition={amountFieldDefinition}
            />
          </StyledAmount>
        )}

      {isCompactModeActive && (
        <StyledCompactIconContainer className="compact-icon-container">
          <StopPropagationContainer>
            <LightIconButton
              emphasis="subtle"
              onClick={() => {
                setRecordBoardCardIsExpanded(!recordBoardCardIsExpanded);
              }}
              aria-label={
                recordBoardCardIsExpanded ? t`Collapse card` : t`Expand card`
              }
              aria-expanded={recordBoardCardIsExpanded}
            >
              {recordBoardCardIsExpanded ? <IconEyeOff /> : <IconEye />}
            </LightIconButton>
          </StopPropagationContainer>
        </StyledCompactIconContainer>
      )}
      {!isMobile && (
        <StyledCheckboxContainer className="checkbox-container">
          <StopPropagationContainer>
            <Checkbox
              hoverable
              checked={isRecordSelected}
              onClick={(event) => {
                toggleRecordSelection({
                  recordId,
                  shouldSelectRange: event.shiftKey,
                });
              }}
              variant="outline"
            />
          </StopPropagationContainer>
        </StyledCheckboxContainer>
      )}
    </RecordCardHeaderContainer>
  );
};
