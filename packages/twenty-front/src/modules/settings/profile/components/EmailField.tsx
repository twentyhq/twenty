import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';

import { currentUserState } from '@/auth/states/currentUserState';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { useUpdateEmail } from '@/settings/profile/hooks/useUpdateEmail';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { IconCheck, IconPencil, IconX } from 'twenty-ui/icon';
import { Tooltip } from 'twenty-ui/primitives/surfaces';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledFieldRow = styled.div`
  align-items: stretch;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledActionWrapper = styled.div`
  align-items: stretch;
  display: flex;

  & > button + button {
    border-left: none;
  }
`;

const StyledActionButtonContainer = styled.div`
  align-items: stretch;
  display: inline-flex;
  height: 100%;
  justify-content: center;
`;

export const EmailField = () => {
  const { t } = useLingui();
  const currentUser = useAtomStateValue(currentUserState);
  const { canEdit, isBlockedByWorkspaceLimit } =
    useCanEditProfileField('email');
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
  const shouldShowWorkspaceLimitTooltip =
    !isEditing && isBlockedByWorkspaceLimit;

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
                size="medium"
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
                size="medium"
                onClick={handleCancelEditing}
                type="button"
              />
            </StyledActionButtonContainer>
          </StyledActionWrapper>
        ) : (
          <StyledActionWrapper key="view">
            <Tooltip
              content={t`You can't change your email because you belong to 2 or more workspaces.`}
              delay={0}
              side="top"
              disabled={!shouldShowWorkspaceLimitTooltip}
            >
              <StyledActionButtonContainer>
                <Button
                  Icon={IconPencil}
                  variant="secondary"
                  size="medium"
                  onClick={handleStartEditing}
                  disabled={!canEdit}
                  type="button"
                />
              </StyledActionButtonContainer>
            </Tooltip>
          </StyledActionWrapper>
        )}
      </StyledFieldRow>
    </StyledContainer>
  );
};
