import { settingsPermissionFlagDefinitionsState } from '@/settings/roles/states/settingsPermissionFlagDefinitionsState';
import { settingsPersistedRoleFamilyState } from '@/settings/roles/states/settingsPersistedRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { IconLock } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsApplicationGrantPermissionFlagsProps = {
  grantRoleId: string;
};

const StyledList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledRow = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  gap: ${themeCssVariables.spacing[2]};
`;

// Permission flags are granted exactly as requested, so they are listed rather than editable
export const SettingsApplicationGrantPermissionFlags = ({
  grantRoleId,
}: SettingsApplicationGrantPermissionFlagsProps) => {
  const settingsPersistedRole = useAtomFamilyStateValue(
    settingsPersistedRoleFamilyState,
    grantRoleId,
  );
  const permissionFlagDefinitions = useAtomStateValue(
    settingsPermissionFlagDefinitionsState,
  );

  const grantedLabels = [
    ...(settingsPersistedRole?.canUpdateAllSettings ? [t`All settings`] : []),
    ...(settingsPersistedRole?.canAccessAllTools ? [t`All tools`] : []),
    ...(settingsPersistedRole?.permissionFlags ?? []).map(
      ({ flag }) =>
        permissionFlagDefinitions.find(({ key }) => key === flag)?.label ??
        flag,
    ),
  ];

  if (grantedLabels.length === 0) {
    return null;
  }

  return (
    <Section.Root>
      <Section.Header
        title={t`Permission flags`}
        description={t`Granted as the app requested them. They can't be changed here.`}
      />
      <StyledList>
        {grantedLabels.map((label) => (
          <StyledRow key={label}>
            <IconLock size={14} aria-hidden />
            {label}
          </StyledRow>
        ))}
      </StyledList>
    </Section.Root>
  );
};
