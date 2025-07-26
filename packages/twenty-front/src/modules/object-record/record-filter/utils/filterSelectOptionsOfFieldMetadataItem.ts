import { FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

export const filterSelectOptionsOfFieldMetadataItem = ({
  fieldMetadataItem,
  filterValue,
}: {
  fieldMetadataItem: FieldMetadataItem;
  filterValue: string;
}) => {
  const selectOptions = fieldMetadataItem.options;

  const foundCorrespondingSelectOptions = selectOptions?.filter(
    (selectOption) =>
      selectOption.value
        .toLocaleLowerCase()
        .includes(filterValue.toLocaleLowerCase()) ||
      selectOption.label
        .toLocaleLowerCase()
        .includes(filterValue.toLocaleLowerCase()),
  );

  return {
    foundCorrespondingSelectOptions,
  };
};
