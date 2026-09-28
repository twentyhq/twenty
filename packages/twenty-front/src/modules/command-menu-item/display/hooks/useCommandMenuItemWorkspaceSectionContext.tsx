import { Avatar } from 'twenty-ui/primitives/data-display';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { DEFAULT_WORKSPACE_LOGO } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceLogo';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

export const useCommandMenuItemWorkspaceSectionContext =
  (): CommandMenuItemSectionContext => {
    const currentWorkspace = useAtomStateValue(currentWorkspaceState);

    return {
      icon: (
        <Avatar
          size="md"
          name={currentWorkspace?.displayName ?? ''}
          src={getAbsoluteImageUrl(
            currentWorkspace?.logo ?? DEFAULT_WORKSPACE_LOGO,
          )}
        />
      ),
    };
  };
