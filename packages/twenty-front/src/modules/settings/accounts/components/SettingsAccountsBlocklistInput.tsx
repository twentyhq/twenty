import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { TextInput } from '@/ui/input/components/TextInput';
import { useLingui } from '@lingui/react/macro';
import { Button } from 'twenty-ui';
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
  updateBlockedEmailList: (email: string) => void;
  blockedEmailOrDomainList: string[];
};

type FormInput = {
  emailOrDomain: string;
};

export const SettingsAccountsBlocklistInput = ({
  updateBlockedEmailList,
  blockedEmailOrDomainList,
}: SettingsAccountsBlocklistInputProps) => {
  const { t } = useLingui();

  const validationSchema = (blockedEmailOrDomainList: string[]) =>
    z
      .object({
        emailOrDomain: z
          .string()
          .trim()
          .email(t`Invalid email or domain`)
          .or(
            z
              .string()
              .refine(
                (value) => value.startsWith('@') && isDomain(value.slice(1)),
                t`Invalid email or domain`,
              ),
          )
          .refine(
            (value) => !blockedEmailOrDomainList.includes(value),
            t`Email or domain is already in blocklist`,
          ),
      })
      .required();

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(blockedEmailOrDomainList)),
    defaultValues: {
      emailOrDomain: '',
    },
  });

  const submit = handleSubmit((data) => {
    updateBlockedEmailList(data.emailOrDomain);
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
        <Button title={t`Add to blocklist`} type="submit" />
      </StyledContainer>
    </form>
  );
};
