/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-restricted-imports */
import { ChangeEvent } from 'react';
import styled from '@emotion/styled';
import { IconArrowLeft, IconCheckbox } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';
import { Button } from '@/ui/input/button/components/Button';
import { PreviewCampaignDetailsTab } from '~/pages/campaigns/PreviewCampaignDetailsTab';
import { PreviewMessagingChannel } from '~/pages/campaigns/PreviewMessagingChannel';
import { PreviewSpecialty } from '~/pages/campaigns/PreviewSpecialty';
import { PreviewCampaignDate } from '~/pages/campaigns/StyledPreviewCampaignDate';
// import { PreviewSpecialty } from '~/pages/campaigns/PreviewSpecialty';
// import { PreviewCampaignDate } from '~/pages/campaigns/PriviewCampaignDate';
const StyledCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.background.primary};
  height: 90%;
  width: 70%;
  margin: auto;
  align-items: center;
  overflow: scroll;
`;

const StyledInputCard = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 65%;
  justify-content: space-between;
  width: 70%;
  align-items: center;
`;

const StyledTitleCard = styled.div`
  /* align-items: center; */
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: 10%;
  width: 100%;
  justify-content: flex-start;
`;

const StyledAreaLabel = styled.span`
  align-content: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
  width: 100%;
`;
const StyledSpecialtySection = styled.span`
  align-content: center;
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: space-between;
  flex: wrap;
`;
const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: ${({ theme }) => theme.spacing(10)};
  margin-bottom: ${({ theme }) => theme.spacing(10)};
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
`;
export const PreviewPage = () => {
  // const { setCurrentStep, currentStep } = useCampaign();

  const onSelectCheckBoxChange = (
    _event: ChangeEvent<HTMLInputElement>,
    arg1: string,
  ): void => {
    throw new Error('Function not implemented.');
  };
  type SingleTabProps = {
    title: string;
    Icon?: IconComponent;
    id: string;
    hide?: boolean;
    disabled?: boolean;
  };

  const tabs = [
    {
      id: 'Campaign Details',
      title: 'Campaign Details',
      Icon: IconCheckbox,
      hide: false,
    },
    {
      id: 'Specialty & Subspecialty',
      title: 'Specialty & Subspecialty',
      Icon: IconCheckbox,
      hide: false,
    },
    {
      id: 'Lead Extraction',
      title: 'Lead Extraction',
      Icon: IconCheckbox,
      hide: false,
    },
    {
      id: 'Campaign Date',
      title: 'Campaign Date',
      Icon: IconCheckbox,
      hide: false,
      disabled: false,
    },
    {
      id: 'Messaging Channel',
      title: 'Messaging Channel',
      Icon: IconCheckbox,
      hide: false,
      disabled: false,
    },
  ];

  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <StyledTitle></StyledTitle>
        </StyledTitleCard>
        <StyledInputCard>
          <PreviewCampaignDetailsTab />
          <PreviewSpecialty />
          <PreviewCampaignDate />
          <PreviewMessagingChannel />
          <StyledButton>
            <Button
              Icon={IconArrowLeft}
              title="Previous"
              variant="secondary"
              //   accent="blue"
              onClick={() => setCurrentStep(currentStep - 1)}
            />
            <Button
              Icon={IconArrowRight}
              title="Submit"
              variant="primary"
              accent="blue"
            />
          </StyledButton>
        </StyledInputCard>
      </StyledCard>
    </>
  );
};