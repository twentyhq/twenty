import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME } from 'src/engine/metadata-modules/overrides/constants/all-overridable-properties-by-metadata-name.constant';
import { type AuthoredOverrides } from 'src/engine/metadata-modules/overrides/types/authored-overrides.type';
import { normalizeAuthoredOverrides } from 'src/engine/metadata-modules/overrides/utils/normalize-authored-overrides.util';

type OverrideEntry = Record<string, unknown>;

type LocaleTranslations = Record<string, Record<string, unknown>>;

const TRANSLATIONS_KEY = 'translations';

const toOverrideEntry = (value: unknown): OverrideEntry =>
  isPlainObject(value) ? (value as OverrideEntry) : {};

const mergeLocaleTranslations = ({
  sourceTranslations,
  destinationTranslations,
}: {
  sourceTranslations: unknown;
  destinationTranslations: unknown;
}): LocaleTranslations => {
  const source = toOverrideEntry(sourceTranslations);
  const destination = toOverrideEntry(destinationTranslations);

  return Object.fromEntries(
    [...new Set([...Object.keys(source), ...Object.keys(destination)])].map(
      (locale) => [
        locale,
        {
          ...toOverrideEntry(source[locale]),
          ...toOverrideEntry(destination[locale]),
        },
      ],
    ),
  );
};

// Before the transfer the read order is [custom app, source app, column]; afterwards the
// custom app owns the row and only its entry is read, so source entries (and, for rows
// the custom app now edits through columns, its own entries) are folded into the columns.
export const foldTransferredEntityOverrides = ({
  metadataName,
  overrides,
  sourceApplicationUniversalIdentifier,
  workspaceCustomApplicationUniversalIdentifier,
  isSystemSideEffect,
  columnPropertyNames,
}: {
  metadataName: AllMetadataName;
  overrides: unknown;
  sourceApplicationUniversalIdentifier: string;
  workspaceCustomApplicationUniversalIdentifier: string;
  isSystemSideEffect: boolean;
  columnPropertyNames: ReadonlySet<string>;
}): {
  columnUpdates: Record<string, unknown>;
  overrides: AuthoredOverrides<OverrideEntry> | null;
} => {
  const authoredOverrides =
    normalizeAuthoredOverrides<OverrideEntry>({
      metadataName,
      overrides,
      workspaceCustomApplicationUniversalIdentifier,
    }) ?? {};

  const {
    [workspaceCustomApplicationUniversalIdentifier]: customEntryValue,
    [sourceApplicationUniversalIdentifier]: sourceEntryValue,
    ...otherAuthorEntries
  } = authoredOverrides;

  const customEntry = toOverrideEntry(customEntryValue);
  const sourceEntry = toOverrideEntry(sourceEntryValue);
  const foldableProperties = new Set<string>(
    ALL_OVERRIDABLE_PROPERTIES_BY_METADATA_NAME[metadataName].filter(
      (property) => columnPropertyNames.has(property),
    ),
  );

  const pickFoldableProperties = (entry: OverrideEntry) =>
    Object.fromEntries(
      Object.entries(entry).filter(([property]) =>
        foldableProperties.has(property),
      ),
    );

  const pickRemainingProperties = (entry: OverrideEntry) =>
    Object.fromEntries(
      Object.entries(entry).filter(
        ([property]) =>
          !foldableProperties.has(property) && property !== TRANSLATIONS_KEY,
      ),
    );

  const columnUpdates = {
    ...pickFoldableProperties(sourceEntry),
    ...(isSystemSideEffect ? {} : pickFoldableProperties(customEntry)),
  };

  const translations = mergeLocaleTranslations({
    sourceTranslations: sourceEntry[TRANSLATIONS_KEY],
    destinationTranslations: customEntry[TRANSLATIONS_KEY],
  });

  const nextCustomEntry: OverrideEntry = {
    ...pickRemainingProperties(sourceEntry),
    ...pickRemainingProperties(customEntry),
    ...(isSystemSideEffect ? pickFoldableProperties(customEntry) : {}),
    ...(Object.keys(translations).length > 0
      ? { [TRANSLATIONS_KEY]: translations }
      : {}),
  };

  const nextOverrides: AuthoredOverrides<OverrideEntry> = {
    ...(otherAuthorEntries as AuthoredOverrides<OverrideEntry>),
    ...(Object.keys(nextCustomEntry).length > 0
      ? { [workspaceCustomApplicationUniversalIdentifier]: nextCustomEntry }
      : {}),
  };

  return {
    columnUpdates,
    overrides: Object.values(nextOverrides).some(isDefined)
      ? nextOverrides
      : null,
  };
};
