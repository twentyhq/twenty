/* eslint-disable no-restricted-globals */
/* eslint-disable @nx/workspace-styled-components-prefixed-with-styled */
import { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { Select, TextInput } from 'tsup.ui.index';
import { v4 as uuidv4 } from 'uuid';

import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { IconMail } from '@/ui/display/icon';
import { H1Title } from '@/ui/display/typography/components/H1Title';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { Button } from '@/ui/input/button/components/Button';
import DateTimePicker from '@/ui/input/components/internal/date/components/DateTimePicker';
import { Radio } from '@/ui/input/components/Radio';
import { SubMenuTopBarContainer } from '@/ui/layout/page/SubMenuTopBarContainer';
import { Section } from '@/ui/layout/section/components/Section';
import { ADD_CAMPAIGN } from '@/users/graphql/queries/addCampaign';
import { GET_SPECIALTY } from '@/users/graphql/queries/getSpecialtyDetails';

const StyledH1Title = styled(H1Title)`
  margin-bottom: 0;
`;

const StyledRadio = styled(Radio)`
  margin-right: 16;
`;

const StyledSection = styled(Section)`
  align-items: center;
  display: flex;
  justify-content: space-around;
  margin-bottom: 16px;
  margin-left: 0;
`;

const SaveButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  width: auto;
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
`;

export const Campaigns = () => {
  let Specialty: any = [];

  const SpecialtyTypes: any = {};

  const [campaignName, setCampaignName] = useState('');
  const [description, setDescription] = useState('');
  const [specialty, setSpecialty] = useState('');
  const [subSpecialty, setSubSpecialty] = useState('');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedMessaging, setSelectedMessaging] = useState('');

  const { loading: queryLoading, data: queryData } = useQuery(GET_SPECIALTY);

  if (!queryLoading) {
    const specialtyTypes = queryData.subspecialties.edges.map(
      (edge: { node: { specialtyType: { name: any } } }) =>
        edge?.node?.specialtyType?.name,
    );
    const uniqueSpecialtyTypes = Array.from(new Set(specialtyTypes));
    Specialty = uniqueSpecialtyTypes.map((specialtyType) => ({
      value: specialtyType,
      label: specialtyType,
    }));

    queryData.subspecialties.edges.forEach(
      (edge: { node: { specialtyType: { name: any }; name: any } }) => {
        const specialtyType = edge.node.specialtyType.name;
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

  const [addCampaigns, { loading, error }] = useMutation(ADD_CAMPAIGN);
  const { enqueueSnackBar } = useSnackBar();

  const handleCampaignChange = (e: any) => {
    setCampaignName(e.target.value);
  };

  const handleDescriptionChange = (e: any) => {
    setDescription(e.target.value);
  };

  const handleSpecialtySelectChange = (selectedValue: any) => {
    setSpecialty(selectedValue);
  };

  const handleSubSpecialtySelectChange = (selectedValue: any) => {
    setSubSpecialty(selectedValue);
  };

  const handleRadioChange = (value: string) => {
    setSelectedMessaging(value);
  };
  const resetCampaignData = () => {
    setCampaignName('');
    setDescription('');
    setStartDate(new Date());
    setSelectedMessaging('');
    setSpecialty('');
    setSubSpecialty('');
  };
  const handleSave = async () => {
    // console.log('Date', date.toISOString());

    try {
      console.log('Start Date', startDate);

      console.log('End Date', endDate);
      const variables = {
        input: {
          id: uuidv4(),
          campaignName: campaignName,
          specialtyType: specialty,
          description: description,
          subSpecialtyType: subSpecialty,
          startDate: startDate,
          endDate: endDate,
          messagingMedia: selectedMessaging,
        },
      };
      const { data } = await addCampaigns({
        variables: variables,
      });
      enqueueSnackBar('Campaign added successfully', {
        variant: 'success',
      });
      resetCampaignData();
    } catch (errors: any) {
      console.error('Error updating user:', error);
      enqueueSnackBar(errors.message + 'Error while Submitting Campaign', {
        variant: 'error',
      });
    }
  };
  return (
    <SubMenuTopBarContainer Icon={IconMail} title="Campaign">
      <SettingsPageContainer>
        <StyledH1Title title="Campaign" />
        <Section>
          <TextInput
            label="Campaign Name"
            value={campaignName}
            // eslint-disable-next-line no-restricted-globals
            onChange={() => handleCampaignChange(event)}
            placeholder="Campaign Name"
            name="campaignName"
            required
            fullWidth
          />
        </Section>
        <Section>
          <TextInput
            label="Description"
            value={description}
            onChange={() => handleDescriptionChange(event)}
            placeholder="Description about campaign"
            name="description"
            required
            fullWidth
          />
        </Section>
        <Section>
          <Select
            fullWidth
            // disabled
            label="Specialty Type"
            dropdownId="Specialty Type"
            value={specialty}
            options={Specialty}
            onChange={handleSpecialtySelectChange}
          />
        </Section>
        {specialty && (
          <Section>
            <Select
              fullWidth
              // disabled
              label="Sub Specialty Type"
              dropdownId="Sub Specialty Type"
              value={subSpecialty}
              options={SpecialtyTypes[specialty]}
              onChange={handleSubSpecialtySelectChange}
            />
          </Section>
        )}
        <Section>
          <StyledLabel>Start Date</StyledLabel>
          <DateTimePicker
            onChange={(startDate) => setStartDate(startDate)}
            minDate={new Date()}
          />
        </Section>
        <Section>
          <StyledLabel>End Date</StyledLabel>
          <DateTimePicker
            onChange={(endDate) => setEndDate(endDate)}
            minDate={startDate}
          />
        </Section>

        <StyledLabel>Messaging</StyledLabel>
        <StyledSection>
          <StyledRadio
            value="SMS"
            label="SMS"
            onChange={(checked) => handleRadioChange('SMS')}
            checked={selectedMessaging === 'SMS'}
          />
          <StyledRadio
            value="WhastApp"
            label="WhastApp"
            onChange={(checked) => handleRadioChange('WhastApp')}
            checked={selectedMessaging === 'WhastApp'}
          />

          <StyledRadio
            value="GBM"
            label="GBM"
            onChange={(checked) => handleRadioChange('GBM')}
            checked={selectedMessaging === 'GBM'}
          />

          <StyledRadio
            value="Call"
            label="Call"
            onChange={() => handleRadioChange('Call')}
            checked={selectedMessaging === 'Call'}
          />
        </StyledSection>
        <SaveButtonContainer>
          <Button
            title="Save"
            variant="primary"
            accent="blue"
            size="medium"
            onClick={(event) => handleSave()}
          />
        </SaveButtonContainer>
      </SettingsPageContainer>
    </SubMenuTopBarContainer>
  );
};
