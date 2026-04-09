import { gql } from 'apollo-server-core';

export const getConfigVariablesGroupedQueryFactory = () => {
  return {
    query: gql`
      query GetConfigVariablesGrouped {
        getConfigVariablesGrouped {
          groups {
            name
            description
            isHiddenOnLoad
            variables {
              name
              description
              value
              isSensitive
              isEnvOnly
              type
              options
              source
            }
          }
        }
      }
    `,
  };
};
