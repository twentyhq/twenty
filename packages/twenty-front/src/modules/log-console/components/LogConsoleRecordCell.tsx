import { isDefined } from 'twenty-shared/utils';
import { Chip, type ChipProps } from 'twenty-ui/primitives/data-display';

import { getLogConsoleRecordLabel } from '@/log-console/utils/getLogConsoleRecordLabel';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { RecordChip } from '@/object-record/components/RecordChip';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

type LogConsoleRecordCellProps = {
  entry: EventLogRecord;
  color?: ChipProps['color'];
};

export const LogConsoleRecordCell = ({
  entry,
  color,
}: LogConsoleRecordCellProps) => {
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
        color={color}
        forceDisableClick
      />
    );
  }

  return (
    <Chip
      color={color}
      startElement={
        <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
      }
      style={{ paddingInlineStart: 0 }}
    >
      {getLogConsoleRecordLabel({ entry, objectMetadataItem })}
    </Chip>
  );
};
