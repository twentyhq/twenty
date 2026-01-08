import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { H2Title, IconTrash } from 'twenty-ui/display';
import { Section } from 'twenty-ui/layout';
import type { Application } from '~/generated/graphql';
import { SettingsApplicationVersionContainer } from '~/pages/settings/applications/components/SettingsApplicationVersionContainer';
import { Button } from 'twenty-ui/input';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { Trans } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useState } from 'react';
import { useUninstallApplicationMutation } from '~/generated-metadata/graphql';
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

  const [uninstallApplication] = useUninstallApplicationMutation();

  const navigate = useNavigateSettings();

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
        <H2Title title={t`Name`} description={t`Name of the application`} />
        <SettingsTextInput
          instanceId={`application-name-${id}`}
          value={name}
          disabled
          fullWidth
        />
      </Section>
      <Section>
        <H2Title
          title={t`Description`}
          description={t`Description of the application`}
        />
        <SettingsTextInput
          instanceId={`application-description-${id}`}
          value={description}
          disabled
          fullWidth
        />
      </Section>
      <Section>
        <H2Title
          title={t`Version`}
          description={t`Version of the application`}
        />
        <SettingsApplicationVersionContainer application={application} />
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
            modalId={UNINSTALL_APPLICATION_MODAL_ID}
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
