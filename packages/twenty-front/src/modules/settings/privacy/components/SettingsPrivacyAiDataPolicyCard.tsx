import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/components/layout';
import { IconShield } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

import { getWorkspaceAiDataPolicy } from '@/ai/utils/getWorkspaceAiDataPolicy';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { useIsAiDataPolicyConfigurable } from '@/settings/privacy/hooks/useIsAiDataPolicyConfigurable';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SettingsPrivacyAiDataPolicyCard = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const isAiDataPolicyConfigurable = useIsAiDataPolicyConfigurable();
  const hasSecurityPermission = useHasPermissionFlag(
    PermissionFlagType.SECURITY,
  );

  if (!isAiDataPolicyConfigurable) {
    return null;
  }

  const { aiDataResidency, isAiZeroDataRetentionRequired } =
    getWorkspaceAiDataPolicy(currentWorkspace);

  const getTitle = () => {
    if (isDefined(aiDataResidency)) {
      return isAiZeroDataRetentionRequired
        ? t`EU only, zero data retention`
        : t`EU only, standard retention`;
    }

    return isAiZeroDataRetentionRequired
      ? t`Worldwide, zero data retention`
      : t`Worldwide, standard retention`;
  };

  return (
    <Section.Root>
      <Section.Header
        title={t`Data processing`}
        description={t`Models above are limited to the providers your privacy settings allow.`}
      />
      <SettingsCard
        to={
          hasSecurityPermission
            ? `${getSettingsPath(SettingsPath.General)}#privacy`
            : undefined
        }
        Icon={<IconShield size={theme.icon.size.md} />}
        title={getTitle()}
        description={
          hasSecurityPermission
            ? t`Change where AI providers process requests and what they keep`
            : t`Ask an admin with security access to change this`
        }
      />
    </Section.Root>
  );
};
