import { isNonEmptyString } from '@sniptt/guards';

type BuildAttributeCacheKeyInput = {
  name: string;
  namespace?: string | null;
};

export const buildAttributeCacheKey = ({
  name,
  namespace,
}: BuildAttributeCacheKeyInput): string =>
  isNonEmptyString(namespace) ? `${namespace}|${name}` : name;
