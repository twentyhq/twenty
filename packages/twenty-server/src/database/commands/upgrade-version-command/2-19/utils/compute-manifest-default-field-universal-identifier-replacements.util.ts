import {
  getFieldUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { capitalize } from 'twenty-shared/utils';
import { v5 } from 'uuid';

// Namespace the SDK used before default field universal identifiers were
// aligned with getFieldUniversalIdentifier.
const LEGACY_SDK_UNIVERSAL_IDENTIFIER_NAMESPACE =
  '142046f0-4d80-48b5-ad56-26ad410e895c';

// Field names the SDK auto-injects on every object manifest.
const SDK_DEFAULT_FIELD_NAMES = [
  'id',
  'name',
  'createdAt',
  'updatedAt',
  'deletedAt',
  'createdBy',
  'updatedBy',
  'position',
  'searchVector',
] as const;

const SDK_DEFAULT_RELATION_CONFIGS = [
  { fieldName: 'timelineActivities', standardObjectKey: 'timelineActivity' },
  { fieldName: 'attachments', standardObjectKey: 'attachment' },
  { fieldName: 'noteTargets', standardObjectKey: 'noteTarget' },
  { fieldName: 'taskTargets', standardObjectKey: 'taskTarget' },
] as const satisfies {
  fieldName: string;
  standardObjectKey: keyof typeof STANDARD_OBJECTS;
}[];

const computeLegacySdkDefaultFieldUniversalIdentifier = ({
  objectUniversalIdentifier,
  fieldName,
}: {
  objectUniversalIdentifier: string;
  fieldName: string;
}) =>
  v5(
    `${objectUniversalIdentifier}-${fieldName}`,
    LEGACY_SDK_UNIVERSAL_IDENTIFIER_NAMESPACE,
  );

export type UniversalIdentifierReplacement = {
  legacyUniversalIdentifier: string;
  deterministicUniversalIdentifier: string;
};

// Computes, for every SDK auto-generated default field of a stored manifest,
// the pair (legacy derivation value, new deterministic derivation value).
// Author-provided universal identifiers never equal the legacy derivation so
// they are naturally excluded when replacements are applied by exact match.
export const computeManifestDefaultFieldUniversalIdentifierReplacements = (
  manifest: Manifest,
): UniversalIdentifierReplacement[] => {
  const applicationUniversalIdentifier =
    manifest.application?.universalIdentifier;

  if (!applicationUniversalIdentifier) {
    return [];
  }

  const replacements: UniversalIdentifierReplacement[] = [];

  for (const objectManifest of manifest.objects ?? []) {
    const objectUniversalIdentifier = objectManifest.universalIdentifier;

    if (!objectUniversalIdentifier) {
      continue;
    }

    for (const fieldName of [
      ...SDK_DEFAULT_FIELD_NAMES,
      ...SDK_DEFAULT_RELATION_CONFIGS.map(({ fieldName }) => fieldName),
    ]) {
      replacements.push({
        legacyUniversalIdentifier:
          computeLegacySdkDefaultFieldUniversalIdentifier({
            objectUniversalIdentifier,
            fieldName,
          }),
        deterministicUniversalIdentifier: getFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier,
          name: fieldName,
        }),
      });
    }

    // Reverse default relation fields live on the standard relation objects;
    // the legacy derivation used the custom object universal identifier with
    // an "Inverse" suffix while the new one uses the standard object
    // universal identifier and the reverse field name.
    for (const {
      fieldName,
      standardObjectKey,
    } of SDK_DEFAULT_RELATION_CONFIGS) {
      replacements.push({
        legacyUniversalIdentifier:
          computeLegacySdkDefaultFieldUniversalIdentifier({
            objectUniversalIdentifier,
            fieldName: `${fieldName}Inverse`,
          }),
        deterministicUniversalIdentifier: getFieldUniversalIdentifier({
          applicationUniversalIdentifier,
          objectUniversalIdentifier:
            STANDARD_OBJECTS[standardObjectKey].universalIdentifier,
          name: `target${capitalize(objectManifest.nameSingular)}`,
        }),
      });
    }
  }

  return replacements;
};

export const applyUniversalIdentifierReplacements = ({
  manifest,
  replacements,
}: {
  manifest: Manifest;
  replacements: UniversalIdentifierReplacement[];
}): { updatedManifest: Manifest; appliedReplacementCount: number } => {
  let serializedManifest = JSON.stringify(manifest);
  let appliedReplacementCount = 0;

  for (const {
    legacyUniversalIdentifier,
    deterministicUniversalIdentifier,
  } of replacements) {
    if (!serializedManifest.includes(legacyUniversalIdentifier)) {
      continue;
    }

    serializedManifest = serializedManifest
      .split(legacyUniversalIdentifier)
      .join(deterministicUniversalIdentifier);
    appliedReplacementCount += 1;
  }

  return {
    updatedManifest: JSON.parse(serializedManifest),
    appliedReplacementCount,
  };
};
