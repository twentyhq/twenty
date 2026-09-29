import { isArray, isNonEmptyString, isString } from '@sniptt/guards';
import { type Manifest } from 'twenty-shared/application';
import { isDefined, isPlainObject, isValidUuid } from 'twenty-shared/utils';

import {
  APPLICATION_EXPORT_COVERAGE_STATUSES,
  type ApplicationExport,
} from '@/cli/utilities/pull/application-export-type';

const hasIdentifier = (value: unknown): boolean =>
  isPlainObject(value) &&
  isString(value.universalIdentifier) &&
  isValidUuid(value.universalIdentifier);

const ENTITY_LISTS = [
  'objects',
  'fields',
  'logicFunctions',
  'frontComponents',
  'permissionFlags',
  'roles',
  'skills',
  'agents',
  'views',
  'viewFields',
  'navigationMenuItems',
  'pageLayouts',
  'pageLayoutTabs',
  'pageLayoutWidgets',
  'commandMenuItems',
  'timelineActivityTypes',
  'settingsMenuItems',
];

const isEntityList = (value: unknown): boolean =>
  isArray(value) && value.every(hasIdentifier);

export const isPullManifest = (value: unknown): value is Manifest => {
  if (
    !isPlainObject(value) ||
    !hasIdentifier(value.application) ||
    !isPlainObject(value.application) ||
    !isString(value.application.displayName) ||
    !ENTITY_LISTS.every((key) => isEntityList(value[key])) ||
    !isArray(value.objects) ||
    !value.objects.every(
      (object) =>
        isPlainObject(object) &&
        isNonEmptyString(object.nameSingular) &&
        isEntityList(object.fields),
    ) ||
    !isArray(value.publicAssets)
  ) {
    return false;
  }

  if (
    isDefined(value.indexes) &&
    (!isArray(value.indexes) ||
      !value.indexes.every(
        (index) =>
          hasIdentifier(index) &&
          isPlainObject(index) &&
          isArray(index.fields) &&
          index.fields.every(
            (field) =>
              isPlainObject(field) && isString(field.fieldUniversalIdentifier),
          ),
      ))
  ) {
    return false;
  }

  return (
    (!isDefined(value.connectionProviders) ||
      isEntityList(value.connectionProviders)) &&
    (!isDefined(value.translations) ||
      (isPlainObject(value.translations) &&
        Object.values(value.translations).every(
          (catalog) =>
            isPlainObject(catalog) && Object.values(catalog).every(isString),
        )))
  );
};

const isApplicationExport = (value: unknown): value is ApplicationExport =>
  isPlainObject(value) &&
  isPlainObject(value.application) &&
  hasIdentifier(value.application) &&
  isString(value.application.displayName) &&
  isString(value.application.sourceType) &&
  isPullManifest(value.manifest) &&
  isString(value.application.universalIdentifier) &&
  value.application.universalIdentifier.toLowerCase() ===
    value.manifest.application.universalIdentifier.toLowerCase() &&
  isArray(value.coverage) &&
  value.coverage.every(
    (entry) =>
      hasIdentifier(entry) &&
      isPlainObject(entry) &&
      isString(entry.metadataName) &&
      APPLICATION_EXPORT_COVERAGE_STATUSES.some(
        (status) => status === entry.status,
      ) &&
      (entry.reason === null || isString(entry.reason)),
  ) &&
  isArray(value.files) &&
  value.files.every(
    (file) =>
      isPlainObject(file) &&
      isString(file.folder) &&
      isString(file.path) &&
      isString(file.content),
  );

export const validateApplicationExport = (
  value: unknown,
): ApplicationExport => {
  if (!isApplicationExport(value)) {
    throw new Error('Invalid application export. No files were written.');
  }

  if (value.files.length > 0) {
    throw new Error(
      'This export contains source or dependency files that this SDK cannot restore. Upgrade the SDK before pulling it. No files were written.',
    );
  }

  return value;
};
