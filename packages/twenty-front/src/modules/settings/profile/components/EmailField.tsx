import { styled } from '@linaria/react';
import { useState } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { useUpdateEmail } from '@/settings/profile/hooks/useUpdateEmail';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { IconCheck, IconPencil, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFieldRow = styled.div`
  display: flex;
  align-items: stretch;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActionWrapper = styled.div`
  display: flex;
  align-items: stretch;

  & > button + button {
    border-left: none;
  }
`;

const StyledActionButtonContainer = styled.div`
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;

export const EmailField = () => {
  const currentUser = useAtomStateValue(currentUserState);
  const { canEdit } = useCanEditProfileField('email');
  const { updateEmail } = useUpdateEmail();

  const [draftEmail, setDraftEmail] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const currentEmail = currentUser?.email ?? '';

  const normalizedDraftEmail = draftEmail.trim().toLowerCase();

  const isEmailChanged =
    normalizedDraftEmail.length > 0 && normalizedDraftEmail !== currentEmail;
  const isEmailFormatValid =
    normalizedDraftEmail.includes('@') && !normalizedDraftEmail.endsWith('@');

  const isSaveDisabled =
    !canEdit || !isEditing || !isEmailChanged || !isEmailFormatValid;

  const handleStartEditing = () => {
    if (!canEdit) {
      return;
    }

    setDraftEmail(currentEmail);
    setIsEditing(true);
  };

  const handleCancelEditing = () => {
    setIsEditing(false);
  };

  const handleSave = async () => {
    if (isSaveDisabled) {
      return;
    }

    setIsEditing(false);
    await updateEmail(normalizedDraftEmail);
  };

  const currentUserId = currentUser?.id;

  return (
    <StyledContainer>
      <StyledFieldRow>
        <SettingsTextInput
          instanceId={`user-email-${currentUserId}`}
          value={isEditing ? draftEmail : currentEmail}
          onChange={setDraftEmail}
          disabled={!canEdit || !isEditing}
          fullWidth
          type="email"
          onInputEnter={handleSave}
        />
        {isEditing ? (
          <StyledActionWrapper key="editing">
            <StyledActionButtonContainer>
              <Button
                Icon={IconCheck}
                variant="secondary"
                position="left"
                size="small"
                onClick={handleSave}
                disabled={isSaveDisabled}
                type="button"
              />
            </StyledActionButtonContainer>
            <StyledActionButtonContainer>
              <Button
                Icon={IconX}
                variant="secondary"
                position="right"
                size="small"
                onClick={handleCancelEditing}
                type="button"
              />
            </StyledActionButtonContainer>
          </StyledActionWrapper>
        ) : (
          <StyledActionWrapper key="view">
            <StyledActionButtonContainer>
              <Button
                Icon={IconPencil}
                variant="secondary"
                size="small"
                onClick={handleStartEditing}
                disabled={!canEdit}
                type="button"
              />
            </StyledActionButtonContainer>
          </StyledActionWrapper>
        )}
      </StyledFieldRow>
    </StyledContainer>
  );
};
