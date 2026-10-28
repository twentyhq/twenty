import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconNewSection, IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { NAVIGATION_MENU_ITEM_AI_SECTION_TYPES } from '@/navigation-menu-item/common/constants/NavigationMenuItemAiSectionTypes';
import { NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS } from '@/navigation-menu-item/common/constants/NavigationMenuItemBuiltInSections';
import { type NavigationMenuItemBuiltInSectionType } from '@/navigation-menu-item/common/types/NavigationMenuItemBuiltInSectionType';
import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { useNavigationMenuItemSectionLabel } from '@/navigation-menu-item/common/hooks/useNavigationMenuItemSectionLabel';
import { NavigationMenuItemGroupedOptionsMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemGroupedOptionsMenu';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { getNavigationMenuAddSectionDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuAddSectionDropdownId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { ColoredIcon } from '@/ui/icon/components/ColoredIcon';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

type NavigationMenuItemAddSectionButtonProps = {
  parentId: string | null;
};

export const NavigationMenuItemAddSectionButton = ({
  parentId,
}: NavigationMenuItemAddSectionButtonProps) => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const sections = useWorkspaceNavigationMenuSections(parentId);
  const { getDefaultSectionLabel } = useNavigationMenuItemSectionLabel();
  const { createSection, createBuiltInSection } =
    useCreateNavigationMenuTabOrSection();
  const builtInSectionTypes: NavigationMenuItemBuiltInSectionType[] = [
    NavigationMenuItemType.FAVORITES,
    ...(hasAiPermission ? NAVIGATION_MENU_ITEM_AI_SECTION_TYPES : []),
  ];

  const isInSidebar = (type: NavigationMenuItemBuiltInSectionType) =>
    sections.some((section) => section.type === type);

  const groups = [
    {
      id: 'available',
      options: builtInSectionTypes
        .filter((type) => !isInSidebar(type))
        .map((type) => {
          const { Icon, color } = NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS[type];

          return {
            id: type,
            label: getDefaultSectionLabel(type),
            icon: <ColoredIcon Icon={Icon} color={color} />,
            onClick: () => createBuiltInSection({ parentId, type }),
          };
        }),
    },
    {
      id: 'in-sidebar',
      label: t`Already in sidebar`,
      options: builtInSectionTypes.filter(isInSidebar).map((type) => ({
        id: type,
        label: getDefaultSectionLabel(type),
        Icon: NAVIGATION_MENU_ITEM_BUILT_IN_SECTIONS[type].Icon,
        isDisabled: true,
        onClick: () => createBuiltInSection({ parentId, type }),
      })),
    },
    {
      id: 'custom',
      options: [
        {
          id: 'custom',
          label: t`Custom section`,
          Icon: IconPlus,
          onClick: () => createSection(parentId),
        },
      ],
    },
  ];

  return (
    <NavigationDrawerSection>
      <NavigationMenuItemEntrance>
        <NavigationMenuItemGroupedOptionsMenu
          dropdownId={getNavigationMenuAddSectionDropdownId(parentId)}
          title={t`Add section`}
          isTriggerNativeButton={false}
          trigger={
            <div tabIndex={-1}>
              <NavigationDrawerItem
                Icon={IconNewSection}
                label={t`Add section`}
                triggerEvent="CLICK"
                variant="tertiary"
              />
            </div>
          }
          groups={groups}
        />
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};
