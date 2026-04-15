/* @license Enterprise */

import { SettingsTableCard } from '@/settings/components/SettingsTableCard';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  CommandBlock,
  H2Title,
  IconChartBar,
  IconCopy,
  IconBrandDocker,
  IconExternalLink,
  IconStatusChange,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  ApplicationRegistrationSourceType,
  FindApplicationRegistrationStatsDocument,
} from '~/generated-metadata/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SettingsEnterpriseFeatureGateCard } from '@/settings/components/SettingsEnterpriseFeatureGateCard';
import { OrganizationAdornment } from '~/pages/settings/enterprise/components/OrganizationAdornment';

const StyledButtonContainer = styled.div`
  display: flex;
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationDistributionTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
}) => {
  const { t } = useLingui();

  const applicationRegistrationId = registration.id;

  const { copyToClipboard } = useCopyToClipboard();

  const currentWorkspace = useAtomStateValue(currentWorkspaceState);

  const hasEnterpriseAccess = currentWorkspace?.hasValidEnterpriseKey === true;

  const isNpmSource =
    registration.sourceType === ApplicationRegistrationSourceType.NPM;

  const isTarballSource =
    registration.sourceType === ApplicationRegistrationSourceType.TARBALL;

  const { data: statsData } = useQuery(
    FindApplicationRegistrationStatsDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const shareLink = getSettingsPath(SettingsPath.AvailableApplicationDetail, {
    availableApplicationId: registration.universalIdentifier,
  });

  const stats = statsData?.findApplicationRegistrationStats;

  const hasStats = (stats?.activeInstalls ?? 0) > 0;

  const versionDistributionLabel =
    stats?.versionDistribution
      ?.map(
        (entry: { version: string; count: number }) =>
          `${entry.version} (${entry.count})`,
      )
      .join(', ') || '—';

  const statsItems = [
    {
      Icon: IconBrandDocker,
      label: t`Active installs`,
      value: stats?.activeInstalls ?? '—',
    },
    {
      Icon: IconStatusChange,
      label: t`Most installed version`,
      value: stats?.mostInstalledVersion ?? '—',
    },
    {
      Icon: IconChartBar,
      label: t`Distribution`,
      value: versionDistributionLabel,
    },
  ];

  const publishCommands = ['yarn twenty publish'];

  return (
    <>
      {isTarballSource && (
        <>
          <Section>
            <H2Title
              title={t`Public`}
              description={t`Publish your app to the marketplace so others can install it`}
            />
            <CommandBlock
              commands={publishCommands}
              button={
                <Button
                  onClick={() => {
                    copyToClipboard(
                      publishCommands.join('\n'),
                      t`Command copied to clipboard`,
                    );
                  }}
                  ariaLabel={t`Copy command`}
                  Icon={IconCopy}
                />
              }
            />
          </Section>
          <Section>
            <H2Title
              title={t`Private`}
              description={t`Share your app to other workspaces without pushing it on the marketplace`}
              adornment={!hasEnterpriseAccess && <OrganizationAdornment />}
            />
            {!hasEnterpriseAccess ? (
              <SettingsEnterpriseFeatureGateCard
                title={t`Upgrade to access`}
                description={t`This feature is part of the Organization Plan`}
                buttonTitle={t`Upgrade`}
              />
            ) : (
              <Button
                Icon={IconCopy}
                title={t`Copy sharing link`}
                variant="secondary"
                disabled={!shareLink}
                onClick={async () => {
                  if (shareLink) {
                    await copyToClipboard(
                      shareLink,
                      t`Sharing link copied to clipboard`,
                    );
                  }
                }}
              />
            )}
          </Section>
        </>
      )}

      {hasStats && (
        <Section>
          <H2Title
            title={t`Install Stats`}
            description={t`Usage across all workspaces on this server`}
          />
          <SettingsTableCard
            rounded
            items={statsItems}
            gridAutoColumns="200px 1fr"
          />
          {isNpmSource && (
            <StyledButtonContainer>
              <Button
                Icon={IconExternalLink}
                title={t`See on marketplace`}
                variant="secondary"
                to={shareLink}
              />
            </StyledButtonContainer>
          )}
        </Section>
      )}
    </>
  );
};
