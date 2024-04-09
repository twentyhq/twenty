import * as React from 'react';

import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { EntityChip } from '@/ui/display/chip/components/EntityChip';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  maxWidth?: number;
  className?: string;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  maxWidth,
  className,
}: RecordChipProps) => {
  const { mapToObjectRecordIdentifier } = useMapToObjectRecordIdentifier({
    objectNameSingular,
  });

  const objectRecordIdentifier = mapToObjectRecordIdentifier(record);

  return (
    <EntityChip
      entityId={record.id}
      name={objectRecordIdentifier.name}
      avatarType={objectRecordIdentifier.avatarType}
      avatarUrl={objectRecordIdentifier.avatarUrl}
      linkToEntity={objectRecordIdentifier.linkToShowPage}
      maxWidth={maxWidth}
      className={className}
    />
  );
};
