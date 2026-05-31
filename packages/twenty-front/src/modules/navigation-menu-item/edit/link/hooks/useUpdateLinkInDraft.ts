import { type NavigationMenuItem } from '~/generated-metadata/graphql';

import { useNavigationMenuItemEditController } from '@/navigation-menu-item/edit/hooks/useNavigationMenuItemEditController';

export const useUpdateLinkInDraft = () => {
  const { applyUpdate } = useNavigationMenuItemEditController();

  const updateLinkInDraft = (
    linkId: string,
    updates: { name?: string; link?: string },
  ) => {
    const normalizedUpdates: Partial<NavigationMenuItem> = {};
    if (updates.name !== undefined) {
      normalizedUpdates.name = updates.name.trim() || 'Link';
    }
    if (updates.link !== undefined && updates.link.trim() !== '') {
      normalizedUpdates.link = updates.link.trim();
    }
    void applyUpdate(linkId, normalizedUpdates);
  };

  return { updateLinkInDraft };
};
