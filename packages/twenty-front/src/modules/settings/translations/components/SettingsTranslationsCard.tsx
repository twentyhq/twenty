import { SettingsCard } from '@/settings/components/SettingsCard';
import { UndecoratedLink } from '@/ui/navigation/link/components/UndecoratedLink/UndecoratedLink';
import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconLanguage } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme';

type SettingsTranslationsCardProps = {
  objectNamePlural: string;
  fieldName?: string;
};

export const SettingsTranslationsCard = ({
  objectNamePlural,
  fieldName,
}: SettingsTranslationsCardProps) => {
  const { t } = useLingui();
  const theme = useTheme();

  return (
    <UndecoratedLink
      to={
        isDefined(fieldName)
          ? getSettingsPath(SettingsPath.ObjectFieldTranslations, {
              objectNamePlural,
              fieldName,
            })
          : getSettingsPath(SettingsPath.ObjectTranslations, {
              objectNamePlural,
            })
      }
    >
      <SettingsCard
        Icon={<IconLanguage size={theme.icon.size.md} />}
        title={t`Edit translations`}
      />
    </UndecoratedLink>
  );
};
