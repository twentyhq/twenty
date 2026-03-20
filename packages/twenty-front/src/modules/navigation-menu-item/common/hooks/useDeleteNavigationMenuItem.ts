import { useMutation } from '@apollo/client/react';
import { DeleteNavigationMenuItemDocument } from '~/generated-metadata/graphql';

import { useMetadataStore } from '@/metadata-store/hooks/useMetadataStore';

export const useDeleteNavigationMenuItem = () => {
  const { removeFromDraft, applyChanges } = useMetadataStore();

  const [deleteNavigationMenuItemMutation] = useMutation(
    DeleteNavigationMenuItemDocument,
  );

  const deleteNavigationMenuItem = async (id: string) => {
    removeFromDraft({ key: 'navigationMenuItems', itemIds: [id] });
    applyChanges();

    await deleteNavigationMenuItemMutation({
      variables: { id },
    });
  };

  return { deleteNavigationMenuItem };
};
