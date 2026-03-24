import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  type NavigationMenuItem,
  type UpdateNavigationMenuItemInput,
  type UpdateOneNavigationMenuItemInput,
  UpdateNavigationMenuItemDocument,
} from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';

export const useUpdateNavigationMenuItem = () => {
  const { addToDraft, applyChanges } = useUpdateMetadataStoreDraft();

  const [updateNavigationMenuItemMutation] = useMutation(
    UpdateNavigationMenuItemDocument,
  );

  const updateNavigationMenuItem = async (
    input: UpdateNavigationMenuItemInput & { id: string },
  ) => {
    const { id, ...update } = input;

    addToDraft({
      key: 'navigationMenuItems',
      items: [{ id, ...update } as NavigationMenuItem],
    });
    applyChanges();

    const updateOneInput: UpdateOneNavigationMenuItemInput = {
      id,
      update,
    };

    const result = await updateNavigationMenuItemMutation({
      variables: { input: updateOneInput },
    });

    const updated = result.data?.updateNavigationMenuItem;

    if (isDefined(updated)) {
      addToDraft({ key: 'navigationMenuItems', items: [updated] });
      applyChanges();
    }
  };

  return { updateNavigationMenuItem };
};
