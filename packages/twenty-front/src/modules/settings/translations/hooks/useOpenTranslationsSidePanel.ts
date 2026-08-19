import { useNavigateSidePanel } from '@/side-panel/hooks/useNavigateSidePanel';
import {
  type SettingsTranslationsSidePanelTarget,
  settingsTranslationsSidePanelTargetState,
} from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useLingui } from '@lingui/react/macro';
import { SidePanelPages } from 'twenty-shared/types';
import { IconLanguage } from 'twenty-ui/icon';

export const useOpenTranslationsSidePanel = () => {
  const { t } = useLingui();
  const { navigateSidePanel } = useNavigateSidePanel();
  const setSettingsTranslationsSidePanelTarget = useSetAtomState(
    settingsTranslationsSidePanelTargetState,
  );

  const openTranslationsSidePanel = (
    target: SettingsTranslationsSidePanelTarget,
  ) => {
    setSettingsTranslationsSidePanelTarget(target);
    navigateSidePanel({
      page: SidePanelPages.SettingsMetadataTranslations,
      pageTitle: t`Translations`,
      pageIcon: IconLanguage,
      resetNavigationStack: true,
    });
  };

  return { openTranslationsSidePanel };
};
