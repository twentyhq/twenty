import { isNonEmptyString } from '@sniptt/guards';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

import {
  type Manifest,
  type PageLayoutWidgetManifest,
} from 'twenty-shared/application';
import {
  GRAPH_WIDGET_CONFIGURATION_TYPES,
  type GraphWidgetConfigurationType,
  type PageLayoutWidgetUniversalConfiguration,
  RelationType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  getDuplicateValues,
  type ManifestField,
  MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION,
  isRelationFieldManifest,
} from '@/cli/utilities/build/manifest/utils/manifest-validation-helpers';
import { validateTimelineActivityTypes } from '@/cli/utilities/build/manifest/utils/validate-timeline-activity-types';

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

const validateRelationFields = (fields: ManifestField[]): string[] => {
  const errors: string[] = [];

  for (const field of fields) {
    if (!isRelationFieldManifest(field)) {
      continue;
    }

    const settings = field.universalSettings;

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

    if (version < MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION) {
      errors.push(
        `Universal identifier "${identifier}" is UUID version ${version}. ` +
          `Only UUID version ${MINIMUM_UNIVERSAL_IDENTIFIER_UUID_VERSION} or higher is allowed.`,
      );
    }
  }

  return errors;
};

export const manifestValidate = (manifest: Manifest) => {
  const errors: string[] = [];
  const warnings: string[] = [];

  const universalIdentifiers = findUniversalIdentifiers(manifest);

  const duplicates = getDuplicateValues(universalIdentifiers);

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

  const allFields: ManifestField[] = [
    ...manifest.fields,
    ...manifest.objects.flatMap((object) => object.fields),
  ];

  errors.push(...validateRelationFields(allFields));

  errors.push(...validateGraphWidgets(collectPageLayoutWidgets(manifest)));

  errors.push(...validateTimelineActivityTypes(manifest));

  return { errors, warnings, isValid: errors.length === 0 };
};
