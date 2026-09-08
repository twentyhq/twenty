import { WidgetType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { MANIFEST_ENTITY_REGISTRY } from 'src/engine/core-modules/application/application-manifest/utils/find-manifest-entity-descriptor-by-universal-identifier.util';
import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { type FlatPageLayoutTab } from 'src/engine/metadata-modules/flat-page-layout-tab/types/flat-page-layout-tab.type';
import { type FlatPageLayoutWidget } from 'src/engine/metadata-modules/flat-page-layout-widget/types/flat-page-layout-widget.type';

type ReferencedMetadataName =
  | 'fieldMetadata'
  | 'view'
  | 'frontComponent'
  | 'commandMenuItem';

const NULLABLE_REFERENCE_KEYS = new Set([
  'viewId',
  'viewUniversalIdentifier',
  'nestedRelationFieldMetadataId',
  'secondaryAxisGroupByFieldMetadataUniversalIdentifier',
  'relationTargetFieldMetadataUniversalIdentifier',
]);

const NOT_EXPORTED_YET_METADATA_NAMES: ReferencedMetadataName[] = [
  'frontComponent',
  'commandMenuItem',
];

const getReferencedMetadataName = (
  key: string,
): ReferencedMetadataName | undefined => {
  if (
    key === 'fieldMetadataId' ||
    key === 'nestedRelationFieldMetadataId' ||
    key === 'fieldMetadataUniversalIdentifier' ||
    key.endsWith('FieldMetadataUniversalIdentifier')
  ) {
    return 'fieldMetadata';
  }

  if (key === 'viewId' || key === 'viewUniversalIdentifier') {
    return 'view';
  }

  if (key === 'frontComponentUniversalIdentifier') {
    return 'frontComponent';
  }

  if (key === 'headerCommandMenuItemUniversalIdentifiers') {
    return 'commandMenuItem';
  }

  return undefined;
};

const getFlatEntityMaps = ({
  metadataName,
  allFlatEntityMaps,
}: {
  metadataName: ReferencedMetadataName;
  allFlatEntityMaps: AllFlatEntityMaps;
}) => {
  switch (metadataName) {
    case 'fieldMetadata':
      return allFlatEntityMaps.flatFieldMetadataMaps;
    case 'view':
      return allFlatEntityMaps.flatViewMaps;
    case 'frontComponent':
      return allFlatEntityMaps.flatFrontComponentMaps;
    case 'commandMenuItem':
      return allFlatEntityMaps.flatCommandMenuItemMaps;
  }
};

const getUnresolvableReferenceReason = ({
  key,
  metadataName,
  universalIdentifier,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
}: {
  key: string;
  metadataName: ReferencedMetadataName;
  universalIdentifier: unknown;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
}): string | undefined => {
  const label = MANIFEST_ENTITY_REGISTRY[metadataName].entityKind;

  if (!isDefined(universalIdentifier)) {
    return NULLABLE_REFERENCE_KEYS.has(key)
      ? undefined
      : `page layout widget referencing a ${label} that does not exist`;
  }

  if (typeof universalIdentifier !== 'string') {
    return undefined;
  }

  if (
    NOT_EXPORTED_YET_METADATA_NAMES.includes(metadataName) &&
    isDefined(
      getFlatEntityMaps({
        metadataName,
        allFlatEntityMaps: applicationAllFlatEntityMaps,
      }).byUniversalIdentifier[universalIdentifier],
    )
  ) {
    return `page layout widget referencing a ${label} that is not exported yet`;
  }

  return isDefined(
    getFlatEntityMaps({ metadataName, allFlatEntityMaps })
      .byUniversalIdentifier[universalIdentifier],
  )
    ? undefined
    : `page layout widget referencing a ${label} that does not exist`;
};

const findUnresolvableReferenceReason = ({
  value,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
}: {
  value: unknown;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
}): string | undefined => {
  if (!isDefined(value) || typeof value !== 'object') {
    return undefined;
  }

  for (const [key, child] of Object.entries(value)) {
    const metadataName = getReferencedMetadataName(key);

    if (!isDefined(metadataName)) {
      const nestedReason = findUnresolvableReferenceReason({
        value: child,
        applicationAllFlatEntityMaps,
        allFlatEntityMaps,
      });

      if (isDefined(nestedReason)) {
        return nestedReason;
      }

      continue;
    }

    for (const universalIdentifier of Array.isArray(child) ? child : [child]) {
      const reason = getUnresolvableReferenceReason({
        key,
        metadataName,
        universalIdentifier,
        applicationAllFlatEntityMaps,
        allFlatEntityMaps,
      });

      if (isDefined(reason)) {
        return reason;
      }
    }
  }

  return undefined;
};

export const getUnsupportedPageLayoutWidgetReason = ({
  flatPageLayoutWidget,
  flatPageLayoutTab,
  applicationAllFlatEntityMaps,
  allFlatEntityMaps,
  exportedObjectUniversalIdentifiers,
}: {
  flatPageLayoutWidget: FlatPageLayoutWidget;
  flatPageLayoutTab: FlatPageLayoutTab | undefined;
  applicationAllFlatEntityMaps: AllFlatEntityMaps;
  allFlatEntityMaps: AllFlatEntityMaps;
  exportedObjectUniversalIdentifiers: ReadonlySet<string>;
}): string | undefined => {
  if (flatPageLayoutWidget.type === WidgetType.VIEW) {
    return 'page layout widget of the VIEW type, which the sync does not support yet';
  }

  if (!isDefined(flatPageLayoutWidget.position)) {
    return 'page layout widget without a position';
  }

  if (
    isDefined(flatPageLayoutTab) &&
    flatPageLayoutWidget.position.layoutMode !== flatPageLayoutTab.layoutMode
  ) {
    return 'page layout widget positioned for another layout mode than its tab';
  }

  if (isDefined(flatPageLayoutWidget.conditionalAvailabilityExpression)) {
    return 'page layout widget with a conditional availability expression';
  }

  const objectUniversalIdentifier =
    flatPageLayoutWidget.objectMetadataUniversalIdentifier;

  if (isDefined(objectUniversalIdentifier)) {
    if (
      isDefined(
        applicationAllFlatEntityMaps.flatObjectMetadataMaps
          .byUniversalIdentifier[objectUniversalIdentifier],
      ) &&
      !exportedObjectUniversalIdentifiers.has(objectUniversalIdentifier)
    ) {
      return 'page layout widget on an unsupported object';
    }

    if (
      !isDefined(
        allFlatEntityMaps.flatObjectMetadataMaps.byUniversalIdentifier[
          objectUniversalIdentifier
        ],
      )
    ) {
      return 'page layout widget on an object that does not exist';
    }
  }

  return findUnresolvableReferenceReason({
    value: flatPageLayoutWidget.universalConfiguration,
    applicationAllFlatEntityMaps,
    allFlatEntityMaps,
  });
};
