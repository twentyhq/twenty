import { isDefined } from 'twenty-shared/utils';

import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { type TabVisibilityConfig } from '@/ui/layout/tab-list/types/TabVisibilityConfig';
import { type ObjectPermissions } from 'twenty-shared/types';
import { FieldMetadataType, type FeatureFlagDto } from '~/generated/graphql';

export type TabVisibilityContext = {
  isMobile: boolean;
  isInRightDrawer: boolean;
  currentWorkspace: {
    featureFlags?: FeatureFlagDto[] | null;
  } | null;
  objectMetadataItems: ObjectMetadataItem[];
  objectPermissionsByObjectMetadataId: Record<
    string,
    ObjectPermissions & { objectMetadataId: string }
  >;
  targetObjectMetadataItem: ObjectMetadataItem;
};

export const evaluateTabVisibility = (
  hide: TabVisibilityConfig,
  context: TabVisibilityContext,
): boolean => {
  const {
    isMobile,
    isInRightDrawer,
    currentWorkspace,
    objectMetadataItems,
    objectPermissionsByObjectMetadataId,
  } = context;

  const baseHide =
    (hide.ifMobile && isMobile) ||
    (hide.ifDesktop && !isMobile) ||
    (hide.ifInRightDrawer && isInRightDrawer);

  if (baseHide) {
    return true;
  }

  const featureNotEnabled =
    hide.ifFeaturesDisabled.length > 0 &&
    !hide.ifFeaturesDisabled.every((flagKey) => {
      const featureFlags = currentWorkspace?.featureFlags;
      if (!featureFlags) {
        return false;
      }
      return !!featureFlags.find((flag) => flag.key === flagKey && flag.value);
    });

  if (featureNotEnabled) {
    return true;
  }

  const requiredObjectInactive = hide.ifRequiredObjectsInactive.some(
    (requiredObjectName) => {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.nameSingular === requiredObjectName,
      );
      return !objectMetadataItem?.isActive;
    },
  );

  if (requiredObjectInactive) {
    return true;
  }

  const relationMissing = hide.ifRelationsMissing.some((relationName) => {
    return !context.targetObjectMetadataItem.fields.some(
      (field) =>
        field.name === relationName &&
        field.type === FieldMetadataType.RELATION &&
        field.isActive === true,
    );
  });

  if (relationMissing) {
    return true;
  }

  const noReadPermission =
    hide.ifNoReadPermission === true &&
    isDefined(hide.ifNoReadPermissionObject) &&
    (() => {
      const targetObjectMetadataId = objectMetadataItems.find(
        (item) => item.nameSingular === hide.ifNoReadPermissionObject,
      )?.id;

      if (!isDefined(targetObjectMetadataId)) {
        return false;
      }

      const objectPermissions = getObjectPermissionsForObject(
        objectPermissionsByObjectMetadataId,
        targetObjectMetadataId,
      );

      return objectPermissions.canReadObjectRecords === false;
    })();

  if (noReadPermission) {
    return true;
  }

  return false;
};
