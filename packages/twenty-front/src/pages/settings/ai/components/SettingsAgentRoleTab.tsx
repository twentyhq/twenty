import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';

import { SettingsRolePermissions } from '@/settings/roles/role-permissions/components/SettingsRolePermissions';
import { Select } from '@/ui/input/components/Select';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  H1Title,
  H1TitleFontColor,
  H2Title,
  IconArrowUpRight,
  IconUser,
  useIcons,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useGetRolesQuery } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { type SettingsAIAgentFormValues } from '../hooks/useSettingsAgentFormState';

const StyledRoleContainer = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  margin-bottom: ${({ theme }) => theme.spacing(8)};
`;

const StyledRoleSelector = styled.div`
  flex: 1;
`;

type SettingsAgentRoleTabProps = {
  formValues: SettingsAIAgentFormValues;
  onFieldChange: (
    field: keyof SettingsAIAgentFormValues,
    value: SettingsAIAgentFormValues[keyof SettingsAIAgentFormValues],
  ) => void;
  disabled: boolean;
};

export const SettingsAgentRoleTab = ({
  formValues,
  onFieldChange,
  disabled,
}: SettingsAgentRoleTabProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const navigateSettings = useNavigateSettings();

  const { data: rolesData } = useGetRolesQuery();

  const rolesOptions = [
    {
      label: t`None`,
      value: null,
      Icon: IconUser,
    },
    ...(rolesData?.getRoles
      ?.filter((role) => role.canBeAssignedToAgents)
      .map((role) => ({
        label: role.label,
        value: role.id,
        Icon: getIcon(role.icon) ?? IconUser,
      })) || []),
  ];

  const selectedRole = rolesData?.getRoles?.find(
    (role) => role.id === formValues.role,
  );

  const handleOpenRole = () => {
    if (isDefined(selectedRole)) {
      navigateSettings(SettingsPath.RoleDetail, { roleId: selectedRole.id });
    }
  };

  return (
    <Section>
      <H2Title
        title={t`Role`}
        description={t`The agent can perform all actions defined by the following role.`}
      />
      <StyledRoleContainer>
        <StyledRoleSelector>
          <Select
            dropdownId="agent-role-select"
            options={rolesOptions}
            value={formValues.role || ''}
            onChange={(value) => onFieldChange('role', value)}
            disabled={disabled}
            withSearchInput
            fullWidth
          />
        </StyledRoleSelector>
        <Button
          Icon={IconArrowUpRight}
          title={t`Open`}
          variant="secondary"
          onClick={handleOpenRole}
          disabled={!selectedRole}
        />
      </StyledRoleContainer>
      {selectedRole?.id && (
        <>
          <H1Title
            title={t`Role Permissions`}
            fontColor={H1TitleFontColor.Primary}
          />
          <SettingsRolePermissions
            roleId={selectedRole.id}
            isEditable={false}
          />
        </>
      )}
    </Section>
  );
};
