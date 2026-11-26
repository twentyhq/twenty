import { isNavigationMenuItemBuiltInSection } from '@/navigation-menu-item/common/utils/isNavigationMenuItemBuiltInSection';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

export const getContextMenuTargetSection = <
  TSection extends Pick<
    NavigationMenuItem,
    'id' | 'type' | 'builtInSectionKey'
  >,
>({
  sections,
  targetSectionId,
}: {
  sections: TSection[];
  targetSectionId: string | null;
}) =>
  sections.find(
    (section) =>
      section.id === targetSectionId &&
      !isNavigationMenuItemBuiltInSection(section),
  );
