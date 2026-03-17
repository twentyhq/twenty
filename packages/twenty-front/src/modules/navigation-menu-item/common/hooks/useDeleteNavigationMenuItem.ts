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

    try {
      await deleteNavigationMenuItemMutation({
        variables: { id },
      });
    } catch (error) {
      // TODO: revert optimistic removal by re-fetching
      throw error;
    }
  };

  return { deleteNavigationMenuItem };
};
