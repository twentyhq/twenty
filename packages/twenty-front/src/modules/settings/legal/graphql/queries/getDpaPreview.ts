import gql from 'graphql-tag';

export const GET_DPA_PREVIEW = gql`
  query GetDpaPreview {
    dpaPreview {
      title
      lastUpdatedLabel
      templateVersion
      region
      processorEntity
      sccSectionActive
      blocks {
        kind
        text
        label
        value
      }
    }
  }
`;
