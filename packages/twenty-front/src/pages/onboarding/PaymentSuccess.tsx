import { SubTitle } from '@/auth/components/SubTitle';
import { Title } from '@/auth/components/Title';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { useSetNextOnboardingStatus } from '@/onboarding/hooks/useSetNextOnboardingStatus';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilState } from 'recoil';
import { IconCheck } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { RGBA } from 'twenty-ui/theme';
import { AnimatedEaseIn } from 'twenty-ui/utilities';
import { useSaveBillingPlan } from '~/pages/onboarding/hooks/useSaveBillingPlan';
import { plans, selectedPlanState } from '~/pages/onboarding/Plans';

const StyledCheckContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: center;
  border: 2px solid ${(props) => props.color};
  border-radius: ${({ theme }) => theme.border.radius.rounded};
  box-shadow: ${(props) =>
    props.color && `-4px 4px 0 -2px ${RGBA(props.color, 1)}`};
  height: 36px;
  width: 36px;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
`;

const StyledButtonContainer = styled.div`
  margin-top: ${({ theme }) => theme.spacing(8)};
`;

export const PaymentSuccess = () => {
  const { t } = useLingui();
  const setNextOnboardingStatus = useSetNextOnboardingStatus();
  const theme = useTheme();
  const color =
    theme.name === 'light' ? theme.grayScale.gray90 : theme.grayScale.gray10;

  const { enqueueSnackBar } = useSnackBar();
  const [currentWorkspaceMember, setCurrentWorkspaceMember] = useRecoilState(
    currentWorkspaceMemberState,
  );
  const { savePlan } = useSaveBillingPlan();

  // eslint-disable-next-line @nx/workspace-matching-state-variable
  const [selectedPlanId] = useRecoilState(selectedPlanState);

  const onSubmit = async () => {
    try {
      if (!currentWorkspaceMember?.id) {
        throw new Error('User is not logged in');
      }

      const selectedPlan = plans.find((p) => p.id === selectedPlanId);

      if (!selectedPlan) {
        enqueueSnackBar('Plano inválido', { variant: SnackBarVariant.Error });
        return;
      }

      await savePlan(selectedPlan.id.toString());

      setNextOnboardingStatus();
    } catch (error: any) {
      enqueueSnackBar(error?.message, {
        variant: SnackBarVariant.Error,
      });
    }
  };

  return (
    <Modal.Content isVerticalCentered isHorizontalCentered>
      <AnimatedEaseIn>
        <StyledCheckContainer color={color}>
          <IconCheck color={color} size={24} stroke={3} />
        </StyledCheckContainer>
      </AnimatedEaseIn>
      <Title>All set!</Title>
      <SubTitle>Your account has been activated.</SubTitle>
      <StyledButtonContainer>
        <MainButton
          title={t`Continue`}
          variant="primary"
          onClick={() => onSubmit()}
          fullWidth
        />
      </StyledButtonContainer>
    </Modal.Content>
  );
};
