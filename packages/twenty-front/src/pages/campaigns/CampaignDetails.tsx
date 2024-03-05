/* eslint-disable no-restricted-imports */
import styled from '@emotion/styled';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { Button, TextArea, TextInput } from 'tsup.ui.index';

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
  height: 50%;
  justify-content: space-evenly;
  width: 70%;
  align-items: center;
`;

const StyledTitleCard = styled.div`
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: 10%;
  width: 70%;
  justify-content: flex-start;
`;

const StyledAreaLabel = styled.span`
  align-content: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
  width: 100%;
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

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const CampaignDetails = () => {
  const { setCurrentStep, currentStep } = useCampaign();
  const handleCampaignChange = (_event: Event | undefined): void => {
    throw new Error('Function not implemented.');
  };

  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <StyledTitle>
            Get started on your campaign journey with our comprehensive
            solution. Create, launch, and optimize campaigns with ease
          </StyledTitle>
        </StyledTitleCard>
        <StyledInputCard>
          <TextInput
            label={'campaign name'}
            // value={'campaignName'}
            placeholder={'Enter campaign name'}
            // eslint-disable-next-line no-restricted-globals
            onChange={() => handleCampaignChange(event)}
            name="campaignName"
            required
            fullWidth
          />
          <StyledAreaLabel>
            <StyledLabel>Description</StyledLabel>
            <TextArea
              value={''}
              placeholder={'Enter campaign description'}
              minRows={5}
              // eslint-disable-next-line no-restricted-globals
              onChange={() => handleCampaignChange(event)}
            />
          </StyledAreaLabel>
          <StyledButton>
            <Button
              Icon={IconArrowLeft}
              title="Previous"
              variant="secondary"
              disabled
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
