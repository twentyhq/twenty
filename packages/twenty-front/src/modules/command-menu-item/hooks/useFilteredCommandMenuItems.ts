import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import {
  useFindManyCommandMenuItemsQuery,
  type CommandMenuItem,
  type CommandMenuItemAvailabilityType,
} from '~/generated-metadata/graphql';

type UseFilteredCommandMenuItemsParams = {
  availabilityTypes: CommandMenuItemAvailabilityType[];
  objectNameSingular?: string;
  skip?: boolean;
};

export const useFilteredCommandMenuItems = ({
  availabilityTypes,
  objectNameSingular,
  skip,
}: UseFilteredCommandMenuItemsParams): {
  commandMenuItems: CommandMenuItem[];
  loading: boolean;
} => {
  const apolloCoreClient = useApolloCoreClient();

  const { data, loading } = useFindManyCommandMenuItemsQuery({
    client: apolloCoreClient,
    skip,
  });

  const filteredCommandMenuItems = (data?.commandMenuItems ?? []).filter(
    (item) => {
      if (!availabilityTypes.includes(item.availabilityType)) {
        return false;
      }

      if (
        isDefined(objectNameSingular) &&
        item.availabilityObjectNameSingular !== objectNameSingular
      ) {
        return false;
      }

      return true;
    },
  );

  return {
    commandMenuItems: filteredCommandMenuItems,
    loading,
  };
};
