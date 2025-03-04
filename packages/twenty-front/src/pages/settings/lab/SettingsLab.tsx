import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsLabContent } from '@/settings/lab/components/SettingsLabContent';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';
import { t } from '@lingui/core/macro';

export const SettingsLab = () => {
  return (
    <SubMenuTopBarContainer
      title={t`Lab`}
      links={[
        {
          children: t`Other`,
          href: getSettingsPath(SettingsPath.Lab),
        },
        { children: t`Lab` },
      ]}
    >
      <SettingsPageContainer>
        <SettingsLabContent />
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
