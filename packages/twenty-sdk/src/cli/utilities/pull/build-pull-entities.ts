import {
  FIELD_ENUM_BINDINGS,
  INDEX_ENUM_BINDINGS,
  OBJECT_ENUM_BINDINGS,
  PAGE_LAYOUT_ENUM_BINDINGS,
  PAGE_LAYOUT_TAB_ENUM_BINDINGS,
  VIEW_ENUM_BINDINGS,
  VIEW_FIELD_ENUM_BINDINGS,
  type EnumBinding,
} from '@/cli/utilities/pull/write-define-file';
import {
  buildIndexFileBaseName,
  buildViewFieldFileBaseName,
  type FieldLocation,
  toFileBaseName,
} from '@/cli/utilities/pull/pull-file-base-name';
import { kebabCase } from '@/cli/utilities/string/kebab-case';
import {
  type ApplicationManifest,
  getSystemRecordFormPageLayoutUniversalIdentifier,
  getSystemRecordPageLayoutUniversalIdentifier,
  type Manifest,
} from 'twenty-shared/application';
import {
  STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS,
  STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS,
} from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

export const PULL_ENTITY_KINDS = [
  'application',
  'object',
  'field',
  'index',
  'view',
  'viewField',
  'pageLayout',
  'pageLayoutTab',
] as const;

export type PullEntityKind = (typeof PULL_ENTITY_KINDS)[number];

export type PullEntity = {
  kind: PullEntityKind;
  universalIdentifier: string;
  definer: string;
  config: unknown;
  enumBindings: EnumBinding[];
  defaultFolder: string;
  fileSuffix: string;
  fileBaseName: string;
  parentName: string | null;
};

export type SkippedPullEntity = {
  kind: PullEntityKind;
  universalIdentifier: string;
  reason: string;
};

const APPLICATION_PROPERTIES_TO_STRIP = [
  'packageJsonChecksum',
  'yarnLockChecksum',
  'requiredServerVersionRange',
  'aboutDescription',
  'postInstallLogicFunction',
  'preInstallLogicFunction',
  'uninstallLogicFunction',
  'settingsFrontComponent',
  'settingsCustomTabFrontComponentUniversalIdentifier',
  'frontComponentSharedDependencies',
  'logoUrl',
  'screenshots',
] as const;

const APPLICATION_PROPERTY_NAMES_TO_STRIP = new Set<string>(
  APPLICATION_PROPERTIES_TO_STRIP,
);

const GENERATED_COVER_GALLERY_IMAGE = 'public/cover.generated.png';

const STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER = new Map<string, string>(
  Object.entries(STANDARD_OBJECT_UNIVERSAL_IDENTIFIERS).map(
    ([name, universalIdentifier]) => [universalIdentifier, name] as const,
  ),
);

const STANDARD_PAGE_LAYOUT_NAME_BY_UNIVERSAL_IDENTIFIER = new Map<
  string,
  string
>(
  Object.entries(STANDARD_PAGE_LAYOUT_UNIVERSAL_IDENTIFIERS).map(
    ([name, { universalIdentifier }]) => [universalIdentifier, name] as const,
  ),
);

const buildApplicationConfig = (
  manifest: Manifest,
): Partial<ApplicationManifest> => {
  const applicationConfig = Object.fromEntries(
    Object.entries(manifest.application).filter(
      ([property]) => !APPLICATION_PROPERTY_NAMES_TO_STRIP.has(property),
    ),
  ) as Partial<ApplicationManifest>;

  const { galleryImages } = applicationConfig;

  if (
    !Array.isArray(galleryImages) ||
    galleryImages.length === 0 ||
    galleryImages.every((image) => image === GENERATED_COVER_GALLERY_IMAGE)
  ) {
    const { galleryImages: _galleryImages, ...withoutGalleryImages } =
      applicationConfig;

    return withoutGalleryImages;
  }

  return applicationConfig;
};

const getObjectName = ({
  objectUniversalIdentifier,
  manifest,
}: {
  objectUniversalIdentifier: string;
  manifest: Manifest;
}): string | null =>
  manifest.objects.find(
    (objectManifest) =>
      objectManifest.universalIdentifier === objectUniversalIdentifier,
  )?.nameSingular ??
  STANDARD_OBJECT_NAME_BY_UNIVERSAL_IDENTIFIER.get(objectUniversalIdentifier) ??
  null;

