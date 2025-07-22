import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/settings-permissions/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/settings-permissions/components/SettingsRolePermissionsSettingsTableRow';
import { SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/settings-permissions/types/SettingsRolePermissionsSettingPermission';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { H2Title, IconMail } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

type SettingsRolePermissionsToolSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsToolSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsToolSectionProps) => {
  const toolPermissionsConfig: SettingsRolePermissionsSettingPermission[] = [
    {
      key: PermissionFlagType.SEND_EMAIL_TOOL,
      name: t`Send Email`,
      description: t`Allow sending emails using connected accounts`,
      Icon: IconMail,
    },
  ];

  return (
    <Section>
      <H2Title
        title={t`Tool Permissions`}
        description={t`Permissions for using tools`}
      />
      <StyledTable>
        <SettingsRolePermissionsSettingsTableHeader
          roleId={roleId}
          settingsPermissionsConfig={toolPermissionsConfig}
          isEditable={isEditable}
        />
        <StyledTableRows>
          {toolPermissionsConfig.map((permission) => (
            <SettingsRolePermissionsSettingsTableRow
              key={permission.key}
              roleId={roleId}
              permission={permission}
              isEditable={isEditable}
            />
          ))}
        </StyledTableRows>
      </StyledTable>
    </Section>
  );
};
