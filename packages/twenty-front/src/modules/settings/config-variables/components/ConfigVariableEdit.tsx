import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { IconCheck, IconPencil, IconX } from 'twenty-ui/icon';
import { useToast } from 'twenty-ui/primitives/feedback';
import { Button, ButtonGroup } from 'twenty-ui/primitives/input';
import { Section } from 'twenty-ui/primitives/layout';
import { H3Title } from 'twenty-ui/primitives/typography';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const RESET_VARIABLE_MODAL_ID =
  'reset-application-registration-config-variable-modal';

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonContainer = styled(ButtonGroup)`
  display: flex;
`;

type ConfigVariableEditProps = {
  title: string;
  description?: string;
  input: React.ReactNode;
  isEditing: boolean;
  setIsEditing: Dispatch<SetStateAction<boolean>>;
  isSaveDisabled?: boolean;
  canOpenCancelModal?: boolean;
  onSave?: () => Promise<void>;
  onCancel: () => void;
  onEdit?: () => void;
  onConfirmReset?: () => Promise<void>;
  editDisabled?: boolean;
  helpContent?: React.ReactNode;
};

export const ConfigVariableEdit = ({
  title,
  description,
  input,
  isEditing,
  setIsEditing,
  canOpenCancelModal,
  isSaveDisabled = false,
  onSave,
  onCancel,
  onEdit,
  onConfirmReset,
  editDisabled = false,
  helpContent,
}: ConfigVariableEditProps) => {
  const { t } = useLingui();

  const { openModal } = useModal();

  const { enqueueToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave?.();
      enqueueToast({
        variant: 'success',
        children: t`Variable ${title} updated`,
      });
    } catch {
      enqueueToast({ variant: 'error', children: t`Error updating variable` });
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmReset?.();
      enqueueToast({
        variant: 'success',
        children: t`Variable ${title} reset`,
      });
    } catch {
      enqueueToast({ variant: 'error', children: t`Error resetting variable` });
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    if (canOpenCancelModal) {
      openModal(RESET_VARIABLE_MODAL_ID);
      return;
    }

    onCancel?.();

    setIsEditing(false);
  };

  const handleEdit = () => {
    onEdit?.();
    setIsEditing(true);
  };

  return (
    <SettingsPageContainer>
      <Section>
        <H3Title title={title} description={description} />
      </Section>

      <Section>
        <StyledRow>
          {input}
          {!isEditing ? (
            <Button
              startIcon={<IconPencil />}
              aria-label={t`Edit`}
              onClick={handleEdit}
              type="button"
              disabled={editDisabled}
              variant="outline"
            />
          ) : (
            <StyledButtonContainer aria-label={t`Edit variable`}>
              <Button
                startIcon={<IconCheck />}
                aria-label={t`Save`}
                type={'button'}
                onClick={handleSave}
                disabled={isSaveDisabled || isSubmitting}
                variant="outline"
              />
              <Button
                startIcon={<IconX />}
                aria-label={t`Cancel`}
                onClick={handleCancel}
                type="button"
                disabled={isSubmitting}
                variant="outline"
              />
            </StyledButtonContainer>
          )}
          <ConfirmationModal
            modalInstanceId={RESET_VARIABLE_MODAL_ID}
            title={t`Reset variable`}
            subtitle={t`Are you sure you want to reset this variable?`}
            onConfirmClick={handleConfirmReset}
            confirmButtonText={t`Reset`}
            confirmButtonColor="danger"
          />
        </StyledRow>
        {helpContent}
      </Section>
    </SettingsPageContainer>
  );
};
