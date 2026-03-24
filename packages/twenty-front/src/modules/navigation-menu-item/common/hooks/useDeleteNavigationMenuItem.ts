import { useMutation } from '@apollo/client/react';
import { DeleteNavigationMenuItemDocument } from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';

export const useDeleteNavigationMenuItem = () => {
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();

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
