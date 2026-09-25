import { t } from '@lingui/core/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { LOG_CONSOLE_RECORD_ACTIONS } from '@/log-console/constants/LogConsoleRecordActions';
import { type FieldActorValue } from '@/object-record/record-field/ui/types/FieldMetadata';
import { type EventLogRecord } from '~/generated-metadata/graphql';

export const getLogConsoleRecordChangeActor = (
  entry: EventLogRecord,
): Partial<FieldActorValue> | undefined => {
  const actorFieldName =
    LOG_CONSOLE_RECORD_ACTIONS[entry.event]?.actorFieldName;

  const snapshotActor = isDefined(actorFieldName)
    ? entry.properties?.after?.[actorFieldName]
    : undefined;

  if (isNonEmptyString(snapshotActor?.name)) {
    return snapshotActor;
  }

  if (isNonEmptyString(entry.userId)) {
    return undefined;
  }

  return { source: 'SYSTEM', name: t`System` };
};
