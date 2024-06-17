import { ObjectMetadataItemsRelationPickerEffect } from '@/object-metadata/components/ObjectMetadataItemsRelationPickerEffect';
import { MultiRecordsEffect } from '@/object-record/record-field/meta-types/input/components/MultiRecordsEffect';
import { useUpdateRelationManyFieldInput } from '@/object-record/record-field/meta-types/input/hooks/useUpdateRelationManyFieldInput';
import { FieldInputEvent } from '@/object-record/record-field/types/FieldInputEvent';
import { MultiRecordSelect } from '@/object-record/relation-picker/components/MultiRecordSelect';
import { RelationPickerScope } from '@/object-record/relation-picker/scopes/RelationPickerScope';

export type RelationManyFieldInputProps = {
  onSubmit?: FieldInputEvent;
};

export const RelationManyFieldInput = ({
  onSubmit,
}: RelationManyFieldInputProps) => {
  // const { fieldDefinition } = useRelationField<EntityForSelect[]>();
  // const relationPickerScopeId = getScopeIdFromComponentId(
  //   `relation-picker-${fieldDefinition.fieldMetadataId}`,
  // );
  // const { relationPickerSearchFilter } = useRelationPickerEntitiesOptions({
  //   relationObjectNameSingular:
  //     fieldDefinition.metadata.relationObjectMetadataNameSingular,
  //   relationPickerScopeId,
  // });

  // const { setRelationPickerSearchFilter } = useRelationPicker({
  //   relationPickerScopeId,
  // });

  const { handleChange } = useUpdateRelationManyFieldInput();

  const handleSubmit = () => {
    onSubmit?.(() => {}); // we persist at change not at submit
  };
  console.log('RelationManyFieldInput rerender');

  // const { objectMetadataItem } = useObjectMetadataItem({
  //   objectNameSingular:
  //     fieldDefinition.metadata.relationObjectMetadataNameSingular,
  // });

  // const allRecords = useMemo(
  //   () => [
  //     ...entities.entitiesToSelect.map((entity) => {
  //       const { record, ...recordIdentifier } = entity;
  //       return {
  //         objectMetadataItem: objectMetadataItem,
  //         record: record,
  //         recordIdentifier: recordIdentifier,
  //       };
  //     }),
  //   ],
  //   [entities.entitiesToSelect, objectMetadataItem],
  // );

  // const setObjectRecordsMultiSelect = useSetRecoilState(
  //   objectRecordsMultiSelectState,
  // );

  // useEffect(() => {
  //   setObjectRecordsMultiSelect(allRecords);
  // }, [allRecords, setObjectRecordsMultiSelect]);

  return (
    <>
      <RelationPickerScope relationPickerScopeId={'relation-picker-test-aaa'}>
        <ObjectMetadataItemsRelationPickerEffect
        // relationPickerScopeId={relationPickerScopeId}
        />
        <MultiRecordsEffect />
        {
          // TO DO Move allrecords fetching logic to MultiRecordsEffect}
        }
        <MultiRecordSelect
          // selectedObjectRecordsIds={selectedRecordsIds}
          loading={false}
          // searchFilter={relationPickerSearchFilter}
          // setSearchFilter={setRelationPickerSearchFilter}
          onSubmit={handleSubmit}
          onChange={handleChange}
        />
      </RelationPickerScope>
    </>
  );
};
