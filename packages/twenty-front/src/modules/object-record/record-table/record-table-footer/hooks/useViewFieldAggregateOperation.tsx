import { RecordTableColumnAggregateFooterDropdownContext } from '@/object-record/record-table/record-table-footer/components/RecordTableColumnAggregateFooterDropdownContext';
import { viewFieldAggregateOperationState } from '@/object-record/record-table/record-table-footer/states/viewFieldAggregateOperationState';
import { type ExtendedAggregateOperations } from '@/object-record/record-table/types/ExtendedAggregateOperations';
import { convertExtendedAggregateOperationToAggregateOperation } from '@/object-record/utils/convertExtendedAggregateOperationToAggregateOperation';
import { RecordTableWidgetContext } from '@/object-record/record-table-widget/contexts/RecordTableWidgetContext';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { updateRecordTableWidgetViewFieldAggregateOperation } from '@/page-layout/widgets/record-table/utils/updateRecordTableWidgetViewFieldAggregateOperation';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { usePerformViewFieldAPIPersist } from '@/views/hooks/internal/usePerformViewFieldAPIPersist';
import { useGetCurrentViewOnly } from '@/views/hooks/useGetCurrentViewOnly';
import { useStore } from 'jotai';
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

  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    recordTableWidgetContext?.pageLayoutId ??
      MISSING_RECORD_TABLE_WIDGET_PAGE_LAYOUT_ID,
  );

  const draftSnapshot =
    recordTableWidgetContext === null
      ? undefined
      : recordTableWidgetViewDraft[recordTableWidgetContext.widgetId];

  const currentViewForAggregateOperation =
    recordTableWidgetContext !== null &&
    recordTableWidgetContext.isPageLayoutInEditMode === true &&
    draftSnapshot !== undefined
      ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
      : currentView;

  const currentViewField = currentViewForAggregateOperation?.viewFields?.find(
    (viewField) => viewField.fieldMetadataId === fieldMetadataId,
  );

  const { performViewFieldAPIUpdate } = usePerformViewFieldAPIPersist();
  const store = useStore();

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
      recordTableWidgetContext !== null &&
      recordTableWidgetContext.isPageLayoutInEditMode === true &&
      draftSnapshot !== undefined
    ) {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[recordTableWidgetContext.widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        const updatedWidgetViewDraft =
          updateRecordTableWidgetViewFieldAggregateOperation({
            snapshot: widgetViewDraft,
            viewFieldId: currentViewField.id,
            aggregateOperation: aggregateOperationForPersistence,
          });

        if (updatedWidgetViewDraft === widgetViewDraft) {
          return prev;
        }

        return {
          ...prev,
          [recordTableWidgetContext.widgetId]: updatedWidgetViewDraft,
        };
      });

      store.set(
        viewFieldAggregateOperationState.atomFamily({
          viewFieldId: currentViewField.id,
        }),
        aggregateOperation,
      );

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
