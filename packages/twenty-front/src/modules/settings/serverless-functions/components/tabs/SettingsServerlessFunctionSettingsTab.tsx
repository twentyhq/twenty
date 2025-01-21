import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { SettingsServerlessFunctionTabEnvironmentVariablesSection } from '@/settings/serverless-functions/components/tabs/SettingsServerlessFunctionTabEnvironmentVariablesSection';
import { useDeleteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useDeleteOneServerlessFunction';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { SettingsServerlessFunctionHotkeyScope } from '@/settings/serverless-functions/types/SettingsServerlessFunctionHotKeyScope';
import { SettingsPath } from '@/types/SettingsPath';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useScopedHotkeys } from '@/ui/utilities/hotkey/hooks/useScopedHotkeys';
import { useState } from 'react';
import { Key } from 'ts-key-enum';
import { Button, H2Title, Section } from 'twenty-ui';
import { useHotkeyScopeOnMount } from '~/hooks/useHotkeyScopeOnMount';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

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
  const [isDeleteFunctionModalOpen, setIsDeleteFunctionModalOpen] =
    useState(false);
  const { deleteOneServerlessFunction } = useDeleteOneServerlessFunction();

  const deleteFunction = async () => {
    await deleteOneServerlessFunction({ id: serverlessFunctionId });
    navigate(SettingsPath.ServerlessFunctions);
  };

  useHotkeyScopeOnMount(
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionSettingsTab,
  );

  useScopedHotkeys(
    [Key.Delete],
    () => {
      setIsDeleteFunctionModalOpen(true);
    },
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionSettingsTab,
  );

  useScopedHotkeys(
    [Key.Escape],
    () => {
      navigate(SettingsPath.ServerlessFunctions);
    },
    SettingsServerlessFunctionHotkeyScope.ServerlessFunctionSettingsTab,
  );
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
          onClick={() => setIsDeleteFunctionModalOpen(true)}
          variant="secondary"
          size="small"
          title="Delete function"
        />
      </Section>
      <ConfirmationModal
        confirmationValue={formValues.name}
        confirmationPlaceholder={formValues.name}
        isOpen={isDeleteFunctionModalOpen}
        setIsOpen={setIsDeleteFunctionModalOpen}
        title="Function Deletion"
        subtitle={
          <>
            This action cannot be undone. This will permanently delete your
            function. <br /> Please type in the function name to confirm.
          </>
        }
        onConfirmClick={deleteFunction}
        deleteButtonText="Delete function"
      />
    </>
  );
};
