import { Form } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { motion } from 'framer-motion';
import { Controller, useFormContext } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';

const StyledFullWidthMotionDiv = styled(motion.div)`
  width: 100%;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing(3)};
`;

export const SignInUpEmailField = ({
  showErrors,
  onInputChange,
}: {
  showErrors: boolean;
  onInputChange?: (value: string) => void;
}) => {
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
        name="email"
        control={form.control}
        render={({
          field: { onChange, onBlur, value },
          fieldState: { error },
        }) => (
          <StyledInputContainer>
            <SettingsTextInput
              instanceId="sign-in-up-email"
              autoFocus
              value={value}
              placeholder="Email"
              onBlur={onBlur}
              onChange={(email: string) => {
                if (isDefined(onInputChange)) onInputChange(email);
                onChange(email);
              }}
              error={showErrors ? error?.message : undefined}
              fullWidth
            />
          </StyledInputContainer>
        )}
      />
    </StyledFullWidthMotionDiv>
  );
};
