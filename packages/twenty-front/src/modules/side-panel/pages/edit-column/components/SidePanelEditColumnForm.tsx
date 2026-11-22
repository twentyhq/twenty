import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { AdvancedFilterSidePanelContainer } from '@/object-record/advanced-filter/side-panel/components/AdvancedFilterSidePanelContainer';
import { getLookupTargetFieldMetadataItems } from '@/object-record/record-column-lookup/utils/getLookupTargetFieldMetadataItems';
import { getRecordFieldColumnHeader } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnHeader';
import { getRecordFieldSummary } from '@/object-record/record-column-summary/utils/getRecordFieldSummary';
import { getSummaryAggregateOperationLabel } from '@/object-record/record-column-summary/utils/getSummaryAggregateOperationLabel';
import { getSummaryAggregateOperationOptions } from '@/object-record/record-column-summary/utils/getSummaryAggregateOperationOptions';
import { getSummaryFieldMetadataItemIdForOperation } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItemIdForOperation';
import { getSummaryFieldMetadataItems } from '@/object-record/record-column-summary/utils/getSummaryFieldMetadataItems';
import { getSummaryRelationScope } from '@/object-record/record-column-summary/utils/getSummaryRelationScope';
import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { useSaveScopedRelationColumn } from '@/object-record/record-column-scope/hooks/useSaveScopedRelationColumn';
import { type ScopedRelationJunction } from '@/object-record/record-column-scope/types/ScopedRelationJunction';
import { getRelationScopeFieldMetadataItems } from '@/object-record/record-column-scope/utils/getRelationScopeFieldMetadataItems';
import { getRelationScopeFromRecordFiltersAndSorts } from '@/object-record/record-column-scope/utils/getRelationScopeFromRecordFiltersAndSorts';
import { getRelationScopeToSave } from '@/object-record/record-column-scope/utils/getRelationScopeToSave';
import { currentRecordFilterGroupsComponentState } from '@/object-record/record-filter-group/states/currentRecordFilterGroupsComponentState';
import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { SIDE_PANEL_FOCUS_ID } from '@/side-panel/constants/SidePanelFocusId';
import { useSidePanelHistory } from '@/side-panel/hooks/useSidePanelHistory';
import { RecordTableSettingsSortsContent } from '@/side-panel/pages/page-layout/components/record-table-settings/RecordTableSettingsSortsContent';
import { SidePanelEditColumnHeader } from '@/side-panel/pages/edit-column/components/SidePanelEditColumnHeader';
import { type EditColumnKind } from '@/side-panel/pages/edit-column/types/EditColumnKind';
import { SidePanelPageComponentInstanceContext } from '@/side-panel/states/contexts/SidePanelPageComponentInstanceContext';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { Select } from '@/ui/input/components/Select';
import { TextInput } from '@/ui/input/components/TextInput';
import { SidePanelFooter } from '@/ui/layout/side-panel/components/SidePanelFooter';
import { currentFocusIdSelector } from '@/ui/utilities/focus/states/currentFocusIdSelector';
import { useHotkeysOnFocusedElement } from '@/ui/utilities/hotkey/hooks/useHotkeysOnFocusedElement';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useStore } from 'jotai';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { QUERY_MAX_RECORDS_FROM_RELATION } from 'twenty-shared/constants';
import { type ViewFieldRelationScope } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconCheck } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button, Field } from 'twenty-ui/primitives/input';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  outline: none;
`;

const StyledContent = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  min-height: 0;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing[4]};
`;

type SidePanelEditColumnFormProps = {
  recordTableId: string;
  fieldMetadataItem: FieldMetadataItem;
  relationObjectMetadataItem: EnrichedObjectMetadataItem;
  scopedRelationJunction?: ScopedRelationJunction;
  recordFieldId?: string;
  storedRelationScope?: ViewFieldRelationScope | null;
  storedRelationTargetFieldMetadataId?: string | null;
  storedLabel?: string | null;
  storedRelationAggregateOperation?: AggregateOperations | null;
  kind: EditColumnKind;
};

