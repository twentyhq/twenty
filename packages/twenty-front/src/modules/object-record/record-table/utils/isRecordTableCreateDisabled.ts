import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const OBJECTS_WITHOUT_MANUAL_RECORD_CREATION: readonly CoreObjectNameSingular[] =
  [CoreObjectNameSingular.WorkflowRun, CoreObjectNameSingular.WorkflowVersion];

export const isRecordTableCreateDisabled = (
  objectMetadataItem: Pick<ObjectMetadataItem, 'nameSingular' | 'isSystem'>,
): boolean => {
  if (objectMetadataItem.isSystem) {
    return true;
  }

  return OBJECTS_WITHOUT_MANUAL_RECORD_CREATION.includes(
    objectMetadataItem.nameSingular as CoreObjectNameSingular,
  );
};
