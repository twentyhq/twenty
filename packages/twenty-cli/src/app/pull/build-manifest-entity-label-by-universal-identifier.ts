import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const LABEL_KEYS = ['nameSingular', 'name', 'label', 'title'] as const;

export const buildManifestEntityLabelByUniversalIdentifier = (
  manifest: Record<string, unknown>,
): Record<string, string> => {
  const labelByUniversalIdentifier: Record<string, string> = {};

  const pending: { value: unknown; parentLabel?: string }[] = [
    { value: manifest },
  ];

  while (pending.length > 0) {
    const entry = pending.pop();

    if (!isDefined(entry)) {
      break;
    }

    const { value, parentLabel } = entry;

    if (Array.isArray(value)) {
      for (const item of [...value].reverse()) {
        pending.push({ value: item, parentLabel });
      }

      continue;
    }

    if (!isPlainObject(value)) {
      continue;
    }

    const ownLabel = LABEL_KEYS.map((key) => value[key]).find(isNonEmptyString);
    const label =
      isDefined(ownLabel) && isDefined(parentLabel)
        ? `${parentLabel}.${ownLabel}`
        : (ownLabel ?? parentLabel);

    if (
      isDefined(ownLabel) &&
      isDefined(label) &&
      isNonEmptyString(value.universalIdentifier)
    ) {
      labelByUniversalIdentifier[value.universalIdentifier] = label;
    }

    for (const child of Object.values(value).reverse()) {
      pending.push({ value: child, parentLabel: label });
    }
  }

  return labelByUniversalIdentifier;
};
