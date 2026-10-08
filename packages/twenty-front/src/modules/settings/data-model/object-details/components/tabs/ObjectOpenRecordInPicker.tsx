import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRadioSettingsCard } from '@/settings/components/SettingsRadioSettingsCard';
import { OpenRecordInCardMedia } from '@/settings/experience/components/OpenRecordInCardMedia';
import { msg } from '@lingui/core/macro';
import { ObjectOpenRecordIn } from 'twenty-shared/types';

type ObjectOpenRecordInPickerProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

const objectOpenRecordInOptions = [
  {
    value: ObjectOpenRecordIn.USER_CHOICE,
    title: msg`Member preference`,
    description: msg`Let each member decide for themselves`,
    cardMedia: <OpenRecordInCardMedia type="member-preference" />,
  },
  {
    value: ObjectOpenRecordIn.SIDE_PANEL,
    title: msg`Side panel`,
    description: msg`Open records alongside the current page`,
    cardMedia: <OpenRecordInCardMedia type="side-panel" />,
  },
  {
    value: ObjectOpenRecordIn.RECORD_PAGE,
    title: msg`Full page`,
    description: msg`Open records on a dedicated page`,
    cardMedia: <OpenRecordInCardMedia type="full-page" />,
  },
];

export const ObjectOpenRecordInPicker = ({
  objectMetadataItem,
}: ObjectOpenRecordInPickerProps) => {
  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleChange = (openRecordIn: ObjectOpenRecordIn) => {
    void updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { openRecordIn },
    });
  };

  return (
    <SettingsRadioSettingsCard
      name="object-open-record-in"
      onChange={handleChange}
      options={objectOpenRecordInOptions}
      value={objectMetadataItem.openRecordIn}
    />
  );
};
