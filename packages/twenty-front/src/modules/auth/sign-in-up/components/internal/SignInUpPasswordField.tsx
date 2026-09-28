import { Text } from 'twenty-ui/primitives/typography';
import { type Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpMode } from '@/auth/types/SignInUpMode';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { motion } from 'framer-motion';
import { Controller, useFormContext } from 'react-hook-form';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[3]};
`;

export const SignInUpPasswordField = ({
  showErrors,
  signInUpMode,
}: {
  showErrors: boolean;
  signInUpMode: SignInUpMode;
}) => {
  const { t } = useLingui();
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
              placeholder={t`Password`}
              onBlur={onBlur}
              onChange={onChange}
              error={showErrors ? error?.message : undefined}
              fullWidth
            />
            {signInUpMode === SignInUpMode.SignUp && (
              <StyledPasswordHint>{t`At least 8 characters long.`}</StyledPasswordHint>
            )}
          </StyledInputContainer>
        )}
      />
    </StyledFullWidthMotionDiv>
  );
};

const StyledPasswordHint = styled(Text)`
  color: ${themeCssVariables.font.color.secondary};
  cursor: initial;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.regular};
  overflow: hidden;
  padding: ${themeCssVariables.spacing[2]} 0;
  white-space: nowrap;
`;
