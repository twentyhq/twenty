import { SettingsRolePermissionsObjectPermission } from '@/settings/roles/role-permissions/objects-permissions/types/SettingsRolePermissionsObjectPermission';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import pluralize from 'pluralize';
import { Checkbox, CheckboxAccent } from 'twenty-ui/input';

const StyledIconWrapper = styled.div<{ isOverriden?: boolean }>`
  align-items: center;
  background: ${({ theme, isOverriden }) =>
    isOverriden ? theme.adaptiveColors.orange1 : theme.adaptiveColors.blue1};
  border: 1px solid
    ${({ theme, isOverriden }) =>
      isOverriden ? theme.adaptiveColors.orange3 : theme.adaptiveColors.blue3};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledIcon = styled.div<{ isOverriden?: boolean }>`
  align-items: center;
  display: flex;
  color: ${({ theme, isOverriden }) =>
    isOverriden ? theme.color.orange : theme.color.blue};
  justify-content: center;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
`;

const StyledOverrideInfo = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const StyledPermissionCell = styled(TableCell)`
  align-items: center;
  display: flex;
  flex: 1;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledCheckboxCell = styled(TableCell)`
  align-items: center;
  display: flex;
  justify-content: flex-end;
  padding-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledTableRow = styled(TableRow)`
  align-items: center;
  display: flex;
`;

type SettingsRolePermissionsObjectsTableRowProps = {
  permission: SettingsRolePermissionsObjectPermission;
  isEditable: boolean;
};

export const SettingsRolePermissionsObjectsTableRow = ({
  permission,
  isEditable,
}: SettingsRolePermissionsObjectsTableRowProps) => {
  const theme = useTheme();

  const isOverridenBy = permission.overridenBy;
  const isOverriden = isOverridenBy && isOverridenBy > 0;
  const label = permission.label;
  const pluralizedObject = pluralize('object', isOverridenBy);

  return (
    <StyledTableRow>
      {isOverriden ? (
        <>
          <StyledPermissionCell>
            <StyledIconWrapper isOverriden={isOverriden}>
              <StyledIcon isOverriden={isOverriden}>
                {permission.IconOverride && (
                  <permission.IconOverride size={theme.icon.size.sm} />
                )}
              </StyledIcon>
            </StyledIconWrapper>
            <StyledLabel>{label}</StyledLabel>
            <StyledOverrideInfo>
              {t` · Overriden for ${isOverridenBy} ${pluralizedObject}`}
            </StyledOverrideInfo>
          </StyledPermissionCell>
          <StyledCheckboxCell>
            <Checkbox
              checked={permission.value}
              onChange={() => permission.setValue(!permission.value)}
              disabled={!isEditable}
              accent={CheckboxAccent.Orange}
            />
          </StyledCheckboxCell>
        </>
      ) : (
        <>
          <StyledPermissionCell>
            <StyledIconWrapper>
              <StyledIcon>
                <permission.Icon size={theme.icon.size.sm} />
              </StyledIcon>
            </StyledIconWrapper>
            <StyledLabel>{label}</StyledLabel>
          </StyledPermissionCell>
          <StyledCheckboxCell>
            <Checkbox
              checked={permission.value}
              onChange={() => permission.setValue(!permission.value)}
              disabled={!isEditable}
            />
          </StyledCheckboxCell>
        </>
      )}
    </StyledTableRow>
  );
};
