import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';
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
import { useOpenDropdown } from '@/ui/layout/dropdown/hooks/useOpenDropdown';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';
import { NavigationDrawerSectionTitle } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSectionTitle';

const StyledAddSectionIcon = styled.span`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  justify-content: center;
  width: ${themeCssVariables.spacing[6]};

  .section-title-container:hover & {
    color: ${themeCssVariables.font.color.secondary};
  }
`;

type NavigationMenuItemAddSectionButtonProps = {
  parentId: string | null;
};

export const NavigationMenuItemAddSectionButton = ({
  parentId,
}: NavigationMenuItemAddSectionButtonProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const sections = useWorkspaceNavigationMenuSections(parentId);
  const { getDefaultSectionLabel } = useNavigationMenuItemSectionLabel();
  const { createSection, createBuiltInSection } =
    useCreateNavigationMenuTabOrSection();
  const { openDropdown } = useOpenDropdown();
  const dropdownId = getNavigationMenuAddSectionDropdownId(parentId);
  const builtInSectionTypes: NavigationMenuItemBuiltInSectionType[] = [
    NavigationMenuItemType.FAVORITES,
    ...(hasAiPermission ? NAVIGATION_MENU_ITEM_AI_SECTION_TYPES : []),
  ];

  const groups = [
    {
      id: 'built-in',
      options: builtInSectionTypes
        .filter((type) => !sections.some((section) => section.type === type))
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
          dropdownId={dropdownId}
          title={t`Add section`}
          isTriggerNativeButton={false}
          trigger={
            <div>
              <NavigationDrawerSectionTitle
                label={t`Add section`}
                onClick={() =>
                  openDropdown({
                    dropdownComponentInstanceIdFromProps: dropdownId,
                  })
                }
                alwaysShowRightIcon
                rightIcon={
                  <StyledAddSectionIcon>
                    <IconPlus size="12px" stroke={theme.icon.stroke.lg} />
                  </StyledAddSectionIcon>
                }
              />
            </div>
          }
          groups={groups}
        />
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};