const getPageLayoutName = ({
  pageLayoutUniversalIdentifier,
  manifest,
}: {
  pageLayoutUniversalIdentifier: string;
  manifest: Manifest;
}): string | null => {
  const pageLayoutManifest = manifest.pageLayouts?.find(
    (candidate) =>
      candidate.universalIdentifier === pageLayoutUniversalIdentifier,
  );

  if (isDefined(pageLayoutManifest)) {
    return pageLayoutManifest.name;
  }

  const standardPageLayoutName =
    STANDARD_PAGE_LAYOUT_NAME_BY_UNIVERSAL_IDENTIFIER.get(
      pageLayoutUniversalIdentifier,
    );

  if (isDefined(standardPageLayoutName)) {
    return standardPageLayoutName;
  }

  const objectMetadataApplicationUniversalIdentifier =
    manifest.application.universalIdentifier;

  for (const objectManifest of manifest.objects) {
    const systemPageLayoutUniversalIdentifiers = {
      objectMetadataApplicationUniversalIdentifier,
      objectUniversalIdentifier: objectManifest.universalIdentifier,
    };

    if (
      getSystemRecordPageLayoutUniversalIdentifier(
        systemPageLayoutUniversalIdentifiers,
      ) === pageLayoutUniversalIdentifier
    ) {
      return `${objectManifest.nameSingular}RecordPage`;
    }

    if (
      getSystemRecordFormPageLayoutUniversalIdentifier(
        systemPageLayoutUniversalIdentifiers,
      ) === pageLayoutUniversalIdentifier
    ) {
      return `${objectManifest.nameSingular}RecordForm`;
    }
  }

  return null;
};

