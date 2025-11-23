import styled from '@emotion/styled';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsRolesQueryEffect } from '@/settings/roles/components/SettingsRolesQueryEffect';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { TabList } from '@/ui/layout/tab-list/components/TabList';
import { activeTabIdComponentState } from '@/ui/layout/tab-list/states/activeTabIdComponentState';
import { useRecoilComponentValue } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValue';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import {
  buildSignedPath,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import {
  H2Title,
  IconInfoCircle,
  IconLockOpen,
  IconPlus,
  IconTrash,
  Status,
} from 'twenty-ui/display';
import { Button, LightIconButton } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { MenuItem } from 'twenty-ui/navigation';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

import { ImageInput } from '@/ui/input/components/ImageInput';
import { type WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import {
  useDeleteUserWorkspaceMutation,
  useGetRolesQuery,
  useUpdateWorkspaceMemberRoleMutation,
  useUploadProfilePictureMutation,
} from '~/generated-metadata/graphql';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

type WorkspaceMemberWithRoles = WorkspaceMember & {
  roles?: { id: string; label: string; icon?: string | null }[];
};

const SETTINGS_WORKSPACE_MEMBER_TABS = {
  COMPONENT_INSTANCE_ID: 'settings-workspace-member-tabs',
  TABS_IDS: {
    INFOS: 'infos',
    PERMISSIONS: 'permissions',
  },
} as const;

const DELETE_MEMBER_MODAL_ID = 'workspace-member-delete-modal';

const StyledNameRow = styled.div`
  display: grid;
  gap: ${({ theme }) => theme.spacing(3)};
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const StyledRoleCard = styled.div`
  align-items: center;
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2.5)}
    ${({ theme }) => theme.spacing(3)};
