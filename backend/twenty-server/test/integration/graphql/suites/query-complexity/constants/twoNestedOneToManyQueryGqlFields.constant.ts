export const TWO_NESTED_ONE_TO_MANY_QUERY_GQL_FIELDS = `
  id
  pointOfContactForOpportunities {
    edges {
      node {
        company {
            people {
            edges {
                node {
                id
                pointOfContactForOpportunities {
                    edges {
                        node {
                            id
                        }
                    }
                }
                }
            }
        }
        }
      }
    }
  }
`;
