import { isNonEmptyString } from '@sniptt/guards';

const SAVED_SECRET_VALUE_PLACEHOLDER = '********';

export const getOptimisticApplicationVariableValue = ({
  value,
  isSecret,
}: {
  value: string;
  isSecret: boolean;
}): string =>
  isSecret && isNonEmptyString(value) ? SAVED_SECRET_VALUE_PLACEHOLDER : value;
