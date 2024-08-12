import { RecordChip } from '@/object-record/components/RecordChip';
import { useFieldFocus } from '@/object-record/record-field/hooks/useFieldFocus';
import { useRelationFromManyFieldDisplay } from '@/object-record/record-field/meta-types/hooks/useRelationFromManyFieldDisplay';
import { ExpandableList } from '@/ui/layout/expandable-list/components/ExpandableList';

export const RelationFromManyFieldDisplay = () => {
  const { fieldValue, fieldDefinition } = useRelationFromManyFieldDisplay();
  const { isFocused } = useFieldFocus();

  const relationObjectNameSingular =
    fieldDefinition?.metadata.relationObjectMetadataNameSingular;

  if (!fieldValue || !relationObjectNameSingular) {
    return null;
  }

  return (
    <ExpandableList isChipCountDisplayed={isFocused}>
      {fieldValue.map((record) => {
        return (
          <RecordChip
            key={record.id}
            objectNameSingular={relationObjectNameSingular}
            record={record}
          />
        );
      })}
    </ExpandableList>
  );
};
