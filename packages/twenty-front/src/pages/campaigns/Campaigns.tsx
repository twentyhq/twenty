import styled from '@emotion/styled';

import { IconTargetArrow } from '@/ui/display/icon';
import { Modal } from '@/ui/layout/modal/components/Modal';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { StepBar } from '@/ui/navigation/step-bar/components/StepBar';
import { MOBILE_VIEWPORT } from '@/ui/theme/constants/MobileViewport';
// import { MOBILE_VIEWPORT } from '@/ui/theme/constants/theme';
import { CampaignDate } from '~/pages/campaigns/CampaignDate';
import { CampaignDetails } from '~/pages/campaigns/CampaignDetails';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { Lead } from '~/pages/campaigns/Lead';
import { MessagingChannel } from '~/pages/campaigns/MessagingChannel';
import { PreviewPage } from '~/pages/campaigns/PreviewPage';
import { Specialty } from '~/pages/campaigns/Specialty';

const StyledBoardContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  justify-self: center;
`;

const StyledHeader = styled(Modal.Header)`
  background-color: ${({ theme }) => theme.background.secondary};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.medium};
  height: 60px;
  padding: 0px;
  padding-left: ${({ theme }) => theme.spacing(30)};
  padding-right: ${({ theme }) => theme.spacing(30)};
  @media (max-width: ${MOBILE_VIEWPORT}px) {
    padding-left: ${({ theme }) => theme.spacing(4)};
    padding-right: ${({ theme }) => theme.spacing(4)};
  }
`;

const StyledCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  justify-content: center;
  background: ${({ theme }) => theme.background.noisy};
  height: 100%;
  overflow: scroll;
  scrollbar-color: ${({ theme }) => theme.border.color.danger};
  scrollbar-width: 4px;
  *::-webkit-scrollbar {
    height: 4px;
    width: 4px;
  }
  *::-webkit-scrollbar-corner {
    background-color: #03030358;
  }
  *::-webkit-scrollbar-thumb {
    background-color: #03030358;
    border-radius: ${({ theme }) => theme.border.radius.md};
  }
`;
export const Campaigns = () => {
  const { currentStep } = useCampaign();
  // const currentStep = 2;
  const showCampaignStep = (step: number) => {
    switch (step) {
      case 2:
        return <Specialty />;
      case 3:
        return <Lead />;
      case 4:
        return <CampaignDate />;
      case 5:
        return <MessagingChannel />;
      case 6:
        return <PreviewPage />;
      default:
        return <CampaignDetails />;
    }
  };

  return (
    <>
      <PageContainer>
        <PageHeader title="Campaign" Icon={IconTargetArrow}></PageHeader>

        <PageBody>
          <StyledBoardContainer>
            <StyledHeader>
              <StepBar activeStep={currentStep - 1}>
                <StepBar.Step label="Campaign details"></StepBar.Step>
                <StepBar.Step label="Specialty & Subspecialty"></StepBar.Step>
                <StepBar.Step label="Lead Extraction"></StepBar.Step>
                <StepBar.Step label="Campaign Date"></StepBar.Step>
                <StepBar.Step label="Message Channel"></StepBar.Step>
                <StepBar.Step label="Preview"></StepBar.Step>
              </StepBar>
            </StyledHeader>
            <StyledCard>{showCampaignStep(currentStep + 1)}</StyledCard>
          </StyledBoardContainer>
        </PageBody>
      </PageContainer>
    </>
  );
};
