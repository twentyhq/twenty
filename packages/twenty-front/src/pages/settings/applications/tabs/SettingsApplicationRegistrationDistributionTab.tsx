import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { CommandBlock, Tag } from 'twenty-ui/data-display';
import { IconCopy } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import {
  ApplicationRegistrationListingRequestStatus,
  ApplicationRegistrationSourceType,
  FindOneApplicationRegistrationDocument,
  RequestApplicationRegistrationListingDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { SettingsApplicationRegistrationShareLinkButtons } from '~/pages/settings/applications/components/SettingsApplicationRegistrationShareLinkButtons';

export const SettingsApplicationRegistrationDistributionTab = ({
  registration,
}: {
  registration: ApplicationRegistrationData;
}) => {
  const { t } = useLingui();

  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const [requestListing, { loading: isRequestingListing }] = useMutation(
    RequestApplicationRegistrationListingDocument,
    {
      refetchQueries: [FindOneApplicationRegistrationDocument],
    },
  );

  const isNpmSource =
    registration.sourceType === ApplicationRegistrationSourceType.NPM;

  const isTarballSource =
    registration.sourceType === ApplicationRegistrationSourceType.TARBALL;

  const shareLink = getSettingsPath(SettingsPath.AvailableApplicationDetail, {
    availableApplicationId: registration.universalIdentifier,
  });

  const publishCommands = ['yarn twenty app:publish'];

  const handleRequestListing = async () => {
    try {
      await requestListing({
        variables: { applicationRegistrationId: registration.id },
      });
      enqueueSuccessSnackBar({
        message: t`Listing requested. An administrator will review it.`,
      });
    } catch (error) {
      enqueueErrorSnackBar({
        message:
          error instanceof Error
            ? error.message
            : t`Could not request a listing`,
      });
    }
  };

  const renderListingStatus = () => {
    if (registration.isListed) {
      return <Tag text={t`Listed`} color="green" />;
    }

    switch (registration.listingRequestStatus) {
      case ApplicationRegistrationListingRequestStatus.REQUESTED:
        return <Tag text={t`Review pending`} color="orange" />;
      case ApplicationRegistrationListingRequestStatus.REJECTED:
        return (
          <Button
            title={t`Request listing again`}
            variant="secondary"
            onClick={handleRequestListing}
            disabled={isRequestingListing}
          />
        );
      default:
        return (
          <Button
            title={t`Request listing`}
            variant="secondary"
            onClick={handleRequestListing}
            disabled={isRequestingListing}
          />
        );
    }
  };

  return (
    <>
      {isNpmSource && (
        <Section>
          <H2Title
            title={t`Marketplace listing`}
            description={t`Ask an administrator to list your app in the marketplace so any workspace can install it`}
          />
          {renderListingStatus()}
        </Section>
      )}
      <Section>
        <H2Title
          title={t`Public`}
          description={t`Publish your app to the marketplace so others can install it`}
        />
        {isNpmSource && (
          <SettingsApplicationRegistrationShareLinkButtons
            shareLink={shareLink}
            isNpmSource
            withCopyButton
          />
        )}
        {isTarballSource && (
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
        )}
      </Section>
      {isTarballSource && (
        <Section>
          <H2Title
            title={t`Private`}
            description={t`Share your app to other workspaces without pushing it on the marketplace`}
          />
          <SettingsApplicationRegistrationShareLinkButtons
            shareLink={shareLink}
            withCopyButton
          />
        </Section>
      )}
    </>
  );
};
