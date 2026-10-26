import { useLingui } from '@lingui/react/macro';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  IconHash,
  IconHeart,
  IconInbox,
  IconLego,
  IconMessage,
  IconNewSection,
  IconPlus,
} from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { useWorkspaceNavigationMenuSections } from '@/navigation-menu-item/display/hooks/useWorkspaceNavigationMenuSections';
import { useNavigationMenuItemAiChatSectionLabel } from '@/navigation-menu-item/display/sections/ai-chat/hooks/useNavigationMenuItemAiChatSectionLabel';
import { NavigationMenuItemContainerTemplateMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerTemplateMenu';
import { NavigationMenuItemEntrance } from '@/navigation-menu-item/edit/components/NavigationMenuItemEntrance';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { getNavigationMenuAddSectionDropdownId } from '@/navigation-menu-item/edit/utils/getNavigationMenuAddSectionDropdownId';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { NavigationDrawerSection } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerSection';

const AI_SECTION_OPTIONS = [
  { type: NavigationMenuItemType.AI_CHAT_TRIAGE, Icon: IconInbox },
  { type: NavigationMenuItemType.AI_CHAT_FAVORITES, Icon: IconHeart },
  { type: NavigationMenuItemType.AI_CHAT_CHANNELS, Icon: IconHash },
  { type: NavigationMenuItemType.AI_CHAT_RECENTS, Icon: IconMessage },
  { type: NavigationMenuItemType.AI_AGENTS, Icon: IconLego },
];

type NavigationMenuItemAddSectionButtonProps = {
  parentId: string | null;
};

export const NavigationMenuItemAddSectionButton = ({
  parentId,
}: NavigationMenuItemAddSectionButtonProps) => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const sections = useWorkspaceNavigationMenuSections(parentId);
  const { getDefaultAiChatSectionLabel } =
    useNavigationMenuItemAiChatSectionLabel();
  const { createSection, createAiSection } =
    useCreateNavigationMenuTabOrSection();

  return (
    <NavigationDrawerSection>
      <NavigationMenuItemEntrance>
        <NavigationMenuItemContainerTemplateMenu
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
          groups={[
            {
              id: 'ai',
              options: hasAiPermission
                ? AI_SECTION_OPTIONS.map(({ type, Icon }) => {
                    const isAlreadyInSidebar = sections.some(
                      (section) => section.type === type,
                    );

                    return {
                      id: type,
                      label: getDefaultAiChatSectionLabel(type),
                      Icon,
                      isDisabled: isAlreadyInSidebar,
                      isAlreadyInSidebar,
                      onClick: () => createAiSection({ parentId, type }),
                    };
                  })
                : [],
            },
            {
              id: 'blank',
              options: [
                {
                  id: 'blank',
                  label: t`Blank section`,
                  Icon: IconPlus,
                  onClick: () => createSection(parentId),
                },
              ],
            },
          ]}
        />
      </NavigationMenuItemEntrance>
    </NavigationDrawerSection>
  );
};
