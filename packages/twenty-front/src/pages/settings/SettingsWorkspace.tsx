import { useRecoilValue } from 'recoil';
import {
  GithubVersionLink,
  H2Title,
  IconWorld,
  Section,
  UndecoratedLink,
} from 'twenty-ui';

import { isMultiWorkspaceEnabledState } from '@/client-config/states/isMultiWorkspaceEnabledState';
import { SettingsCard } from '@/settings/components/SettingsCard';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { DeleteWorkspace } from '@/settings/profile/components/DeleteWorkspace';
import { getSettingsPagePath } from '@/settings/utils/getSettingsPagePath';
import { NameField } from '@/settings/workspace/components/NameField';
import { ToggleImpersonate } from '@/settings/workspace/components/ToggleImpersonate';
import { WorkspaceLogoUploader } from '@/settings/workspace/components/WorkspaceLogoUploader';
import { SettingsPath } from '@/types/SettingsPath';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { useTranslation } from 'react-i18next';
import packageJson from '../../../package.json';

export const SettingsWorkspace = () => {
  const isMultiWorkspaceEnabled = useRecoilValue(isMultiWorkspaceEnabledState);
  const { t } = useTranslation();
  return (
    <SubMenuTopBarContainer
      title={t("general")}
      links={[
        {
          children: 'Workspace',
          href: getSettingsPagePath(SettingsPath.Workspace),
        },
        { children: t('general') },
      ]}
    >
      <SettingsPageContainer>
        <Section>
          <H2Title title={t('picture')} />
          <WorkspaceLogoUploader />
        </Section>
        <Section>
          <H2Title title={t('name')} description={t('nameProfileDescription')} />
          <NameField />
        </Section>
        {isMultiWorkspaceEnabled && (
          <>
            <Section>
              <H2Title
                title={t('domain')}
                description={t('subdomainSettingsWorkspaceDescription')}
              />
              <UndecoratedLink to={getSettingsPagePath(SettingsPath.Domain)}>
                <SettingsCard title={t('customizeDomain')} Icon={<IconWorld />} />
              </UndecoratedLink>
            </Section>
            <Section>
              <H2Title
                title={t('support')}
                adornment={<ToggleImpersonate />}
                description={t('supportDescription')}
              />
            </Section>
          </>
        )}
        <Section>
          <DeleteWorkspace />
        </Section>
        <Section>
          <GithubVersionLink version={packageJson.version} />
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
