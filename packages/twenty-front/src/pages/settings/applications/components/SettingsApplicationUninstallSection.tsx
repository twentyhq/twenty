import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useMutation } from '@apollo/client/react';
import { UninstallApplicationDocument } from '~/generated-metadata/graphql';
import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { AppTooltip, H2Title, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';

const UNINSTALL_APPLICATION_MODAL_ID = 'uninstall-application-modal';

type SettingsApplicationUninstallSectionProps = {
  universalIdentifier: string;
  canBeUninstalled: boolean;
};

export const SettingsApplicationUninstallSection = ({
  universalIdentifier,
  canBeUninstalled,
}: SettingsApplicationUninstallSectionProps) => {
  const { openModal } = useModal();
  const [isLoading, setIsLoading] = useState(false);
  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();
  const [uninstallApplication] = useMutation(UninstallApplicationDocument);
  const navigate = useNavigateSettings();

  const handleUninstallApplication = async () => {
    setIsLoading(true);
    try {
      await uninstallApplication({
        variables: { universalIdentifier },
      });

      enqueueSuccessSnackBar({
        message: t`Application successfully uninstalled.`,
      });
      navigate(SettingsPath.Applications);
    } catch {
      enqueueErrorSnackBar({ message: t`Error uninstalling application.` });
    } finally {
      setIsLoading(false);
    }
  };

  const confirmationValue = t`yes`;

  return (
    <Section>
      <H2Title
        title={t`Manage your app`}
        description={t`Uninstall this application`}
      />
      <Button
        accent="danger"
        id={'uninstall-button-anchor'}
        variant="secondary"
        title={t`Uninstall`}
        Icon={IconTrash}
        disabled={!canBeUninstalled}
        onClick={() =>
          canBeUninstalled ? openModal(UNINSTALL_APPLICATION_MODAL_ID) : null
        }
      />
      {!canBeUninstalled && (
        <AppTooltip
          anchorSelect={`#uninstall-button-anchor`}
          content={t`This application is required for your workspace to function properly and cannot be uninstalled.`}
          place="bottom-start"
        />
      )}
      <ConfirmationModal
        confirmationPlaceholder={confirmationValue}
        confirmationValue={confirmationValue}
        modalInstanceId={UNINSTALL_APPLICATION_MODAL_ID}
        title={t`Uninstall Application?`}
        subtitle={
          <Trans>
            Please type {`"${confirmationValue}"`} to confirm you want to
            uninstall this application.
          </Trans>
        }
        onConfirmClick={handleUninstallApplication}
        confirmButtonText={t`Uninstall`}
        loading={isLoading}
      />
    </Section>
  );
};
