/* eslint-disable no-restricted-imports */
import styled from '@emotion/styled';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { Button } from 'tsup.ui.index';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { PreviewLeadsData } from '~/pages/campaigns/PreviewLeadsData';

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
  height: 85%;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

const StyledTitleCard = styled.div`
  /* align-items: center; */
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: 1%;
  width: 100%;
  justify-content: flex-start;
`;

const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const LeadsPreviewPage = () => {
  const { setCurrentStep, currentStep, leadData } = useCampaign();
  return (
    <>
      <StyledInputCard>
        <PreviewLeadsData data={leadData.data} />
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
    </>
  );
};
