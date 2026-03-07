import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  CommandBlock,
  H2Title,
  IconApps,
  IconChevronRight,
  IconCopy,
  IconFileInfo,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import {
  type ApplicationRegistrationFragmentFragment,
  ApplicationRegistrationSourceType,
} from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledButtonContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledEmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

export const SettingsApplicationsDeveloperTab = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const navigate = useNavigate();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { copyToClipboard } = useCopyToClipboard();

  const { data, loading } = useQuery(FIND_MANY_APPLICATION_REGISTRATIONS);

  const registrations: ApplicationRegistrationFragmentFragment[] =
    data?.findManyApplicationRegistrations ?? [];

  const developmentApps = registrations.filter(
    (registration) =>
      registration.sourceType === ApplicationRegistrationSourceType.LOCAL,
  );

  const publishedApps = registrations.filter(
    (registration) =>
      registration.sourceType === ApplicationRegistrationSourceType.NPM,
  );

  const internalApps = registrations.filter(
    (registration) =>
      registration.sourceType === ApplicationRegistrationSourceType.TARBALL,
  );

  const createCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'npx create-twenty-app@latest my-twenty-app',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'cd my-twenty-app',
  ];

  const createCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(
          createCommands.join('\n'),
          t`Commands copied to clipboard`,
        );
      }}
      ariaLabel={t`Copy commands`}
      Icon={IconCopy}
    />
  );

  const publishNpmCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'npx twenty app:publish',
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'npx twenty app:register <package-name>',
  ];

  const publishNpmCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(
          publishNpmCommands.join('\n'),
          t`Command copied to clipboard`,
        );
      }}
      ariaLabel={t`Copy command`}
      Icon={IconCopy}
    />
  );

  const publishServerCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'npx twenty app:publish --server <server-url>',
  ];

  const publishServerCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(
          publishServerCommands.join('\n'),
          t`Command copied to clipboard`,
        );
      }}
      ariaLabel={t`Copy command`}
      Icon={IconCopy}
    />
  );

  const navigateToRegistration = (
    registration: ApplicationRegistrationFragmentFragment,
  ) => {
    navigate(
      getSettingsPath(SettingsPath.ApplicationRegistrationDetail, {
        applicationRegistrationId: registration.id,
      }),
    );
  };

  const renderAppList = (
    apps: ApplicationRegistrationFragmentFragment[],
    emptyState: React.ReactNode,
  ) => {
    if (apps.length > 0) {
      return (
        <SettingsListCard
          items={apps}
          getItemLabel={(registration) => registration.name}
          isLoading={loading}
          RowIcon={IconApps}
          onRowClick={navigateToRegistration}
          RowRightComponent={() => (
            <IconChevronRight
              size={theme.icon.size.md}
              stroke={theme.icon.stroke.sm}
            />
          )}
        />
      );
    }

    return emptyState;
  };

  const devCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'npx twenty app:dev',
  ];

  const devCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(devCommands.join('\n'), t`Command copied to clipboard`);
      }}
      ariaLabel={t`Copy command`}
      Icon={IconCopy}
    />
  );

  return (
    <>
      <Section>
        <H2Title
          title={t`Create an application`}
          description={t`You can either create a private app or share it to others`}
        />
        <CommandBlock commands={createCommands} button={createCopyButton} />
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

      <Section>
        <H2Title
          title={t`Your Development Apps`}
          description={t`Apps running in local development mode`}
        />
        {renderAppList(
          developmentApps,
          <StyledEmptyStateContainer>
            <CommandBlock commands={devCommands} button={devCopyButton} />
          </StyledEmptyStateContainer>,
        )}
      </Section>

      <Section>
        <H2Title
          title={t`Your Published Apps`}
          description={t`Apps published to npm and available to all servers`}
        />
        {renderAppList(
          publishedApps,
          <StyledEmptyStateContainer>
            <CommandBlock
              commands={publishNpmCommands}
              button={publishNpmCopyButton}
            />
          </StyledEmptyStateContainer>,
        )}
      </Section>

      <Section>
        <H2Title
          title={t`Your Internal Apps`}
          description={t`Apps deployed to this server via tarball. Install or upgrade from any workspace.`}
        />
        {renderAppList(
          internalApps,
          <StyledEmptyStateContainer>
            <CommandBlock
              commands={publishServerCommands}
              button={publishServerCopyButton}
            />
          </StyledEmptyStateContainer>,
        )}
      </Section>
    </>
  );
};
