import { objectOptionsDropdownSearchInputComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownSearchInputComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import { useMemo } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useSearchRecordGroupField = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [recordGroupFieldSearchInput, setRecordGroupFieldSearchInput] =
    useRecoilComponentState(objectOptionsDropdownSearchInputComponentState);

  const filteredRecordGroupFieldMetadataItems = useMemo(() => {
    const searchInputLowerCase =
      recordGroupFieldSearchInput.toLocaleLowerCase();

    return objectMetadataItem.readableFields.filter(
      (field) =>
        field.type === FieldMetadataType.SELECT &&
        field.label.toLocaleLowerCase().includes(searchInputLowerCase),
    );
  }, [objectMetadataItem.readableFields, recordGroupFieldSearchInput]);

  return {
    recordGroupFieldSearchInput,
    setRecordGroupFieldSearchInput,
    filteredRecordGroupFieldMetadataItems,
  };
};
