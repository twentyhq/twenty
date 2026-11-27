import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getNavigationMenuItemDescendantIds = ({
  items,
  ancestorId,
}: {
  items: Pick<NavigationMenuItem, 'id' | 'parentId'>[];
  ancestorId: string;
}): string[] => {
  const childIds = items
    .filter((item) => item.parentId === ancestorId)
    .map((item) => item.id);

  return childIds.flatMap((childId) => [
    childId,
    ...getNavigationMenuItemDescendantIds({ items, ancestorId: childId }),
  ]);
};
