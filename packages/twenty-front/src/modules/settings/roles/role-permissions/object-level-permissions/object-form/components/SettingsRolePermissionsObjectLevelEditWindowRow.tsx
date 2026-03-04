import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Select } from '@/ui/input/components/Select';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconClockHour8 } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { type ObjectPermission } from '~/generated-metadata/graphql';

const StyledTableRow = styled(TableRow)`
  align-items: center;
  display: flex;
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(1)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledPermissionLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledOverrideInfo = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledSelectCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.color.blue3};
  border: 1px solid ${({ theme }) => theme.color.blue7};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  justify-content: center;
`;

type SettingsRolePermissionsObjectLevelEditWindowRowProps = {
  roleId: string;
  objectMetadataItemId: string;
  isEditable: boolean;
  settingsDraftRoleObjectPermissions: ObjectPermission | undefined;
};

export const SettingsRolePermissionsObjectLevelEditWindowRow = ({
  roleId,
  objectMetadataItemId,
  isEditable,
  settingsDraftRoleObjectPermissions,
}: SettingsRolePermissionsObjectLevelEditWindowRowProps) => {
  const theme = useTheme();

  const editWindowOptions: SelectOption<number | null>[] = [
    { value: null, label: t`No limit` },
    { value: 5, label: t`5 minutes` },
    { value: 10, label: t`10 minutes` },
    { value: 15, label: t`15 minutes` },
    { value: 60, label: t`1 hour` },
    { value: 240, label: t`4 hours` },
    { value: 720, label: t`12 hours` },
    { value: 1440, label: t`24 hours` },
    { value: 2880, label: t`48 hours` },
    { value: 10080, label: t`7 days` },
  ];

  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );

  const { upsertObjectPermissionInDraftRole } =
    useUpsertObjectPermissionInDraftRole(roleId);

  const roleDefault = settingsDraftRole.editWindowMinutes ?? null;

  const effectiveValue = isDefined(
    settingsDraftRoleObjectPermissions?.editWindowMinutes,
  )
    ? settingsDraftRoleObjectPermissions.editWindowMinutes
    : roleDefault;

  const isInherited = !isDefined(
    settingsDraftRoleObjectPermissions?.editWindowMinutes,
  );

  const handleChange = (value: number | null) => {
    const updatedPermission: ObjectPermission = {
      ...settingsDraftRoleObjectPermissions,
      objectMetadataId: objectMetadataItemId,
      editWindowMinutes: value,
    };

    upsertObjectPermissionInDraftRole(updatedPermission);
  };

  return (
    <StyledTableRow>
      <StyledPermissionCell>
        <StyledPermissionContent>
          <StyledIconWrapper>
            <StyledIcon>
              <IconClockHour8 size={theme.icon.size.sm} />
            </StyledIcon>
          </StyledIconWrapper>
          <StyledPermissionLabel>{t`Edit window`}</StyledPermissionLabel>
        </StyledPermissionContent>
        <StyledOverrideInfo>
          {isInherited && isDefined(roleDefault) ? (
            <>
              {' · '}
              {t`Inherited from role`} (
              {editWindowOptions.find((o) => o.value === roleDefault)?.label ??
                `${roleDefault} min`}
              )
            </>
          ) : null}
        </StyledOverrideInfo>
      </StyledPermissionCell>
      <StyledSelectCell onClick={(e) => e.stopPropagation()}>
        <Select
          dropdownId={`edit-window-${objectMetadataItemId}`}
          options={editWindowOptions}
          value={effectiveValue}
          onChange={handleChange}
          disabled={!isEditable}
          selectSizeVariant="small"
        />
      </StyledSelectCell>
    </StyledTableRow>
  );
};
