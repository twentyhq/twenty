export type RecordPickerPickableMorphItem = {
  recordId: string;
  objectMetadataId: string;
  isSelected: boolean;
  isMatchingSearchFilter: boolean;
};

export type RecordPickerOnChange = (
  morphItem: RecordPickerPickableMorphItem,
) => void | Promise<void>;
