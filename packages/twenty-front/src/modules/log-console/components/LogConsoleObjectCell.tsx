import { isDefined } from 'twenty-shared/utils';
import { Chip } from 'twenty-ui/primitives/data-display';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

type LogConsoleObjectCellProps = {
  entry: EventLogRecord;
};

export const LogConsoleObjectCell = ({ entry }: LogConsoleObjectCellProps) => {
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  return (
    <Chip
      startElement={
        <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
      }
      style={{ paddingInlineStart: 0 }}
    >
      {objectMetadataItem.labelSingular}
    </Chip>
  );
};
