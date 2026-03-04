import { useUpsertObjectPermissionInDraftRole } from '@/settings/roles/role-permissions/object-level-permissions/hooks/useUpsertObjectPermissionInDraftRole';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { Select } from '@/ui/input/components/Select';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconClockHour8 } from 'twenty-ui/display';
import { type SelectOption } from 'twenty-ui/input';
import { ThemeContext } from 'twenty-ui/theme';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ObjectPermission } from '~/generated-metadata/graphql';

const StyledTableRow = styled(TableRow)`
  align-items: center;
  display: flex;
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${themeCssVariables.spacing[1]};
  padding-left: ${themeCssVariables.spacing[2]};
`;

const StyledPermissionContent = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPermissionLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
`;

const StyledOverrideInfo = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledSelectCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${themeCssVariables.spacing[1]};
`;

const StyledIconWrapper = styled.div`
  align-items: center;
  background: ${themeCssVariables.color.blue3};
  border: 1px solid ${themeCssVariables.color.blue7};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  height: ${themeCssVariables.spacing[4]};
  justify-content: center;
  width: ${themeCssVariables.spacing[4]};
`;

const StyledIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.color.blue};
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
  const { theme } = useContext(ThemeContext);

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
    ? settingsDraftRoleObjectPermissions?.editWindowMinutes
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
