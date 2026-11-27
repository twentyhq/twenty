import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const sortNavigationMenuContainerChildren = <
  TItem extends Pick<NavigationMenuItem, 'position'>,
>({
  items,
  sections,
}: {
  items: TItem[];
  sections: TItem[];
}): TItem[] =>
  [
    ...items.map((child) => ({ child, isSection: false })),
    ...sections.map((child) => ({ child, isSection: true })),
  ]
    .sort(
      (first, second) =>
        first.child.position - second.child.position ||
        Number(first.isSection) - Number(second.isSection),
    )
    .map(({ child }) => child);
