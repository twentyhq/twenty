// Every key a flat, non-authored override entry could carry when 2.40 shipped:
// the overridable properties of the kind, their universal twins and the
// translations map. Author keys are application universal identifiers and
// never collide with one of these, so a blob holding any of them predates
// author-keyed overrides. Frozen here so the command does not follow the
// registry as properties are added or retired later.
export const LEGACY_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME = {
  objectMetadata: [
    'translations',
    'openRecordIn',
    'color',
    'description',
    'icon',
    'isActive',
    'labelPlural',
    'labelSingular',
    'imageIdentifierFieldMetadataId',
    'imageIdentifierFieldMetadataUniversalIdentifier',
  ],
  fieldMetadata: ['translations', 'description', 'icon', 'isActive', 'label'],
  view: [
    'translations',
    'name',
    'type',
    'icon',
    'position',
    'isCompact',
    'openRecordIn',
    'kanbanAggregateOperation',
    'kanbanAggregateOperationFieldMetadataId',
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
    'kanbanColumnWidth',
    'isActive',
  ],
  viewField: [
    'translations',
    'isVisible',
    'size',
    'position',
    'aggregateOperation',
    'viewFieldGroupId',
    'viewFieldGroupUniversalIdentifier',
    'isActive',
  ],
  viewFieldGroup: ['translations', 'name', 'position', 'isVisible', 'isActive'],
  pageLayoutTab: ['translations', 'title', 'position', 'icon', 'isActive'],
  pageLayoutWidget: [
    'translations',
    'title',
    'position',
    'pageLayoutTabId',
    'pageLayoutTabUniversalIdentifier',
    'conditionalDisplay',
    'conditionalAvailabilityExpression',
    'isActive',
  ],
  commandMenuItem: [
    'translations',
    'label',
    'icon',
    'shortLabel',
    'position',
    'isPinned',
    'availabilityType',
    'availabilityObjectMetadataId',
    'availabilityObjectMetadataUniversalIdentifier',
    'engineComponentKey',
    'hotKeys',
    'pageLayoutId',
    'pageLayoutUniversalIdentifier',
    'isActive',
  ],
  timelineActivityType: ['translations', 'name', 'icon', 'isActive'],
} as const satisfies Record<string, readonly string[]>;

export type BackfilledOverridesMetadataName =
  keyof typeof LEGACY_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME;

export const BACKFILLED_OVERRIDES_METADATA_NAMES = Object.keys(
  LEGACY_OVERRIDE_ENTRY_PROPERTY_NAMES_BY_METADATA_NAME,
) as BackfilledOverridesMetadataName[];
