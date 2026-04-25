import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { t } from '@lingui/core/macro';
import {
  type Manifest,
  type NavigationMenuItemManifest,
} from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import { resolveManifestObjectLabel } from '~/pages/settings/layout/utils/resolveManifestObjectLabel';

export type NavigationMenuItemDestination =
  | { kind: 'FOLDER' }
  | { kind: 'LINK'; link: string | undefined }
  | { kind: 'OBJECT'; label: string | undefined }
  | { kind: 'PAGE_LAYOUT'; label: string | undefined }
  | { kind: 'VIEW'; label: string | undefined }
  | { kind: 'RECORD' }
  | { kind: 'UNKNOWN' };

export const getNavigationMenuItemDestination = (
  item: NavigationMenuItemManifest,
  manifest: Manifest | undefined,
  objectMetadataItems?: EnrichedObjectMetadataItem[],
): NavigationMenuItemDestination => {
  switch (item.type) {
    case 'FOLDER':
      return { kind: 'FOLDER' };
    case 'LINK':
      return { kind: 'LINK', link: item.link };
    case 'OBJECT':
      return {
        kind: 'OBJECT',
        label: resolveManifestObjectLabel(
          item.targetObjectUniversalIdentifier,
          manifest,
          objectMetadataItems,
        ),
      };
    case 'PAGE_LAYOUT':
      return {
        kind: 'PAGE_LAYOUT',
        label: manifest?.pageLayouts?.find(
          (pl) => pl.universalIdentifier === item.pageLayoutUniversalIdentifier,
        )?.name,
      };
    case 'VIEW':
      return {
        kind: 'VIEW',
        label: manifest?.views?.find(
          (v) => v.universalIdentifier === item.viewUniversalIdentifier,
        )?.name,
      };
    case 'RECORD':
      return { kind: 'RECORD' };
    default:
      return { kind: 'UNKNOWN' };
  }
};

// Short single-line summary used as secondary text on list rows. Kept distinct
// from the longer phrasing on the detail page (see getNavigationMenuItemDestinationDescription).
export const getNavigationMenuItemDestinationSecondary = (
  destination: NavigationMenuItemDestination,
): string | undefined => {
  switch (destination.kind) {
    case 'FOLDER':
      return t`Folder`;
    case 'LINK':
      return isDefined(destination.link) ? destination.link : t`Link`;
    case 'OBJECT':
      return isDefined(destination.label)
        ? t`${destination.label} list`
        : t`Object`;
    case 'PAGE_LAYOUT':
      return isDefined(destination.label)
        ? t`${destination.label} layout`
        : t`Page layout`;
    case 'VIEW':
      return isDefined(destination.label)
        ? t`${destination.label} view`
        : t`View`;
    case 'RECORD':
      return t`Record`;
    default:
      return undefined;
  }
};

export const getNavigationMenuItemDisplayLabel = (
  destination: NavigationMenuItemDestination,
): string | undefined => {
  switch (destination.kind) {
    case 'FOLDER':
      return t`Folder`;
    case 'LINK':
      return destination.link ?? t`Link`;
    case 'OBJECT':
    case 'PAGE_LAYOUT':
    case 'VIEW':
      return destination.label;
    case 'RECORD':
      return t`Record`;
    default:
      return undefined;
  }
};
