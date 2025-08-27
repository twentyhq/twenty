import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { isValidHostname } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';

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
            z.string().refine(
              (value) =>
                value.startsWith('@') &&
                isValidHostname(value.slice(1), {
                  allowIp: false,
                  allowLocalhost: false,
                }),
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
              <SettingsTextInput
                instanceId="settings-accounts-blocklist-input"
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
