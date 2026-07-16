import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordBoardWidget } from '@/object-record/record-board-widget/components/RecordBoardWidget';
import { RecordTableWidget } from '@/object-record/record-table-widget/components/RecordTableWidget';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { useIsPageLayoutInEditMode } from '@/page-layout/hooks/useIsPageLayoutInEditMode';
import { recordTableWidgetViewDraftByWidgetIdComponentFamilySelector } from '@/page-layout/states/selectors/recordTableWidgetViewDraftByWidgetIdComponentFamilySelector';
import { RecordTableWidgetViewDraftInitEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect';
import { constructViewFromRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/constructViewFromRecordTableWidgetViewSnapshot';
import { useAtomComponentFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorValue';
import { useViewById } from '@/views/hooks/useViewById';
import { getViewLayoutFromViewType, isDefined } from 'twenty-shared/utils';
import { ViewType } from '~/generated-metadata/graphql';

type RecordTableWidgetRendererContentProps = {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
  isReadOnly?: boolean;
  isEmptyStateHidden?: boolean;
  recordLimit?: number;
  instanceIdSuffix?: string;
};

export const RecordTableWidgetRendererContent = ({
  objectMetadataId,
  viewId,
  widgetId,
  isReadOnly = true,
  isEmptyStateHidden = false,
  recordLimit,
  instanceIdSuffix,
}: RecordTableWidgetRendererContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  const isPageLayoutInEditMode = useIsPageLayoutInEditMode();

  const draftSnapshot = useAtomComponentFamilySelectorValue(
    recordTableWidgetViewDraftByWidgetIdComponentFamilySelector,
    { widgetId },
  );

  const { view: persistedView } = useViewById(viewId);

  const widgetView =
    isPageLayoutInEditMode && isDefined(draftSnapshot)
      ? constructViewFromRecordTableWidgetViewSnapshot(draftSnapshot)
      : persistedView;

  const widgetViewLayout = getViewLayoutFromViewType(
    widgetView?.type ?? ViewType.TABLE_WIDGET,
  );

  const isKanbanLayout = widgetViewLayout === ViewType.KANBAN;

  return (
    <>
      <RecordTableWidgetViewDraftInitEffect
        widgetId={widgetId}
        viewId={viewId}
      />
      <RecordTableWidgetProvider
        objectNameSingular={objectMetadataItem.nameSingular}
        viewId={viewId}
        widgetId={widgetId}
        recordLimit={recordLimit}
        instanceIdSuffix={instanceIdSuffix}
        contextStoreViewType={
          isKanbanLayout
            ? ContextStoreViewType.Kanban
            : ContextStoreViewType.Table
        }
      >
        {isKanbanLayout ? (
          <RecordBoardWidget isReadOnly={isReadOnly} />
        ) : (
          <RecordTableWidget
            isReadOnly={isReadOnly}
            isEmptyStateHidden={isEmptyStateHidden}
          />
        )}
      </RecordTableWidgetProvider>
    </>
  );
};
