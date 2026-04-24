export const PROJECT_V2_ITEM_FRAGMENT = `
  id
  content {
    __typename
    ... on Issue {
      title
      number
      url
      repository { nameWithOwner }
    }
    ... on PullRequest {
      title
      number
      url
      repository { nameWithOwner }
    }
    ... on DraftIssue {
      title
    }
  }
  fieldValues(first: 20) {
    nodes {
      __typename
      ... on ProjectV2ItemFieldSingleSelectValue {
        name
        field { ... on ProjectV2SingleSelectField { name } }
      }
      ... on ProjectV2ItemFieldIterationValue {
        title
        field { ... on ProjectV2IterationField { name } }
      }
      ... on ProjectV2ItemFieldTextValue {
        text
        field { ... on ProjectV2Field { name } }
      }
      ... on ProjectV2ItemFieldNumberValue {
        number
        field { ... on ProjectV2Field { name } }
      }
      ... on ProjectV2ItemFieldUserValue {
        users(first: 10) { nodes { login } }
        field { ... on ProjectV2Field { name } }
      }
    }
  }
`;
