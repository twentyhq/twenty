import { useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';
import { Button, FieldTextInput } from 'twenty-ui';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAccountsEmailsBlocklistInputProps = {
  updateBlockedEmailList: (email: string) => void;
};

export const SettingsAccountsEmailsBlocklistInput = ({
  updateBlockedEmailList,
}: SettingsAccountsEmailsBlocklistInputProps) => {
  const [formValues, setFormValues] = useState<{
    email: string;
  }>({
    email: '',
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Key.Enter) {
      updateBlockedEmailList(formValues.email);
      setFormValues({ email: '' });
    }
  };

  return (
    <StyledContainer>
      <StyledLinkContainer>
        <FieldTextInput
          placeholder="eddy@gmail.com, @apple.com"
          value={formValues.email}
          onChange={(value) => {
            setFormValues((prevState) => ({
              ...prevState,
              email: value,
            }));
          }}
          fullWidth
          onKeyDown={handleKeyDown}
        />
      </StyledLinkContainer>
      <Button
        title="Add to blocklist"
        onClick={() => {
          updateBlockedEmailList(formValues.email);
          setFormValues({ email: '' });
        }}
      />
    </StyledContainer>
  );
};
