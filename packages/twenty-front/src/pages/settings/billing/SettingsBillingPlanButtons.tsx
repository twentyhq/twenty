import {
  IconApi,
  IconApps,
  IconAt,
  IconCalendarEvent,
  IconColorSwatch,
  IconComponent,
  IconCurrencyDollar,
  IconDoorEnter,
  IconFlask,
  IconFunction,
  IconHierarchy2,
  IconKey,
  IconLock,
  IconMail,
  IconPhone,
  IconRocket,
  IconServer,
  IconSettings,
  IconUserCircle,
  IconUsers,
  IconWebhook,
} from 'twenty-ui/display';

import { IconCancel, IconCreditCard, IconIdBadge2, IconMessageCircleCog, IconWallet } from '@tabler/icons-react';

import styled from '@emotion/styled';
import { ChangeSubscriptionPlan } from '~/pages/settings/billing/ChangeSubscriptionPlan';
import { useState } from 'react';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { useModal } from '@/ui/layout/modal/hooks/useModal';

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
    const CHANGE_PLAN_MODAL_ID = 'change-subscription-plan-modal';

    const { openModal } = useModal();

    const handleClick = () => {
        openModal(CHANGE_PLAN_MODAL_ID);
    };

    return (
        <div>
                <StyledSettingsBillingButton onClick={() => handleClick()}>
                    <IconCreditCard size={15} />
                    <span>Change plan</span>
                </StyledSettingsBillingButton>

                <Modal modalId={CHANGE_PLAN_MODAL_ID} isClosable>
                    <ChangeSubscriptionPlan />
                </Modal>
        </div>
    );
}

const CancelSubscriptionButton = () => {
    return (
        <div>
                <StyledSettingsBillingButton>
                    <IconCancel size={15} />
                    <span>Cancel plan</span>
                </StyledSettingsBillingButton>
        </div>
    );
}

export {
    BillingDetailsButton,
    ChangeSubscriptionButton,
    CancelSubscriptionButton,
}