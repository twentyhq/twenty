import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { ObjectOpenRecordIn } from 'twenty-shared/types';
import {
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconUserCog,
} from 'twenty-ui/icon';

type ObjectOpenRecordInSelectProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectOpenRecordInSelect = ({
  objectMetadataItem,
}: ObjectOpenRecordInSelectProps) => {
  const { t } = useLingui();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleChange = async (openRecordIn: ObjectOpenRecordIn) => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { openRecordIn },
    });
  };

  return (
    <Select
      dropdownId="object-open-record-in-select"
      dropdownWidth={218}
      dropdownWidthAuto
      fullWidth
      value={objectMetadataItem.openRecordIn}
      options={[
        {
          label: t`Member preference`,
          value: ObjectOpenRecordIn.USER_CHOICE,
          Icon: IconUserCog,
        },
        {
          label: t`Side Panel`,
          value: ObjectOpenRecordIn.SIDE_PANEL,
          Icon: IconLayoutSidebarRight,
        },
        {
          label: t`Record Page`,
          value: ObjectOpenRecordIn.RECORD_PAGE,
          Icon: IconLayoutNavbar,
        },
      ]}
      onChange={handleChange}
    />
  );
};
