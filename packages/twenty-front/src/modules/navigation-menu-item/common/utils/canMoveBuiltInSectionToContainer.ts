import { canAddBuiltInSectionToContainer } from '@/navigation-menu-item/common/utils/canAddBuiltInSectionToContainer';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const canMoveBuiltInSectionToContainer = ({
  builtInSectionKey,
  containerId,
  items,
}: {
  builtInSectionKey: string;
  containerId: string | null;
  items: Pick<NavigationMenuItem, 'builtInSectionKey' | 'parentId'>[];
}) =>
  builtInSectionKey !== 'favorites' ||
  canAddBuiltInSectionToContainer({ builtInSectionKey, containerId, items });
