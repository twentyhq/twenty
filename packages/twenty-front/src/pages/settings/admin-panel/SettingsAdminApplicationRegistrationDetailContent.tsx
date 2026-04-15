import {
  H2Title,
  IconBox,
  IconDownload,
  IconTag,
  IconWorld,
} from 'twenty-ui/display';
import { Trans, useLingui } from '@lingui/react/macro';
import {
  SettingsTableCard,
  TableItem,
} from '@/settings/components/SettingsTableCard';
import {
  ApplicationRegistration,
  ApplicationRegistrationSourceType,
  ApplicationRegistrationTarballUrlDocument,
  FindOneApplicationDocument,
  GetPublicWorkspaceDataByIdDocument,
} from '~/generated-metadata/graphql';
import { isNonEmptyString } from '@sniptt/guards';
import { IconGitBranch } from '@tabler/icons-react';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Button } from 'twenty-ui/input';
import { useQuery } from '@apollo/client/react';
import {
  AvatarOrIcon,
  Chip,
  ChipSize,
  ChipVariant,
} from 'twenty-ui/components';
import { isDefined } from 'twenty-shared/utils';

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
const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding-top: ${themeCssVariables.spacing[2]};
`;

export const SettingsAdminApplicationRegistrationDetailContent = ({
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

  const { data: ownerWorkspaceData } = useQuery(
    GetPublicWorkspaceDataByIdDocument,
    {
      variables: { id: registration.ownerWorkspaceId ?? '' },
      skip: !registration.ownerWorkspaceId,
    },
  );

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

    return items;
  };

  const getDownloadTarballButton = () => {
    if (registration.sourceType !== ApplicationRegistrationSourceType.TARBALL) {
      return null;
    }

    if (!isNonEmptyString(tarballUrlData?.applicationRegistrationTarballUrl)) {
      return null;
    }

    return (
      <Button
        Icon={IconDownload}
        title={t`Download tarball`}
        variant="secondary"
        to={tarballUrlData?.applicationRegistrationTarballUrl}
      />
    );
  };

  return (
    <>
      <H2Title title={t`General`} description={t`About your app`} />
      <SettingsTableCard
        rounded
        items={generateItems()}
        gridAutoColumns="3fr 8fr"
      />
      <StyledButtonGroup>{getDownloadTarballButton()}</StyledButtonGroup>
    </>
  );
};
