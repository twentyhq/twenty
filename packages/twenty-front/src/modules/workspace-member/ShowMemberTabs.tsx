import styled from '@emotion/styled';
import { useEffect } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useFindAllInvitedMembers } from '@/settings/roles/hooks/useFindAllInvites';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';

import { useTabList } from '@/ui/layout/tab/hooks/useTabList';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import { MembersTabContent } from '@/workspace-member/components/MembersTabContent';
import { RolesTabList } from '@/workspace-member/components/RolesTabList';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';

const StyledShowMembersTabs = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

const StyledTabListContainer = styled.div`
  align-items: center;
  border-bottom: ${({ theme }) => `1px solid ${theme.border.color.light}`};
  box-sizing: border-box;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 40px;
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ShowMemberTabsProps = {
  isRightDrawer?: boolean;
  loading?: boolean;
};

export const ShowMemberTabs = ({
  loading,
  isRightDrawer = false,
}: ShowMemberTabsProps) => {
  const { activeTabId } = useTabList(TAB_LIST_COMPONENT_ID);

  const isMobile = useIsMobile() || isRightDrawer;

  const { roles } = useFindAllRoles();
  const { invites } = useFindAllInvitedMembers();
  const { records: workspaceMembers, refetch: refetchMembers } =
    useFindManyRecords<WorkspaceMember>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    });

  useEffect(() => {}, [refetchMembers]);

  const allRolesTab = {
    id: 'allroles',
    name: 'All',
    icon: 'IconUsers',
  };

  const tab = [
    allRolesTab,
    ...(roles?.map((role) => ({
      id: role.id,
      name: role.name,
      icon: role.icon,
    })) || []),
  ];

  const filteredWorkspaceMembers =
  activeTabId === 'allroles'
  ? workspaceMembers
  : workspaceMembers?.filter((member) => member.roleId === activeTabId) ||
  [];

  return (
    <StyledShowMembersTabs isMobile={isMobile}>
      <StyledTabListContainer>
        <RolesTabList
          loading={loading}
          tabListId={TAB_LIST_COMPONENT_ID}
          tabs={tab}
        />
      </StyledTabListContainer>
      {activeTabId && filteredWorkspaceMembers.length > 0 && (
        <MembersTabContent
          roles={roles}
          workspaceMembers={workspaceMembers}
          invitedMembers={invites}
          activeTabId={activeTabId}
          onUpdateMember={refetchMembers}
          filteredWorkspaceMembers={filteredWorkspaceMembers}
        />
      )}
    </StyledShowMembersTabs>
  );
};
