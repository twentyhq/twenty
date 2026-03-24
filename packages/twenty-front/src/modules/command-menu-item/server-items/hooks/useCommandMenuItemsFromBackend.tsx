import { useConvertBackendItemToCommandMenuItemConfig } from '@/command-menu-item/server-items/hooks/useConvertBackendItemToCommandMenuItemConfig';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useQuery } from '@apollo/client/react';
import { type CommandMenuContextApi } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemFieldsFragment,
  FindManyCommandMenuItemsDocument,
} from '~/generated-metadata/graphql';

export const useCommandMenuItemsFromBackend = (
  commandMenuContextApi: CommandMenuContextApi,
) => {
  const { convertBackendItemToCommandMenuItemConfig } =
    useConvertBackendItemToCommandMenuItemConfig();

  const contextStoreCurrentObjectMetadataItemId = useAtomComponentStateValue(
    contextStoreCurrentObjectMetadataItemIdComponentState,
  );

  const { data } = useQuery(FindManyCommandMenuItemsDocument);

  const allItems = data?.commandMenuItems ?? [];

  const objectMatches = (item: CommandMenuItemFieldsFragment) =>
    !isDefined(item.availabilityObjectMetadataId) ||
    item.availabilityObjectMetadataId ===
      contextStoreCurrentObjectMetadataItemId;

  return allItems
    .filter(objectMatches)
    .map((item) =>
      convertBackendItemToCommandMenuItemConfig(item, commandMenuContextApi),
    )
    .filter(isDefined)
    .filter((item) => item.shouldBeRegistered())
    .sort((a, b) => a.position - b.position);
};
