export const shouldHideDeprecatedVariable = ({
  isDeprecated,
  hasValue,
}: {
  isDeprecated?: boolean | null;
  hasValue: boolean;
}): boolean => isDeprecated === true && !hasValue;
