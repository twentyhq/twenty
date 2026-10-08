import { getMetadataFlatEntityMapsKey } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-flat-entity-maps-key.util';
import { getMetadataRelatedMetadataNames } from 'src/engine/metadata-modules/flat-entity/utils/get-metadata-related-metadata-names.util';

// Full flat-maps closure of the re-owned record-page stack: widget universal
// configurations resolve view primary keys at cache-build time, so the widget
// maps must be rebuilt together with the view/view-field/group/layout maps.
export const computeRecordPageReconcileFlatEntityMapsKeys = () => {
  const reconciledMetadataRelatedNames = [
    'view',
    ...getMetadataRelatedMetadataNames('view'),
    'viewField',
    ...getMetadataRelatedMetadataNames('viewField'),
    'viewFieldGroup',
    ...getMetadataRelatedMetadataNames('viewFieldGroup'),
    'pageLayout',
    ...getMetadataRelatedMetadataNames('pageLayout'),
    'pageLayoutTab',
    ...getMetadataRelatedMetadataNames('pageLayoutTab'),
    'pageLayoutWidget',
    ...getMetadataRelatedMetadataNames('pageLayoutWidget'),
  ] as const;

  return [
    ...new Set(
      reconciledMetadataRelatedNames.map(getMetadataFlatEntityMapsKey),
    ),
  ];
};
