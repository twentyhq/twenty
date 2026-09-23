import { isNonEmptyString } from '@sniptt/guards';
import { kebabCase } from '@/cli/utilities/string/kebab-case';
import {
  type IndexManifest,
  type StandaloneViewFieldManifest,
} from 'twenty-shared/application';
import { STANDARD_OBJECT_FIELDS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export type FieldLocation = {
  objectName: string | null;
  fieldName: string;
};

const MAX_FILE_BASE_NAME_LENGTH = 80;

const STANDARD_FIELD_LOCATION_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  FieldLocation
>(
  Object.entries(STANDARD_OBJECT_FIELDS).flatMap(([objectName, fields]) =>
    Object.entries(fields).map(
      ([fieldName, { universalIdentifier }]) =>
        [universalIdentifier, { objectName, fieldName }] as const,
    ),
  ),
);

export const isUsableFileNameSegment = (
  value: string | undefined,
): value is string =>
  isNonEmptyString(value) &&
  isNonEmptyString(kebabCase(value).replace(/-+/g, ''));

export const capFileBaseName = (fileBaseName: string): string =>
  fileBaseName.slice(0, MAX_FILE_BASE_NAME_LENGTH).replace(/-+$/g, '');

export const toFileBaseName = ({
  segments,
  universalIdentifier,
}: {
  segments: (string | null)[];
  universalIdentifier: string;
}): string => {
  const fileBaseName = capFileBaseName(
    segments
      .filter(isDefined)
      .map(kebabCase)
      .join('-')
      .replace(/-{2,}/g, '-')
      .replace(/^-+|-+$/g, ''),
  );

  return isNonEmptyString(fileBaseName)
    ? fileBaseName
    : universalIdentifier.slice(0, 8);
};

export const buildIndexFileBaseName = ({
  indexManifest,
  objectName,
  fieldLocationByUniversalIdentifier,
}: {
  indexManifest: IndexManifest;
  objectName: string | null;
  fieldLocationByUniversalIdentifier: Map<string, FieldLocation>;
}): string =>
  toFileBaseName({
    segments: [
      objectName,
      ...indexManifest.fields.map(
        ({ fieldUniversalIdentifier }) =>
          fieldLocationByUniversalIdentifier.get(fieldUniversalIdentifier)
            ?.fieldName ?? null,
      ),
    ],
    universalIdentifier: indexManifest.universalIdentifier,
  });

export const buildViewFieldFileBaseName = ({
  viewFieldManifest,
  fieldLocationByUniversalIdentifier,
}: {
  viewFieldManifest: StandaloneViewFieldManifest;
  fieldLocationByUniversalIdentifier: Map<string, FieldLocation>;
}): string => {
  const fieldLocation =
    fieldLocationByUniversalIdentifier.get(
      viewFieldManifest.fieldMetadataUniversalIdentifier,
    ) ??
    STANDARD_FIELD_LOCATION_BY_UNIVERSAL_IDENTIFIER.get(
      viewFieldManifest.fieldMetadataUniversalIdentifier,
    );

  return toFileBaseName({
    segments: isDefined(fieldLocation)
      ? [fieldLocation.objectName, fieldLocation.fieldName]
      : [],
    universalIdentifier: viewFieldManifest.universalIdentifier,
  });
};
