import {
  type SettingsTranslationsSidePanelTarget,
  settingsTranslationsSidePanelTargetState,
} from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconLanguage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

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
      startIcon={<IconLanguage />}
      size="sm"
      onClick={() => {
        setSettingsTranslationsSidePanelTarget(target);
        navigateSidePanel({
          page: SidePanelPages.SettingsMetadataTranslations,
          pageTitle: target.label,
          pageIcon: IconLanguage,
          resetNavigationStack: true,
        });
      }}
      variant="outline"
    >{t`Edit translations`}</Button>
  );
};
