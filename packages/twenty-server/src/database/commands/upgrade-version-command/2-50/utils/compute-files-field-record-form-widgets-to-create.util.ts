import { getSystemFormFieldPageLayoutWidgetUniversalIdentifier } from 'twenty-shared/application';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { type AllFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/all-flat-entity-maps.type';
import { findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/utils/find-many-flat-entity-by-universal-identifier-in-universal-flat-entity-maps.util';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { computeRecordFormFlatFieldMetadatas } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-flat-field-metadatas.util';
import { computeRecordFormWidgetForExistingObject } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/compute-record-form-widget-for-existing-object.util';
import { getRecordFormPageLayoutTabUniversalIdentifier } from 'src/engine/metadata-modules/metadata-side-effect/handlers/utils/get-record-form-page-layout-tab-universal-identifier.util';
import { type UniversalFlatPageLayoutWidget } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/types/universal-flat-page-layout-widget.type';

type RecordFormRelatedFlatEntityMaps = Pick<
  AllFlatEntityMaps,
  'flatFieldMetadataMaps' | 'flatPageLayoutTabMaps' | 'flatPageLayoutWidgetMaps'
>;

const computeObjectFilesFieldRecordFormWidgetsToCreate = ({
  flatObjectMetadata,
  flatFieldMetadataMaps,
  flatPageLayoutTabMaps,
  flatPageLayoutWidgetMaps,
}: {
  flatObjectMetadata: FlatObjectMetadata;
} & RecordFormRelatedFlatEntityMaps): UniversalFlatPageLayoutWidget[] => {
  const recordFormPageLayoutTabUniversalIdentifier =
    getRecordFormPageLayoutTabUniversalIdentifier({
      objectApplicationUniversalIdentifier:
        flatObjectMetadata.applicationUniversalIdentifier,
      objectMetadataUniversalIdentifier: flatObjectMetadata.universalIdentifier,
    });

  const hasRecordFormWidget = (flatFieldMetadata: FlatFieldMetadata) =>
    isDefined(
      flatPageLayoutWidgetMaps.byUniversalIdentifier[
        getSystemFormFieldPageLayoutWidgetUniversalIdentifier({
          fieldMetadataApplicationUniversalIdentifier:
            flatFieldMetadata.applicationUniversalIdentifier,
          pageLayoutTabUniversalIdentifier:
            recordFormPageLayoutTabUniversalIdentifier,
          fieldMetadataUniversalIdentifier:
            flatFieldMetadata.universalIdentifier,
        })
      ],
    );

  const filesFlatFieldMetadatas =
    findManyFlatEntityByUniversalIdentifierInUniversalFlatEntityMaps({
      flatEntityMaps: flatFieldMetadataMaps,
      universalIdentifiers: flatObjectMetadata.fieldUniversalIdentifiers,
    }).filter(
      (flatFieldMetadata) => flatFieldMetadata.type === FieldMetadataType.FILES,
    );

  const filesFlatFieldMetadatasWithoutWidget =
    computeRecordFormFlatFieldMetadatas({
      flatFieldMetadatas: filesFlatFieldMetadatas,
      labelIdentifierFieldMetadataUniversalIdentifier:
        flatObjectMetadata.labelIdentifierFieldMetadataUniversalIdentifier,
    }).filter((flatFieldMetadata) => !hasRecordFormWidget(flatFieldMetadata));

  return filesFlatFieldMetadatasWithoutWidget
    .map((flatFieldMetadata) =>
      computeRecordFormWidgetForExistingObject({
        sourceFlatFieldMetadata: flatFieldMetadata,
        orderedFormFlatFieldMetadatasInBatch:
          filesFlatFieldMetadatasWithoutWidget,
        recordFormPageLayoutTabUniversalIdentifier,
        flatPageLayoutTabMaps,
        flatPageLayoutWidgetMaps,
      }),
    )
    .filter(isDefined);
};

export const computeFilesFieldRecordFormWidgetsToCreate = ({
  flatObjectMetadataMaps,
  ...recordFormRelatedFlatEntityMaps
}: Pick<AllFlatEntityMaps, 'flatObjectMetadataMaps'> &
  RecordFormRelatedFlatEntityMaps): UniversalFlatPageLayoutWidget[] =>
  Object.values(flatObjectMetadataMaps.byUniversalIdentifier)
    .filter(isDefined)
    .flatMap((flatObjectMetadata) =>
      computeObjectFilesFieldRecordFormWidgetsToCreate({
        flatObjectMetadata,
        ...recordFormRelatedFlatEntityMaps,
      }),
    );
