import { isDefined } from 'twenty-shared/utils';
import type { Application } from '~/generated/graphql';
import { useUpdateOneApplicationVariable } from '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable';
import { SettingsApplicationDetailEnvironmentVariablesTable } from '~/pages/settings/applications/tabs/SettingsApplicationDetailEnvironmentVariablesTable';
import { H2Title, IconTrash } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { Trans, useLingui } from '@lingui/react/macro';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useUninstallApplicationMutation } from '~/generated-metadata/graphql';

const UNINSTALL_APPLICATION_MODAL_ID = 'uninstall-application-modal';

export const SettingsApplicationDetailSettingsTab = ({
  application,
}: {
  application?: Omit<Application, 'objects'> & {
    objects: { id: string }[];
  };
}) => {
  const { t } = useLingui();

  const { openModal } = useModal();

  const { enqueueErrorSnackBar, enqueueSuccessSnackBar } = useSnackBar();

  const navigate = useNavigateSettings();

  const [isLoading, setIsLoading] = useState(false);

  const { updateOneApplicationVariable } = useUpdateOneApplicationVariable();

  const [uninstallApplication] = useUninstallApplicationMutation();

  if (!isDefined(application)) {
    return null;
  }

  const envVariables = [...(application.applicationVariables ?? [])].sort(
    (a, b) => a.key.localeCompare(b.key),
  );

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
      <SettingsApplicationDetailEnvironmentVariablesTable
        envVariables={envVariables}
        onUpdate={({ key, value }) =>
          updateOneApplicationVariable({
            key,
            value,
            applicationId: application.id,
          })
        }
      />
      {application.canBeUninstalled && (
        <>
          <Section>
            <H2Title
              title={t`Danger zone`}
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
