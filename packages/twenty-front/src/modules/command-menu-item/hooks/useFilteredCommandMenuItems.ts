import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { isDefined } from 'twenty-shared/utils';
import {
  useFindManyCommandMenuItemsQuery,
  type CommandMenuItem,
  type CommandMenuItemAvailabilityType,
} from '~/generated-metadata/graphql';

type UseFilteredCommandMenuItemsParams = {
  availabilityTypes: CommandMenuItemAvailabilityType[];
  objectMetadataId?: string;
  skip?: boolean;
};

export const useFilteredCommandMenuItems = ({
  availabilityTypes,
  objectMetadataId,
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
        isDefined(objectMetadataId) &&
        item.availabilityObjectMetadataId !== objectMetadataId
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
