import { useState } from 'react';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import useI18n from '@/ui/i18n/useI18n';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';

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
  const { translate } = useI18n('translations');
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
        <TextInput
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
        title={translate('addToBlockList')}
        onClick={() => {
          updateBlockedEmailList(formValues.email);
          setFormValues({ email: '' });
        }}
      />
    </StyledContainer>
  );
};
