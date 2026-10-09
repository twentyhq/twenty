import { stop } from 'esbuild';
import { isString } from '@sniptt/guards';
import { isPlainObject } from 'twenty-shared/utils';

import { parseAppExport } from '@/app/parse-app-export';
import { pullApplication } from '@/app/pull/pull-application';
import { type PullAppOptions } from '@/app/pull/types';

export const pullSource = async (
  options: Omit<PullAppOptions, 'applicationExport'> & {
    applicationExport: unknown;
  },
) => {
  try {
    const exported = options.applicationExport;

    const universalIdentifier =
      isPlainObject(exported) &&
      isPlainObject(exported.application) &&
      isString(exported.application.universalIdentifier)
        ? exported.application.universalIdentifier
        : '';

    return await pullApplication({
      ...options,
      applicationExport: parseAppExport({
        value: exported,
        universalIdentifier,
      }),
    });
  } finally {
    await stop();
  }
};
