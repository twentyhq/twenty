import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { MISSING_RECORD_TABLE_WIDGET_PAGE_LAYOUT_ID } from '@/object-record/record-table-widget/constants/MissingRecordTableWidgetPageLayoutId';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { getViewPersistTarget } from '@/object-record/record-table-widget/utils/getViewPersistTarget';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { usePerformViewFieldApiPersist } from '@/views/hooks/internal/usePerformViewFieldApiPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useViewFieldAggregateOperation = () => {
  const { fieldMetadataId } = useContext(
    RecordTableColumnAggregateFooterDropdownContext,
  );
  const { currentView } = useGetCurrentViewOnly();
  const recordTableWidgetContext = useContext(RecordTableWidgetContext);

  const recordTableWidgetViewDraft = useAtomComponentStateValue(
    recordTableWidgetViewDraftComponentState,
    recordTableWidgetContext?.pageLayoutId ??
      MISSING_RECORD_TABLE_WIDGET_PAGE_LAYOUT_ID,
  );

  const draftSnapshot = !isDefined(recordTableWidgetContext)
    ? undefined
    : recordTableWidgetViewDraft[recordTableWidgetContext.widgetId];

  const persistTarget = getViewPersistTarget(recordTableWidgetContext);

  const shouldUseRecordTableWidgetDraft =
    persistTarget.target === 'pageLayoutDraft' && isDefined(draftSnapshot);

  const currentViewForAggregateOperation = shouldUseRecordTableWidgetDraft
    ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
    : currentView;

  const currentViewField = currentViewForAggregateOperation?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  );

  const { performViewFieldApiUpdate } = usePerformViewFieldApiPersist();

  const updateViewFieldAggregateOperation = async (
    aggregateOperation: ExtendedAggregateOperations | null,
  ) => {
    if (!currentViewField) {
      throw new Error('ViewField not found');
    }

    const aggregateOperationForPersistence =
      aggregateOperation === null
        ? null
        : convertExtendedAggregateOperationToAggregateOperation(
            aggregateOperation,
          );

    if (
      persistTarget.target === 'pageLayoutDraft' &&
      shouldUseRecordTableWidgetDraft
    ) {
      persistTarget.widgetContext.updateViewDraftField(currentViewField.id, {
        aggregateOperation: aggregateOperationForPersistence,
      });
      return;
    }

    if (persistTarget.target !== 'api') {
      return;
    }

    await performViewFieldApiUpdate([
      {
        input: {
          id: currentViewField.id,
          update: {
            isVisible: currentViewField.isVisible,
            position: currentViewField.position,
            size: currentViewField.size,
            aggregateOperation: aggregateOperationForPersistence,
          },
        },
      },
    ]);
  };

  const viewFieldAggregateOperation = useAtomFamilyStateValue(
    viewFieldAggregateOperationState,
    { viewFieldId: currentViewField?.id ?? '' },
  );

  return {
    updateViewFieldAggregateOperation,
    currentViewFieldAggregateOperation: viewFieldAggregateOperation,
  };
};
