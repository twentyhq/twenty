import { gql, useQuery, useMutation } from '@apollo/client';

const GET_MODULE_ADOPTION = gql`
  query GetModuleAdoption {
    moduleAdoption {
      flags {
        id
        key
        label
        description
        enabled
        scope
        updatedAt
        createdAt
      }
      adoptionMetrics {
        flagId
        flagKey
        flagLabel
        activeUsers
        totalUsers
        adoptionPercentage
        lastUsedAt
      }
    }
  }
`;

const TOGGLE_FLAG = gql`
  mutation ToggleFlag($flagId: String!, $enabled: Boolean!) {
    toggleFlag(flagId: $flagId, enabled: $enabled) {
      id
      enabled
    }
  }
`;

const BULK_TOGGLE = gql`
  mutation BulkToggleFlags($flagIds: [String!]!, $enabled: Boolean!) {
    bulkToggleFlags(flagIds: $flagIds, enabled: $enabled) {
      flagId
      success
      error
    }
  }
`;

export const useModuleAdoption = () => {
  const { data, loading, refetch } = useQuery(GET_MODULE_ADOPTION);

  return {
    flags: data?.moduleAdoption?.flags ?? [],
    adoptionMetrics: data?.moduleAdoption?.adoptionMetrics ?? [],
    loading,
    refetch,
  };
};

export const useToggleFlag = () => {
  const [toggleFlag, { loading }] = useMutation(TOGGLE_FLAG);

  return {
    toggleFlag: (flagId: string, enabled: boolean) =>
      toggleFlag({ variables: { flagId, enabled } }),
    loading,
  };
};

export const useBulkToggle = () => {
  const [bulkToggle, { loading }] = useMutation(BULK_TOGGLE);

  return {
    bulkToggle: (flagIds: string[], enabled: boolean) =>
      bulkToggle({ variables: { flagIds, enabled } }),
    loading,
  };
};
