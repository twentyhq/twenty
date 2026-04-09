import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconTrash } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import { SettingsApplicationVersionContainer } from '~/pages/settings/applications/components/SettingsApplicationVersionContainer';
import { Button } from 'twenty-ui/input';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { Trans } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useState } from 'react';
import { useMutation } from '@apollo/client/react';
import {
  type Application,
  UninstallApplicationDocument,
} from '~/generated-metadata/graphql';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const UNINSTALL_APPLICATION_MODAL_ID = 'uninstall-application-modal';

export const SettingsApplicationDetailAboutTab = ({
  application,
}: {
  application?: Omit<Application, 'objects'> & {
    objects: { id: string }[];
  };
}) => {
  const { openModal } = useModal();

  const [isLoading, setIsLoading] = useState(false);

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const [uninstallApplication] = useMutation(UninstallApplicationDocument);

  const navigate = useNavigateSettings();

  const registrationId = application?.applicationRegistrationId;

  const latestAvailableVersion =
    application?.applicationRegistration?.latestAvailableVersion ?? null;

  if (!isDefined(application)) {
    return null;
  }

  const { id, name, description } = application;

  const handleUninstallApplication = async () => {
    setIsLoading(true);
    try {
      await uninstallApplication({
        variables: { universalIdentifier: application.universalIdentifier },
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
    <>
      <Section>
        <SettingsApplicationVersionContainer
          application={application}
          latestAvailableVersion={latestAvailableVersion}
          appRegistrationId={registrationId}
        />
      </Section>
      {application.canBeUninstalled && (
        <>
          <Section>
            <H2Title
              title={t`Manage your app`}
              description={t`Uninstall this application`}
            />
            <Button
              accent="danger"
              variant="secondary"
              title={t`Uninstall`}
              Icon={IconTrash}
              onClick={() => openModal(UNINSTALL_APPLICATION_MODAL_ID)}
            />
          </Section>
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
        </>
      )}
    </>
  );
};
