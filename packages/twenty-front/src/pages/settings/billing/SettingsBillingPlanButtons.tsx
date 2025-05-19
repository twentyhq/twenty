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
    return (
        <div>
                <StyledSettingsBillingButton>
                    <IconCreditCard size={15} />
                    <span>Change plan</span>
                </StyledSettingsBillingButton>
        </div>
    );
}

const CancelSubscriptionButton = () => {
    return (
        <div>
                <StyledSettingsBillingButton>
                    <IconCancel size={15} />
                    <span style={{color: #FF0000,}}>Cancel plan</span>
                </StyledSettingsBillingButton>
        </div>
    );
}

export {
    BillingDetailsButton,
    ChangeSubscriptionButton,
    CancelSubscriptionButton,
}