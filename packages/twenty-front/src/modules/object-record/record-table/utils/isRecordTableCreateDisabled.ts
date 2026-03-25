import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';

const OBJECTS_WITHOUT_MANUAL_RECORD_CREATION: readonly CoreObjectNameSingular[] =
  [CoreObjectNameSingular.WorkflowRun, CoreObjectNameSingular.WorkflowVersion];

export const isRecordTableCreateDisabled = (
  objectMetadataItem: Pick<
    EnrichedObjectMetadataItem,
    'nameSingular' | 'isSystem'
  >,
): boolean => {
  if (objectMetadataItem.isSystem) {
    return true;
  }

  return OBJECTS_WITHOUT_MANUAL_RECORD_CREATION.includes(
    objectMetadataItem.nameSingular as CoreObjectNameSingular,
  );
};
