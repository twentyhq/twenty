import { isArray, isString } from '@sniptt/guards';
import { isDefined, isPlainObject } from 'twenty-shared/utils';

import { ENTITY_KEY_BY_KIND } from '@/app/pull/entity-key-by-kind.constant';
import { isLocaleCatalog } from '@/app/translations/is-locale-catalog';

import { type ExportedManifest } from '@/app/types/exported-manifest.type';

const isEntityCollection = (value: unknown, children: string[] = []): boolean =>
  !isDefined(value) ||
  (isArray(value) &&
    value.every(
      (entry) =>
        isPlainObject(entry) &&
        isString(entry.universalIdentifier) &&
        children.every((key) =>
          isEntityCollection(entry[key], key === 'tabs' ? ['widgets'] : []),
        ),
    ));

export const isExportedManifest = (value: unknown): value is ExportedManifest =>
  isPlainObject(value) &&
  isPlainObject(value.application) &&
  isString(value.application.universalIdentifier) &&
  (!isDefined(value.translations) ||
    (isPlainObject(value.translations) &&
      Object.values(value.translations).every(isLocaleCatalog))) &&
  Object.values(ENTITY_KEY_BY_KIND)
    .filter((key) => key !== 'application')
    .every((key) =>
      isEntityCollection(
        value[key],
        key === 'objects' || key === 'views'
          ? ['fields']
          : key === 'pageLayouts'
            ? ['tabs']
            : key === 'pageLayoutTabs'
              ? ['widgets']
              : [],
      ),
    ) &&
  (!isArray(value.objects) ||
    value.objects.every(
      (entry) => isPlainObject(entry) && isString(entry.nameSingular),
    ));
