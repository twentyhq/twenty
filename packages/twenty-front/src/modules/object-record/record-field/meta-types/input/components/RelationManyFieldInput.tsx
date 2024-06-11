import { useMemo } from 'react';

import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useUpdateRelationManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationManyFieldInput';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { useRelationPicker } from '@/object-record/relation-picker/hooks/useRelationPicker';
import { useRelationPickerEntitiesOptions } from '@/object-record/relation-picker/hooks/useRelationPickerEntitiesOptions';
import { EntityForSelect } from '@/object-record/relation-picker/types/EntityForSelect';
import { isDefined } from '~/utils/isDefined';

import { useRelationField } from '../../hooks/useRelationField';

export const RelationManyFieldInput = ({
  relationPickerScopeId = 'relation-picker',
  onCancel,
}: {
  relationPickerScopeId?: string;
  onCancel?: () => void;
}) => {
  const { fieldDefinition, fieldValue } = useRelationField<EntityForSelect[]>();
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
          if (isDefined(onCancel)) {
            onCancel();
          }
        }}
        onChange={handleChange}
      />
    </>
  );
};
