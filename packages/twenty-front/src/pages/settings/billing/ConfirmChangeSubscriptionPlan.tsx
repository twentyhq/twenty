import React from 'react'
import { Title } from '@/auth/components/Title';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { Trans, useLingui } from '@lingui/react/macro';
import styled from '@emotion/styled';
import { SubTitle } from '@/auth/components/SubTitle';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ChangeSubscriptionPlan } from '~/pages/settings/billing/ChangeSubscriptionPlan';

const StyledMainContainer = styled.div`
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    margin-top: 20px;
`;

const StyledChangePlanButtonCancell = styled.button`
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

const StyledChangePlanButton = styled.button`
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

export const ConfirmChangeSubscriptionPlan = () => {   
    const CHANGE_PLAN_MODAL_ID = 'change-subscription-plan-modal';
    
    const { openModal } = useModal();
    const { closeModal } = useModal();

    const handleCloseModal = async () => {
        closeModal('confirm-change-subscription-plan-modal');
    };

    const handleOpenModal = async () => {
        openModal('change-subscription-plan-modal');
    };

  return (
        <Modal.Content isVerticalCentered>
            <Title>
                <Trans>Change subscription plan</Trans>
            </Title>

            <SubTitle>
                Are you sure you want to change your subscription plan? Your invoice amount will change at the end of the current period.
            </SubTitle>

            <StyledMainContainer>
                <StyledChangePlanButtonCancell onClick={() => handleCloseModal()} >
                    <span>Cancel</span>
                </StyledChangePlanButtonCancell>

                <StyledChangePlanButton>
                    <StyledChangePlanButtonText onClick={() => handleOpenModal()} >
                        Change
                    </StyledChangePlanButtonText>
                </StyledChangePlanButton>
            </StyledMainContainer>

            <Modal modalId={CHANGE_PLAN_MODAL_ID} isClosable>
                <ChangeSubscriptionPlan />
            </Modal>
        </Modal.Content>
  )
}
