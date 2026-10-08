import { RecordShowPageResourceEffect } from '@/object-record/record-show/components/RecordShowPageResourceEffect';
import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';

type RecordShowResourceLoaderProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowResourceLoader = ({
  objectNameSingular,
  recordId,
}: RecordShowResourceLoaderProps) => {
  const { loading, record } = useRecordShowPageResource({
    objectNameSingular,
    recordId,
  });

  return (
    <RecordShowPageResourceEffect
      loading={loading}
      record={record}
      recordId={recordId}
    />
  );
};
