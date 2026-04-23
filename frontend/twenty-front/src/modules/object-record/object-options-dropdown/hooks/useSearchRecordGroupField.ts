import { objectOptionsDropdownSearchInputComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownSearchInputComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useAtomComponentState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentState';
import { useMemo } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useSearchRecordGroupField = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [
    objectOptionsDropdownSearchInput,
    setObjectOptionsDropdownSearchInput,
  ] = useAtomComponentState(objectOptionsDropdownSearchInputComponentState);

  const filteredRecordGroupFieldMetadataItems = useMemo(() => {
    const searchInputLowerCase =
      objectOptionsDropdownSearchInput.toLocaleLowerCase();

    return objectMetadataItem.readableFields.filter(
      (field) =>
        field.type === FieldMetadataType.SELECT &&
        field.isActive &&
        field.label.toLocaleLowerCase().includes(searchInputLowerCase),
    );
  }, [objectMetadataItem.readableFields, objectOptionsDropdownSearchInput]);

  return {
    recordGroupFieldSearchInput: objectOptionsDropdownSearchInput,
    setRecordGroupFieldSearchInput: setObjectOptionsDropdownSearchInput,
    filteredRecordGroupFieldMetadataItems,
  };
};
