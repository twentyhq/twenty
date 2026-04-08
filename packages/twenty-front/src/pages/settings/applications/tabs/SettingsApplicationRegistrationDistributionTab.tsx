import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { useQuery } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  H2Title,
  IconChartBar,
  IconCopy,
  IconDownload,
  IconExternalLink,
  IconTag,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
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

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
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
      Icon: IconDownload,
      label: t`Active installs`,
      value: stats?.activeInstalls ?? '—',
    },
    {
      Icon: IconTag,
      label: t`Most installed version`,
      value: stats?.mostInstalledVersion ?? '—',
    },
    {
      Icon: IconChartBar,
      label: t`Distribution`,
      value: versionDistributionLabel,
    },
  ];

  return (
    <>
      {isNpmSource && (
        <Section>
          <H2Title
            title={t`Marketplace Listing`}
            description={t`This app is listed on the marketplace because it is published to npm.`}
          />
          <Card rounded>
            <SettingsOptionCardContentToggle
              title={t`Featured`}
              description={t`Featured apps are curated. Open a PR to request featured status.`}
              checked={registration.isFeatured}
              onChange={() => {}}
              disabled
            />
          </Card>
          <StyledButtonGroup>
            <Button
              Icon={IconExternalLink}
              title={t`View marketplace page`}
              variant="secondary"
              to={shareLink}
            />
          </StyledButtonGroup>
        </Section>
      )}

      {isTarballSource &&
        (!hasEnterpriseAccess ? (
          <SettingsEnterpriseFeatureGateCard
            description={t`Upgrade to Enterprise to share private applications.`}
          />
        ) : (
          <Section>
            <H2Title
              title={t`Share`}
              description={t`Share this link with other workspaces on this server to let them install this application.`}
            />
            <StyledButtonGroup>
              <Button
                Icon={IconCopy}
                title={t`Copy share link`}
                variant="secondary"
                disabled={!shareLink}
                onClick={async () => {
                  if (shareLink) {
                    await copyToClipboard(
                      shareLink,
                      t`Share link copied to clipboard`,
                    );
                  }
                }}
              />
              <Button
                Icon={IconExternalLink}
                title={t`View private application page`}
                variant="secondary"
                to={shareLink}
              />
            </StyledButtonGroup>
          </Section>
        ))}

      {hasStats && (
        <Section>
          <H2Title
            title={t`Install Stats`}
            description={t`Usage across all workspaces on this server`}
          />
          <SettingsAdminTableCard
            rounded
            items={statsItems}
            gridAutoColumns="3fr 8fr"
          />
        </Section>
      )}
    </>
  );
};
