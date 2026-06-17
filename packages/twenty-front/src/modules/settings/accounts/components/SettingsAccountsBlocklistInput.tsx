import { zodResolver } from '@hookform/resolvers/zod';
import { styled } from '@linaria/react';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { Key } from 'ts-key-enum';
import { z } from 'zod';

import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyArray, isValidHostname } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${themeCssVariables.spacing[2]};
`;

const parseHandles = (value: string): string[] =>
  value
    .split(',')
    .map((handle) => handle.trim())
    .filter((handle) => isNonEmptyString(handle));

type SettingsAccountsBlocklistInputProps = {
  updateBlockedEmailList: (emails: string[]) => void;
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
    z.object({
      emailOrDomain: z
        .string()
        .trim()
        .refine(
          (value) => {
            const handles = parseHandles(value);

            return (
              isNonEmptyArray(handles) &&
              handles.every((handle) => {
                const isEmail = z.email().safeParse(handle).success;

                const isDomain =
                  handle.startsWith('@') &&
                  isValidHostname(handle.slice(1), {
                    allowIp: false,
                    allowLocalhost: false,
                  });

                return isEmail || isDomain;
              })
            );
          },
          t`Invalid email or domain`,
        )
        .refine(
          (value) => {
            const handles = parseHandles(value);

            return (
              isNonEmptyArray(handles) &&
              handles.every(
                (handle) => !blockedEmailOrDomainList.includes(handle),
              )
            );
          },
          t`Email or domain is already in blocklist`,
        ),
    });

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema(blockedEmailOrDomainList)),
    defaultValues: {
      emailOrDomain: '',
    },
  });

  const submit = handleSubmit((data) => {
    const handles = parseHandles(data.emailOrDomain);
    if (isNonEmptyArray(handles)) {
      updateBlockedEmailList(handles);
    }
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === Key.Enter) {
      e.preventDefault();
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
                placeholder={t`eddy@gmail.com, @apple.com`}
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
