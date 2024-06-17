import { useRecoilCallback } from 'recoil';

import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useRelationField } from '@/object-record/record-field/meta-types/hooks/useRelationField';
import { FieldRelationManyValue } from '@/object-record/record-field/types/FieldMetadata';
import { isDefined } from '~/utils/isDefined';

export const useUpdateRelationManyFieldInput = () => {
  const { fieldDefinition, entityId } =
    useRelationField<FieldRelationManyValue>();

  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  const fieldName = fieldDefinition.metadata.targetFieldMetadataName;

  const handleChange = useRecoilCallback(
    ({ snapshot }) =>
      (objectRecordId: string, isSelected: boolean) => {
        // const entityToAddOrRemove = entities.entitiesToSelect.find(
        //   (entity) => entity.id === objectRecordId,
        // );
        // const currentRecord = snapshot
        //   .getLoadable(objectRecordMultiSelectFamilyState(objectRecordId))
        //   .getValue();

        // const updatedFieldValue = isSelected
        //   ? [...(fieldValue ?? []), currentRecord]
        //   : (fieldValue ?? []).filter(
        //       (value: any) => value.id !== objectRecordId,
        //     );
        // setFieldValue(
        //   updatedFieldValue.filter((value: any) =>
        //     isDefined(value),
        //   ) as EntityForSelect[],
        // );
        if (isDefined(objectRecordId)) {
          updateOneRecord({
            idToUpdate: objectRecordId,
            updateOneRecordInput: {
              [`${fieldName}Id`]: isSelected ? entityId : null,
            },
          });
        }
      },
    [entityId, fieldName, updateOneRecord],
  );

  return { handleChange };
};
