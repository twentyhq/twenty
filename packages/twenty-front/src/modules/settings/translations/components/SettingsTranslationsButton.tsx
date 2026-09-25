import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { IconLanguage } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

type SettingsTranslationsButtonProps = {
  objectNamePlural: string;
  fieldName?: string;
};

export const SettingsTranslationsButton = ({
  objectNamePlural,
  fieldName,
}: SettingsTranslationsButtonProps) => {
  const { t } = useLingui();
  const navigateSettings = useNavigateSettings();

  return (
    <Button
      startIcon={<IconLanguage />}
      size="sm"
      onClick={() =>
        isDefined(fieldName)
          ? navigateSettings(SettingsPath.ObjectFieldTranslations, {
              objectNamePlural,
              fieldName,
            })
          : navigateSettings(SettingsPath.ObjectTranslations, {
              objectNamePlural,
            })
      }
      variant="outline"
    >{t`Edit translations`}</Button>
  );
};
