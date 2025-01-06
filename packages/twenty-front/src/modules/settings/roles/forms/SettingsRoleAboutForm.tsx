import styled from '@emotion/styled';
import { SetStateAction, useEffect, useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';
import { H2Title, useIcons } from 'twenty-ui';
import { z } from 'zod';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { OBJECT_NAME_MAXIMUM_LENGTH } from '@/settings/data-model/constants/ObjectNameMaximumLength';
import { SettingsRolePermissionsTable } from '@/settings/roles/forms/components/SettingsRolePermissionsTable';
import { useFindAllRoles } from '@/settings/roles/hooks/useFindAllRoles';

import { PermissionWithoutId } from '@/settings/roles/types/Permission';
import { Role } from '@/settings/roles/types/Role';
import { IconPicker } from '@/ui/input/components/IconPicker';
import { Radio } from '@/ui/input/components/Radio';
import { RadioGroup } from '@/ui/input/components/RadioGroup';
import { Select } from '@/ui/input/components/Select';
import { TextArea } from '@/ui/input/components/TextArea';
import { TextInput } from '@/ui/input/components/TextInput';
import { Section } from '@/ui/layout/section/components/Section';
import { WorkspaceMember } from '@/workspace-member/types/WorkspaceMember';
import { useTranslation } from 'react-i18next';

const permissionsSchema = z.object({
  canCreate: z.boolean(),
  canDelete: z.boolean(),
  canEdit: z.boolean(),
  canView: z.boolean(),
  tableName: z.string().min(1, 'Table name is required'),
});

const roleMetadataFormSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string().min(3, 'Name is required'),
  description: z.string().optional(),
  canAccessWorkspaceSettings: z.boolean(),
  permissions: z.array(permissionsSchema),
  workspaceId: z.string(),
});

export const SettingsRoleFormSchema = roleMetadataFormSchema.pick({
  icon: true,
  name: true,
  description: true,
  permissions: true,
  canAccessWorkspaceSettings: true,
});

export type SettingsRoleFormSchemaValues = z.infer<
  typeof roleMetadataFormSchema
>;

type SettingsRoleAboutFormProps = {
  disabled?: boolean;
  disableNameEdit?: boolean;
  roleItem?: Role;
  selectedReportRole?: string;
  setSelectedReportRole?: React.Dispatch<SetStateAction<string>>;
};

const StyledInputsContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
`;

const StyledInputContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledSection = styled(Section)`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
`;

export const SettingsRoleAboutForm = ({
  disabled,
  disableNameEdit,
  roleItem,
  selectedReportRole,
  setSelectedReportRole
}: SettingsRoleAboutFormProps) => {
  const { control, reset, setValue } =
    useFormContext<SettingsRoleFormSchemaValues>();
  const { t } = useTranslation();
  const { getIcon } = useIcons();

  const { roles } = useFindAllRoles();
  const { records: workspaceMembers } = useFindManyRecords<WorkspaceMember>({
    objectNameSingular: CoreObjectNameSingular.WorkspaceMember,
  });

  // const [assignRecord, setAssignRecord] = useState('');
  const [accessWorkspace, setAccessWorkspace] = useState<boolean>(false);
  const [copyPermissions, setCopyPermissions] = useState('');
  const [permissions, setPermissions] = useState<PermissionWithoutId[]>([]);

  useEffect(() => {
    if (roleItem) {
      reset({
        id: roleItem.id ?? '',
        icon: roleItem.icon ?? 'IconListNumbers',
        name: roleItem.name ?? '',
        description: roleItem.description ?? '',
        canAccessWorkspaceSettings:
          roleItem.canAccessWorkspaceSettings ?? false,
        permissions: roleItem.permissions ?? [],
        workspaceId: roleItem.workspace.id ?? '',
      });
      setPermissions(roleItem.permissions);
      setAccessWorkspace(roleItem.canAccessWorkspaceSettings);
      roleItem.reportsTo && setSelectedReportRole && setSelectedReportRole(roleItem.reportsTo?.id)
    }
  }, [roleItem, reset]);

  useEffect(() => {
    setValue('permissions', permissions);
  }, [permissions]);

  useEffect(() => {
    setValue('canAccessWorkspaceSettings', accessWorkspace);
  }, [accessWorkspace]);

  const handleSelectReportRole = (value: string) => {
    setSelectedReportRole && setSelectedReportRole(value);
  };

  const handleSelectCopyPermissions = (value: string) => {
    setCopyPermissions(value);
    const permissionsToCopy = roles.find(role => role.id === value)?.permissions?.map(permission => ({
      canCreate: permission.canCreate,
      canDelete: permission.canDelete,
      canEdit: permission.canEdit,
      canView: permission.canView,
      tableName: permission.tableName
  }))
    permissionsToCopy && setPermissions(permissionsToCopy)
  };
  console.log('ROLES', roles)
  const roleOptions = roles ? roles.map((role) => ({
    Icon: getIcon(role.icon),
    label: role.name, 
    value: role.id,
  })).filter((role) => role.value !== roleItem?.id) : [];

  return (
    <>
      <Section >
        <H2Title title={t('about')} />
        <StyledInputsContainer>
          <StyledInputContainer>
            <StyledLabel>{t('icon')}</StyledLabel>
            <Controller
              name="icon"
              control={control}
              render={({ field: { onChange, value } }) => (
                <IconPicker
                  disabled={disabled}
                  selectedIconKey={value}
                  onChange={({ iconKey }) => onChange(iconKey)}
                />
              )}
            />
          </StyledInputContainer>
          <Controller
            name="name"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                label={t('name')}
                placeholder={t('enterRoleName')}
                value={value}
                onChange={onChange}
                disabled={disabled || disableNameEdit}
                fullWidth
                maxLength={OBJECT_NAME_MAXIMUM_LENGTH}
              />
            )}
          />
        </StyledInputsContainer>
        <Controller
          name="description"
          control={control}
          render={({ field: { onChange, value } }) => (
            <TextArea
              placeholder={t('writeDescription')}
              minRows={1}
              value={value ?? ''}
              onChange={(nextValue) => onChange(nextValue ?? '')}
              disabled={disabled}
            />
          )}
        />
      </Section>
      <Section>
        <H2Title title={t('newRoleSettings')} />
        <Select
          disabled={disabled}
          dropdownId="report-role"
          label={t('reportsTo')}
          options={[
            {
              label: t('selectResponsibleRole'),
              value: '',
            },
            ...roleOptions,
          ]}
          value={selectedReportRole}
          onChange={handleSelectReportRole}
        />
      </Section>
      {/* // * It can be used in a future version */}
      {/* <StyledSection>
        <StyledLabel>{t('canAssignRecordsTo')}</StyledLabel>
        <RadioGroup
          onValueChange={(value) => setAssignRecord(value)}
          value={assignRecord}
        >
          <Radio
            name="assignRecordsGroup"
            label={t('allMembers')}
            value="allmembers"
            onChange={(e) => setAssignRecord(e.target.value)}
            disabled={disabled}
          />
          <Radio
            name="assignRecordsGroup"
            label={t('membersSameLevel')}
            value="sameLevelMembers"
            onChange={(e) => setAssignRecord(e.target.value)}
            disabled={disabled}
          />
          <Radio
            name="assignRecordsGroup"
            label={t('directSubordinateMembers')}
            value="directSubordinate"
            onChange={(e) => setAssignRecord(e.target.value)}
            disabled={disabled}
          />
        </RadioGroup>
      </StyledSection> */}
      <StyledSection>
        <StyledLabel>{t('canAccessWorkspaceSettings')}</StyledLabel>
        <RadioGroup
          onValueChange={(value) => setAccessWorkspace(value === 'true')}
          value={accessWorkspace ? 'true' : 'false'}
        >
          <Radio
            name="accessWorkspaceGroup"
            label={t('yes')}
            value="true"
            onChange={(e) => setAccessWorkspace(true)}
            disabled={disabled}
          />
          <Radio
            name="accessWorkspaceGroup"
            label={t('no')}
            value="false"
            onChange={(e) => setAccessWorkspace(false)}
            disabled={disabled}
          />
        </RadioGroup>
      </StyledSection>
      <Section>
        <Select
          dropdownId="copy-permissions"
          label={t('copyPermissions')}
          options={[
            {
              label: t('selectRole'),
              value: '',
            },
            ...roleOptions,
          ]}
          value={copyPermissions}
          onChange={handleSelectCopyPermissions}
          disabled={disabled}
        />
      </Section>
      <Section>
        <H2Title title={t('permissions')} />
        <SettingsRolePermissionsTable
          permissions={permissions}
          setPermissions={setPermissions}
          disabled={disabled}
        />
      </Section>
    </>
  );
};
