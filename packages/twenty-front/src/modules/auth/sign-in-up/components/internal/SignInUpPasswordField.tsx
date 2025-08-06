import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpMode } from '@/auth/types/signInUpMode';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Controller, useFormContext } from 'react-hook-form';
import { StyledText } from 'twenty-ui/display';

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
  const { t } = useLingui();
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
            <SettingsTextInput
              instanceId="sign-in-up-password"
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
                text={t`At least 8 characters long.`}
                color={theme.font.color.secondary}
              />
            )}
          </StyledInputContainer>
        )}
      />
    </StyledFullWidthMotionDiv>
  );
};
