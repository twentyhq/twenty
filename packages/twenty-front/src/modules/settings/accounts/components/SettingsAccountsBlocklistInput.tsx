import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { isDomain } from '~/utils/is-domain';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

type SettingsAccountsBlocklistInputProps = {
  updateBlockedEmailList: (email: string,context: "To" | "Cc" | "Bcc" | "Any") => void;
  blockedEmailOrDomainList: string[];
};

const validationSchema = (blockedEmailOrDomainList: string[]) =>
  z
    .object({
      emailOrDomain: z
        .string()
        .trim()
        .email('Invalid email or domain')
        .or(
          z
            .string()
            .refine(
              (value) => value.startsWith('@') && isDomain(value.slice(1)),
              'Invalid email or domain',
            ),
        )
        .refine(
          (value) => !blockedEmailOrDomainList.includes(value),
          'Email or domain is already in blocklist',
        ),
      context: z.enum(['To', 'Cc', 'Bcc', 'Any']),  
    })
    .required();

type FormInput = {
  emailOrDomain: string;
  context: 'To' | 'Cc' | 'Bcc' | 'Any';
};

export const SettingsAccountsBlocklistInput = ({
  updateBlockedEmailList,
  blockedEmailOrDomainList,
}: SettingsAccountsBlocklistInputProps) => {
  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(blockedEmailOrDomainList)),
    defaultValues: {
      emailOrDomain: '',
      context: 'Any',
    },
  });

  const submit = handleSubmit((data) => {
    updateBlockedEmailList(data.emailOrDomain,"Any");
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === Key.Enter) {
      submit();
    }
  };

  const { isSubmitSuccessful } = formState;

  useEffect(() => {
    if (isSubmitSuccessful) {
      reset();
    }
  }, [isSubmitSuccessful, reset]);

  return (
    <form onSubmit={submit}>
      <StyledContainer>
        <StyledLinkContainer>
          <Controller
            name="emailOrDomain"
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
        <Controller
          name="context"
          control={control}
          render={({ field }) => (
            <select {...field}>
              <option value="Any">Any</option>
              <option value="To">To</option>
              <option value="Cc">Cc</option>
              <option value="Bcc">Bcc</option>
            </select>
          )}
        />
        <Button title="Add to blocklist" type="submit" />
      </StyledContainer>
    </form>
  );
};
