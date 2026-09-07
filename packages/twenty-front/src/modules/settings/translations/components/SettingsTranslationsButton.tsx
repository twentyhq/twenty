import {
  type SettingsTranslationsSidePanelTarget,
  settingsTranslationsSidePanelTargetState,
} from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconLanguage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

type SettingsTranslationsButtonProps = {
  target: SettingsTranslationsSidePanelTarget;
};

export const SettingsTranslationsButton = ({
  target,
}: SettingsTranslationsButtonProps) => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSettingsTranslationsSidePanelTarget = useSetAtomState(
    settingsTranslationsSidePanelTargetState,
  );

  return (
    <Button
      Icon={IconLanguage}
      title={t`Edit translations`}
      variant="secondary"
      size="small"
      onClick={() => {
        setSettingsTranslationsSidePanelTarget(target);
        navigateSidePanel({
          page: SidePanelPages.SettingsMetadataTranslations,
          pageTitle: t`Translations`,
          pageIcon: IconLanguage,
          resetNavigationStack: true,
        });
      }}
    />
  );
};
