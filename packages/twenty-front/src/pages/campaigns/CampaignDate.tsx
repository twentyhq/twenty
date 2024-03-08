/* eslint-disable no-restricted-imports */
import { useState } from 'react';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { Button } from 'tsup.ui.index';

import DateTimePicker from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { H2Title } from '@/ui/display/typography/components/H2Title';

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
  height: 70%;
  justify-content: space-around;
  width: 70%;
  align-items: center;
`;

const StyledTitleCard = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: 10%;
  width: 70%;
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
  const { setCurrentStep, currentStep } = useCampaign();

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  return (
    <>
      <StyledCard>
        <StyledTitleCard>
        <H2Title
              title="Campaign Date"
              description="Choose your when to run your campaigns"
        />
        </StyledTitleCard>
        <StyledInputCard>
          <Section>
            <StyledLabel>Start Date</StyledLabel>
            <DateTimePicker
              onChange={(startDate) => setStartDate(startDate)}
              minDate={new Date()}
              showTimeInput
            />
          </Section>
          <Section>
            <StyledLabel>End Date</StyledLabel>
            <DateTimePicker
              onChange={(endDate) => setEndDate(endDate)}
              minDate={startDate}
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
