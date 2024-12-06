import { TextInput } from '@/ui/input/components/TextInput';
import { Controller, useFormContext } from 'react-hook-form';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { StyledText } from 'twenty-ui';
import { useTheme } from '@emotion/react';
import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpMode } from '@/auth/types/signInUpMode';

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const SignInUpPasswordField = ({
  showErrors,
  signInUpMode,
}: {
  showErrors: boolean;
  signInUpMode: SignInUpMode;
}) => {
  const theme = useTheme();
  const form = useFormContext<Form>();

  return (
    <StyledFullWidthMotionDiv
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      transition={{
        type: 'spring',
        stiffness: 800,
        damping: 35,
      }}
    >
      <Controller
        name="password"
        control={form.control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <StyledInputContainer>
            <TextInput
              autoFocus
              value={value}
              type="password"
              placeholder="Password"
              onBlur={onBlur}
              onChange={onChange}
              error={showErrors ? error?.message : undefined}
              fullWidth
            />
            {signInUpMode === SignInUpMode.SignUp && (
              <StyledText
                text={'At least 8 characters long.'}
                color={theme.font.color.secondary}
              />
            )}
          </StyledInputContainer>
        )}
      />
    </StyledFullWidthMotionDiv>
  );
};
