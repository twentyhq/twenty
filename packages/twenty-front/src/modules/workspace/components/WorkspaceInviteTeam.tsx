import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { Key } from 'ts-key-enum';
import { IconCopy, IconMail, IconSend } from 'twenty-ui';
import { z } from 'zod';

import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { TextInput } from '@/ui/input/components/TextInput';
import { extractEmailsList } from '@/workspace/utils/extractEmailList';
import { useSendInviteLinkMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: row;
`;

const StyledLinkContainer = styled.div`
  flex: 1;
  margin-right: ${({ theme }) => theme.spacing(2)};
`;

const emailValidationSchema = (email: string) =>
  z.string().email(`Invalid email '${email}'`);

const validationSchema = () =>
  z
    .object({
      emails: z.string().superRefine((value, ctx) => {
        if (!value.length) {
          return;
        }
        const emails = extractEmailsList(value);
        if (emails.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            message: 'Emails should not be empty',
            validation: 'email',
          });
        }
        const invalidEmails: string[] = [];
        for (const email of emails) {
          const result = emailValidationSchema(email).safeParse(email);
          if (!result.success) {
            invalidEmails.push(email);
          }
        }
        if (invalidEmails.length > 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.invalid_string,
            message:
              invalidEmails.length > 1
                ? 'Emails "' + invalidEmails.join('", "') + '" are invalid'
                : 'Email "' + invalidEmails.join('", "') + '" is invalid',
            validation: 'email',
          });
        }
      }),
    })
    .required();

type FormInput = {
  emails: string;
};

export const WorkspaceInviteTeam = () => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const [sendInviteLink] = useSendInviteLinkMutation();

  const { reset, handleSubmit, control, formState } = useForm<FormInput>({
    mode: 'onSubmit',
    resolver: zodResolver(validationSchema()),
    defaultValues: {
      emails: '',
    },
  });

  const submit = handleSubmit(async (data) => {
    const emailsList = extractEmailsList(data.emails);
    const result = await sendInviteLink({ variables: { emails: emailsList } });
    if (isDefined(result.errors)) {
      throw result.errors;
    }
    enqueueSnackBar('Invite link sent to email addresses', {
      variant: SnackBarVariant.Success,
      icon: <IconCopy size={theme.icon.size.md} />,
      duration: 2000,
    });
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
            name="emails"
            control={control}
            render={({ field: { value, onChange }, fieldState: { error } }) => {
              return (
                <TextInput
                  placeholder="tim@apple.com, jony.ive@apple.dev"
                  LeftIcon={IconMail}
                  value={value}
                  onChange={onChange}
                  error={error?.message}
                  onKeyDown={handleKeyDown}
                  fullWidth
                />
              );
            }}
          />
        </StyledLinkContainer>
        <Button
          Icon={IconSend}
          variant="primary"
          accent="blue"
          title="Invite"
          type="submit"
        />
      </StyledContainer>
    </form>
  );
};
