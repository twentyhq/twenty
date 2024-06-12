import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { EntitiesForMultipleEntitySelect } from '@/object-record/relation-picker/types/EntitiesForMultipleEntitySelect';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { isDefined } from '~/utils/isDefined';

export const useUpdateRelationManyFieldInput = ({
  entities,
}: {
  entities: EntitiesForMultipleEntitySelect<EntityForSelect>;
}) => {
  const { fieldDefinition, fieldValue, setFieldValue, entityId } =
    useRelationField<EntityForSelect[]>();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const fieldName = fieldDefinition.metadata.targetFieldMetadataName;

  const handleChange = (
    objectRecord: ObjectRecordForSelect | null,
    isSelected: boolean,
  ) => {
    const entityToAddOrRemove = entities.entitiesToSelect.find(
      (entity) => entity.id === objectRecord?.recordIdentifier.id,
    );

    const updatedFieldValue = isSelected
      ? [...(fieldValue ?? []), entityToAddOrRemove]
      : (fieldValue ?? []).filter(
          (value) => value.id !== objectRecord?.recordIdentifier.id,
        );
    setFieldValue(
      updatedFieldValue.filter((value) =>
        isDefined(value),
      ) as EntityForSelect[],
    );
    if (isDefined(objectRecord)) {
      updateOneRecord({
        idToUpdate: objectRecord.record?.id,
        updateOneRecordInput: {
          [`${fieldName}Id`]: isSelected ? entityId : null,
        },
      });
    }
  };

  return { handleChange };
};
