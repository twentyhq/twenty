import { H2Title } from 'twenty-ui';
import { Section } from '@/ui/layout/section/components/Section';
import { ServerlessFunctionFormValues } from '@/settings/serverless-functions/hooks/useServerlessFunctionUpdateFormState';
import { Button } from '@/ui/input/button/components/Button';
import { useState } from 'react';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { SettingsServerlessFunctionNewForm } from '@/settings/serverless-functions/components/SettingsServerlessFunctionNewForm';
import { useDeleteOneServerlessFunction } from '@/settings/serverless-functions/hooks/useDeleteOneServerlessFunction';
import { useNavigate } from 'react-router-dom';

export const SettingsServerlessFunctionSettingsTab = ({
  formValues,
  serverlessFunctionId,
  onChange,
}: {
  formValues: ServerlessFunctionFormValues;
  serverlessFunctionId: string;
  onChange: (key: string) => (value: string) => void;
}) => {
  const navigate = useNavigate();
  const [isDeleteFunctionModalOpen, setIsDeleteFunctionModalOpen] =
    useState(false);
  const { deleteOneServerlessFunction } = useDeleteOneServerlessFunction();

  const deleteFunction = async () => {
    await deleteOneServerlessFunction({ id: serverlessFunctionId });
    navigate('/settings/functions');
  };
  return (
    <>
      <SettingsServerlessFunctionNewForm
        formValues={formValues}
        onChange={onChange}
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
