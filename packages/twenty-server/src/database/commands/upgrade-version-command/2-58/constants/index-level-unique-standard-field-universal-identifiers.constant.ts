import { STANDARD_OBJECTS } from 'twenty-shared/metadata';

export const INDEX_LEVEL_UNIQUE_STANDARD_FIELD_UNIVERSAL_IDENTIFIERS = {
  accessGroupGroupHash:
    STANDARD_OBJECTS.accessGroup.fields.groupHash.universalIdentifier,
  shortLinkTemplateAndResolvedUrlHash:
    STANDARD_OBJECTS.shortLink.fields.templateAndResolvedUrlHash
      .universalIdentifier,
  campaignDeliveryProviderMessageId:
    STANDARD_OBJECTS.campaignDelivery.fields.providerMessageId
      .universalIdentifier,
} as const;
