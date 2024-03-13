/* eslint-disable no-restricted-imports */
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { Button, TextArea, TextInput } from 'tsup.ui.index';

import { H2Title } from '@/ui/display/typography/components/H2Title';
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
  const { setCurrentStep, campaignData, setCampaignData, currentStep } =
    useCampaign();
  const handleCampaignChange = (_event: Event | undefined): void => {
    throw new Error('Function not implemented.');
  };

  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <StyledTitle></StyledTitle>
        </StyledTitleCard>
        <StyledInputCard>
          <Section>
            <H2Title
              title="Campaign Name"
              description="Your Campaign name will be displayed in Campaign List"
            />
            <TextInput
              placeholder={'Enter campaign name'}
              value={campaignData?.campaignName}
              onChange={(e) =>
                setCampaignData({
                  ...campaignData,
                  campaignName: e,
                })
              }
              name="campaignName"
              required
              fullWidth
            />
          </Section>

          <StyledAreaLabel>
            <Section>
              <H2Title
                title="Campaign Description"
                description="Describe the main objectives and goals of the campaign "
              />
            </Section>
            <TextArea
              value={campaignData?.campaignDescription}
              placeholder={'Enter campaign description'}
              minRows={5}
              // eslint-disable-next-line no-restricted-globals
              onChange={(e) =>
                setCampaignData({ ...campaignData, campaignDescription: e })
              }
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
