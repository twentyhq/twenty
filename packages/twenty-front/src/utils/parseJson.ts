import { isDefined } from 'twenty-shared/utils';
export const parseJson = <T>(json: string | undefined | null) => {
  if (!isDefined(json)) {
    return null;
  }

  try {
    return JSON.parse(json) as T;
  } catch (e) {
    return null;
  }
};
