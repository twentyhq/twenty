import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRecoilValue } from 'recoil';
import { IconCopy } from 'twenty-ui';
import { string, z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { SeparatorLineText } from '@/ui/display/text/components/SeparatorLineText';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';
import { ActionLink } from '@/ui/navigation/link/components/ActionLink';
import { isDefined } from '~/utils/isDefined';

const StyledAnimatedInput = styled.div`
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
  animation: ${({ theme }) =>
    `fadeIn ${theme.animation.duration['normal']}s ease-in-out`};
`;

const StyledAnimatedContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(8)} 0
    ${({ theme }) => theme.spacing(4)} 0;
  gap: ${({ theme }) => theme.spacing(4)};
  overflow-y: scroll;
  overflow-x: hidden;
  width: 100%;
`;

const StyledActionLinkContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const validationSchema = z
  .object({ emails: z.array(z.object({ email: string().email() })) })
  .required();

type FormInput = z.infer<typeof validationSchema>;

export const InviteTeam = () => {
  const theme = useTheme();
  const { enqueueSnackBar } = useSnackBar();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const { control, watch } = useForm<FormInput>({
    mode: 'onChange',
    defaultValues: {
      emails: [{ email: '' }, { email: '' }, { email: '' }],
    },
    resolver: zodResolver(validationSchema),
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'emails',
  });

  const emailValues = watch('emails').map((email) => email.email);

  const getPlaceholder = (emailIndex: number) => {
    if (emailIndex === 0) {
      return 'tim@apple.dev';
    }
    if (emailIndex === 1) {
      return 'craig@apple.dev';
    }
    if (emailIndex === 2) {
      return 'mike@apple.dev';
    }
    return 'phil@apple.dev';
  };

  const copyInviteLink = () => {
    if (isDefined(currentWorkspace?.inviteHash)) {
      const inviteLink = `${window.location.origin}/invite/${currentWorkspace?.inviteHash}`;
      navigator.clipboard.writeText(inviteLink);
      enqueueSnackBar('Link copied to clipboard', {
        variant: SnackBarVariant.Success,
        icon: <IconCopy size={theme.icon.size.md} />,
        duration: 2000,
      });
    }
  };

  useEffect(() => {
    const lastEmailIndex = emailValues.length - 1;
    if (emailValues[lastEmailIndex] !== '') {
      append({ email: '' });
    }
    if (emailValues.length > 3 && emailValues[emailValues.length - 2] === '') {
      remove(emailValues.length - 1);
    }
  }, [emailValues, append, remove]);

  return (
    <>
      <Title noMarginTop>Invite your team</Title>
      <SubTitle>
        Get the most out of your workspace by inviting your team.
      </SubTitle>
      <StyledAnimatedContainer>
        {fields.map((field, index) => (
          <Controller
            name={`emails.${index}.email`}
            control={control}
            render={({ field: { onChange, onBlur, value } }) => (
              <StyledAnimatedInput>
                <TextInputV2
                  type="email"
                  value={value}
                  placeholder={getPlaceholder(index)}
                  onBlur={onBlur}
                  onChange={onChange}
                  fullWidth
                />
              </StyledAnimatedInput>
            )}
          />
        ))}
        {isDefined(currentWorkspace?.inviteHash) && (
          <>
            <SeparatorLineText>Or</SeparatorLineText>
            <StyledActionLinkContainer>
              <ActionLink enhanced onClick={copyInviteLink}>
                <IconCopy size={14} />
                Copy invitation link
              </ActionLink>
            </StyledActionLinkContainer>
          </>
        )}
      </StyledAnimatedContainer>
    </>
  );
};
