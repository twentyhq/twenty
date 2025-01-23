import { useGetStandardObjectIcon } from '@/object-metadata/hooks/useGetStandardObjectIcon';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { useRecordChipData } from '@/object-record/hooks/useRecordChipData';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useTheme } from '@emotion/react';
import { Avatar } from 'twenty-ui';

export const CommandMenuContextRecordChipAvatars = ({
  objectMetadataItem,
  record,
}: {
  objectMetadataItem: ObjectMetadataItem;
  record: ObjectRecord;
}) => {
  const { recordChipData } = useRecordChipData({
    objectNameSingular: objectMetadataItem.nameSingular,
    record,
  });

  const { Icon, IconColor } = useGetStandardObjectIcon(
    objectMetadataItem.nameSingular,
  );

  const theme = useTheme();

  return (
    <>
      {Icon ? (
        <Icon color={IconColor} size={theme.icon.size.sm} />
      ) : (
        <Avatar
          avatarUrl={recordChipData.avatarUrl}
          placeholderColorSeed={recordChipData.recordId}
          placeholder={recordChipData.name}
          type={recordChipData.avatarType}
          size="sm"
        />
      )}
    </>
  );
};
