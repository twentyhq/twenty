import { type ObjectManifest } from 'twenty-shared/application';
import {
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import {
  ApplicationException,
  ApplicationExceptionCode,
} from 'src/engine/core-modules/application/application.exception';

// `readabilityParentFieldUniversalIdentifiers` is the pre-`inheritance` shape:
// a flat OR-ed list of parent relation fields. It is read once, here, so the
// stored configuration stays the single writable truth
export type LegacyReadabilityParentFieldsInput = {
  readabilityParentFieldUniversalIdentifiers?: string[] | null;
};

export const normalizeObjectManifestInheritance = (
  objectManifest: Pick<ObjectManifest, 'nameSingular' | 'inheritance'> &
    LegacyReadabilityParentFieldsInput,
): ObjectAccessInheritance | null => {
  const legacyIdentifiers =
    objectManifest.readabilityParentFieldUniversalIdentifiers;

  if (isDefined(objectManifest.inheritance)) {
    if (isDefined(legacyIdentifiers)) {
      throw new ApplicationException(
        `Object "${objectManifest.nameSingular}" declares both "inheritance" and the legacy "readabilityParentFieldUniversalIdentifiers": keep only "inheritance"`,
        ApplicationExceptionCode.INVALID_INPUT,
      );
    }

    return objectManifest.inheritance;
  }

  if (!isDefined(legacyIdentifiers)) {
    return null;
  }

  if (legacyIdentifiers.length === 0) {
    throw new ApplicationException(
      `Object "${objectManifest.nameSingular}" declares an empty "readabilityParentFieldUniversalIdentifiers": name at least one parent relation`,
      ApplicationExceptionCode.INVALID_INPUT,
    );
  }

  const [firstIdentifier, ...otherIdentifiers] = legacyIdentifiers;

  return {
    match: ObjectAccessInheritanceMatch.ANY,
    through: [firstIdentifier, ...otherIdentifiers].map(
      (fieldUniversalIdentifier) => ({
        kind: ObjectAccessInheritanceRelationKind.FIELD as const,
        fieldUniversalIdentifier,
      }),
    ) as ObjectAccessInheritance['through'],
  };
};
