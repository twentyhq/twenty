import { useImpersonate } from '@/settings/admin-panel/hooks/useImpersonate';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useState } from 'react';
import { Button, H2Title, IconUser, Section } from 'twenty-ui';

const StyledLinkContainer = styled.div`
  margin-right: ${({ theme }) => theme.spacing(2)};
  width: 100%;
`;

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  flex-direction: row;
`;

const StyledErrorSection = styled.div`
  color: ${({ theme }) => theme.font.color.danger};
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsAdminImpersonateUsers = () => {
  const [userId, setUserId] = useState('');
  const { handleImpersonate, isLoading, error, canImpersonate } =
    useImpersonate();

  if (!canImpersonate) {
    return (
      <Section>
        <H2Title
          title="Impersonate"
          description="You don't have permission to impersonate other users. Please contact your administrator if you need this access."
        />
      </Section>
    );
  }

  return (
    <Section>
      <H2Title title="Impersonate" description="Impersonate a user." />
      <StyledContainer>
        <StyledLinkContainer>
          <TextInput
            value={userId}
            onChange={setUserId}
            placeholder="Enter user ID or email address"
            fullWidth
            disabled={isLoading}
            dataTestId="impersonate-input"
            onInputEnter={() => handleImpersonate(userId)}
          />
        </StyledLinkContainer>
        <Button
          Icon={IconUser}
          variant="primary"
          accent="blue"
          title={'Impersonate'}
          onClick={() => handleImpersonate(userId)}
          disabled={!userId.trim() || isLoading}
          dataTestId="impersonate-button"
        />
      </StyledContainer>
      {error && <StyledErrorSection>{error}</StyledErrorSection>}
    </Section>
  );
};
