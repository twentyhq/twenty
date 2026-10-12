import { msg } from '@lingui/core/macro';
import { IconLock, IconUsers } from 'twenty-ui/icon';

import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { ObjectSharingReach } from '~/generated-metadata/graphql';

type ObjectSharingReachPickerProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  isReadOnly: boolean;
};

const OBJECT_SHARING_REACH_OPTIONS = [
  {
    value: ObjectSharingReach.WORKSPACE,
    title: msg`Anyone in the workspace`,
    description: msg`A record can be shared with anyone, even people whose role cannot access this object. They get that record only, to view or edit.`,
    cardMedia: <IconUsers />,
  },
  {
    value: ObjectSharingReach.ROLE_ACCESS,
    title: msg`Only people who can already access these records`,
    description: msg`Sharing never goes beyond roles and their row filters. Use it for sensitive objects.`,
    cardMedia: <IconLock />,
  },
];

export const ObjectSharingReachPicker = ({
  objectMetadataItem,
  isReadOnly,
}: ObjectSharingReachPickerProps) => {
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleChange = (sharingReach: ObjectSharingReach) => {
    void updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { sharingReach },
    });
  };

  return (
    <SettingsRadioSettingsCard
      name="object-sharing-reach"
      onChange={handleChange}
      options={OBJECT_SHARING_REACH_OPTIONS}
      value={objectMetadataItem.sharingReach}
      disabled={isReadOnly}
    />
  );
};
