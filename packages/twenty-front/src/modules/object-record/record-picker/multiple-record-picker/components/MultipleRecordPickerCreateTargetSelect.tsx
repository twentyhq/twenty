import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { Dropdown, useDropdownPage } from 'twenty-ui/components/navigation';
import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';

type MultipleRecordPickerCreateTargetSelectProps = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  disabled: boolean;
  onSelect: (objectMetadataItemId: string) => void;
};

export const MultipleRecordPickerCreateTargetSelect = ({
  objectMetadataItems,
  disabled,
  onSelect,
}: MultipleRecordPickerCreateTargetSelectProps) => {
  const { goBack } = useDropdownPage();

  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== Key.Escape || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    goBack();
  };

  return (
    <>
      <Dropdown.Header onKeyDownCapture={handleKeyDownCapture}>
        <Dropdown.Back />
        <Dropdown.Title>{t`Select a record type`}</Dropdown.Title>
      </Dropdown.Header>
      <Dropdown.Section scrollable onKeyDownCapture={handleKeyDownCapture}>
        {objectMetadataItems.map((objectMetadataItem) => (
          <Dropdown.ActionItem
            key={objectMetadataItem.id}
            startIcon={
              <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
            }
            disabled={disabled}
            closeOnClick={false}
            onClick={() => onSelect(objectMetadataItem.id)}
          >
            {objectMetadataItem.labelSingular}
          </Dropdown.ActionItem>
        ))}
      </Dropdown.Section>
    </>
  );
};
