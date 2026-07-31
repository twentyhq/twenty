import { useUpdateOneObjectMetadataItem } from '@/object-metadata/hooks/useUpdateOneObjectMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useOpenRecordInDestinationOptions } from '@/settings/experience/hooks/useOpenRecordInDestinationOptions';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { ObjectOpenRecordIn } from 'twenty-shared/types';
import { IconUserCog } from 'twenty-ui/icon';

type ObjectOpenRecordInSelectProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
};

export const ObjectOpenRecordInSelect = ({
  objectMetadataItem,
}: ObjectOpenRecordInSelectProps) => {
  const { t } = useLingui();

  const { updateOneObjectMetadataItem } = useUpdateOneObjectMetadataItem();

  const destinationOptions = useOpenRecordInDestinationOptions({
    sidePanelValue: ObjectOpenRecordIn.SIDE_PANEL,
    recordPageValue: ObjectOpenRecordIn.RECORD_PAGE,
  });

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
        ...destinationOptions,
      ]}
      onChange={handleChange}
    />
  );
};