`;

const StyledRoleInfo = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const SettingsWorkspaceMemberInfosTab = ({
  member,
  onAvatarChange,
  onNameChange,
  onDelete,
}: {
  member: WorkspaceMemberWithRoles;
  onAvatarChange: (action: 'upload' | 'remove', file?: File) => Promise<void>;
  onNameChange: (firstName: string, lastName: string) => void;
  onDelete: () => void;
  isDeleting: boolean;
}) => {
  const [firstName, setFirstName] = useState(member.name.firstName);
  const [lastName, setLastName] = useState(member.name.lastName);
  const [avatarUrl, setAvatarUrl] = useState<string | null | undefined>(
    member.avatarUrl,
  );
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    setFirstName(member.name.firstName);
    setLastName(member.name.lastName);
    setAvatarUrl(member.avatarUrl);
  }, [member]);

  const handleUpload = async (file: File) => {
    setIsUploading(true);
    setUploadError(null);
    try {
      await onAvatarChange('upload', file);
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : t`Failed to upload picture`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async () => {
    setIsUploading(true);
    setUploadError(null);
    try {
      await onAvatarChange('remove');
    } catch (error) {
      setUploadError(
        error instanceof Error ? error.message : t`Failed to remove picture`,
      );
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <Section>
        <H2Title title={t`Picture`} />
        <ImageInput
          picture={avatarUrl}
          onUpload={handleUpload}
          onRemove={handleRemove}
          onAbort={() => setIsUploading(false)}
          isUploading={isUploading}
          errorMessage={uploadError}
        />
      </Section>

      <Section>
        <H2Title
          title={t`Name`}
          description={t`Your name as it will be displayed`}
        />
        <StyledNameRow>
          <SettingsTextInput
            instanceId={`workspace-member-first-name-${member.id}`}
            label={t`First Name`}
            value={firstName}
            onChange={(value) => {
              setFirstName(value);
              onNameChange(value, lastName);
            }}
            fullWidth
          />
          <SettingsTextInput
            instanceId={`workspace-member-last-name-${member.id}`}
            label={t`Last name`}
            value={lastName}
            onChange={(value) => {
              setLastName(value);
              onNameChange(firstName, value);
            }}
            fullWidth
          />
        </StyledNameRow>
      </Section>

      <Section>
        <H2Title
          title={t`Email`}
          description={t`The email associated to this account`}
        />
        <SettingsTextInput
          instanceId={`workspace-member-email-${member.id}`}
          value={member.userEmail}
          disabled
          fullWidth
          type="email"
        />
      </Section>

      <Section>
        <H2Title
          title={t`Danger zone`}
          description={t`Delete account and all the associated data`}
        />
        <Button
          accent="danger"
          title={t`Delete account`}
          variant="secondary"
          size="small"
          onClick={onDelete}
        />
      </Section>
    </>
  );
};

const SettingsWorkspaceMemberPermissionsTab = ({
  member,
  onAssignRole,
  roles,
  rolesLoading,
}: {
  member: WorkspaceMemberWithRoles;
  onAssignRole: (roleId: string) => void;
  roles: { id: string; label: string; icon?: string | null }[];
  isAssigning: boolean;
  rolesLoading: boolean;
}) => {
  const currentRoles = member.roles ?? [];
  const assignableRoles = roles.filter(
    (role) => !currentRoles.find((existing) => existing.id === role.id),
  );
  const primaryRole = currentRoles[0]?.label;
  const additionalRolesCount = currentRoles.length - 1;

  return (
    <>
      <Section>
        <H2Title
          title={t`Role`}
          description={t`Customize what this user can view and perform`}
        />
        <StyledRoleCard>
          <StyledRoleInfo>
            <IconLockOpen size={18} stroke={1.75} />
            <div>
              {primaryRole ?? t`No role assigned yet`}
              {currentRoles.length > 1 && (
                <div>
                  <Status
                    color="gray"
                    text={t`${additionalRolesCount} more role(s)`}
                  />
                </div>
              )}
            </div>
          </StyledRoleInfo>
          <Dropdown
            dropdownId="assign-role-dropdown"
            clickableComponent={
              <Button
                title={t`Assign role`}
                Icon={IconPlus}
                variant="secondary"
                size="small"
                disabled={rolesLoading || assignableRoles.length === 0}
              />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  {assignableRoles.length === 0 && (
                    <MenuItem text={t`No more roles to assign`} disabled />
                  )}
                  {assignableRoles.map((role) => (
                    <MenuItem
                      key={role.id}
                      text={role.label}
                      onClick={() => onAssignRole(role.id)}
                    />
                  ))}
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        </StyledRoleCard>
      </Section>

      <Section>
        <H2Title
          title={t`Permissions`}
          description={t`Objects and fields permissions settings`}
        />
        <Status color="gray" text={t`More granular permissions coming soon`} />
      </Section>
    </>
  );
};

export const SettingsWorkspaceMember = () => {
  const { workspaceMemberId = '' } = useParams();
  const navigateSettings = useNavigateSettings();
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const { record: member, loading } =
    useFindOneRecord<WorkspaceMemberWithRoles>({
      objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
      objectRecordId: workspaceMemberId,
      recordGqlFields: {
        name: { firstName: true, lastName: true },
        avatarUrl: true,
        userEmail: true,
        roles: { id: true, label: true, icon: true },
      },
    });

  const [memberData, setMemberData] = useState<WorkspaceMemberWithRoles | null>(
    null,
  );

  useEffect(() => {
    if (isDefined(member)) {
      setMemberData(member);
    }
  }, [member]);

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

  const [uploadPicture] = useUploadProfilePictureMutation();
  const [updateWorkspaceMemberRole, { loading: isAssigningRole }] =
    useUpdateWorkspaceMemberRoleMutation();

  const { data: rolesData, loading: rolesLoading } = useGetRolesQuery();
  const roles = rolesData?.getRoles ?? [];

  const debouncedUpdateName = useDebouncedCallback(
    async (firstName: string, lastName: string) => {
      if (!memberData?.id) return;
      try {
        await updateOneRecord({
          idToUpdate: memberData.id,
          updateOneRecordInput: {
            name: { firstName, lastName },
          },
        });
        setMemberData({
          ...memberData,
          name: { ...memberData.name, firstName, lastName },
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

  const handleAvatarChange = async (
    action: 'upload' | 'remove',
    file?: File,
  ) => {
    if (!memberData?.id) return;

    try {
      if (action === 'upload') {
        if (isUndefinedOrNull(file)) return;
        const { data } = await uploadPicture({
          variables: { file },
        });
        const signedFile = data?.uploadProfilePicture;
        if (!isDefined(signedFile)) {
          throw new Error('Avatar URL not found');
        }
        const signedPath = buildSignedPath(signedFile);
        await updateOneRecord({
          idToUpdate: memberData.id,
          updateOneRecordInput: {
            avatarUrl: signedFile.path,
          },
        });
        setMemberData({ ...memberData, avatarUrl: signedPath });
      } else {
        await updateOneRecord({
          idToUpdate: memberData.id,
          updateOneRecordInput: { avatarUrl: '' },
        });
        setMemberData({ ...memberData, avatarUrl: null });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Error while updating profile picture`,
      });
    }
  };

  const handleDeleteMember = async () => {
    if (!memberData?.id) return;
    try {
      await deleteUserFromWorkspace({
        variables: { workspaceMemberIdToDelete: memberData.id },
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

  const handleAssignRole = async (roleId: string) => {
    if (!memberData?.id) return;

    try {
      const { data } = await updateWorkspaceMemberRole({
        variables: {
          workspaceMemberId: memberData.id,
          roleId,
        },
      });

      const updatedMember = data?.updateWorkspaceMemberRole;
      if (isDefined(updatedMember)) {
        setMemberData({
          ...memberData,
          roles: updatedMember.roles ?? memberData.roles,
        });
        enqueueSuccessSnackBar({ message: t`Role assigned` });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error ? error.message : t`Unable to assign role`,
      });
    }
  };

  const tabs = useMemo(
    () => [
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
    ],
    [],
  );

  if (loading || !memberData) return null;

  return (
    <SubMenuTopBarContainer
      title={`${memberData.name.firstName} ${memberData.name.lastName}`}
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
          children: `${memberData.name.firstName} ${memberData.name.lastName}`,
        },
      ]}
      actionButton={
        <LightIconButton
          Icon={IconTrash}
          accent="tertiary"
          onClick={() => openModal(DELETE_MEMBER_MODAL_ID)}
        />
      }
    >
      <SettingsRolesQueryEffect />

      <SettingsPageContainer>
        <TabList tabs={tabs} componentInstanceId={tabListComponentId} />

        {activeTabId === SETTINGS_WORKSPACE_MEMBER_TABS.TABS_IDS.INFOS && (
          <SettingsWorkspaceMemberInfosTab
            member={memberData}
            onAvatarChange={handleAvatarChange}
            onNameChange={(first, last) => debouncedUpdateName(first, last)}
            onDelete={() => openModal(DELETE_MEMBER_MODAL_ID)}
            isDeleting={isDeleting}
          />
        )}

        {activeTabId ===
          SETTINGS_WORKSPACE_MEMBER_TABS.TABS_IDS.PERMISSIONS && (
          <SettingsWorkspaceMemberPermissionsTab
            member={memberData}
            onAssignRole={handleAssignRole}
            roles={roles}
            isAssigning={isAssigningRole}
            rolesLoading={rolesLoading}
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
  );
};
