import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
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

export const EmailField = () => {
  const { t } = useLingui();
  const currentUser = useRecoilValue(currentUserState);
  const { canEdit } = useCanEditProfileField('email');
  const { updateEmail } = useUpdateEmail();

  const [email, setEmail] = useState(currentUser?.email || '');
  const isEmailChanged = email.length > 0 && email !== currentUser?.email;

  const handleUpdate = async () => {
    if (!canEdit || !isEmailChanged) {
      return;
    }

    await updateEmail(email);
    setEmail(currentUser?.email || '');
  };

  const currentUserId = currentUser?.id;

  return (
    <StyledContainer>
      <StyledFieldRow>
        <SettingsTextInput
          instanceId={`user-email-${currentUserId}`}
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
    </StyledContainer>
  );
};
