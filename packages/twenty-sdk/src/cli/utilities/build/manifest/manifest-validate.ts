import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import { type FieldManifest, type Manifest } from 'twenty-shared/application';
import { FieldMetadataType, RelationType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

const MIN_UUID_VERSION = 4;

const RELATION_FIELD_TYPES: string[] = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
];

const VALID_RELATION_TYPES: string[] = [
  RelationType.MANY_TO_ONE,
  RelationType.ONE_TO_MANY,
];

const extractDuplicates = (values: string[]): string[] => {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  }

  return Array.from(duplicates);
};

const findUniversalIdentifiers = (obj: object): string[] => {
  const universalIdentifiers: string[] = [];

  if (!obj) {
    return [];
  }

  for (const [key, val] of Object.entries(obj)) {
    if (key === 'universalIdentifier' && typeof val === 'string') {
      universalIdentifiers.push(val);
    }

    if (
      key === 'postInstallLogicFunction' ||
      key === 'preInstallLogicFunction'
    ) {
      continue;
    }

    if (typeof val === 'object') {
      universalIdentifiers.push(...findUniversalIdentifiers(val));
    }
  }

  return universalIdentifiers;
};

const validateRelationFields = (
  fields: Pick<FieldManifest, 'type' | 'name' | 'universalSettings'>[],
): string[] => {
  const errors: string[] = [];

  for (const field of fields) {
    if (!RELATION_FIELD_TYPES.includes(field.type)) {
      continue;
    }

    const settings = field.universalSettings as
      | { relationType?: string; joinColumnName?: string | null }
      | null
      | undefined;

    if (!settings?.relationType) {
      errors.push(
        `Relation field "${field.name}" is missing relationType. ` +
          `${field.type} fields must declare a relationType (${VALID_RELATION_TYPES.join(' or ')}) in universalSettings.`,
      );
      continue;
    }

    if (!VALID_RELATION_TYPES.includes(settings.relationType)) {
      errors.push(
        `Relation field "${field.name}" has invalid relationType "${settings.relationType}". ` +
          `Expected ${VALID_RELATION_TYPES.join(' or ')}.`,
      );
      continue;
    }

    if (
      settings.relationType === RelationType.MANY_TO_ONE &&
      !settings.joinColumnName
    ) {
      errors.push(
        `MANY_TO_ONE relation field "${field.name}" is missing joinColumnName. ` +
          `MANY_TO_ONE relations must declare a joinColumnName in universalSettings.`,
      );
    }
  }

  return errors;
};

const invalidUniversalIdentifierVersions = (
  identifiers: string[],
): string[] => {
  const errors: string[] = [];
  const seen = new Set<string>();

  for (const identifier of identifiers) {
    if (seen.has(identifier)) {
      continue;
    }
    seen.add(identifier);

    if (!uuidValidate(identifier)) {
      errors.push(`Universal identifier "${identifier}" is not a valid UUID.`);
      continue;
    }

    const version = uuidVersion(identifier);

    if (version < MIN_UUID_VERSION) {
      errors.push(
        `Universal identifier "${identifier}" is UUID version ${version}. ` +
          `Only UUID version ${MIN_UUID_VERSION} or higher is allowed.`,
      );
    }
  }

  return errors;
};

export const manifestValidate = (manifest: Manifest) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const universalIdentifiers = findUniversalIdentifiers(manifest);

  const duplicates = extractDuplicates(universalIdentifiers);

  if (duplicates.length > 0) {
    errors.push(`Duplicate universal identifiers: ${duplicates.join(', ')}`);
  }

  const invalidUniversalIdentifiers =
    invalidUniversalIdentifierVersions(universalIdentifiers);

  if (invalidUniversalIdentifiers.length > 0) {
    errors.push(
      `Duplicate universal identifiers: ${invalidUniversalIdentifiers.join(', ')}`,
    );
  }

  if (!isNonEmptyArray(manifest.objects)) {
    warnings.push('No object defined');
  }

  if (!isNonEmptyArray(manifest.logicFunctions)) {
    warnings.push('No logic function defined');
  }

  if (!isNonEmptyArray(manifest.frontComponents)) {
    warnings.push('No front component defined');
  }

  const allFields: Pick<
    FieldManifest,
    'type' | 'name' | 'universalSettings'
  >[] = [
    ...manifest.fields,
    ...manifest.objects.flatMap((object) => object.fields),
  ];

  errors.push(...validateRelationFields(allFields));

  return { errors, warnings, isValid: errors.length === 0 };
};
