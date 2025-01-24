import { FieldActorValue } from '@/object-record/record-field/types/FieldMetadata';
import { RecordFilterDefinition } from '@/object-record/record-filter/types/RecordFilterDefinition';

export const isActorSourceCompositeFilter = (
  filterDefinition: Pick<RecordFilterDefinition, 'compositeFieldName'>,
) => {
  return (
    filterDefinition.compositeFieldName ===
    ('source' satisfies keyof FieldActorValue)
  );
};
