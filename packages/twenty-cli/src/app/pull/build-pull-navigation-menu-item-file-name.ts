import { getObjectNameForPullFile } from '@/app/pull/get-object-name-for-pull-file';
import { getPageLayoutNameForPullFile } from '@/app/pull/get-page-layout-name-for-pull-file';
import {
  isUsableFileNameSegment,
  toFileBaseName,
} from '@/app/pull/pull-file-base-name';
import {
  getSystemViewUniversalIdentifier,
  type Manifest,
  type NavigationMenuItemManifest,
  SYSTEM_VIEW_KEYS,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { NavigationMenuItemType } from 'twenty-shared/types';

const getViewName = ({
  viewUniversalIdentifier,
  manifest,
}: {
  viewUniversalIdentifier: string;
  manifest: Manifest;
}): string | null => {
  const viewManifest = manifest.views?.find(
    (candidate) => candidate.universalIdentifier === viewUniversalIdentifier,
  );

  if (isDefined(viewManifest)) {
    return viewManifest.name;
  }

  const objectMetadataApplicationUniversalIdentifier =
    manifest.application.universalIdentifier;

  for (const objectManifest of manifest.objects ?? []) {
    if (
      getSystemViewUniversalIdentifier({
        objectMetadataApplicationUniversalIdentifier,
        objectUniversalIdentifier: objectManifest.universalIdentifier,
        viewKey: SYSTEM_VIEW_KEYS.INDEX,
      }) === viewUniversalIdentifier
    ) {
      return `${objectManifest.nameSingular}IndexView`;
    }
  }

  return null;
};

const getNavigationMenuItemName = ({
  navigationMenuItemManifest,
  manifest,
}: {
  navigationMenuItemManifest: NavigationMenuItemManifest;
  manifest: Manifest;
}): string | null => {
  const {
    type,
    name,
    targetObjectUniversalIdentifier,
    viewUniversalIdentifier,
    pageLayoutUniversalIdentifier,
  } = navigationMenuItemManifest;

  if (isUsableFileNameSegment(name)) {
    return name;
  }

  if (
    type === NavigationMenuItemType.OBJECT &&
    isDefined(targetObjectUniversalIdentifier)
  ) {
    return getObjectNameForPullFile({
      objectUniversalIdentifier: targetObjectUniversalIdentifier,
      manifest,
    });
  }

  if (
    type === NavigationMenuItemType.VIEW &&
    isDefined(viewUniversalIdentifier)
  ) {
    return getViewName({ viewUniversalIdentifier, manifest });
  }

  if (
    type === NavigationMenuItemType.PAGE_LAYOUT &&
    isDefined(pageLayoutUniversalIdentifier)
  ) {
    return getPageLayoutNameForPullFile({
      pageLayoutUniversalIdentifier,
      manifest,
    });
  }

  return null;
};

export const buildPullNavigationMenuItemFileName = ({
  navigationMenuItemManifest,
  manifest,
}: {
  navigationMenuItemManifest: NavigationMenuItemManifest;
  manifest: Manifest;
}): string =>
  toFileBaseName({
    segments: [
      getNavigationMenuItemName({ navigationMenuItemManifest, manifest }),
    ],
    universalIdentifier: navigationMenuItemManifest.universalIdentifier,
  });
