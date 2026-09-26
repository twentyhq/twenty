import { isDefined } from 'twenty-shared/utils';
import { type ChipProps, Chip } from 'twenty-ui/primitives/data-display';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

type LogConsoleObjectCellProps = {
  entry: EventLogRecord;
  color?: ChipProps['color'];
};

export const LogConsoleObjectCell = ({
  entry,
  color,
}: LogConsoleObjectCellProps) => {
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
      color={color}
      startElement={
        <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
      }
      style={{ paddingInlineStart: 0 }}
    >
      {objectMetadataItem.labelSingular}
    </Chip>
  );
};
