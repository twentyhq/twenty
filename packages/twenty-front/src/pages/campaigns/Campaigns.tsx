import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { IconTargetArrow } from '@tabler/icons-react';
import { Button, Select, TextArea, TextInput } from 'tsup.ui.index';
import { ChangeEvent, useState } from 'react';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import {
  Checkbox,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
} from 'tsup.ui.index';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';
import { PageBody } from '@/ui/layout/page/PageBody';
import { PageContainer } from '@/ui/layout/page/PageContainer';
import { PageHeader } from '@/ui/layout/page/PageHeader';
const StyledCheckboxLabel = styled.span`
  margin-left: ${({ theme }) => theme.spacing(2)};
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
  display: flex;
  alignitems: center;
  text-transform: uppercase;
`;

const SytledHR = styled.hr`
  background: ${GRAY_SCALE.gray0};
  color: ${GRAY_SCALE.gray0};
  bordercolor: ${GRAY_SCALE.gray0};
  height: 0.2px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(10)};
`;

const StyledBoardContainer = styled.div`
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  justify-content: flex-start;
  background: ${({ theme }) => theme.background.noisy};
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledSection = styled(Section)`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  margin-left: 0;
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export const Campaigns = () => {
  const { setCurrentStep, campaignData, setCampaignData, currentStep } =
    useCampaign();
  const [messageContent, setMessageContent] = useState('');

  const handleCampaignChange = (e: any) => {
    setMessageContent(e.target.value);
    console.log('Message content', messageContent);
  };
  const onSelectCheckBoxChange = (
    event: ChangeEvent<HTMLInputElement>,
    channel: string,
  ): void => {
    // throw new Error('Function not implemented.');
    setCampaignData((prevData: any) => ({
      ...prevData,
      [channel]: event.target.checked,
    }));
  };

  return (
    <PageContainer>
      <PageHeader title="Campaign" Icon={IconTargetArrow}></PageHeader>

      <StyledBoardContainer>
        <StyledInputCard>
          <Section>
            <H2Title
              title="Campaign Name"
              description="Your Campaign name will be displayed in Campaign List"
            />
            <TextInput
              placeholder={'Enter campaign Name'}
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
          <SytledHR />

          <Section>
            <H2Title
              title="Campaign Description"
              description="Your Campaign Description will be displayed in Campaign List"
            />
            <TextInput
              value={campaignData?.campaignDescription}
              onChange={(e) =>
                setCampaignData({
                  ...campaignData,
                  campaignDescription: e,
                })
              }
              name="campaignDescription"
              required
              fullWidth
            />
          </Section>
          <SytledHR />
          <Section>
            <H2Title
              title="Target Audience"
              description="Your Target Audience will be displayed in Campaign List"
            />
            <TextInput
              // placeholder={'Select target Audience'}
              value={campaignData?.targetAudience}
              onChange={(e) =>
                setCampaignData({
                  ...campaignData,
                  targetAudience: e,
                })
              }
              name="targetAudience"
              required
              fullWidth
            />
          </Section>
          <SytledHR />
          <Section>
            <Section>
              <H2Title title="Target Communication" />
            </Section>

            <StyledSection>
              <StyledComboInputContainer>
                <StyledLabel>
                  <Checkbox
                    checked={campaignData.Whatsapp || false}
                    indeterminate={false}
                    onChange={(event) => {
                      onSelectCheckBoxChange(event, 'Whatsapp');
                      setCampaignData({
                        ...campaignData,
                        Whatsapp: event.target.checked,
                        Email: !event.target.checked
                          ? campaignData.Email
                          : false,
                      });
                    }}
                    variant={CheckboxVariant.Primary}
                    size={CheckboxSize.Small}
                    shape={CheckboxShape.Squared}
                  />
                  <StyledCheckboxLabel>WhatsApp</StyledCheckboxLabel>
                </StyledLabel>

                {campaignData.Whatsapp && (
                  <Select
                    fullWidth
                    dropdownId="whatsappTemplate"
                    value={campaignData?.whatsappTemplate}
                    options={[]}
                    onChange={(e) => {
                      setCampaignData({
                        ...campaignData,
                        whatsappTemplate: e,
                      });
                    }}
                  />
                )}
              </StyledComboInputContainer>

              <StyledComboInputContainer>
                <StyledLabel style={{ marginBottom: '5px' }}>
                  <Checkbox
                    checked={campaignData.Email || false}
                    indeterminate={false}
                    onChange={(event) => {
                      onSelectCheckBoxChange(event, 'Email');
                      setCampaignData({
                        ...campaignData,
                        Email: event.target.checked,
                        Whatsapp: !event.target.checked
                          ? campaignData.Whatsapp
                          : false,
                      });
                    }}
                    variant={CheckboxVariant.Primary}
                    size={CheckboxSize.Small}
                    shape={CheckboxShape.Squared}
                  />
                  <StyledCheckboxLabel>Email</StyledCheckboxLabel>
                </StyledLabel>

                {campaignData.Email && (
                  <Select
                    fullWidth
                    dropdownId="emailTemplate"
                    value={campaignData?.emailTemplate}
                    options={[]}
                    onChange={(e) => {
                      setCampaignData({
                        ...campaignData,
                        emailTemplate: e,
                      });
                    }}
                  />
                )}
              </StyledComboInputContainer>
            </StyledSection>
          </Section>

          <SytledHR />

          <Section>
            <H2Title
              title="Loading Page URL"
              description="URL for the landing page, to be used here"
            />
            <TextInput
              value={campaignData?.pageUrl}
              onChange={(e) =>
                setCampaignData({
                  ...campaignData,
                  pageUrl: e,
                })
              }
              name="pageUrl"
              required
              fullWidth
            />
          </Section>

          <StyledButton>
            <Button
              size="medium"
              title="Save"
              variant="primary"
              accent="dark"
              onClick={() => setCurrentStep(currentStep - 1)}
            />
          </StyledButton>
        </StyledInputCard>
      </StyledBoardContainer>
    </PageContainer>
  );
};
