import { KNOWN_PARAM_NAMES } from '../constants/known-param-names';

export const isKnownParamReference = ({ name }: { name: string }): boolean => {
  const rootIdentifier = name.split('.')[0];

  return KNOWN_PARAM_NAMES.has(rootIdentifier);
};
