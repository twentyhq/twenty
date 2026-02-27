import { ALLOWED_PARAMETERS_IN_SHOULD_BE_REGISTERED } from '../constants/allowed-parameters-in-should-be-registered';

export const isAllowedParameterInShouldBeRegistered = ({
  name,
}: {
  name: string;
}): boolean => {
  const rootIdentifier = name.split('.')[0];

  return ALLOWED_PARAMETERS_IN_SHOULD_BE_REGISTERED.has(rootIdentifier);
};
