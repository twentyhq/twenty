import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { ConfirmationModal } from '@/ui/layout/modal/components/ConfirmationModal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type Dispatch, type SetStateAction, useState } from 'react';
import { useToast } from 'twenty-ui/feedback';
import { IconCheck, IconPencil, IconX } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { H3Title } from 'twenty-ui/typography';

const RESET_VARIABLE_MODAL_ID =
  'reset-application-registration-config-variable-modal';

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledButtonContainer = styled.div`
  display: flex;
  & > :not(:first-of-type) > button {
    border-left: none;
  }
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

  const { add: addToast } = useToast();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSave = async () => {
    try {
      setIsSubmitting(true);
      await onSave?.();
      addToast({ variant: 'success', children: t`Variable ${title} updated` });
    } catch {
      addToast({ variant: 'error', children: t`Error updating variable` });
    } finally {
      setIsSubmitting(false);
      setIsEditing(false);
    }
  };

  const handleConfirmReset = async () => {
    try {
      setIsSubmitting(true);
      await onConfirmReset?.();
      addToast({ variant: 'success', children: t`Variable ${title} reset` });
    } catch {
      addToast({ variant: 'error', children: t`Error resetting variable` });
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
              Icon={IconPencil}
              variant="primary"
              onClick={handleEdit}
              type="button"
              disabled={editDisabled}
            />
          ) : (
            <StyledButtonContainer>
              <Button
                Icon={IconCheck}
                variant="secondary"
                position="left"
                type={'button'}
                onClick={handleSave}
                disabled={isSaveDisabled || isSubmitting}
              />
              <Button
                Icon={IconX}
                variant="secondary"
                position="right"
                onClick={handleCancel}
                type="button"
                disabled={isSubmitting}
              />
            </StyledButtonContainer>
          )}
          <ConfirmationModal
            modalInstanceId={RESET_VARIABLE_MODAL_ID}
            title={t`Reset variable`}
            subtitle={t`Are you sure you want to reset this variable?`}
            onConfirmClick={handleConfirmReset}
            confirmButtonText={t`Reset`}
            confirmButtonAccent="danger"
          />
        </StyledRow>
        {helpContent}
      </Section>
    </SettingsPageContainer>
  );
};
