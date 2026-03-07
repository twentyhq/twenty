import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useQuery } from '@apollo/client';
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
import { useContext } from 'react';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledButtonContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledPublishMethodLabel = styled.div`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.light};
  margin-bottom: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[4]};
`;

const StyledEmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

type ApplicationRegistration = {
  id: string;
  name: string;
  description: string | null;
};

export const SettingsApplicationsDeveloperTab = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const navigate = useNavigate();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { copyToClipboard } = useCopyToClipboard();

  const { data, loading } = useQuery(FIND_MANY_APPLICATION_REGISTRATIONS);

  const registrations: ApplicationRegistration[] =
    data?.findManyApplicationRegistrations ?? [];

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
          title={t`My Apps`}
          description={t`Apps you've created, registered, or published`}
        />
        {registrations.length > 0 ? (
          <SettingsListCard
            items={registrations}
            getItemLabel={(registration) => registration.name}
            isLoading={loading}
            RowIcon={IconApps}
            onRowClick={(registration) => {
              navigate(
                getSettingsPath(SettingsPath.ApplicationRegistrationDetail, {
                  applicationRegistrationId: registration.id,
                }),
              );
            }}
            RowRightComponent={() => (
              <IconChevronRight
                size={theme.icon.size.md}
                stroke={theme.icon.stroke.sm}
              />
            )}
          />
        ) : (
          <StyledEmptyStateContainer>
            <StyledPublishMethodLabel>
              {t`Publish to npm`}
            </StyledPublishMethodLabel>
            <CommandBlock
              commands={publishNpmCommands}
              button={publishNpmCopyButton}
            />
            <StyledPublishMethodLabel>
              {t`Or push directly to your server`}
            </StyledPublishMethodLabel>
            <CommandBlock
              commands={publishServerCommands}
              button={publishServerCopyButton}
            />
          </StyledEmptyStateContainer>
        )}
      </Section>
    </>
  );
};
