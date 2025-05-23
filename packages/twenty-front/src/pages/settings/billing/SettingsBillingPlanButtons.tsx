import { IconCancel, IconCreditCard } from '@tabler/icons-react';

import styled from '@emotion/styled';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { ConfirmChangeSubscriptionPlan } from '~/pages/settings/billing/ConfirmChangeSubscriptionPlan';
import { CancelChangeSubscriptionPlan } from '~/pages/settings/billing/CancelSubscriptionPlan';

const StyledSettingsBillingButton = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #fff;
    border: 1px solid ${({ theme }) => theme.color.gray30};
    cursor: pointer;
`;

const StyledCancelSubscriptionButton = styled.button`
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 5px 10px;
    border-radius: 5px;
    background-color: #fff;
    border: 1px solid ${({ theme }) => theme.color.red20};
    cursor: pointer;

    span {
        color: ${({ theme }) => theme.color.red40};
    }

    .iconCancel {
        color: ${({ theme }) => theme.color.red40};
    }
`;

const BillingDetailsButton = () => {
    return (
        <div>
                <StyledSettingsBillingButton>
                    <IconCreditCard size={15} />
                    <span>View billing details</span>
                </StyledSettingsBillingButton>
        </div>
    );
}

const ChangeSubscriptionButton = () => {
    const CONFIRM_CHANGE_PLAN_MODAL_ID = 'confirm-change-subscription-plan-modal';

    const { openModal } = useModal();

    const handleClick = () => {
        openModal(CONFIRM_CHANGE_PLAN_MODAL_ID);
    };

    return (
        <div>
                <StyledSettingsBillingButton onClick={() => handleClick()}>
                    <IconCreditCard size={15} />
                    <span>Change plan</span>
                </StyledSettingsBillingButton>

                <Modal modalId={CONFIRM_CHANGE_PLAN_MODAL_ID} isClosable>
                    <ConfirmChangeSubscriptionPlan />
                </Modal>
        </div>
    );
}

const CancelSubscriptionButton = () => {
    const  CANCEL_PLAN_MODAL_ID = 'cancel-subscription-plan-modal';

    const { openModal } = useModal();

    const handleClick = () => {
        openModal(CANCEL_PLAN_MODAL_ID);
    };

    return (
        <div>
                <StyledCancelSubscriptionButton onClick={() => handleClick()}>
                    <IconCancel size={15} className='iconCancel' />
                    <span>Cancel plan</span>
                </StyledCancelSubscriptionButton>

                <Modal modalId={CANCEL_PLAN_MODAL_ID} isClosable>
                    <CancelChangeSubscriptionPlan />
                </Modal>
        </div>
    );
}

export {
    BillingDetailsButton,
    ChangeSubscriptionButton,
    CancelSubscriptionButton,
}