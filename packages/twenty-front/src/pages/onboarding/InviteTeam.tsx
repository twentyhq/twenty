import { useEffect } from 'react';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import styled from '@emotion/styled';
import { zodResolver } from '@hookform/resolvers/zod';
import { string, z } from 'zod';

import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { SeparatorLineText } from '@/ui/display/text/components/SeparatorLineText';
import { TextInputV2 } from '@/ui/input/components/TextInputV2';

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
  padding: ${({ theme }) => theme.spacing(8)} ${({ theme }) => theme.spacing(4)}
    0;
  gap: ${({ theme }) => theme.spacing(4)};
  max-height: 100%;
  overflow: scroll;
  width: 100%;
`;

const validationSchema = z
  .object({ emails: z.array(z.object({ email: string().email() })) })
  .required();

type FormInput = z.infer<typeof validationSchema>;

export const InviteTeam = () => {
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
        <SeparatorLineText>Or</SeparatorLineText>
      </StyledAnimatedContainer>
    </>
  );
};
