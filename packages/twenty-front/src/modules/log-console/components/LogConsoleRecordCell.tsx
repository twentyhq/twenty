import { isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

const RECORD_ID_DISPLAYED_LENGTH = 8;

type LogConsoleRecordCellProps = {
  entry: EventLogRecord;
};

export const LogConsoleRecordCell = ({ entry }: LogConsoleRecordCellProps) => {
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );
  const recordSnapshot = entry.properties?.after ?? entry.properties?.before;

  if (isDefined(objectMetadataItem) && isDefined(recordSnapshot)) {
    return (
      <RecordChip
        objectNameSingular={objectMetadataItem.nameSingular}
        record={recordSnapshot}
        forceDisableClick
      />
    );
  }

  const displayedRecordId = entry.recordId?.slice(
    0,
    RECORD_ID_DISPLAYED_LENGTH,
  );

  return (
    <Chip
      startElement={
        <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
      }
      style={{ paddingInlineStart: 0 }}
    >
      {isDefined(objectMetadataItem)
        ? `${objectMetadataItem.labelSingular} ${displayedRecordId}`
        : displayedRecordId}
    </Chip>
  );
};
