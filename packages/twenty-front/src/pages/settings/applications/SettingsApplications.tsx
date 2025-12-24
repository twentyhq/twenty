import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { useFindManyApplicationsQuery } from '~/generated-metadata/graphql';
import { SettingsApplicationsTable } from '~/pages/settings/applications/components/SettingsApplicationsTable';
import {
  H2Title,
  CommandBlock,
  IconCopy,
  IconFileInfo,
} from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui/input';
import styled from '@emotion/styled';
import { useRecoilValue } from 'recoil';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

export const SettingsApplications = () => {
  const { t } = useLingui();

  const currentWorkspaceMember = useRecoilValue(currentWorkspaceMemberState);

  const { data } = useFindManyApplicationsQuery();

  const { copyToClipboard } = useCopyToClipboard();

  const applications = data?.findManyApplications ?? [];

  const commands = [
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'npx create-twenty-app@latest my-twenty-app',
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'cd my-twenty-app',
  ];

  const button = (
    <Button
      onClick={() => {
        copyToClipboard(commands.join('\n'), t`Commands copied to clipboard`);
      }}
      ariaLabel={t`Copy commands`}
      Icon={IconCopy}
    />
  );

  return (
    <SubMenuTopBarContainer
      title={t`Applications`}
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.Workspace),
        },
        { children: t`Applications` },
      ]}
    >
      <SettingsPageContainer>
        {applications.length > 0 && (
          <SettingsApplicationsTable applications={applications} />
        )}
        <Section>
          <H2Title
            title={t`Create an application`}
            description={t`You can either create a private app or share it to others`}
          />
          <CommandBlock commands={commands} button={button} />
          <StyledButtonContainer>
            <Button
              Icon={IconFileInfo}
              title={t`Read documentation`}
              onClick={() =>
                window.open(
                  getDocumentationUrl({
                    locale: currentWorkspaceMember?.locale,
                    path: '/developers/extend/capabilities/apps',
                  }),
                  '_blank',
                )
              }
            />
          </StyledButtonContainer>
        </Section>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
