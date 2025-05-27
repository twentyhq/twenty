import { useLingui } from '@lingui/react/macro';
import { Workspaces, workspacesState } from '@/auth/states/workspaces';
import { StyledDropdownMenuSubheader } from '@/ui/layout/dropdown/components/StyledDropdownMenuSubheader';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { getWorkspaceUrl } from '~/utils/getWorkspaceUrl';
import { WorkspaceItem } from './WorkspaceItem';
import { useFilteredWorkspaces } from '@/ui/navigation/navigation-drawer/hooks/useFilteredWorkspaces';
import { useBuildWorkspaceUrl } from '@/domain-manager/hooks/useBuildWorkspaceUrl';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useRedirectToWorkspaceDomain } from '@/domain-manager/hooks/useRedirectToWorkspaceDomain';
import { useRecoilValue } from 'recoil';

export const MemberWorkspaces = ({ searchValue }: { searchValue: string }) => {
  const { t } = useLingui();

  const workspaces = useRecoilValue(workspacesState);
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const { searchWorkspace } = useFilteredWorkspaces();
  const { buildWorkspaceUrl } = useBuildWorkspaceUrl();
  const { redirectToWorkspaceDomain } = useRedirectToWorkspaceDomain();

  const filterWorkspace: Workspaces = searchWorkspace(searchValue, workspaces);

  return (
    <>
      <StyledDropdownMenuSubheader>{t`Member of`}</StyledDropdownMenuSubheader>
      <DropdownMenuItemsContainer>
        {filterWorkspace.map((workspace) => (
          <WorkspaceItem
            key={workspace.id}
            workspace={workspace}
            isSelected={currentWorkspace?.id === workspace.id}
            link={buildWorkspaceUrl(getWorkspaceUrl(workspace.workspaceUrls))}
          />
        ))}
      </DropdownMenuItemsContainer>
    </>
  );
};
