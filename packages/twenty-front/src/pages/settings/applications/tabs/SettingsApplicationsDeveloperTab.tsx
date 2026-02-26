import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import styled from '@emotion/styled';
import { useTheme } from '@emotion/react';
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
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledButtonContainer = styled.div`
  margin: ${({ theme }) => theme.spacing(2)} 0;
`;

type ApplicationRegistration = {
  id: string;
  name: string;
  description: string | null;
};

export const SettingsApplicationsDeveloperTab = () => {
  const { t } = useLingui();
  const navigate = useNavigate();
  const theme = useTheme();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { copyToClipboard } = useCopyToClipboard();

  const { data, loading } = useQuery(FIND_MANY_APPLICATION_REGISTRATIONS);

  const registrations: ApplicationRegistration[] =
    data?.findManyApplicationRegistrations ?? [];

  const commands = [
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'npx create-twenty-app@latest my-twenty-app',
    // eslint-disable-next-line lingui/no-unlocalized-strings
    'cd my-twenty-app',
  ];

  const copyButton = (
    <Button
      onClick={() => {
        copyToClipboard(commands.join('\n'), t`Commands copied to clipboard`);
      }}
      ariaLabel={t`Copy commands`}
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
        <CommandBlock commands={commands} button={copyButton} />
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
      {registrations.length > 0 && (
        <Section>
          <H2Title
            title={t`My Apps`}
            description={t`Apps you've created and published`}
          />
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
        </Section>
      )}
    </>
  );
};
