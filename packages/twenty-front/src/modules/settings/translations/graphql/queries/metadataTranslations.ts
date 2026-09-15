import { gql } from '@apollo/client';

export const METADATA_TRANSLATIONS = gql`
  query MetadataTranslations($input: MetadataTranslationsInput!) {
    metadataTranslations(input: $input) {
      metadataName
      recordId
      objectMetadataId
      property
      locale
      sourceValue
      canonicalValue
      value
      provenance
    }
  }
`;
