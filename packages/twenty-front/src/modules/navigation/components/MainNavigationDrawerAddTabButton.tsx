import { useLingui } from '@lingui/react/macro';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconCode, IconInbox, IconPlus } from 'twenty-ui/icon';
import { PermissionFlagType } from '~/generated-metadata/graphql';

import { NavigationMenuItemContainerTemplateMenu } from '@/navigation-menu-item/edit/components/NavigationMenuItemContainerTemplateMenu';
import { useCreateNavigationMenuTabOrSection } from '@/navigation-menu-item/edit/hooks/useCreateNavigationMenuTabOrSection';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';

type MainNavigationDrawerAddTabButtonProps = {
  isExpanded: boolean;
};

export const MainNavigationDrawerAddTabButton = ({
  isExpanded,
}: MainNavigationDrawerAddTabButtonProps) => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { createTab } = useCreateNavigationMenuTabOrSection();

  return (
    <NavigationMenuItemContainerTemplateMenu
      dropdownId="navigation-menu-add-tab"
      title={t`Add tab`}
      side={isExpanded ? 'bottom' : 'right'}
      trigger={
        <LightIconButton
          emphasis="subtle"
          size={isExpanded ? 'sm' : 'md'}
          aria-label={t`Add tab`}
        >
          <IconPlus />
        </LightIconButton>
      }
      groups={[
        {
          id: 'blank',
          options: [
            {
              id: 'blank',
              label: t`Blank tab`,
              Icon: IconPlus,
              onClick: () => createTab('blank'),
            },
          ],
        },
        {
          id: 'templates',
          label: t`Templates`,
          options: [
            {
              id: 'developer-tools',
              label: t`Developers`,
              contextualText: t`API, webhooks, apps, CLI and logs`,
              Icon: IconCode,
              onClick: () => createTab('developer-tools'),
            },
            ...(hasAiPermission
              ? [
                  {
                    id: 'inbox',
                    label: t`Inbox`,
                    contextualText: t`Triage, favorite and recent chats`,
                    Icon: IconInbox,
                    onClick: () => createTab('inbox'),
                  },
                ]
              : []),
          ],
        },
      ]}
    />
  );
};
