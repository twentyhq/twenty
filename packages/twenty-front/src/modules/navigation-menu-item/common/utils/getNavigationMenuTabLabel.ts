import { isNonEmptyString } from '@sniptt/guards';

export const getNavigationMenuTabLabel = ({
  name,
  fallbackLabel,
}: {
  name: string | null | undefined;
  fallbackLabel: string;
}) => (isNonEmptyString(name) ? name : fallbackLabel);
