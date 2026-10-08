import { useLingui } from '@lingui/react/macro';
import { PermissionFlagType } from 'twenty-shared/constants';
import { LightIconButton } from 'twenty-ui/components/input';
import { IconSparkles } from 'twenty-ui/icon';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenAskAiPageInSidePanel } from '@/side-panel/hooks/useOpenAskAiPageInSidePanel';

export const SettingsValidationRuleAskAiButton = () => {
  const { t } = useLingui();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const { openAskAiPage } = useOpenAskAiPageInSidePanel();

  if (!hasAiPermission) {
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
