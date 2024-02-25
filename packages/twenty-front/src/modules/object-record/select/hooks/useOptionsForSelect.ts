import { useParams } from 'react-router-dom';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectNameSingularFromPlural } from '@/object-metadata/hooks/useObjectNameSingularFromPlural';
import { OrderBy } from '@/object-metadata/types/OrderBy';

import { SelectableOption } from '../types/SelectableOption';

export const DEFAULT_SEARCH_REQUEST_LIMIT = 60;

export const useOptionsForSelect = ({
  searchFilterText,
  selectedValues,
  fieldMetaDataId,
}: {
  searchFilterText: string;
  sortOrder?: OrderBy;
  selectedValues: string[];
  limit?: number;
  excludeEntityIds?: string[];
  fieldMetaDataId: string;
}) => {
  const objectNamePlural = useParams().objectNamePlural ?? '';

  const { objectNameSingular } = useObjectNameSingularFromPlural({
    objectNamePlural,
  });

  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });

  const fieldMetadataItem = objectMetadataItem.fields.find(
    (field) => field.id === fieldMetaDataId,
  );

  const filteredSelectedOptionsData =
    fieldMetadataItem?.options?.filter((option) => {
      return selectedValues.indexOf(option.value) !== -1;
    }) || [];

  const selectedOptionsData =
    fieldMetadataItem?.options?.filter((option) => {
      return selectedValues.indexOf(option.value) !== -1;
    }) || [];

  const optionsToSelectData =
    fieldMetadataItem?.options?.filter((option) => {
      return (
        selectedValues.indexOf(option.value) === -1 &&
        option.label.includes(searchFilterText)
      );
    }) || [];

  return {
    filteredSelectedOptions: filteredSelectedOptionsData.map((record) => ({
      ...record,
      isSelected: true,
    })) as SelectableOption[],
    selectedOptions: selectedOptionsData.map((record) => ({
      ...record,
      isSelected: true,
    })) as SelectableOption[],
    optionsToSelect: optionsToSelectData.map((record) => ({
      ...record,
      isSelected: false,
    })) as SelectableOption[],
  };
};
