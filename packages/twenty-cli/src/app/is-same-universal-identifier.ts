import { isString } from '@sniptt/guards';

export const isSameUniversalIdentifier = ({
  value,
  universalIdentifier,
}: {
  value: unknown;
  universalIdentifier: string;
}) =>
  isString(value) && value.toLowerCase() === universalIdentifier.toLowerCase();
