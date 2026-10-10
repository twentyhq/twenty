export const shouldDisplayVariable = ({
  isDeprecated,
  hasValue,
}: {
  isDeprecated: boolean;
  hasValue: boolean;
}): boolean => !isDeprecated || hasValue;
