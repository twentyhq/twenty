import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { useImpersonationAuth } from '@/settings/admin-panel/hooks/useImpersonationAuth';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { useRecoilValue } from 'recoil';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconInfoCircle, IconLockOpen } from 'twenty-ui/display';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isImpersonatingState } from '@/auth/states/isImpersonatingState';
import { MemberInfosTab } from '@/settings/members/components/MemberInfosTab';
import { MemberPermissionsTab } from '@/settings/members/components/MemberPermissionsTab';
import { useWorkspaceMemberRoles } from '@/settings/members/hooks/useWorkspaceMemberRoles';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  useDeleteUserWorkspaceMutation,
  useImpersonateMutation,
} from '~/generated-metadata/graphql';
import { PermissionFlagType } from '~/generated/graphql';

const SETTINGS_WORKSPACE_MEMBER_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-workspace-member-tabs',
  TABS_IDS: {
    INFOS: 'infos',
    PERMISSIONS: 'permissions',
  },
};

const DELETE_MEMBER_MODAL_ID = 'workspace-member-delete-modal';

export const SettingsWorkspaceMember = () => {
  const { workspaceMemberId = '' } = useParams();
  const navigateSettings = useNavigateSettings();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { executeImpersonationAuth } = useImpersonationAuth();
  const [impersonate] = useImpersonateMutation();
  const isImpersonating = useRecoilValue(isImpersonatingState);
  const canImpersonate =
    useHasPermissionFlag(PermissionFlagType.IMPERSONATE) && !isImpersonating;

  const {
    roles,
    allRoles,
    loading: rolesLoading,
  } = useWorkspaceMemberRoles(workspaceMemberId);

  const { record: member, loading } = useFindOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
    objectRecordId: workspaceMemberId,
    recordGqlFields: {
      id: true,
      userId: true,
      name: { firstName: true, lastName: true },
      avatarUrl: true,
      userEmail: true,
    },
  });

  const tabListComponentId = `${SETTINGS_WORKSPACE_MEMBER_TABS.COMPONENT_INSTANCE_ID}-${workspaceMemberId}`;
  const activeTabId = useRecoilComponentValue(
    activeTabIdComponentState,
    tabListComponentId,
  );

  const { updateOneRecord } = useUpdateOneRecord<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  const [deleteUserFromWorkspace, { loading: isDeleting }] =
    useDeleteUserWorkspaceMutation();

  const debouncedUpdateName = useDebouncedCallback(
    async (firstName: string, lastName: string) => {
      if (
        !member?.id ||
        firstName.trim().length < 1 ||
        lastName.trim().length < 1
      ) {
        return;
      }
      try {
        await updateOneRecord({
          idToUpdate: member.id,
          updateOneRecordInput: {
            name: { firstName, lastName },
          },
        });
      } catch (error) {
        enqueueErrorSnackBar({
          message:
            error instanceof Error
              ? error.message
              : t`Error while saving the name`,
        });
      }
    },
    400,
  );

  const handleDeleteMember = async () => {
    if (!member?.id) return;
    try {
      await deleteUserFromWorkspace({
        variables: { workspaceMemberIdToDelete: member.id },
      });
      enqueueSuccessSnackBar({ message: t`Member removed from workspace` });
      closeModal(DELETE_MEMBER_MODAL_ID);
      navigateSettings(SettingsPath.WorkspaceMembersPage);
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Unable to delete member right now`,
      });
    }
  };

  const handleImpersonate = async () => {
    if (!member?.userId || !currentWorkspace?.id) {
      enqueueErrorSnackBar({
        message: t`Cannot impersonate selected user`,
        options: { duration: 2000 },
      });
      return;
    }

    await impersonate({
      variables: {
        userId: member.userId,
        workspaceId: currentWorkspace.id,
      },
      onCompleted: async (data) => {
        const { loginToken } = data.impersonate;
        await executeImpersonationAuth(loginToken.token);
      },
      onError: () => {
        enqueueErrorSnackBar({
          message: t`Cannot impersonate selected user`,
          options: { duration: 2000 },
        });
      },
    });
  };

  const isLoading = loading || rolesLoading || !member;

  return (
    <>
      <SettingsRolesQueryEffect />
      {isLoading ? null : (
        <SubMenuTopBarContainer
          title={`${member.name.firstName} ${member.name.lastName}`}
          links={[
            {
              children: t`Workspace`,
              href: getSettingsPath(SettingsPath.Workspace),
            },
            {
              children: t`Members`,
              href: getSettingsPath(SettingsPath.WorkspaceMembersPage),
            },
            {
              children: `${member.name.firstName} ${member.name.lastName}`,
            },
          ]}
        >
          <SettingsPageContainer>
            <TabList
              tabs={[
                {
                  id: SETTINGS_WORKSPACE_MEMBER_TABS.TABS_IDS.INFOS,
                  title: t`Infos`,
                  Icon: IconInfoCircle,
                },
                {
                  id: SETTINGS_WORKSPACE_MEMBER_TABS.TABS_IDS.PERMISSIONS,
                  title: t`Permissions`,
                  Icon: IconLockOpen,
                },
              ]}
              componentInstanceId={tabListComponentId}
            />

            {activeTabId === SETTINGS_WORKSPACE_MEMBER_TABS.TABS_IDS.INFOS && (
              <MemberInfosTab
                member={member}
                onImpersonate={canImpersonate ? handleImpersonate : undefined}
                onNameChange={debouncedUpdateName}
                onDelete={() => openModal(DELETE_MEMBER_MODAL_ID)}
              />
            )}

            {activeTabId ===
              SETTINGS_WORKSPACE_MEMBER_TABS.TABS_IDS.PERMISSIONS && (
              <MemberPermissionsTab
                member={member}
                roles={roles}
                allRoles={allRoles}
              />
            )}
          </SettingsPageContainer>

          <ConfirmationModal
            modalId={DELETE_MEMBER_MODAL_ID}
            title={t`Remove member from workspace`}
            subtitle={t`This action cannot be undone. This will permanently remove this member from this workspace and remove them from all their assignments.`}
            onConfirmClick={handleDeleteMember}
            confirmButtonText={t`Remove member`}
            loading={isDeleting}
          />
        </SubMenuTopBarContainer>
      )}
    </>
  );
};
