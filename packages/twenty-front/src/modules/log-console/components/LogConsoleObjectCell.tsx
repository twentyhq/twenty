import { isDefined } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { SettingsTableTextCell } from '@/settings/components/SettingsTableTextCell';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

type LogConsoleObjectCellProps = {
  entry: EventLogRecord;
};

export const LogConsoleObjectCell = ({ entry }: LogConsoleObjectCellProps) => {
  const theme = useTheme();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );

  return (
    <SettingsTableTextCell
      startElement={
        isDefined(objectMetadataItem) ? (
          <ObjectMetadataIcon
            objectMetadataItem={objectMetadataItem}
            size={theme.icon.size.sm}
            stroke={theme.icon.stroke.sm}
          />
        ) : null
      }
      text={objectMetadataItem?.labelSingular}
    />
  );
};
