import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { RecordTableWidget } from '@/object-record/record-table-widget/components/RecordTableWidget';
import { RecordTableWidgetProvider } from '@/object-record/record-table-widget/components/RecordTableWidgetProvider';
import { RecordTableWidgetViewDraftInitEffect } from '@/page-layout/widgets/record-table/components/RecordTableWidgetViewDraftInitEffect';

type RecordTableWidgetRendererContentProps = {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
  areCellsEditable?: boolean;
};

export const RecordTableWidgetRendererContent = ({
  objectMetadataId,
  viewId,
  widgetId,
  areCellsEditable = false,
}: RecordTableWidgetRendererContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

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
      >
        <RecordTableWidget areCellsEditable={areCellsEditable} />
      </RecordTableWidgetProvider>
    </>
  );
};
