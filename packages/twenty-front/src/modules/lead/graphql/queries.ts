import { gql } from '@apollo/client';

export const GET_CONVERSION_TEMPLATES = gql`
  query GetConversionTemplates {
    conversionTemplates {
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

export const GET_AVAILABLE_TEMPLATES_FOR_LEAD = gql`
  query GetAvailableTemplatesForLead($leadId: String!) {
    availableTemplatesForLead(leadId: $leadId) {
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