export const buildPullEntities = (
  manifest: Manifest,
): { entities: PullEntity[]; skipped: SkippedPullEntity[] } => {
  const applicationUniversalIdentifier =
    manifest.application.universalIdentifier;
  const entities: PullEntity[] = [];
  const skipped: SkippedPullEntity[] = [];

  entities.push({
    kind: 'application',
    universalIdentifier: applicationUniversalIdentifier,
    definer: 'defineApplication',
    config: buildApplicationConfig(manifest),
    enumBindings: [],
    defaultFolder: 'src',
    fileSuffix: '.config.ts',
    fileBaseName: 'application',
    parentName: null,
  });

  const writtenObjectUniversalIdentifiers = new Set<string>();
  const fieldLocationByUniversalIdentifier = new Map<string, FieldLocation>();

  for (const objectManifest of manifest.objects) {
    for (const field of objectManifest.fields) {
      fieldLocationByUniversalIdentifier.set(field.universalIdentifier, {
        objectName: objectManifest.nameSingular,
        fieldName: field.name,
      });
    }

    writtenObjectUniversalIdentifiers.add(objectManifest.universalIdentifier);

    entities.push({
      kind: 'object',
      universalIdentifier: objectManifest.universalIdentifier,
      definer: 'defineObject',
      config: objectManifest,
      enumBindings: OBJECT_ENUM_BINDINGS,
      defaultFolder: 'src/objects',
      fileSuffix: '.object.ts',
      fileBaseName: kebabCase(objectManifest.nameSingular),
      parentName: null,
    });
  }

  for (const fieldManifest of manifest.fields) {
    const objectName = getObjectName({
      objectUniversalIdentifier: fieldManifest.objectUniversalIdentifier,
      manifest,
    });

    fieldLocationByUniversalIdentifier.set(fieldManifest.universalIdentifier, {
      objectName,
      fieldName: fieldManifest.name,
    });

    entities.push({
      kind: 'field',
      universalIdentifier: fieldManifest.universalIdentifier,
      definer: 'defineField',
      config: fieldManifest,
      enumBindings: FIELD_ENUM_BINDINGS,
      defaultFolder: 'src/fields',
      fileSuffix: '.field.ts',
      fileBaseName: toFileBaseName({
        segments: [objectName, fieldManifest.name],
        universalIdentifier: fieldManifest.universalIdentifier,
      }),
      parentName: objectName,
    });
  }

  for (const indexManifest of manifest.indexes ?? []) {
    if (
      !writtenObjectUniversalIdentifiers.has(
        indexManifest.objectUniversalIdentifier,
      )
    ) {
      skipped.push({
        kind: 'index',
        universalIdentifier: indexManifest.universalIdentifier,
        reason: 'its object is not part of the written source',
      });
      continue;
    }

    const objectName = getObjectName({
      objectUniversalIdentifier: indexManifest.objectUniversalIdentifier,
      manifest,
    });

    entities.push({
      kind: 'index',
      universalIdentifier: indexManifest.universalIdentifier,
      definer: 'defineIndex',
      config: indexManifest,
      enumBindings: INDEX_ENUM_BINDINGS,
      defaultFolder: 'src/indexes',
      fileSuffix: '.index.ts',
      fileBaseName: buildIndexFileBaseName({
        indexManifest,
        objectName,
        fieldLocationByUniversalIdentifier,
      }),
      parentName: objectName,
    });
  }

  for (const viewManifest of manifest.views ?? []) {
    entities.push({
      kind: 'view',
      universalIdentifier: viewManifest.universalIdentifier,
      definer: 'defineView',
      config: viewManifest,
      enumBindings: VIEW_ENUM_BINDINGS,
      defaultFolder: 'src/views',
      fileSuffix: '.view.ts',
      fileBaseName: toFileBaseName({
        segments: [viewManifest.name],
        universalIdentifier: viewManifest.universalIdentifier,
      }),
      parentName: getObjectName({
        objectUniversalIdentifier: viewManifest.objectUniversalIdentifier,
        manifest,
      }),
    });
  }

  for (const viewFieldManifest of manifest.viewFields ?? []) {
    entities.push({
      kind: 'viewField',
      universalIdentifier: viewFieldManifest.universalIdentifier,
      definer: 'defineViewField',
      config: viewFieldManifest,
      enumBindings: VIEW_FIELD_ENUM_BINDINGS,
      defaultFolder: 'src/view-fields',
      fileSuffix: '.view-field.ts',
      fileBaseName: buildViewFieldFileBaseName({
        viewFieldManifest,
        fieldLocationByUniversalIdentifier,
      }),
      parentName: null,
    });
  }

  for (const pageLayoutManifest of manifest.pageLayouts ?? []) {
    entities.push({
      kind: 'pageLayout',
      universalIdentifier: pageLayoutManifest.universalIdentifier,
      definer: 'definePageLayout',
      config: pageLayoutManifest,
      enumBindings: PAGE_LAYOUT_ENUM_BINDINGS,
      defaultFolder: 'src/page-layouts',
      fileSuffix: '.page-layout.ts',
      fileBaseName: toFileBaseName({
        segments: [pageLayoutManifest.name],
        universalIdentifier: pageLayoutManifest.universalIdentifier,
      }),
      parentName: isDefined(pageLayoutManifest.objectUniversalIdentifier)
        ? getObjectName({
            objectUniversalIdentifier:
              pageLayoutManifest.objectUniversalIdentifier,
            manifest,
          })
        : null,
    });
  }

  for (const pageLayoutTabManifest of manifest.pageLayoutTabs ?? []) {
    const { pageLayoutUniversalIdentifier } = pageLayoutTabManifest;

    if (!isDefined(pageLayoutUniversalIdentifier)) {
      skipped.push({
        kind: 'pageLayoutTab',
        universalIdentifier: pageLayoutTabManifest.universalIdentifier,
        reason: 'it does not name the page layout it belongs to',
      });
      continue;
    }

    entities.push({
      kind: 'pageLayoutTab',
      universalIdentifier: pageLayoutTabManifest.universalIdentifier,
      definer: 'definePageLayoutTab',
      config: pageLayoutTabManifest,
      enumBindings: PAGE_LAYOUT_TAB_ENUM_BINDINGS,
      defaultFolder: 'src/page-layout-tabs',
      fileSuffix: '.page-layout-tab.ts',
      fileBaseName: toFileBaseName({
        segments: [pageLayoutTabManifest.title],
        universalIdentifier: pageLayoutTabManifest.universalIdentifier,
      }),
      parentName: getPageLayoutName({
        pageLayoutUniversalIdentifier,
        manifest,
      }),
    });
  }

  return { entities, skipped };
};
