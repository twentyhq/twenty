import { isNonEmptyString } from '@sniptt/guards';

export const getNavigationMenuBuiltInSectionLabel = ({
  name,
  defaultLabel,
}: {
  name: string | null | undefined;
  defaultLabel: string;
}) => {
  const trimmedName = name?.trim();

  return isNonEmptyString(trimmedName) ? trimmedName : defaultLabel;
};
