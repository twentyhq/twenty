import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import { Dropdown } from 'twenty-ui/components/navigation';

type MultipleRecordPickerCreateTargetSelectProps = {
  objectMetadataItems: EnrichedObjectMetadataItem[];
  disabled: boolean;
  onSelect: (objectMetadataItemId: string) => void;
};

export const MultipleRecordPickerCreateTargetSelect = ({
  objectMetadataItems,
  disabled,
  onSelect,
}: MultipleRecordPickerCreateTargetSelectProps) => (
  <>
    <Dropdown.Header>
      <Dropdown.Back />
      <Dropdown.Title>{t`Select a record type`}</Dropdown.Title>
    </Dropdown.Header>
    <Dropdown.Section scrollable>
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
