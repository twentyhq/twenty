import { useMutation } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  type CreateNavigationMenuItemInput,
  CreateManyNavigationMenuItemsDocument,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';

const buildOptimisticNavigationMenuItem = (
  input: CreateNavigationMenuItemInput & { id: string },
): NavigationMenuItem => ({
  id: input.id,
  type: input.type,
  position: input.position ?? 0,
  userWorkspaceId: input.userWorkspaceId ?? null,
  targetRecordId: input.targetRecordId ?? null,
  targetObjectMetadataId: input.targetObjectMetadataId ?? null,
  viewId: input.viewId ?? null,
  folderId: input.folderId ?? null,
  name: input.name ?? null,
  link: input.link ?? null,
  icon: input.icon ?? null,
  color: input.color ?? null,
  applicationId: null,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});

export const useCreateManyNavigationMenuItems = () => {
  const { addToDraft, removeFromDraft, applyChanges } =
    useUpdateMetadataStoreDraft();

  const [createManyNavigationMenuItemsMutation] = useMutation(
    CreateManyNavigationMenuItemsDocument,
  );

  const createManyNavigationMenuItems = async (
    inputs: CreateNavigationMenuItemInput[],
  ): Promise<NavigationMenuItem[]> => {
    if (inputs.length === 0) {
      return [];
    }

    const inputsWithIds = inputs.filter(
      (input): input is CreateNavigationMenuItemInput & { id: string } =>
        isDefined(input.id),
    );

    if (inputsWithIds.length > 0) {
      addToDraft({
        key: 'navigationMenuItems',
        items: inputsWithIds.map(buildOptimisticNavigationMenuItem),
      });
      applyChanges();
    }

    try {
      const result = await createManyNavigationMenuItemsMutation({
        variables: { inputs },
      });

      const createdItems = result.data?.createManyNavigationMenuItems ?? [];

      if (createdItems.length > 0) {
        addToDraft({ key: 'navigationMenuItems', items: createdItems });
        applyChanges();
      }

      return createdItems;
    } catch (error) {
      if (inputsWithIds.length > 0) {
        removeFromDraft({
          key: 'navigationMenuItems',
          itemIds: inputsWithIds.map((input) => input.id),
        });
        applyChanges();
      }
      throw error;
    }
  };

  return { createManyNavigationMenuItems };
};
