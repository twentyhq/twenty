import { isDefined } from 'twenty-shared/utils';

import { type InboxThreadRecord } from '@/ai/types/InboxThreadRecord';
import { type InboxThreadStatusScope } from '@/ai/types/InboxThreadStatusScope';
import { type InboxThreadTriageStatus } from '@/ai/types/InboxThreadTriageStatus';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

export const getInboxThreadDetailsStatusAccess = ({
  thread,
  permissions,
  triageStatus,
  scope,
  isInChannel,
}: {
  thread: Pick<InboxThreadRecord, 'deletedAt'> | null;
  permissions: Pick<RecordPermissionsDto, 'canRead' | 'canUpdate'> | undefined;
  triageStatus: InboxThreadTriageStatus | undefined;
  scope: InboxThreadStatusScope | undefined;
  isInChannel: boolean;
}) => {
  const isThreadAvailable =
    isDefined(thread) &&
    !isDefined(thread.deletedAt) &&
    (permissions?.canRead ?? false);

  if (!isThreadAvailable || !isDefined(triageStatus)) {
    return { status: undefined, canChangeStatus: false };
  }

  return {
    status: triageStatus,
    canChangeStatus:
      isDefined(scope) && (!isInChannel || (permissions?.canUpdate ?? false)),
  };
};
