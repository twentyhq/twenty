import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { ViewOpenRecordIn } from 'twenty-shared/types';
import {
  IconLayoutNavbar,
  IconLayoutSidebarRight,
  IconUserCog,
} from 'twenty-ui/icon';

type ObjectDefaultOpenRecordInSelectProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectDefaultOpenRecordInSelect = ({
  objectMetadataItem,
}: ObjectDefaultOpenRecordInSelectProps) => {
  const { t } = useLingui();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const handleChange = async (defaultOpenRecordIn: ViewOpenRecordIn) => {
    await updateOneObjectMetadataItem({
      idToUpdate: objectMetadataItem.id,
      updatePayload: { defaultOpenRecordIn },
    });
  };

  return (
    <Select
      dropdownId="object-default-open-record-in-select"
      dropdownWidth={218}
      dropdownWidthAuto
      fullWidth
      value={objectMetadataItem.defaultOpenRecordIn}
      options={[
        {
          label: t`My preference`,
          value: ViewOpenRecordIn.USER_PREFERENCE,
          Icon: IconUserCog,
        },
        {
          label: t`Side Panel`,
          value: ViewOpenRecordIn.SIDE_PANEL,
          Icon: IconLayoutSidebarRight,
        },
        {
          label: t`Record Page`,
          value: ViewOpenRecordIn.RECORD_PAGE,
          Icon: IconLayoutNavbar,
        },
      ]}
      onChange={handleChange}
    />
  );
};
