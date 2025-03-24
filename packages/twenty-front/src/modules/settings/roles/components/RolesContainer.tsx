import { H3Title } from 'twenty-ui';

import { SettingsPath } from '@/types/SettingsPath';

import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { RolesDefaultRole } from '@/settings/roles/components/RolesDefaultRole';

import { AllRoles } from '@/settings/roles/components/AllRoles';
import { settingsAllRolesState } from '@/settings/roles/states/settingsAllRolesState';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { Trans, useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

export const RolesContainer = () => {
  const { t } = useLingui();

  const settingsAllRoles = useRecoilValue(settingsAllRolesState);

  if (!isDefined(settingsAllRoles) || settingsAllRoles.length === 0) {
    return null;
  }

  return (
    <SubMenuTopBarContainer
      title={settingsAllRoles && <H3Title title={t`Roles`} />}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: <Trans>Roles</Trans> },
      ]}
    >
      <SettingsPageContainer>
        {settingsAllRoles && (
          <>
            <AllRoles roles={settingsAllRoles} />
            <RolesDefaultRole roles={settingsAllRoles} />
          </>
        )}
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
