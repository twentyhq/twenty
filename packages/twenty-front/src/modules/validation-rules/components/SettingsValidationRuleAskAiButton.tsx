import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconSparkles } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';
import { useWorkspaceSurface } from '@/ui/layout/hooks/useWorkspaceSurface';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const SettingsValidationRuleAskAiButton = () => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();
  const workspaceSurface = useWorkspaceSurface();
  const isCustomizableSidebarEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_CUSTOMIZABLE_SIDEBAR_ENABLED,
  );

  if (
    !hasAiPermission ||
    workspaceSurface.type === 'side-panel' ||
    isCustomizableSidebarEnabled
  ) {
    return null;
  }

  return (
    <LightIconButton
      aria-label={t`Ask AI`}
      onClick={() => openAskAiPage({ resetNavigationStack: true })}
    >
      <IconSparkles />
    </LightIconButton>
  );
};
