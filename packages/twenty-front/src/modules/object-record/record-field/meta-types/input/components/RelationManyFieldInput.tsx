import { useMemo } from 'react';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateRelationManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationManyFieldInput';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { ObjectRecordForSelect } from '@/object-record/relation-picker/hooks/useMultiObjectSearch';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { getScopeIdFromComponentId } from '@/ui/utilities/recoil-scope/utils/getScopeIdFromComponentId';

import { useRelationField } from '../../hooks/useRelationField';

export type RelationManyFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const RelationManyFieldInput = ({
  onSubmit,
}: RelationManyFieldInputProps) => {
  const { fieldDefinition, fieldValue } = useRelationField<EntityForSelect[]>();
  const relationPickerScopeId = getScopeIdFromComponentId(
    `relation-picker-${fieldDefinition.fieldMetadataId}`,
  );
  const { entities, relationPickerSearchFilter } =
    useRelationPickerEntitiesOptions({
      relationObjectNameSingular:
        fieldDefinition.metadata.relationObjectMetadataNameSingular,
      relationPickerScopeId,
    });

  const { setRelationPickerSearchFilter } = useRelationPicker({
    relationPickerScopeId,
  });

  const { handleChange } = useUpdateRelationManyFieldInput({ entities });

  const handleSubmit = (_obj: ObjectRecordForSelect[]) => {
    onSubmit?.(() => {}); // we persist at change not at submit
  };

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular:
      fieldDefinition.metadata.relationObjectMetadataNameSingular,
  });
  const allRecords = useMemo(
    () => [
      ...entities.entitiesToSelect.map((entity) => {
        const { record, ...recordIdentifier } = entity;
        return {
          objectMetadataItem: objectMetadataItem,
          record: record,
          recordIdentifier: recordIdentifier,
        };
      }),
    ],
    [entities.entitiesToSelect, objectMetadataItem],
  );

  const selectedRecords = useMemo(
    () =>
      allRecords.filter(
        (entity) =>
          fieldValue?.some((value: any) => {
            return value.id === entity.recordIdentifier.id;
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
        onSubmit={handleSubmit}
        onChange={handleChange}
      />
    </>
  );
};
