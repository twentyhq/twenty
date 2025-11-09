import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';

import { currentUserState } from '@/auth/states/currentUserState';
import { useCanEditProfileField } from '@/settings/profile/hooks/useCanEditProfileField';
import { useUpdateEmail } from '@/settings/profile/hooks/useUpdateEmail';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { Button } from 'twenty-ui/input';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const StyledFieldRow = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: ${({ theme }) => theme.spacing(3)};
`;

const StyledHelperText = styled.p`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.sm};
  margin: 0;
`;

export const EmailField = () => {
  const { t } = useLingui();
  const currentUser = useRecoilValue(currentUserState);
  const { canEdit } = useCanEditProfileField('email');
  const { updateEmail } = useUpdateEmail();

  if (!currentUser) {
    return null;
  }

  const [email, setEmail] = useState(currentUser.email);

  useEffect(() => {
    setEmail(currentUser.email);
  }, [currentUser.email]);

  const trimmedEmail = email.trim();
  const isEmailChanged =
    trimmedEmail.length > 0 && trimmedEmail !== currentUser.email;

  const handleUpdate = async () => {
    if (!canEdit || !isEmailChanged) {
      return;
    }

    await updateEmail(trimmedEmail);
  };

  return (
    <StyledContainer>
      <StyledFieldRow>
        <SettingsTextInput
          instanceId={`user-email-${currentUser.id}`}
          value={email}
          onChange={setEmail}
          disabled={!canEdit}
          fullWidth
          type="email"
          onInputEnter={handleUpdate}
        />
        <Button
          variant="secondary"
          title={t`Update email`}
          onClick={handleUpdate}
          disabled={!canEdit || !isEmailChanged}
        />
      </StyledFieldRow>
      {canEdit && (
        <StyledHelperText>
          {t`We will send you a verification email to confirm this change.`}
        </StyledHelperText>
      )}
    </StyledContainer>
  );
};
