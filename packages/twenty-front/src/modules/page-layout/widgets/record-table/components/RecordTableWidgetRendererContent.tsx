import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { StandaloneRecordTable } from '@/object-record/record-table-standalone/components/StandaloneRecordTable';
import { StandaloneRecordTableProvider } from '@/object-record/record-table-standalone/components/StandaloneRecordTableProvider';

type RecordTableWidgetRendererContentProps = {
  objectMetadataId: string;
  viewId: string;
  widgetId: string;
};

export const RecordTableWidgetRendererContent = ({
  objectMetadataId,
  viewId,
  widgetId,
}: RecordTableWidgetRendererContentProps) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataId,
  });

  return (
    <StandaloneRecordTableProvider
      objectNameSingular={objectMetadataItem.nameSingular}
      viewId={viewId}
      widgetId={widgetId}
    >
      <StandaloneRecordTable />
    </StandaloneRecordTableProvider>
  );
};
