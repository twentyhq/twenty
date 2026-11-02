import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

// key=value pairs so Loki can aggregate queue wait per workspace / application
export const buildJobLogContext = ({
  jobData,
  queueWaitMs,
}: {
  jobData: unknown;
  queueWaitMs?: number;
}): string => {
  const fields: string[] = [];

  if (isPlainObject(jobData)) {
    if (isNonEmptyString(jobData.workspaceId)) {
      fields.push(`workspace=${jobData.workspaceId}`);
    }

    if (isNonEmptyString(jobData.applicationUniversalIdentifier)) {
      fields.push(`application=${jobData.applicationUniversalIdentifier}`);
    }
  }

  if (isDefined(queueWaitMs)) {
    fields.push(`queueWaitMs=${queueWaitMs}`);
  }

  return fields.length > 0 ? ` [${fields.join(' ')}]` : '';
};
