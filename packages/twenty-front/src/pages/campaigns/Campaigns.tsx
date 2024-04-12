import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { IconSpeakerphone } from '@tabler/icons-react';
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
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { ADD_CAMPAIGN } from '@/users/graphql/queries/addCampaign';
import { useMutation, useQuery } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { GET_MESSAGE_TEMPLATES } from '@/users/graphql/queries/getMessageTemplates';
import { GET_SPECIALTY } from '@/users/graphql/queries/getSpecialtyDetails';
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

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: scroll;
`;

const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(10)};
`;
const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-left: ${({ theme }) => theme.spacing(2)};
  display: flex;
  align-items: center;
  text-transform: uppercase;
`;

const SytledHR = styled.hr`
  background: ${GRAY_SCALE.gray0};
  color: ${GRAY_SCALE.gray0};
  bordercolor: ${GRAY_SCALE.gray0};
  height: 0.2px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(8)};
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
  align-items: center;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;
type MessageTemplate = {
  type: string;
  value: string;
  label: string;
};

export const Campaigns = () => {
  const [messageTemplates, setMessageTemplates] = useState<MessageTemplate[]>(
    [],
  );
  const { loading: templatesLoading, data: templatesData } = useQuery(
    GET_MESSAGE_TEMPLATES,
  );
  const fetchTemplates = (channelType: string) => {
    const channelTemplates = templatesData?.messageTemplates.edges
      .filter(
        (edge: { node: any }) =>
          edge.node?.typeOfCommunicationChannels === channelType,
      )
      .map((edge: { node: any }) => ({
        value: edge.node?.id,
        label: edge.node?.name,
      }));
    setMessageTemplates(channelTemplates);
  };
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [selectedSubSpecialty, setSelectedSubSpecialty] = useState('');

  let Specialty: any = [];
  const { loading: queryLoading, data: queryData } = useQuery(GET_SPECIALTY);

  const SpecialtyTypes: any = {};
  const [specialty, setSpecialty] = useState('');
  const [subSpecialty, setSubSpecialty] = useState('');
  if (!queryLoading) {
    const specialtyTypes = queryData?.subspecialties.edges.map(
      (edge: { node: { specialtyType: { name: any } } }) =>
        edge?.node?.specialtyType?.name,
    );
    const uniqueSpecialtyTypes = Array.from(new Set(specialtyTypes));
    Specialty = uniqueSpecialtyTypes.map((specialtyType) => ({
      value: specialtyType,
      label: specialtyType,
    }));

    queryData?.subspecialties.edges.forEach(
      (edge: { node: { specialtyType: { name: any }; name: any } }) => {
        const specialtyType = edge.node?.specialtyType?.name;
        const subSpecialty = edge.node.name;

        // If the specialty type is already a key in the dictionary, push the sub-specialty to its array
        if (SpecialtyTypes[specialtyType]) {
          SpecialtyTypes[specialtyType].push({
            value: subSpecialty,
            label: subSpecialty,
          });
        } else {
          // If the specialty type is not yet a key, create a new array with the sub-specialty as its first element
          SpecialtyTypes[specialtyType] = [];
          SpecialtyTypes[specialtyType].push({
            value: subSpecialty,
            label: subSpecialty,
          });
        }
      },
    );
  }

  const handleSpecialtySelectChange = (selectedValue: any) => {
    setSpecialty(selectedValue);
  };

  const handleSubSpecialtySelectChange = (selectedValue: any) => {
    setSubSpecialty(selectedValue);
  };

  const { setCurrentStep, campaignData, setCampaignData, currentStep } =
    useCampaign();
  const [messageContent, setMessageContent] = useState('');

  const handleCampaignChange = (e: any) => {
    setMessageContent(e.target.value);
    console.log('Message content', messageContent);
  };
  console.log(campaignData.whatsapptemplate);

  const { enqueueSnackBar } = useSnackBar();
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
  const [addCampaigns, { loading, error }] = useMutation(ADD_CAMPAIGN);
  const handleSave = async () => {
    console.log(campaignData.whatsapptemplate);
    try {
      const variables = {
        input: {
          id: uuidv4(),
          campaignName: campaignData.campaignName,
          description: campaignData.campaignDescription,
          leads: campaignData.targetAudience,
          messagingMedia: campaignData.whatsappTemplate
            ? campaignData.whatsapptemplate
            : campaignData.emailTemplate,
          formUrl: campaignData.pageUrl,
        },
      };
      console.log('Variables: ', variables);
      const { data } = await addCampaigns({
        variables: variables,
      });
      enqueueSnackBar('Campaign added successfully', {
        variant: 'success',
      });
    } catch (errors: any) {
      console.error('Error adding campaign:', error);
      enqueueSnackBar(errors.message + 'Error while adding Campaign', {
        variant: 'error',
      });
    }
  };

  console.log('email: ', campaignData.emailTemplate);
  console.log('Whatsapp: ', campaignData.whatsappTemplate);
  console.log('Whatsapp: ', campaignData.whatsapptemplate);

  return (
    <PageContainer>
      <PageHeader title="Campaign" Icon={IconSpeakerphone}></PageHeader>

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
              title="Specialty Type"
              description="Select a medical specialty that is focused on a particular area of medical practice"
            />
            <Select
              fullWidth
              // disabled
              dropdownId="Specialty Type"
              value={specialty}
              options={Specialty}
              onChange={handleSpecialtySelectChange}
            />
          </Section>
          <Section>
          {specialty && (
            
            <Section>
              <H2Title
                title="Subspecialty Type"
                description="Select a subspecialization within the selected medical specialty"
              />
              <Select
                fullWidth
                // disabled
                dropdownId="Sub Specialty Type"
                value={subSpecialty}
                options={SpecialtyTypes[specialty]}
                onChange={handleSubSpecialtySelectChange}
              />
            </Section>
          )}
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
                      onSelectCheckBoxChange(event, 'WHATSAPP');
                      if (event.target.checked) {
                        fetchTemplates('WHATSAPP');
                      } else {
                        setMessageTemplates([]);
                      }
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
                    options={messageTemplates} // Display fetched templates
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
                      onSelectCheckBoxChange(event, 'EMAIL');
                      if (event.target.checked) {
                        fetchTemplates('EMAIL'); // Fetch Email templates
                      } else {
                        setMessageTemplates([]); // Reset templates when Email checkbox is unchecked
                      }
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
                    options={messageTemplates} // Display fetched templates
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
              onClick={handleSave}
            />
          </StyledButton>
        </StyledInputCard>
      </StyledBoardContainer>
    </PageContainer>
  );
};
