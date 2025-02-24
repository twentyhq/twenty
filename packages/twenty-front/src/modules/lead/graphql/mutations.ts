import { gql } from '@apollo/client';

export const CREATE_CONVERSION_TEMPLATE = gql`
  mutation CreateConversionTemplate($input: CreateTemplateInput!) {
    createConversionTemplate(input: $input) {
      id
      name
      description
      sourceLeadType
      targetObjectType
      fieldMappingRules
      conversionSettings {
        keepOriginalLead
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
      sourceLeadType
      targetObjectType
      fieldMappingRules
      conversionSettings {
        keepOriginalLead
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

export const CONVERT_LEAD = gql`
  mutation ConvertLead($leadId: String!, $templateId: String!) {
    convertLead(leadId: $leadId, templateId: $templateId) {
      success
      convertedObjectId
      convertedObjectType
    }
  }
`;
