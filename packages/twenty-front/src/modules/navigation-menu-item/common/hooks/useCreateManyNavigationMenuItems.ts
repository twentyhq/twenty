import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateNavigationMenuItemInput,
  CreateManyNavigationMenuItemsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';

export const useCreateManyNavigationMenuItems = () => {
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const [createManyNavigationMenuItemsMutation] = useMutation(
    CreateManyNavigationMenuItemsDocument,
  );

  const createManyNavigationMenuItems = async (
    inputs: CreateNavigationMenuItemInput[],
  ): Promise<NavigationMenuItem[]> => {
    if (inputs.length === 0) {
      return [];
    }

    const result = await createManyNavigationMenuItemsMutation({
      variables: { inputs },
    });

    const createdItems = result.data?.createManyNavigationMenuItems;

    if (isDefined(createdItems) && createdItems.length > 0) {
      addToDraft({
        key: 'navigationMenuItems',
        items: createdItems as NavigationMenuItem[],
      });
      applyChanges();
    }

    return (createdItems as NavigationMenuItem[]) ?? [];
  };

  return { createManyNavigationMenuItems };
};
