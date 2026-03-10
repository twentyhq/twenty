import { SettingsAdminTableCard } from '@/settings/admin-panel/components/SettingsAdminTableCard';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { UPDATE_APPLICATION_REGISTRATION } from '@/settings/application-registrations/graphql/mutations/updateApplicationRegistration';
import { FIND_APPLICATION_REGISTRATION_STATS } from '@/settings/application-registrations/graphql/queries/findApplicationRegistrationStats';
import { FIND_MANY_APPLICATION_REGISTRATIONS } from '@/settings/application-registrations/graphql/queries/findManyApplicationRegistrations';
import { FIND_ONE_APPLICATION_REGISTRATION } from '@/settings/application-registrations/graphql/queries/findOneApplicationRegistration';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useMutation, useQuery } from '@apollo/client';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import {
  H2Title,
  IconChartBar,
  IconDownload,
  IconExternalLink,
  IconTag,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Card, Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { ApplicationRegistrationSourceType } from '~/generated-metadata/graphql';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';

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
  const { enqueueErrorSnackBar } = useSnackBar();

  const applicationRegistrationId = registration.id;

  const isNpmSource =
    registration.sourceType === ApplicationRegistrationSourceType.NPM;

  const { data: statsData } = useQuery(FIND_APPLICATION_REGISTRATION_STATS, {
    variables: { id: applicationRegistrationId },
    skip: !applicationRegistrationId,
  });

  const [updateRegistration] = useMutation(UPDATE_APPLICATION_REGISTRATION, {
    refetchQueries: [
      FIND_ONE_APPLICATION_REGISTRATION,
      FIND_MANY_APPLICATION_REGISTRATIONS,
    ],
  });

  const handleToggleListed = async () => {
    try {
      await updateRegistration({
        variables: {
          input: {
            id: applicationRegistrationId,
            update: {
              isListed: !registration.isListed,
            },
          },
        },
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Error updating marketplace listing`,
      });
    }
  };

  const marketplacePageUrl = getSettingsPath(
    SettingsPath.AvailableApplicationDetail,
    {
      availableApplicationId: registration.universalIdentifier,
    },
  );

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
      <Section>
        <H2Title
          title={t`Marketplace Listing`}
          description={t`Control visibility on the marketplace. Unlisted apps are still accessible via direct link.`}
        />
        <Card rounded>
          <SettingsOptionCardContentToggle
            title={t`Listed on marketplace`}
            description={
              isNpmSource
                ? t`Managed by the marketplace catalog sync for npm packages`
                : t`When enabled, this app appears in the marketplace browse page`
            }
            checked={registration.isListed}
            onChange={handleToggleListed}
            disabled={isNpmSource}
            divider
          />
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
            to={marketplacePageUrl}
          />
        </StyledButtonGroup>
      </Section>

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
