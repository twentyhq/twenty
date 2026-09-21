import { isNonEmptyString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

const LABEL_KEYS = ['nameSingular', 'name', 'label', 'title'] as const;

export const buildManifestEntityLabelByUniversalIdentifier = (
  manifest: Manifest,
): Record<string, string> => {
  const labelByUniversalIdentifier: Record<string, string> = {};

  const visit = (value: unknown, parentLabel: string | undefined): void => {
    if (Array.isArray(value)) {
      for (const item of value) {
        visit(item, parentLabel);
      }

      return;
    }

    if (!isPlainObject(value)) {
      return;
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

    for (const child of Object.values(value)) {
      visit(child, label);
    }
  };

  visit(manifest, undefined);

  return labelByUniversalIdentifier;
};
