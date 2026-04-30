import { gql } from '@apollo/client';

export const GET_TENANT-WIZARD_DATA = gql`
  query GetTenantWizardData {
    tenantwizardData {
      id
    }
  }
`;

export const CREATE_TENANT-WIZARD_ITEM = gql`
  mutation CreateTenantWizardItem($input: TenantWizardInput!) {
    createTenantWizardItem(input: $input) {
      id
    }
  }
`;

export const GET_TENANT-WIZARD_ANALYTICS = gql`
  query GetTenantWizardAnalytics {
    tenantwizardAnalytics {
      totalCount
      activeCount
    }
  }
`;
