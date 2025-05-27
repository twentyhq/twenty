import React from 'react'
import { Title } from '@/auth/components/Title';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { Trans, useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { SubTitle } from '@/auth/components/SubTitle';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { SnackBarVariant } from '@/ui/feedback/snack-bar-manager/components/SnackBar';


const StyledMainContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
`;

const StyledCancelPlanButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 20rem;
    padding-top: 6px;
    padding-bottom: 6px;
    border-radius: 5px;
    background-color: #fff;
    border: 1px solid ${({ theme }) => theme.color.gray30};
    cursor: pointer;
`;

const StyledKeepPlanButton = styled.button`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 5px;
    width: 20rem;
    padding-top: 6px;
    padding-bottom: 6px;
    border-radius: 5px;
    background-color: #fff;
    border: 1px solid ${({ theme }) => theme.color.blue30};
    cursor: pointer;
`;

const StyledChangePlanButtonText = styled.span`
    color: ${({ theme }) => theme.color.blue50};
`;

export const CancelChangeSubscriptionPlan = () => {       
    const { enqueueSnackBar } = useSnackBar();
    
    const { closeModal } = useModal();

    const handleCloseModal = async () => {
        closeModal('cancel-subscription-plan-modal');
    };

    const handleCancel = async () => {
        enqueueSnackBar('Subscription has been canceled, you will lose your access at the end of the current billing period!', {
            variant: SnackBarVariant.Success,
        });

        closeModal('cancel-subscription-plan-modal');
    }

  return (
        <Modal.Content isVerticalCentered>
            <Title>
                <Trans>Are you sure you want to cancel?</Trans>
            </Title>

            <SubTitle>
                By cancelling Your subscription, your workspace will remain active until the end of the current billing period.
            </SubTitle>

            <StyledMainContainer>
                <StyledCancelPlanButton onClick={() => handleCancel()} >
                    <span>Confirm cancellation</span>
                </StyledCancelPlanButton>

                <StyledKeepPlanButton>
                    <StyledChangePlanButtonText onClick={() => handleCloseModal()} >
                        Keep subscription
                    </StyledChangePlanButtonText>
                </StyledKeepPlanButton>
            </StyledMainContainer>
        </Modal.Content>
  )
}
