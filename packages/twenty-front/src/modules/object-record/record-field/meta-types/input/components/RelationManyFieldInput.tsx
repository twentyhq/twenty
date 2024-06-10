import { useMemo } from 'react';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useInlineCell } from '@/object-record/record-inline-cell/hooks/useInlineCell';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { isDefined } from '~/utils/isDefined';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationManyFieldInput = ({
  relationPickerScopeId = 'relation-picker',
}: {
  relationPickerScopeId?: string;
}) => {
  const { fieldDefinition, fieldValue, entityId, setFieldValue } =
    useRelationField<EntityForSelect[]>();

  const { closeInlineCell: closeEditableField } = useInlineCell();

  const { setRelationPickerSearchFilter } = useRelationPicker({
    relationPickerScopeId,
  });

  const { entities, relationPickerSearchFilter } =
    useRelationPickerEntitiesOptions({
      relationObjectNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationPickerScopeId,
    });
  const { updateOneRecord } = useUpdateOneRecord({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });

  if (!fieldDefinition.metadata.targetFieldMetadataName) {
    throw new Error('Missing target field');
  }

  const { objectMetadataItem } = useObjectMetadataItem({
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

  const allRecords = useMemo(
    () => [
      ...entities.entitiesToSelect.map((entity) => {
        return {
          objectMetadataItem: objectMetadataItem,
          record: entity.record,
          recordIdentifier: {
            id: entity.id,
            name: entity.name,
            avatarUrl: entity.avatarUrl,
            avatarType: entity.avatarType,
            linkToShowPage: entity.linkToShowPage,
          },
        };
      }),
    ],
    [entities.entitiesToSelect, objectMetadataItem],
  );

  const selectedRecords = useMemo(
    () =>
      allRecords.filter(
        (entity) =>
          fieldValue?.some((f) => {
            return f.id === entity.recordIdentifier.id;
          }),
      ),
    [allRecords, fieldValue],
  );

  return (
    <>
      <ObjectMetadataItemsRelationPickerEffect
        relationPickerScopeId={relationPickerScopeId}
      />
      <MultiRecordSelect
        allRecords={allRecords}
        selectedObjectRecords={selectedRecords}
        loading={entities.loading}
        searchFilter={relationPickerSearchFilter}
        setSearchFilter={setRelationPickerSearchFilter}
        onSubmit={() => {
          closeEditableField();
        }}
        onChange={handleChange}
      />
    </>
  );
};
