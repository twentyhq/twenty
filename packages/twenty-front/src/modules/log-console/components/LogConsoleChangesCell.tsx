import { styled } from '@linaria/react';
import { plural } from '@lingui/core/macro';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { EventFieldDiffContainer } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffContainer';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { getLogConsoleRecordChangeFieldDiffs } from '@/log-console/utils/getLogConsoleRecordChangeFieldDiffs';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

const StyledOtherFieldDiffCount = styled.span`
  flex-shrink: 0;
`;

type LogConsoleChangesCellProps = {
  entry: EventLogRecord;
};

export const LogConsoleChangesCell = ({
  entry,
}: LogConsoleChangesCellProps) => {
  const { t } = useLingui();
  const diffId = useId();
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const summary = LOG_CONSOLE_RECORD_ACTIONS[entry.event]?.summary;
  const objectMetadataItem = objectMetadataItemsByIdMap.get(
    entry.objectMetadataId ?? '',
  );

  const fieldDiffs =
    isDefined(summary) || !isDefined(objectMetadataItem)
      ? []
      : getLogConsoleRecordChangeFieldDiffs({ entry, objectMetadataItem });

  const [firstFieldDiff, ...otherFieldDiffs] = fieldDiffs;

  return (
    <TableCell
      gap={themeCssVariables.spacing[2]}
      overflow="hidden"
      whiteSpace="nowrap"
    >
      {isDefined(summary) && <Text truncate>{t(summary)}</Text>}
      {isDefined(objectMetadataItem) && isDefined(firstFieldDiff) && (
        <EventFieldDiffContainer
          mainObjectMetadataItem={objectMetadataItem}
          diffKey={firstFieldDiff.key}
          fieldDiff={firstFieldDiff}
          eventId={diffId}
        />
      )}
      {otherFieldDiffs.length > 0 && (
        <StyledOtherFieldDiffCount>
          {plural(otherFieldDiffs.length, {
            one: 'and # more',
            other: 'and # more',
          })}
        </StyledOtherFieldDiffCount>
      )}
    </TableCell>
  );
};
