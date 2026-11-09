import { isDefined } from 'twenty-shared/utils';

export const findByUniversalIdentifier = <TValue>({
  valueByUniversalIdentifier,
  universalIdentifier,
}: {
  valueByUniversalIdentifier:
    | Map<string, TValue>
    | Partial<Record<string, TValue>>;
  universalIdentifier: string | null | undefined;
}): TValue | undefined => {
  if (!isDefined(universalIdentifier)) {
    return undefined;
  }

  return valueByUniversalIdentifier instanceof Map
    ? valueByUniversalIdentifier.get(universalIdentifier)
    : valueByUniversalIdentifier[universalIdentifier];
};
