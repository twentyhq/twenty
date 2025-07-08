import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { SettingsServerlessFunctionTabEnvironmentVariablesSection } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariablesSection';
import { useDeleteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useDeleteOneServerlessFunction';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SettingsPath } from '@/types/SettingsPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { H2Title } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_FUNCTION_MODAL_ID = 'delete-function-modal';

export const SettingsServerlessFunctionSettingsTab = ({
  formValues,
  serverlessFunctionId,
  onChange,
  onCodeChange,
}: {
  formValues: ServerlessFunctionFormValues;
  serverlessFunctionId: string;
  onChange: (key: string) => (value: string) => void;
  onCodeChange: (filePath: string, value: string) => void;
}) => {
  const navigate = useNavigateSettings();
  const { openModal } = useModal();
  const { deleteOneServerlessFunction } = useDeleteOneServerlessFunction();

  const deleteFunction = async () => {
    await deleteOneServerlessFunction({ id: serverlessFunctionId });
    navigate(SettingsPath.ServerlessFunctions);
  };

  return (
    <>
      <SettingsServerlessFunctionNewForm
        formValues={formValues}
        onChange={onChange}
      />
      <SettingsServerlessFunctionTabEnvironmentVariablesSection
        formValues={formValues}
        onCodeChange={onCodeChange}
      />
      <Section>
        <H2Title title="Danger zone" description="Delete this function" />
        <Button
          accent="danger"
          onClick={() => openModal(DELETE_FUNCTION_MODAL_ID)}
          variant="secondary"
          size="small"
          title="Delete function"
        />
      </Section>
      <ConfirmationModal
        confirmationValue={formValues.name}
        confirmationPlaceholder={formValues.name}
        modalId={DELETE_FUNCTION_MODAL_ID}
        title="Function Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            function. <br /> Please type in the function name to confirm.
          </>
        }
        onConfirmClick={deleteFunction}
        confirmButtonText="Delete function"
      />
    </>
  );
};
