import { Controller, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

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

const validationSchema = z
  .object({
    email: z.string().trim().email('Email must be a valid email'),
  })
  .required();

type FormInput = z.infer<typeof validationSchema>;

export const SettingsAccountsEmailsBlocklistInput = ({
  updateBlockedEmailList,
}: SettingsAccountsEmailsBlocklistInputProps) => {
  const { reset, handleSubmit, control } = useForm<FormInput>({
    mode: 'onSubmit',
    reValidateMode: 'onSubmit',
    resolver: zodResolver(validationSchema),
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
            render={({ field: { value, onChange }, fieldState: { error } }) => (
              <TextInput
                placeholder="eddy@gmail.com, @apple.com"
                value={value}
                onChange={onChange}
                error={error?.message}
                onKeyDown={handleKeyDown}
                fullWidth
              />
            )}
          />
        </StyledLinkContainer>
        <Button title="Add to blocklist" type="submit" />
      </StyledContainer>
    </form>
  );
};
