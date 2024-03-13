/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-restricted-imports */
import { useMutation } from '@apollo/client';
import styled from '@emotion/styled';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import { v4 as uuidv4 } from 'uuid';

import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import { ADD_CAMPAIGN } from '@/users/graphql/queries/addCampaign';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { PreviewCampaignDate } from '~/pages/campaigns/PreviewCampaignDate';
import { PreviewCampaignDetailsTab } from '~/pages/campaigns/PreviewCampaignDetailsTab';
import { PreviewMessagingChannel } from '~/pages/campaigns/PreviewMessagingChannel';
import { PreviewSpecialty } from '~/pages/campaigns/PreviewSpecialty';

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
  height: 5%;
  width: 100%;
  justify-content: flex-start;
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
  const { setCurrentStep, currentStep, campaignData, setCampaignData } =
    useCampaign();
  const [addCampaigns, { error }] = useMutation(ADD_CAMPAIGN);
  const { enqueueSnackBar } = useSnackBar();

  const selectedChannels = ['SMS', 'Whatsapp', 'Email', 'GBM', 'CALL']
    .filter((channel) => campaignData[channel])
    .join(', ');

  const resetFormData = () => {
    setCampaignData({
      ...campaignData,
      campaignName: '',
      campaignDescription: '',
      specialtyType: '',
      subSpecialtyType: '',
      leads: '',
      startDate: '',
      endDate: '',
    });
    setCurrentStep(0);
  };
  const handleSave = async () => {
    try {
      const variables = {
        input: {
          id: uuidv4(),
          campaignName: campaignData?.campaignName,
          specialtyType: campaignData?.specialtyType,
          description: campaignData?.campaignDescription,
          subSpecialtyType: campaignData?.subSpecialtyType,
          startDate: campaignData?.startDate,
          endDate: campaignData?.endDate,
          messagingMedia: selectedChannels,
          leads: `${campaignData?.leads}`,
        },
      };
      const { data } = await addCampaigns({
        variables: variables,
      });
      enqueueSnackBar('Campaign Created successfully', {
        variant: 'success',
      });
      resetFormData();
    } catch (errors: any) {
      console.error('Error while creating Campaign :', error);
      enqueueSnackBar(errors.message + 'Error while creating Campaign', {
        variant: 'error',
      });
    }
  };
  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <StyledTitle></StyledTitle>
        </StyledTitleCard>
        <StyledInputCard>
          <PreviewCampaignDetailsTab
            campaignName={campaignData?.campaignName}
            campaignDescription={campaignData?.campaignDescription}
          />
          <PreviewSpecialty
            specialtyType={campaignData?.specialtyType}
            subSpecialityType={campaignData?.subSpecialtyType}
          />
          <PreviewCampaignDate
            startDate={campaignData?.startDate}
            endDate={campaignData?.endDate}
          />
          <PreviewMessagingChannel selectedChannels={selectedChannels} />
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
              onClick={handleSave}
            />
          </StyledButton>
        </StyledInputCard>
      </StyledCard>
    </>
  );
};
