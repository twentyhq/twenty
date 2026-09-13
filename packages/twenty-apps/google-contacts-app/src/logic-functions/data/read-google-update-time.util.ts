import { isNonEmptyString } from '@sniptt/guards';

import { type Person } from 'src/logic-functions/types/google-response.type';

export const readGoogleUpdateTime = (person: Person): string | undefined =>
  (person.metadata?.sources ?? [])
    .map((source) => source.updateTime)
    .filter(isNonEmptyString)
    .reduce<string | undefined>(
      (latest, updateTime) =>
        !isNonEmptyString(latest) || Date.parse(updateTime) > Date.parse(latest)
          ? updateTime
          : latest,
      undefined,
    );