export const SidePanelEditColumnForm = ({
  recordTableId,
  fieldMetadataItem,
  relationObjectMetadataItem,
  scopedRelationJunction,
  recordFieldId,
  storedRelationScope,
  storedRelationTargetFieldMetadataId,
  storedLabel,
  storedRelationAggregateOperation,
  kind,
}: SidePanelEditColumnFormProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const store = useStore();
  const currentFocusId = useAtomStateValue(currentFocusIdSelector);
  const { goBackFromSidePanel, removePageFromSidePanelHistory } =
    useSidePanelHistory();
  const { saveScopedRelationColumn } =
    useSaveScopedRelationColumn(recordTableId);

  const sidePanelPageId = useAvailableComponentInstanceIdOrThrow(
    SidePanelPageComponentInstanceContext,
  );

  const currentRecordFilters = useAtomComponentStateCallbackState(
    currentRecordFiltersComponentState,
  );
  const currentRecordFilterGroups = useAtomComponentStateCallbackState(
    currentRecordFilterGroupsComponentState,
  );
  const currentRecordSorts = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
  );

  const isJunctionRelation = isDefined(scopedRelationJunction);
  const isSummary = kind === 'summary';

  const [limitInput, setLimitInput] = useState(
    storedRelationScope?.limit?.toString() ?? '',
  );
  // The target records of a join object are two hops away, too far for a column to show one of their fields
  const [relationTargetFieldMetadataId, setRelationTargetFieldMetadataId] =
    useState(
      isJunctionRelation ? null : (storedRelationTargetFieldMetadataId ?? null),
    );
  const [label, setLabel] = useState(storedLabel ?? null);
  const [aggregateOperation, setAggregateOperation] = useState(
    storedRelationAggregateOperation ?? AggregateOperations.COUNT,
  );
  const [isSaving, setIsSaving] = useState(false);

  const trimmedLimitInput = limitInput.trim();
  const limit = trimmedLimitInput === '' ? null : Number(trimmedLimitInput);
  const isLimitValid =
    !isDefined(limit) ||
    (Number.isInteger(limit) &&
      limit >= 1 &&
      limit <= QUERY_MAX_RECORDS_FROM_RELATION);

  const lookupTargetFieldMetadataItems = getLookupTargetFieldMetadataItems(
    relationObjectMetadataItem,
  );
  const selectedLookupTargetFieldMetadataItem =
    lookupTargetFieldMetadataItems.find(
      ({ id }) => id === relationTargetFieldMetadataId,
    );

  const summaryFieldMetadataItems = getSummaryFieldMetadataItems({
    relationObjectMetadataItem,
    aggregateOperation,
  });

  const summary = isSummary
    ? getRecordFieldSummary({
        recordField: {
          relationAggregateOperation: aggregateOperation,
          relationTargetFieldMetadataId,
        },
        relationObjectMetadataItem,
      })
    : undefined;

  const columnHeader = getRecordFieldColumnHeader({
    fieldMetadataItem,
    lookupTarget:
      !isSummary && isDefined(selectedLookupTargetFieldMetadataItem)
        ? {
            lookupTargetFieldMetadataItem:
              selectedLookupTargetFieldMetadataItem,
          }
        : undefined,
    isScopedRelationColumn: true,
    summary,
    customLabel: undefined,
  });

  const defaultColumnLabel =
    isSummary && !isDefined(summary)
      ? `${fieldMetadataItem.label} · ${t`Summary`}`
      : columnHeader.label;

  const canSave = isSummary ? isDefined(summary) : isLimitValid;

  const handleAggregateOperationChange = (
    selectedAggregateOperation: AggregateOperations,
  ) => {
    setAggregateOperation(selectedAggregateOperation);
    setRelationTargetFieldMetadataId(
      getSummaryFieldMetadataItemIdForOperation({
        aggregateOperation: selectedAggregateOperation,
        relationTargetFieldMetadataId,
        summaryFieldMetadataItems: getSummaryFieldMetadataItems({
          relationObjectMetadataItem,
          aggregateOperation: selectedAggregateOperation,
        }),
      }),
    );
  };

  const handleSaveClick = async () => {
    if (!canSave || isSaving) {
      return;
    }

    setIsSaving(true);

    const relationScope = getRelationScopeToSave({
      editedRelationScope: getRelationScopeFromRecordFiltersAndSorts({
        recordFilters: store.get(currentRecordFilters),
        recordFilterGroups: store.get(currentRecordFilterGroups),
        recordSorts: isSummary ? [] : store.get(currentRecordSorts),
        limit: isSummary ? null : limit,
      }),
      storedRelationScope,
      scopedRelationJunction,
    });

    const isSaved = await saveScopedRelationColumn({
      fieldMetadataItemId: fieldMetadataItem.id,
      recordFieldId,
      relationScope: isSummary
        ? getSummaryRelationScope(relationScope)
        : relationScope,
      relationTargetFieldMetadataId,
      relationAggregateOperation: isSummary ? aggregateOperation : null,
      label,
    });

    if (!isSaved) {
      setIsSaving(false);
      return;
    }

    // Another page may have been opened on top of this one while saving
    removePageFromSidePanelHistory(sidePanelPageId);
  };

  const containerRef = useHotkeysOnFocusedElement({
    keys: [`${Key.Meta}+${Key.Enter}`, `${Key.Control}+${Key.Enter}`],
    focusId: currentFocusId ?? SIDE_PANEL_FOCUS_ID,
    callback: handleSaveClick,
    dependencies: [currentFocusId, handleSaveClick],
  });

  const ColumnIcon = getIcon(columnHeader.icon);

  return (
    <StyledContainer ref={containerRef} tabIndex={-1}>
      <SidePanelEditColumnHeader
        instanceId={`edit-column-label-${sidePanelPageId}`}
        icon={
          <ColumnIcon size={theme.icon.size.md} stroke={theme.icon.stroke.sm} />
        }
        defaultLabel={defaultColumnLabel}
        label={label}
        onLabelChange={setLabel}
      />
      <StyledContent>
        {!isJunctionRelation && !isSummary && (
          <FormFieldInputContainer>
            <Field.Label>{t`Show`}</Field.Label>
            <Select
              dropdownId={`edit-column-show-${sidePanelPageId}`}
              fullWidth
              value={relationTargetFieldMetadataId}
              pinnedOption={{
                Icon: getIcon(relationObjectMetadataItem.icon),
                label: relationObjectMetadataItem.labelPlural,
                value: null,
              }}
              options={lookupTargetFieldMetadataItems.map(
                (lookupTargetFieldMetadataItem) => ({
                  Icon: getIcon(lookupTargetFieldMetadataItem.icon),
                  label: lookupTargetFieldMetadataItem.label,
                  value: lookupTargetFieldMetadataItem.id,
                }),
              )}
              onChange={setRelationTargetFieldMetadataId}
              withSearchInput
            />
          </FormFieldInputContainer>
        )}
        <FormFieldInputContainer>
          <Field.Label>{t`Filter`}</Field.Label>
          <AdvancedFilterSidePanelContainer
            objectMetadataItem={
              scopedRelationJunction?.targetObjectMetadataItem ??
              relationObjectMetadataItem
            }
            isWorkflowFindRecords={false}
            shouldHideRelationFields={isJunctionRelation}
          />
        </FormFieldInputContainer>
        {isSummary ? (
          <>
            <FormFieldInputContainer>
              <Field.Label>{t`Operation`}</Field.Label>
              <Select
                dropdownId={`edit-column-operation-${sidePanelPageId}`}
                fullWidth
                value={aggregateOperation}
                options={getSummaryAggregateOperationOptions({
                  relationObjectMetadataItem,
                  isJunctionRelation,
                }).map((aggregateOperationOption) => ({
                  label: getSummaryAggregateOperationLabel(
                    aggregateOperationOption,
                  ),
                  value: aggregateOperationOption,
                }))}
                onChange={handleAggregateOperationChange}
              />
            </FormFieldInputContainer>
            {aggregateOperation !== AggregateOperations.COUNT && (
              <FormFieldInputContainer>
                <Field.Label>{t`Field`}</Field.Label>
                <Select
                  dropdownId={`edit-column-summary-field-${sidePanelPageId}`}
                  fullWidth
                  value={relationTargetFieldMetadataId}
                  options={summaryFieldMetadataItems.map(
                    (summaryFieldMetadataItem) => ({
                      Icon: getIcon(summaryFieldMetadataItem.icon),
                      label: summaryFieldMetadataItem.label,
                      value: summaryFieldMetadataItem.id,
                    }),
                  )}
                  onChange={setRelationTargetFieldMetadataId}
                  withSearchInput
                />
              </FormFieldInputContainer>
            )}
          </>
        ) : (
          <>
            <FormFieldInputContainer>
              <Field.Label>{t`Sort`}</Field.Label>
              <RecordTableSettingsSortsContent
                objectMetadataItem={{
                  fields: getRelationScopeFieldMetadataItems({
                    relationObjectMetadataItem,
                    scopedRelationJunction,
                  }),
                }}
              />
            </FormFieldInputContainer>
            <TextInput
              label={t`Limit`}
              type="number"
              value={limitInput}
              error={
                isLimitValid
                  ? undefined
                  : t`Enter a number between 1 and ${QUERY_MAX_RECORDS_FROM_RELATION}`
              }
              onChange={setLimitInput}
              placeholder={String(QUERY_MAX_RECORDS_FROM_RELATION)}
              fullWidth
            />
          </>
        )}
      </StyledContent>
      <SidePanelFooter
        actions={[
          <Button
            key="cancel"
            size="sm"
            onClick={goBackFromSidePanel}
          >{t`Cancel`}</Button>,
          <Button
            key="save-column"
            startIcon={<IconCheck />}
            size="sm"
            onClick={handleSaveClick}
            disabled={!canSave}
            loading={isSaving}
            shortcut={['Mod', 'Enter']}
            variant="solid"
            color="accent"
          >{t`Save`}</Button>,
        ]}
      />
    </StyledContainer>
  );
};
