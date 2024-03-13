/* eslint-disable no-restricted-imports */
import React from 'react';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { Button } from 'tsup.ui.index';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import DateTimePicker from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';

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

const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;
const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

export const CampaignDate = () => {
  const { setCurrentStep, currentStep, campaignData, setCampaignData } =
    useCampaign();

  return (
    <>
      <StyledCard>
        <StyledTitleCard></StyledTitleCard>
        <StyledInputCard>
          <Section>
            <H2Title
              title="Campaign Date"
              description="Choose when you to run your campaign"
            />
            <StyledLabel>Start Date</StyledLabel>
            <DateTimePicker
              value={campaignData?.startDate}
              selected={campaignData?.startDate}
              onChange={(date) => {
                setCampaignData({
                  ...campaignData,
                  startDate: date,
                });
              }}
              minDate={new Date()}
              showTimeInput
            />
          </Section>
          <Section>
            <StyledLabel>End Date</StyledLabel>
            <DateTimePicker
              value={campaignData?.endDate}
              selected={campaignData?.endDate}
              onChange={(date) => {
                setCampaignData({
                  ...campaignData,
                  endDate: date,
                });
              }}
              minDate={campaignData.startDate}
              showTimeInput
            />
          </Section>

          <StyledButton>
            <Button
              Icon={IconArrowLeft}
              title="Previous"
              variant="secondary"
              onClick={() => setCurrentStep(currentStep - 1)}
            />
            <Button
              Icon={IconArrowRight}
              title="Next"
              variant="primary"
              accent="blue"
              onClick={() => setCurrentStep(currentStep + 1)}
            />
          </StyledButton>
        </StyledInputCard>
      </StyledCard>
    </>
  );
};
