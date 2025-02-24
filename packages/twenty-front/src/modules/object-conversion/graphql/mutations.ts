import { gql } from '@apollo/client';

export const UPDATE_OBJECT_CONVERSION_SETTINGS = gql`
  mutation UpdateObjectConversionSettings(
    $objectMetadataId: String!
    $isConversionSource: Boolean!
    $showConvertButton: Boolean!
  ) {
    updateObjectConversionSettings(
      objectMetadataId: $objectMetadataId
      isConversionSource: $isConversionSource
      showConvertButton: $showConvertButton
    ) {
      id
      objectMetadataId
      isConversionSource
      showConvertButton
    }
  }
`;

export const CREATE_CONVERSION_TEMPLATE = gql`
  mutation CreateConversionTemplate($input: CreateTemplateInput!) {
    createConversionTemplate(input: $input) {
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

export const UPDATE_CONVERSION_TEMPLATE = gql`
  mutation UpdateConversionTemplate($input: UpdateTemplateInput!) {
    updateConversionTemplate(input: $input) {
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

export const DELETE_CONVERSION_TEMPLATE = gql`
  mutation DeleteConversionTemplate($templateId: String!) {
    deleteConversionTemplate(templateId: $templateId)
  }
`;

export const REORDER_CONVERSION_TEMPLATES = gql`
  mutation ReorderConversionTemplates($templateIds: [String!]!) {
    reorderConversionTemplates(templateIds: $templateIds) {
      id
      orderIndex
    }
  }
`;

export const CONVERT_OBJECT = gql`
  mutation ConvertObject(
    $objectId: String!
    $recordId: String!
    $templateId: String!
  ) {
    convertObject(
      objectId: $objectId
      recordId: $recordId
      templateId: $templateId
    ) {
      success
      convertedObjectId
      convertedObjectType
    }
  }
`;
