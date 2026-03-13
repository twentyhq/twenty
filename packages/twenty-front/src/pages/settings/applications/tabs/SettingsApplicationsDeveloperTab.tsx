import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { SettingsListCard } from '@/settings/components/SettingsListCard';
import { getDocumentationUrl } from '@/support/utils/getDocumentationUrl';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
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
import { Tag } from 'twenty-ui/components';
import {
  type ApplicationRegistrationFragmentFragment,
  ApplicationRegistrationSourceType,
  FindManyApplicationRegistrationsDocument,
} from '~/generated-metadata/graphql';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const StyledButtonContainer = styled.div`
  margin: ${themeCssVariables.spacing[2]} 0;
`;

const StyledRowRightContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const SOURCE_TYPE_BADGE_CONFIG: Record<
  ApplicationRegistrationSourceType,
  { label: string; color: 'gray' | 'blue' | 'green' }
> = {
  [ApplicationRegistrationSourceType.LOCAL]: {
    label: 'Dev',
    color: 'gray',
  },
  [ApplicationRegistrationSourceType.NPM]: {
    label: 'Npm',
    color: 'blue',
  },
  [ApplicationRegistrationSourceType.TARBALL]: {
    label: 'Internal',
    color: 'green',
  },
};

export const SettingsApplicationsDeveloperTab = () => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);

  const { copyToClipboard } = useCopyToClipboard();

  const { data, loading } = useQuery(FindManyApplicationRegistrationsDocument);

  const registrations: ApplicationRegistrationFragmentFragment[] =
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

  const getRegistrationLink = (
    registration: ApplicationRegistrationFragmentFragment,
  ) =>
    getSettingsPath(SettingsPath.ApplicationRegistrationDetail, {
      applicationRegistrationId: registration.id,
    });

  const syncCommands = [
    // oxlint-disable-next-line lingui/no-unlocalized-strings
    'yarn twenty app:dev',
  ];

  const syncCopyButton = (
    <Button
      onClick={() => {
        copyToClipboard(
          syncCommands.join('\n'),
          t`Command copied to clipboard`,
        );
      }}
      ariaLabel={t`Copy command`}
      Icon={IconCopy}
    />
  );

  const RowRightWithBadge = ({
    item,
  }: {
    item: ApplicationRegistrationFragmentFragment;
  }) => {
    const badgeConfig = SOURCE_TYPE_BADGE_CONFIG[item.sourceType];

    return (
      <StyledRowRightContainer>
        <Tag text={badgeConfig.label} color={badgeConfig.color} preventShrink />
        <IconChevronRight
          size={theme.icon.size.md}
          stroke={theme.icon.stroke.sm}
        />
      </StyledRowRightContainer>
    );
  };

  return (
    <>
      <Section>
        <H2Title
          title={t`Create & Develop`}
          description={t`Scaffold a new app, then use the CLI to develop, publish, and distribute`}
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
          title={t`Your Apps`}
          description={t`All applications registered on this workspace`}
        />
        {registrations.length > 0 ? (
          <SettingsListCard
            items={registrations}
            getItemLabel={(registration) => registration.name}
            isLoading={loading}
            RowIcon={IconApps}
            to={getRegistrationLink}
            RowRightComponent={RowRightWithBadge}
          />
        ) : (
          !loading && (
            <CommandBlock commands={syncCommands} button={syncCopyButton} />
          )
        )}
      </Section>
    </>
  );
};
