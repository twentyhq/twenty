import { useRecordShowPageResource } from '@/object-record/record-show/hooks/useRecordShowPageResource';

type RecordShowEffectProps = {
  objectNameSingular: string;
  recordId: string;
};

export const RecordShowEffect = ({
  objectNameSingular,
  recordId,
}: RecordShowEffectProps) => {
  useRecordShowPageResource({
    objectNameSingular,
    recordId,
  });

  return <></>;
};
