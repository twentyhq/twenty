import { isNonEmptyString } from '@sniptt/guards';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import {
  type FieldManifest,
  type Manifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  GRAPH_WIDGET_CONFIGURATION_TYPES,
  type GraphWidgetConfigurationType,
  type PageLayoutWidgetUniversalConfiguration,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

const MIN_UUID_VERSION = 4;

const RELATION_FIELD_TYPES: string[] = [
  FieldMetadataType.RELATION,
  FieldMetadataType.MORPH_RELATION,
];

const VALID_RELATION_TYPES: string[] = [
  RelationType.MANY_TO_ONE,
  RelationType.ONE_TO_MANY,
];

const RAW_AGGREGATE_FIELD_METADATA_ID_KEY = 'aggregateFieldMetadataId';

type GraphPageLayoutWidgetUniversalConfiguration = Extract<
  PageLayoutWidgetUniversalConfiguration,
  { configurationType: GraphWidgetConfigurationType }
>;

const isGraphWidgetConfiguration = (
  configuration: PageLayoutWidgetUniversalConfiguration | null | undefined,
): configuration is GraphPageLayoutWidgetUniversalConfiguration =>
  isDefined(configuration) &&
  GRAPH_WIDGET_CONFIGURATION_TYPES.some(
    (configurationType) =>
      configurationType === configuration.configurationType,
  );

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
      key === 'preInstallLogicFunction' ||
      key === 'uninstallLogicFunction' ||
      key === 'onConnectLogicFunction' ||
      key === 'onDisconnectLogicFunction' ||
      key === 'settingsFrontComponent'
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

const collectPageLayoutWidgets = (
  manifest: Pick<Manifest, 'pageLayouts' | 'pageLayoutTabs'>,
): PageLayoutWidgetManifest[] => {
  const widgetsFromPageLayouts = manifest.pageLayouts.flatMap(
    (pageLayout) => pageLayout.tabs?.flatMap((tab) => tab.widgets ?? []) ?? [],
  );

  const widgetsFromStandaloneTabs = manifest.pageLayoutTabs.flatMap(
    (tab) => tab.widgets ?? [],
  );

  return [...widgetsFromPageLayouts, ...widgetsFromStandaloneTabs];
};

const validateGraphWidgets = (
  widgets: PageLayoutWidgetManifest[],
): string[] => {
  const errors: string[] = [];

  for (const widget of widgets) {
    const configuration = widget.configuration;

    if (!isGraphWidgetConfiguration(configuration)) {
      continue;
    }

    if (
      !isNonEmptyString(configuration.aggregateFieldMetadataUniversalIdentifier)
    ) {
      const usedRawKey = RAW_AGGREGATE_FIELD_METADATA_ID_KEY in configuration;

      const hint = usedRawKey
        ? ` Reference the aggregate field with "aggregateFieldMetadataUniversalIdentifier" (not "${RAW_AGGREGATE_FIELD_METADATA_ID_KEY}").`
        : '';

      errors.push(
        `Graph widget "${widget.title}" is missing aggregateFieldMetadataUniversalIdentifier.${hint}`,
      );
    }
  }

  return errors;
};

const validateTimelineActivityTypes = (
  manifest: Pick<
    Manifest,
    'fields' | 'frontComponents' | 'objects' | 'timelineActivityTypes'
  >,
): string[] => {
  const errors: string[] = [];
  const duplicateNames = extractDuplicates(
    manifest.timelineActivityTypes.map(
      (timelineActivityType) => timelineActivityType.name,
    ),
  );
  const frontComponentUniversalIdentifiers = new Set(
    manifest.frontComponents.map(
      (frontComponent) => frontComponent.universalIdentifier,
    ),
  );

  for (const duplicateName of duplicateNames) {
    errors.push(
      `Timeline activity type name "${duplicateName}" is used more than once. Names must be unique within an application.`,
    );
  }

  for (const timelineActivityType of manifest.timelineActivityTypes) {
    if (
      isDefined(timelineActivityType.frontComponentUniversalIdentifier) &&
      !frontComponentUniversalIdentifiers.has(
        timelineActivityType.frontComponentUniversalIdentifier,
      )
    ) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" references front component "${timelineActivityType.frontComponentUniversalIdentifier}", which is not defined by this application.`,
      );
    }

    const emit = timelineActivityType.emit;

    if (!isDefined(emit)) {
      continue;
    }

    const sourceObject = manifest.objects.find(
      (object) =>
        object.universalIdentifier === emit.objectUniversalIdentifier,
    );

    if (!isDefined(sourceObject)) {
      if (
        !isDefined(
          timelineActivityType.replacesTimelineActivityTypeUniversalIdentifier,
        )
      ) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" targets object "${emit.objectUniversalIdentifier}", which is not defined by this application. Types targeting another application's object must declare replacesTimelineActivityTypeUniversalIdentifier.`,
        );
      }

      continue;
    }

    const sourceFields = [
      ...sourceObject.fields,
      ...manifest.fields.filter(
        (field) =>
          field.objectUniversalIdentifier === sourceObject.universalIdentifier,
      ),
    ];
    const through = emit.through;

    if (!isDefined(through)) {
      continue;
    }

    const relationField = sourceFields.find(
      (field) =>
        field.universalIdentifier ===
        through.relationFieldUniversalIdentifier,
    );

    if (!isDefined(relationField)) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" references relation field "${through.relationFieldUniversalIdentifier}", which is not defined on object "${sourceObject.nameSingular}".`,
      );
    } else {
      const relationSettings = relationField.universalSettings as
        | {
            relationType?: string;
            junctionTargetFieldUniversalIdentifier?: string | null;
          }
        | null
        | undefined;
      const hasSupportedRelationShape =
        RELATION_FIELD_TYPES.includes(relationField.type) &&
        (relationSettings?.relationType === RelationType.MANY_TO_ONE ||
          (relationSettings?.relationType === RelationType.ONE_TO_MANY &&
            isNonEmptyString(
              relationSettings.junctionTargetFieldUniversalIdentifier,
            )));

      if (!hasSupportedRelationShape) {
        errors.push(
          `Timeline activity type "${timelineActivityType.name}" must route through a MANY_TO_ONE relation or a junction-backed ONE_TO_MANY relation.`,
        );
      }
    }

    const triggerFieldUniversalIdentifiers =
      through.triggerFieldUniversalIdentifiers ?? [];
    const sourceFieldUniversalIdentifiers = new Set(
      sourceFields.map((field) => field.universalIdentifier),
    );
    const missingTriggerFieldUniversalIdentifiers =
      triggerFieldUniversalIdentifiers.filter(
        (universalIdentifier) =>
          !sourceFieldUniversalIdentifiers.has(universalIdentifier),
      );

    if (missingTriggerFieldUniversalIdentifiers.length > 0) {
      errors.push(
        `Timeline activity type "${timelineActivityType.name}" references trigger fields that are not defined on object "${sourceObject.nameSingular}": ${missingTriggerFieldUniversalIdentifiers.join(', ')}.`,
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
      `Invalid universal identifiers: ${invalidUniversalIdentifiers.join(', ')}`,
    );
  }

  const allFields: Pick<
    FieldManifest,
    'type' | 'name' | 'universalSettings'
  >[] = [
    ...manifest.fields,
    ...manifest.objects.flatMap((object) => object.fields),
  ];

  errors.push(...validateRelationFields(allFields));

  errors.push(...validateGraphWidgets(collectPageLayoutWidgets(manifest)));

  errors.push(...validateTimelineActivityTypes(manifest));

  return { errors, warnings, isValid: errors.length === 0 };
};
