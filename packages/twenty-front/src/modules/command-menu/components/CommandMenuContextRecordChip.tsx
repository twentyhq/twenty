import { CommandMenuContextChip } from '@/command-menu/components/CommandMenuContextChip';
import { CommandMenuContextRecordChipAvatars } from '@/command-menu/components/CommandMenuContextRecordChipAvatars';
import { useFindManyRecordsSelectedInContextStore } from '@/context-store/hooks/useFindManyRecordsSelectedInContextStore';
import { useObjectMetadataItemById } from '@/object-metadata/hooks/useObjectMetadataItemById';
import { getObjectRecordIdentifier } from '@/object-metadata/utils/getObjectRecordIdentifier';
import { useMemo } from 'react';
import { capitalize } from 'twenty-shared';

export const CommandMenuContextRecordChip = ({
  objectMetadataItemId,
}: {
  objectMetadataItemId: string;
}) => {
  const { objectMetadataItem } = useObjectMetadataItemById({
    objectId: objectMetadataItemId,
  });

  const { records, loading, totalCount } =
    useFindManyRecordsSelectedInContextStore({
      limit: 3,
    });

  const Avatars = useMemo(
    () =>
      records.map((record) => (
        <CommandMenuContextRecordChipAvatars
          objectMetadataItem={objectMetadataItem}
          key={record.id}
          record={record}
        />
      )),
    [records, objectMetadataItem],
  );

  if (loading || !totalCount) {
    return null;
  }

  const text =
    totalCount === 1
      ? getObjectRecordIdentifier({ objectMetadataItem, record: records[0] })
          .name
      : `${totalCount} ${capitalize(objectMetadataItem.namePlural)}`;

  return <CommandMenuContextChip text={text} Icons={Avatars} />;
};
