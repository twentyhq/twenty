import { useContext } from 'react';
import { EntityChip, EntityChipVariant } from 'twenty-ui';

import { useMapToObjectRecordIdentifier } from '@/object-metadata/hooks/useMapToObjectRecordIdentifier';
import { RecordTableRowContext } from '@/object-record/record-table/contexts/RecordTableRowContext';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getImageAbsoluteURIOrBase64 } from '~/utils/image/getImageAbsoluteURIOrBase64';

export type RecordChipProps = {
  objectNameSingular: string;
  record: ObjectRecord;
  maxWidth?: number;
  className?: string;
  variant?: EntityChipVariant;
};

export const RecordChip = ({
  objectNameSingular,
  record,
  maxWidth,
  className,
  variant,
}: RecordChipProps) => {
  const { mapToObjectRecordIdentifier } = useMapToObjectRecordIdentifier({
    objectNameSingular,
  });

  // Will only exists if the chip is inside a record table.
  // This is temporary until we have the show page for remote objects.
  const { isReadOnly } = useContext(RecordTableRowContext);

  const objectRecordIdentifier = mapToObjectRecordIdentifier(record);

  const linkToEntity = isReadOnly
    ? undefined
    : objectRecordIdentifier.linkToShowPage;

  return (
    <EntityChip
      entityId={record.id}
      name={objectRecordIdentifier.name}
      avatarType={objectRecordIdentifier.avatarType}
      avatarUrl={
        getImageAbsoluteURIOrBase64(objectRecordIdentifier.avatarUrl) || ''
      }
      linkToEntity={linkToEntity}
      maxWidth={maxWidth}
      className={className}
      variant={variant}
    />
  );
};
