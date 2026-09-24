import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { isDefined } from 'twenty-shared/utils';

import { type TwentyStandardAllFlatEntityMaps } from 'src/engine/workspace-manager/twenty-standard-application/types/twenty-standard-all-flat-entity-maps.type';

const CAMPAIGN_SENDING_OBJECT_UNIVERSAL_IDENTIFIERS: string[] = [
  STANDARD_OBJECTS.campaignDelivery.universalIdentifier,
  STANDARD_OBJECTS.messageSuppression.universalIdentifier,
];

export const collectCampaignSendingStandardUniversalIdentifiers = ({
  standardAllFlatEntityMaps,
}: {
  standardAllFlatEntityMaps: TwentyStandardAllFlatEntityMaps;
}): { objectMetadata: string[]; fieldMetadata: string[]; index: string[] } => {
  const belongsToCampaignSendingObject = ({
    objectMetadataUniversalIdentifier,
  }: {
    objectMetadataUniversalIdentifier: string;
  }) =>
    CAMPAIGN_SENDING_OBJECT_UNIVERSAL_IDENTIFIERS.includes(
      objectMetadataUniversalIdentifier,
    );

  const fieldMetadata = Object.values(
    standardAllFlatEntityMaps.flatFieldMetadataMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(belongsToCampaignSendingObject)
    .map((flatFieldMetadata) => flatFieldMetadata.universalIdentifier);

  const index = Object.values(
    standardAllFlatEntityMaps.flatIndexMaps.byUniversalIdentifier,
  )
    .filter(isDefined)
    .filter(belongsToCampaignSendingObject)
    .map((flatIndexMetadata) => flatIndexMetadata.universalIdentifier);

  return {
    objectMetadata: CAMPAIGN_SENDING_OBJECT_UNIVERSAL_IDENTIFIERS,
    fieldMetadata,
    index,
  };
};
