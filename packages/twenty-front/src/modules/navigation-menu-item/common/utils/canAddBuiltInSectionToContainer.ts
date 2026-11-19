import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const canAddBuiltInSectionToContainer = ({
  builtInSectionKey,
  containerId,
  items,
}: {
  builtInSectionKey: string;
  containerId: string | null;
  items: Pick<NavigationMenuItem, 'builtInSectionKey' | 'parentId'>[];
}) => {
  const isAlreadyShownOnHome =
    builtInSectionKey === 'favorites' && containerId === null;

  const isAlreadyInContainer = items.some(
    (item) =>
      item.builtInSectionKey === builtInSectionKey &&
      (item.parentId ?? null) === containerId,
  );

  return !isAlreadyShownOnHome && !isAlreadyInContainer;
};
