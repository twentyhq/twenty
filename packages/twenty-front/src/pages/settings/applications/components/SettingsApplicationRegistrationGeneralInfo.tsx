import {
  H2Title,
  IconBox,
  IconDownload,
  IconGitBranch,
  IconTag,
  IconWorld,
} from 'twenty-ui/display';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  SettingsTableCard,
  type TableItem,
} from '@/settings/components/SettingsTableCard';
import {
  type ApplicationRegistration,
  ApplicationRegistrationSourceType,
  ApplicationRegistrationTarballUrlDocument,
  FindOneApplicationSummaryDocument,
  GetPublicWorkspaceDataByIdDocument,
} from '~/generated-metadata/graphql';
import { isNonEmptyString } from '@sniptt/guards';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useQuery } from '@apollo/client/react';
import {
  AvatarOrIcon,
  Chip,
  ChipSize,
  ChipVariant,
  Tag,
} from 'twenty-ui/components';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { SettingsApplicationRegistrationShareLinkButtons } from '~/pages/settings/applications/components/SettingsApplicationRegistrationShareLinkButtons';

const StyledSourceRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledDownloadLink = styled.a`
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  text-decoration: underline;
  &:hover {
    color: ${themeCssVariables.font.color.primary};
  }
`;

const StyledGeneralContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationGeneralInfo = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();

  const applicationRegistrationId = registration.id;

  const { data: tarballUrlData } = useQuery(
    ApplicationRegistrationTarballUrlDocument,
    {
      variables: { id: applicationRegistrationId },
      skip: !applicationRegistrationId,
    },
  );

  const { data: applicationSummaryData } = useQuery(
    FindOneApplicationSummaryDocument,
    {
      variables: { universalIdentifier: registration.universalIdentifier },
      skip: !registration.universalIdentifier,
    },
  );

  const isApplicationInstalled = isDefined(
    applicationSummaryData?.findOneApplication,
  );

  const { data: ownerWorkspaceData } = useQuery(
    GetPublicWorkspaceDataByIdDocument,
    {
      variables: { id: registration.ownerWorkspaceId ?? '' },
      skip: !registration.ownerWorkspaceId,
    },
  );

  const shareLink = getSettingsPath(SettingsPath.AvailableApplicationDetail, {
    availableApplicationId: registration.universalIdentifier,
  });

  const ownerWorkspace = ownerWorkspaceData?.getPublicWorkspaceDataById;

  const generateItems = () => {
    const items: TableItem[] = [
      {
        Icon: IconWorld,
        label: t`Universal ID`,
        value: registration.universalIdentifier,
      },
    ];

    if (isDefined(ownerWorkspace?.displayName)) {
      items.push({
        Icon: IconTag,
        label: t`Owner`,
        value: (
          <Chip
            size={ChipSize.Large}
            variant={ChipVariant.Highlighted}
            clickable={false}
            leftComponent={
              <AvatarOrIcon
                avatarType="rounded"
                avatarUrl={ownerWorkspace?.logo ?? undefined}
              />
            }
            label={ownerWorkspace.displayName}
          />
        ),
      });
    }

    switch (registration.sourceType) {
      case ApplicationRegistrationSourceType.NPM:
        items.push({
          Icon: IconBox,
          label: t`Package`,
          value: 'NPM',
        });
        break;
      case ApplicationRegistrationSourceType.TARBALL:
        items.push({
          Icon: IconBox,
          label: t`Source`,
          value: isNonEmptyString(
            tarballUrlData?.applicationRegistrationTarballUrl,
          ) ? (
            <StyledSourceRow>
              <span>Tarball</span>
              <StyledDownloadLink
                href={tarballUrlData.applicationRegistrationTarballUrl}
                download
              >
                <Trans>Download</Trans>
              </StyledDownloadLink>
            </StyledSourceRow>
          ) : (
            'Tarball'
          ),
        });
        break;
      case ApplicationRegistrationSourceType.LOCAL:
        items.push({
          Icon: IconBox,
          label: t`Source`,
          value: 'Local',
        });
        break;
      case ApplicationRegistrationSourceType.OAUTH_ONLY:
        items.push({
          Icon: IconBox,
          label: t`Source`,
          value: 'OAuth',
        });
        break;
    }

    if (isNonEmptyString(registration.latestAvailableVersion)) {
      items.push({
        Icon: IconGitBranch,
        label: t`Latest version`,
        value: registration.latestAvailableVersion,
      });
    }

    items.push({
      Icon: IconDownload,
      label: t`Installed`,
      value: isApplicationInstalled ? (
        <Tag color="green" text={t`Yes`} />
      ) : (
        <Tag color="orange" text={t`No`} />
      ),
    });

    return items;
  };

  return (
    <Section>
      <H2Title title={t`General`} description={t`About your app`} />
      <StyledGeneralContainer>
        <SettingsTableCard
          rounded
          items={generateItems()}
          gridAutoColumns="3fr 8fr"
        />
        <SettingsApplicationRegistrationShareLinkButtons
          shareLink={shareLink}
          isInstalled={isApplicationInstalled}
          universalIdentifier={registration.universalIdentifier}
          isNpmSource={
            registration.sourceType === ApplicationRegistrationSourceType.NPM
          }
        />
      </StyledGeneralContainer>
    </Section>
  );
};
