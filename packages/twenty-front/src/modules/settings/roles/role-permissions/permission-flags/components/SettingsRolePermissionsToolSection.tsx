import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsRolePermissionsSettingsTableHeader } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableHeader';
import { SettingsRolePermissionsSettingsTableRow } from '@/settings/roles/role-permissions/permission-flags/components/SettingsRolePermissionsSettingsTableRow';
import { SettingsRolePermissionsSettingPermission } from '@/settings/roles/role-permissions/permission-flags/types/SettingsRolePermissionsSettingPermission';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import styled from '@emotion/styled';
import { t } from '@lingui/core/macro';
import { useRecoilState } from 'recoil';

import {
  H2Title,
  IconFileExport,
  IconFileImport,
  IconMail,
  IconTool,
} from 'twenty-ui/display';
import { AnimatedExpandableContainer, Card, Section } from 'twenty-ui/layout';
import { PermissionFlagType } from '~/generated-metadata/graphql';

const StyledTable = styled.div`
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StyledTableRows = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;

const StyledCard = styled(Card)`
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

type SettingsRolePermissionsToolSectionProps = {
  roleId: string;
  isEditable: boolean;
};

export const SettingsRolePermissionsToolSection = ({
  roleId,
  isEditable,
}: SettingsRolePermissionsToolSectionProps) => {
  const [settingsDraftRole, setSettingsDraftRole] = useRecoilState(
    settingsDraftRoleFamilyState(roleId),
  );

  const toolPermissionsConfig: SettingsRolePermissionsSettingPermission[] = [
    {
      key: PermissionFlagType.SEND_EMAIL_TOOL,
      name: t`Send Email`,
      description: t`Allow sending emails using connected accounts`,
      Icon: IconMail,
      isToolPermission: true,
    },
    {
      key: PermissionFlagType.IMPORT_CSV,
      name: t`Import CSV`,
      description: t`Allow importing data from CSV files`,
      Icon: IconFileImport,
      isToolPermission: true,
    },
    {
      key: PermissionFlagType.EXPORT_CSV,
      name: t`Export CSV`,
      description: t`Allow exporting data to CSV files`,
      Icon: IconFileExport,
      isToolPermission: true,
    },
  ];

  return (
    <Section>
      <H2Title title={t`Actions`} description={t`Actions permissions`} />
      <StyledCard rounded>
        <SettingsOptionCardContentToggle
          Icon={IconTool}
          title={t`All Actions Access`}
          description={t`Grants permission to perform all available actions without restriction`}
          checked={settingsDraftRole.canAccessAllTools}
          disabled={!isEditable}
          onChange={() => {
            setSettingsDraftRole({
              ...settingsDraftRole,
              canAccessAllTools: !settingsDraftRole.canAccessAllTools,
            });
          }}
        />
      </StyledCard>
      <AnimatedExpandableContainer
        isExpanded={!settingsDraftRole.canAccessAllTools}
        dimension="height"
        animationDurations={{
          opacity: 0.2,
          size: 0.4,
        }}
        mode="scroll-height"
        containAnimation={false}
      >
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
      </AnimatedExpandableContainer>
    </Section>
  );
};
