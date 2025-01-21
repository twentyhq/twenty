import styled from '@emotion/styled';
import { useState } from 'react';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

interface StripeLoginButtonProps {
  onClick: () => void;
}

const Button = styled.button`
  background-color: #080808d5;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing(2)};
  color: ${({ theme }) => theme.font.color.primary};
  padding: 8px 16px;
  border-radius: ${({ theme }) => theme.border.radius.md};
  width: 100%;
  border: none;
  cursor: pointer;
`;

const CheckBox = styled.input`
  padding: 8px;
  margin-bottom: 30px;
  margin-right: 10px;
`;

const StripeLoginButton = ({ onClick }: StripeLoginButtonProps) => {
  const [acceptTerms, setAcceptTerms] = useState<boolean>(false);

  const { enqueueSnackBar } = useSnackBar();

  return (
    <>
      <CheckBox type="checkbox" onClick={() => setAcceptTerms(!acceptTerms)} />
      <span>I agree to the Terms and Conditions</span>

      <Button
        onClick={() => {
          if (!acceptTerms) {
            enqueueSnackBar('Accept the Terms', {
              variant: SnackBarVariant.Error,
            });
            throw new Error('Accept the Terms');
          }
          onClick();
        }}
      >
        {/* <img src="/images/integrations/stripe-logo.png" width={'24px'} alt="" /> */}
        <span style={{ color: 'white', fontWeight: '600' }}>
          Connect with Stripe
        </span>
      </Button>
    </>
  );
};

export default StripeLoginButton;
