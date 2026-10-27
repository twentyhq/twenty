import { isDefined } from 'twenty-shared/utils';

import { type FlatApplication } from 'src/engine/core-modules/application/types/flat-application.type';

export const findActiveFlatApplicationById = <
  TFlatApplication extends Pick<FlatApplication, 'deletedAt'>,
>(
  flatApplicationMaps: { byId: Partial<Record<string, TFlatApplication>> },
  applicationId: string,
): TFlatApplication | undefined => {
  const application = flatApplicationMaps.byId[applicationId];

  if (!isDefined(application) || isDefined(application.deletedAt)) {
    return undefined;
  }

  return application;
};
