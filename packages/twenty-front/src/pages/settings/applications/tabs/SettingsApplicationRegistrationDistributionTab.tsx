import { currentUserState } from '@/auth/states/currentUserState';
import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { CommandBlock, Tag } from 'twenty-ui/data-display';
import { IconCopy } from 'twenty-ui/icon';
import { H2Title } from 'twenty-ui/typography';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isNonEmptyString } from 'twenty-shared/utils';
import {
  ApplicationRegistrationListingRequestStatus,
  ApplicationRegistrationSourceType,
  FindOneApplicationRegistrationDocument,
  RequestApplicationRegistrationListingDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';
import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { SettingsApplicationRegistrationShareLinkButtons } from '~/pages/settings/applications/components/SettingsApplicationRegistrationShareLinkButtons';

const StyledListingRequestForm = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledEmailInputContainer = styled.div`
  max-width: 280px;
  flex: 1;
`;

const StyledStatusRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

export const SettingsApplicationRegistrationDistributionTab = ({
  registration,
  fromAdmin,
}: {
  registration: ApplicationRegistrationData;
  fromAdmin?: boolean;
}) => {
  const { t } = useLingui();

  const { copyToClipboard } = useCopyToClipboard();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();

  const currentUser = useAtomStateValue(currentUserState);

  const [contactEmail, setContactEmail] = useState(currentUser?.email ?? '');

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
        variables: {
          applicationRegistrationId: registration.id,
          contactEmail: contactEmail.trim(),
        },
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

  const renderListingRequestForm = (buttonTitle: string) => {
    if (fromAdmin === true) {
      return null;
    }

    return (
    <StyledListingRequestForm>
      <StyledEmailInputContainer>
        <SettingsTextInput
          instanceId="listing-request-contact-email"
          value={contactEmail}
          onChange={setContactEmail}
          fullWidth
          label={t`Contact email`}
          placeholder={t`you@example.com`}
        />
      </StyledEmailInputContainer>
      <Button
        title={buttonTitle}
        variant="secondary"
        onClick={handleRequestListing}
        disabled={isRequestingListing || !isNonEmptyString(contactEmail.trim())}
      />
    </StyledListingRequestForm>
    );
  };

  const renderListingStatus = () => {
    if (registration.isListed) {
      return <Tag text={t`Listed`} color="green" />;
    }

    switch (registration.listingRequestStatus) {
      case ApplicationRegistrationListingRequestStatus.REQUESTED:
        return <Tag text={t`Review pending`} color="orange" />;
      case ApplicationRegistrationListingRequestStatus.APPROVED:
        return <Tag text={t`Approved`} color="green" />;
      case ApplicationRegistrationListingRequestStatus.CHANGE_REQUESTED:
        return (
          <>
            <StyledStatusRow>
              <Tag text={t`Changes requested`} color="orange" />
            </StyledStatusRow>
            {renderListingRequestForm(t`Request listing again`)}
          </>
        );
      case ApplicationRegistrationListingRequestStatus.REJECTED:
        return (
          <>
            <StyledStatusRow>
              <Tag text={t`Rejected`} color="red" />
            </StyledStatusRow>
            {renderListingRequestForm(t`Request listing again`)}
          </>
        );
      default:
        return renderListingRequestForm(t`Request listing`);
    }
  };

  return (
    <>
      {isNpmSource && fromAdmin !== true && (
        <Section>
          <H2Title
            title={t`Ownership`}
            description={t`This application's registration is claimed by your workspace`}
          />
          <Tag text={t`Claimed by this workspace`} color="green" />
        </Section>
      )}
      {isNpmSource && (
        <Section>
          <H2Title
            title={t`Marketplace listing`}
            description={t`Ask an administrator to list your app in the marketplace so any workspace can install it. The decision will be sent to your contact email.`}
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
