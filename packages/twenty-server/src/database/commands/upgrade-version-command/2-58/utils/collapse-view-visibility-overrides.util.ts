import { isDefined, isPlainObject } from 'twenty-shared/utils';

// Freeze the pre-cutover override format, including universal relation aliases.
const VIEW_OVERRIDE_PROPERTIES = new Set([
  'translations',
  'name',
  'type',
  'icon',
  'position',
  'isCompact',
  'openRecordIn',
  'kanbanAggregateOperation',
  'kanbanAggregateOperationFieldMetadataId',
  'kanbanAggregateOperationFieldMetadataUniversalIdentifier',
  'anyFieldFilterValue',
  'calendarLayout',
  'calendarFieldMetadataId',
  'calendarFieldMetadataUniversalIdentifier',
  'calendarEndFieldMetadataId',
  'calendarEndFieldMetadataUniversalIdentifier',
  'visibility',
  'mainGroupByFieldMetadataId',
  'mainGroupByFieldMetadataUniversalIdentifier',
  'shouldHideEmptyGroups',
  'shouldDisplayGroupsAsTabs',
  'kanbanColumnWidth',
  'groupLoadLimit',
  'isActive',
]);

type StoredViewVisibility = 'WORKSPACE' | 'UNLISTED';

export const collapseViewVisibilityOverrides = ({
  visibility,
  overrides,
  applicationUniversalIdentifier,
}: {
  visibility: unknown;
  overrides: unknown;
  applicationUniversalIdentifier: string | null;
}): {
  visibility: StoredViewVisibility;
  overrides: Record<string, unknown> | null;
} => {
  if (isDefined(overrides) && !isPlainObject(overrides)) {
    throw new Error('Invalid stored view overrides');
  }

  const storedOverrides = overrides ?? {};
  const isLegacyOverride = Object.keys(storedOverrides).some((property) =>
    VIEW_OVERRIDE_PROPERTIES.has(property),
  );
  const entries = isLegacyOverride
    ? [storedOverrides]
    : [
        ...Object.entries(storedOverrides)
          .filter(([author]) => author !== applicationUniversalIdentifier)
          .map(([, entry]) => entry),
        isDefined(applicationUniversalIdentifier)
          ? storedOverrides[applicationUniversalIdentifier]
          : undefined,
      ];
  const overrideVisibility = entries
    .map((entry) => (isPlainObject(entry) ? entry.visibility : undefined))
    .find((value) => value !== undefined);
  const effectiveVisibility =
    overrideVisibility !== undefined ? overrideVisibility : visibility;

  if (
    effectiveVisibility !== 'WORKSPACE' &&
    effectiveVisibility !== 'UNLISTED'
  ) {
    throw new Error('Invalid stored view visibility');
  }

  return {
    visibility: effectiveVisibility,
    overrides: !isDefined(overrides)
      ? null
      : Object.fromEntries(
          Object.entries(storedOverrides)
            .filter(([property]) => property !== 'visibility')
            .map(([property, value]) => [
              property,
              !VIEW_OVERRIDE_PROPERTIES.has(property) && isPlainObject(value)
                ? Object.fromEntries(
                    Object.entries(value).filter(
                      ([entryProperty]) => entryProperty !== 'visibility',
                    ),
                  )
                : value,
            ]),
        ),
  };
};
