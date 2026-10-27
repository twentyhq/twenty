import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';
import { type KeyboardEvent } from 'react';
import { Key } from 'ts-key-enum';

type MultipleRecordPickerCreateTargetSelectProps = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  disabled: boolean;
  onBack: () => void;
  onSelect: (objectMetadataItemId: string) => void;
};

export const MultipleRecordPickerCreateTargetSelect = ({
  objectMetadataItems,
  disabled,
  onBack,
  onSelect,
}: MultipleRecordPickerCreateTargetSelectProps) => {
  const handleKeyDownCapture = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== Key.Escape || event.nativeEvent.isComposing) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    onBack();
  };

  return (
    <>
      <Dropdown.Header onKeyDownCapture={handleKeyDownCapture}>
        <Dropdown.Back
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        />
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
