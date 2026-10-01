import { msg } from '@lingui/core/macro';
import { IconLock, IconUsers } from 'twenty-ui/icon';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { MetadataReadability } from '~/generated-metadata/graphql';

type ObjectReadabilityPickerProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

const OBJECT_READABILITY_OPTIONS = [
  {
    value: MetadataReadability.OPEN,
    title: msg`Visible to everyone with access`,
    description: msg`Roles decide who sees a new record. It can still be restricted one record at a time.`,
    cardMedia: <IconUsers />,
  },
  {
    value: MetadataReadability.PRIVATE,
    title: msg`Restricted to their creator`,
    description: msg`Only its creator sees a new record, until it is shared.`,
    cardMedia: <IconLock />,
  },
];

export const ObjectReadabilityPicker = ({
  objectMetadataItem,
  isReadOnly,
}: ObjectReadabilityPickerProps) => {
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleChange = (readability: MetadataReadability) => {
    void updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { readability },
    });
  };

  return (
    <SettingsRadioSettingsCard
      name="object-readability"
      onChange={handleChange}
      options={OBJECT_READABILITY_OPTIONS}
      value={objectMetadataItem.readability}
      disabled={isReadOnly}
    />
  );
};
