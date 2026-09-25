import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useId } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { Pill } from 'twenty-ui/primitives/data-display';
import { Text } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme';

import { EventFieldDiffContainer } from '@/activities/timeline-activities/rows/main-object/components/EventFieldDiffContainer';
import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { getLogConsoleRecordChangeFieldDiffs } from '@/log-console/utils/getLogConsoleRecordChangeFieldDiffs';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type EventLogRecord } from '~/generated-metadata/graphql';

const StyledSummary = styled(Text)`
  color: ${themeCssVariables.font.color.tertiary};
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

  if (isDefined(summary)) {
    return <StyledSummary truncate>{t(summary)}</StyledSummary>;
  }

  if (!isDefined(objectMetadataItem)) {
    return null;
  }

  const fieldDiffs = getLogConsoleRecordChangeFieldDiffs({
    entry,
    objectMetadataItem,
  });

  const [firstFieldDiff, ...otherFieldDiffs] = fieldDiffs;

  if (!isDefined(firstFieldDiff)) {
    return null;
  }

  return (
    <>
      <EventFieldDiffContainer
        mainObjectMetadataItem={objectMetadataItem}
        diffKey={firstFieldDiff.key}
        fieldDiff={firstFieldDiff}
        eventId={diffId}
      />
      {otherFieldDiffs.length > 0 && (
        <Pill label={`+${otherFieldDiffs.length}`} />
      )}
    </>
  );
};
