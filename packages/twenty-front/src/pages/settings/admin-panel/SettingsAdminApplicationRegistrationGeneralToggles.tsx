import { Section } from 'twenty-ui/layout';
import { AppTooltip, Card, TooltipDelay } from 'twenty-ui/surfaces';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import {
  IconArrowBarToDown,
  IconInfoCircle,
  IconPinned,
  IconReload,
} from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { H2Title } from 'twenty-ui/typography';
import { type ApplicationRegistration } from '~/generated-metadata/graphql';
import {
  BackfillApplicationInstallationDocument,
  UpdateAdminApplicationRegistrationDocument,
} from '~/generated-admin/graphql';
import { styled } from '@linaria/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useApolloAdminClient } from '@/settings/admin-panel/apollo/hooks/useApolloAdminClient';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

const StyledToggleContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledBackfillContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[6]};
`;

const StyledInfoIcon = styled(IconInfoCircle)`
  color: ${themeCssVariables.font.color.tertiary};
  cursor: default;
  flex-shrink: 0;
`;

const BACKFILL_INSTALLATION_MODAL_ID =
  'backfill-application-installation-modal';

const BACKFILL_BUTTON_ID = 'backfill-application-installation-button';

const BACKFILL_INFO_ICON_ID = 'backfill-application-installation-info';

export const SettingsAdminApplicationRegistrationGeneralToggles = ({
  registration,
}: {
  registration: ApplicationRegistration;
}) => {
  const { t } = useLingui();
  const apolloAdminClient = useApolloAdminClient();
  const { enqueueSuccessSnackBar, enqueueErrorSnackBar } = useSnackBar();
  const { openModal, closeModal } = useModal();

  const [isBackfilling, setIsBackfilling] = useState(false);

  const [updateRegistration] = useMutation(
    UpdateAdminApplicationRegistrationDocument,
    { client: apolloAdminClient },
  );

  const [backfillInstallation] = useMutation(
    BackfillApplicationInstallationDocument,
    { client: apolloAdminClient },
  );

  const handleBackfill = async () => {
    setIsBackfilling(true);
    try {
      await backfillInstallation({
        variables: { applicationRegistrationId: registration.id },
      });
      enqueueSuccessSnackBar({
        message: t`Backfill started. This app will be installed on all existing workspaces in the background.`,
      });
    } catch {
      enqueueErrorSnackBar({
        message: t`Failed to start backfill`,
      });
    } finally {
      setIsBackfilling(false);
      closeModal(BACKFILL_INSTALLATION_MODAL_ID);
    }
  };

  return (
    <Section>
      <H2Title title={t`Installation`} />
      <StyledToggleContainer>
        <Card rounded fullWidth>
          <SettingsOptionCardContentToggle
            Icon={IconArrowBarToDown}
            title={t`Allow installation`}
            description={t`Display this app in the NPM packages list`}
            checked={registration.isListed}
            onChange={(checked) =>
              updateRegistration({
                variables: {
                  input: {
                    id: registration.id,
                    update: { isListed: checked },
                  },
                },
              })
            }
          />
        </Card>
        <Card rounded fullWidth>
          <SettingsOptionCardContentToggle
            Icon={IconPinned}
            title={t`Pre-install on new workspaces`}
            description={t`Automatically install this app on every newly created workspace`}
            checked={registration.isPreInstalled}
            onChange={(checked) =>
              updateRegistration({
                variables: {
                  input: {
                    id: registration.id,
                    update: { isPreInstalled: checked },
                  },
                },
              })
            }
          />
        </Card>
      </StyledToggleContainer>
      <StyledBackfillContainer>
        <Button
          id={BACKFILL_BUTTON_ID}
          Icon={IconReload}
          title={t`Install latest version on all workspaces`}
          variant="secondary"
          onClick={() => openModal(BACKFILL_INSTALLATION_MODAL_ID)}
          disabled={isBackfilling || !registration.isPreInstalled}
        />
        <StyledInfoIcon id={BACKFILL_INFO_ICON_ID} size={16} />
        <AppTooltip
          anchorSelect={`#${BACKFILL_INFO_ICON_ID}`}
          content={t`Install the latest version of this app on all existing workspaces`}
          noArrow
          place="bottom"
          positionStrategy="fixed"
          delay={TooltipDelay.shortDelay}
        />
        {!registration.isPreInstalled && (
          <AppTooltip
            anchorSelect={`#${BACKFILL_BUTTON_ID}`}
            content={t`Pre install should be enabled.`}
            noArrow
            place="bottom"
            positionStrategy="fixed"
            delay={TooltipDelay.shortDelay}
          />
        )}
      </StyledBackfillContainer>
      <ConfirmationModal
        modalInstanceId={BACKFILL_INSTALLATION_MODAL_ID}
        title={t`Backfill installation`}
        subtitle={t`This will install the latest version of "${registration.name}" on all existing active and suspended workspaces, upgrading any workspace that already has an older version. It runs as a background job and may take a while. Continue?`}
        onConfirmClick={handleBackfill}
        confirmButtonText={t`Backfill`}
        confirmButtonAccent="blue"
        loading={isBackfilling}
      />
    </Section>
  );
};
