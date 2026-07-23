import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useRecordTableWidgetFieldUpdate } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldUpdate';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

const MISSING_RECORD_TABLE_WIDGET_PAGE_LAYOUT_ID =
  '__missing_record_table_widget_page_layout__';

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

  const shouldUseRecordTableWidgetDraft =
    isDefined(recordTableWidgetContext) &&
    recordTableWidgetContext.isPageLayoutInEditMode &&
    isDefined(draftSnapshot);

  const currentViewForAggregateOperation = shouldUseRecordTableWidgetDraft
    ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
    : currentView;

  const currentViewField = currentViewForAggregateOperation?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  );

  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();

  const { handleFieldUpdated: handleRecordTableWidgetFieldUpdated } =
    useRecordTableWidgetFieldUpdate({
      pageLayoutId:
        recordTableWidgetContext?.pageLayoutId ??
        MISSING_RECORD_TABLE_WIDGET_PAGE_LAYOUT_ID,
      widgetId: recordTableWidgetContext?.widgetId ?? '',
    });

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

    if (shouldUseRecordTableWidgetDraft) {
      handleRecordTableWidgetFieldUpdated(currentViewField.id, {
        aggregateOperation: aggregateOperationForPersistence,
      });
      return;
    }

    await performViewFieldAPIUpdate([
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
