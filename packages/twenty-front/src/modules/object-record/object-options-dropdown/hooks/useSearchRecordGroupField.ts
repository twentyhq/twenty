import { objectOptionsDropdownSearchInputComponentState } from '@/object-record/object-options-dropdown/states/objectOptionsDropdownSearchInputComponentState';
import { useRecordIndexContextOrThrow } from '@/object-record/record-index/contexts/RecordIndexContext';
import { useRecoilComponentStateV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentStateV2';
import { useMemo } from 'react';
import { FieldMetadataType } from '~/generated-metadata/graphql';

export const useSearchRecordGroupField = () => {
  const { objectMetadataItem } = useRecordIndexContextOrThrow();

  const [recordGroupFieldSearchInput, setRecordGroupFieldSearchInput] =
    useRecoilComponentStateV2(objectOptionsDropdownSearchInputComponentState);

  const filteredRecordGroupFieldMetadataItems = useMemo(() => {
    const searchInputLowerCase =
      recordGroupFieldSearchInput.toLocaleLowerCase();

    return objectMetadataItem.fields.filter(
      (field) =>
        field.type === FieldMetadataType.Select &&
        field.label.toLocaleLowerCase().includes(searchInputLowerCase),
    );
  }, [objectMetadataItem.fields, recordGroupFieldSearchInput]);

  return {
    recordGroupFieldSearchInput,
    setRecordGroupFieldSearchInput,
    filteredRecordGroupFieldMetadataItems,
  };
};
