import * as React from 'react';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { EntityChip } from '@/ui/display/chip/components/EntityChip';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
};

export const RecordChip = ({ objectNameSingular, record }: RecordChipProps) => {
  const { mapToObjectRecordIdentifier } = useObjectMetadataItem({
    objectNameSingular,
  });

  const objectRecordIdentifier = mapToObjectRecordIdentifier(record);

  return (
    <EntityChip
      entityId={record.id}
      name={objectRecordIdentifier.name}
      avatarType={objectRecordIdentifier.avatarType}
      avatarUrl={objectRecordIdentifier.avatarUrl ?? undefined}
      linkToEntity={objectRecordIdentifier.linkToShowPage}
    />
  );
};
