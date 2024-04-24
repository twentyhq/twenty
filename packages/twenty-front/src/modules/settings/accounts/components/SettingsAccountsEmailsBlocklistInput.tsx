import { Controller, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { Key } from 'ts-key-enum';

import { validateMetadataLabel } from '@/object-metadata/utils/validateMetadataLabel';
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

type FormInput = {
  email: string;
};

type SettingsAccountsEmailsBlocklistInputProps = {
  updateBlockedEmailList: (email: string) => void;
};

export const SettingsAccountsEmailsBlocklistInput = ({
  updateBlockedEmailList,
}: SettingsAccountsEmailsBlocklistInputProps) => {
  const { reset, handleSubmit, control } = useForm<FormInput>({
    mode: 'onChange',
  });

  const submit = handleSubmit((data) => {
    updateBlockedEmailList(data.email);
    reset({ email: '' });
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Key.Enter) {
      submit();
    }
  };

  return (
    <form onSubmit={submit}>
      <StyledContainer>
        <StyledLinkContainer>
          <Controller
            name="email"
            control={control}
            render={({ field: { onChange, value } }) => (
              <TextInput
                placeholder="eddy@gmail.com, @apple.com"
                value={value}
                onChange={(value) => {
                  if (!value || validateMetadataLabel(value)) {
                    onChange?.(value);
                  }
                }}
                fullWidth
                onKeyDown={handleKeyDown}
              />
            )}
          />
        </StyledLinkContainer>
        <Button title="Add to blocklist" type="submit" />
      </StyledContainer>
    </form>
  );
};
