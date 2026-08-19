import { useOpenTranslationsSidePanel } from '@/settings/translations/hooks/useOpenTranslationsSidePanel';
import { type SettingsTranslationsSidePanelTarget } from '@/settings/translations/states/settingsTranslationsSidePanelTargetState';
import { useLingui } from '@lingui/react/macro';
import { IconLanguage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';

export const SettingsTranslationsButton = ({
  target,
}: {
  target: SettingsTranslationsSidePanelTarget;
}) => {
  const { t } = useLingui();
  const { openTranslationsSidePanel } = useOpenTranslationsSidePanel();

  return (
    <Button
      Icon={IconLanguage}
      title={t`Edit translations`}
      variant="secondary"
      size="small"
      onClick={() => openTranslationsSidePanel(target)}
    />
  );
};
