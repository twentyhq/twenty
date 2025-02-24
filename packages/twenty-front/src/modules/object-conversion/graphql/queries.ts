import { gql } from '@apollo/client';

export const GET_OBJECT_CONVERSION_SETTINGS = gql`
  query GetObjectConversionSettings($objectMetadataId: String!) {
    getObjectConversionSettings(objectMetadataId: $objectMetadataId) {
      id
      objectMetadataId
      isConversionSource
      showConvertButton
    }
  }
`;

export const GET_CONVERSION_TEMPLATES = gql`
  query GetConversionTemplates {
    conversionTemplates {
      id
      name
      description
      sourceObjectMetadataId
      targetObjectMetadataId
      fieldMappingRules
      conversionSettings {
        keepOriginalObject
        createRelations
        markAsConverted
      }
      matchingRules {
        fieldName
        operator
        value
      }
      isDefault
      orderIndex
    }
  }
`;

export const GET_AVAILABLE_TEMPLATES_FOR_OBJECT = gql`
  query GetAvailableTemplatesForObject($objectId: String!, $recordId: String!) {
    availableTemplatesForObject(objectId: $objectId, recordId: $recordId) {
      id
      name
      description
      sourceObjectMetadataId
      targetObjectMetadataId
      fieldMappingRules
      conversionSettings {
        keepOriginalObject
        createRelations
        markAsConverted
      }
      matchingRules {
        fieldName
        operator
        value
      }
      isDefault
      orderIndex
    }
  }
`;
