/* eslint-disable @nx/workspace-styled-components-prefixed-with-styled */
/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-restricted-imports */
import { useState } from 'react';
import styled from '@emotion/styled';
import { IconArrowRight, IconPlus } from '@tabler/icons-react';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import DateTimePicker from '@/ui/input/components/internal/date/components/DateTimePicker';
import { Section } from '@/ui/layout/section/components/Section';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { MenuItemMultiSelectAvatar, TextInput } from 'tsup.ui.index';
import {
  IconArrowBadgeRight,
  IconArrowLeft,
  IconCalendar,
  IconEqual,
  IconSpeakerphone,
  IconTrash,
  IconUsersGroup,
} from '@tabler/icons-react';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { FILTER_LEADS } from '@/users/graphql/queries/filterLeads';
import { useLazyQuery } from '@apollo/client';
import { PreviewLeadsData } from '~/pages/campaigns/PreviewLeadsData';
import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';

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
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: 65%;
  justify-content: space-between;
  width: 70%;
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

const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledAreaLabel = styled.span`
  align-content: center;
  display: flex;
  flex-direction: column;
  background: ${({ theme }) => theme.background.noisy};
  justify-content: center;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const TextContainer = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.primary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};

  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-left: ${({ theme }) => theme.spacing(5)};
  padding-right: ${({ theme }) => theme.spacing(5)};
  padding-top: ${({ theme }) => theme.spacing(2)};
`;
const StyledFilter = styled(Section)`secondary
  margin-left: ${({ theme }) => theme.spacing(2)};
`;
const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
  align-items: center;
  justify-content: space-around;
`;

const StyledComboInputContainer1 = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
  align-items: center;
`;
const StyledFilterCard = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
  width: 100%;
  justify-content: space-between;
`;
const Section2 = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

export const Lead = () => {
  const { setCurrentStep, currentStep, setLeadData, leadData } = useCampaign();
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<
    Record<string, boolean>
  >({});
  const [leadSourceValue, setLeadSourceValue] = useState('');
  const [campaignNameValue, setCampaignNameValue] = useState('');
  const [locationValue, setLocationValue] = useState('');
  const [ageValue, setAgeValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);

  const handleLeadSourceChange = (event: any) => {
    setLeadSourceValue(event.target.value);
  };

  const handleCampaignNameChange = (event: any) => {
    setCampaignNameValue(event.target.value);
  };

  const handleLocationChange = (event: any) => {
    setLocationValue(event.target.value);
  };

  const handleAgeChange = (event: any) => {
    setAgeValue(event.target.value);
  };

  const [filterleads, { loading, error, data }] = useLazyQuery(FILTER_LEADS, {
    fetchPolicy: 'network-only',
  });

  const filterOptions = [
    { id: '1', name: 'Lead Source' },
    { id: '2', name: 'Campaign Name' },
    { id: '3', name: 'Select Date' },
    { id: '4', name: 'Location' },
    { id: '5', name: 'Age' },
  ];

  const handleSubmit = () => {
    const filter: Record<string, any> = {};
    if (selectedFilterOptions['1']) {
      filter['advertisementSource'] = { ilike: `%${leadSourceValue}%` };
    }
    if (selectedFilterOptions['2']) {
      filter['campaignName'] = { ilike: `%${campaignNameValue}%` };
    }
    if (selectedFilterOptions['4']) {
      filter['location'] = { ilike: `%${locationValue}%` };
    }
    if (selectedFilterOptions['5']) {
      filter['age'] = { ilike: `%${ageValue}%` };
    }
    try {
      console.log(filter, '----------');
      filterleads({ variables: { filter: filter } });
      setModalOpen(true);

      if (data) {
        console.log(data);
        setLeadData({ ...leadData, data: data });
      }
    } catch (error) {
      console.error('Error sending data to API:', error);
    }
  };

  const handleCloseModal = () => {
    setModalOpen(false);
  };

  const removeFilterOption = (id: string) => {
    setSelectedFilterOptions((previous) => ({
      ...previous,
      [id]: false,
    }));
    switch (id) {
      case '1':
        setLeadSourceValue('');
        break;
      case '2':
        setCampaignNameValue('');
        break;
      case '4':
        setLocationValue('');
        break;
      case '5':
        setAgeValue('');
        break;
      default:
        break;
    }
  };

  const displayFilterSection = () => {
    return filterOptions.map((item) => {
      if (selectedFilterOptions[item.id]) {
        switch (item.id) {
          case '1':
            return (
              <StyledFilterCard>
                <StyledAreaLabel>
                  <StyledComboInputContainer>
                    <TextContainer>
                      <IconUsersGroup />{' '}
                      <StyledFilter>Lead Source</StyledFilter>
                    </TextContainer>
                    <TextContainer>
                      <IconEqual /> <StyledFilter>is equal to</StyledFilter>
                    </TextContainer>
                    <TextInput
                      value={leadSourceValue}
                      placeholder={'Enter name of lead  source'}
                      name="leadSrcInput"
                      required
                      onChange={() => handleLeadSourceChange(event)}
                    />
                  </StyledComboInputContainer>
                </StyledAreaLabel>
                <Section2>
                  <Button
                    Icon={IconTrash}
                    title="Remove"
                    variant="secondary"
                    accent="danger"
                    onClick={() => removeFilterOption(item.id)}
                  />
                </Section2>
              </StyledFilterCard>
            );
          case '2':
            return (
              <StyledFilterCard>
                <StyledAreaLabel>
                  <StyledComboInputContainer>
                    <TextContainer>
                      <IconSpeakerphone />{' '}
                      <StyledFilter>Campaign Name</StyledFilter>
                    </TextContainer>
                    <TextContainer>
                      <IconEqual /> <StyledFilter>is equal to</StyledFilter>
                    </TextContainer>
                    <TextInput
                      value={campaignNameValue}
                      placeholder={'Enter name of campaign'}
                      name="leadCampaignInput"
                      required
                      onChange={() => handleCampaignNameChange(event)}
                    />
                  </StyledComboInputContainer>
                </StyledAreaLabel>
                <Section2>
                  <Button
                    Icon={IconTrash}
                    title="Remove"
                    variant="secondary"
                    accent="danger"
                    onClick={() => removeFilterOption(item.id)}
                  />
                </Section2>
              </StyledFilterCard>
            );
          case '3':
            return (
              <StyledFilterCard>
                <StyledAreaLabel>
                  <StyledComboInputContainer>
                    <TextContainer>
                      <IconCalendar /> <StyledFilter>Select Date</StyledFilter>
                    </TextContainer>
                    <DateTimePicker
                      onChange={(startDate) => setStartDate(startDate)}
                      minDate={new Date()}
                    />
                    {/* <TextInput value={'to'} disabled /> */}
                    <TextContainer>
                      <IconArrowBadgeRight /> <StyledFilter>to</StyledFilter>
                    </TextContainer>

                    <DateTimePicker
                      onChange={(endDate) => setEndDate(endDate)}
                      minDate={startDate}
                    />
                  </StyledComboInputContainer>
                </StyledAreaLabel>
                <Section2>
                  <Button
                    Icon={IconTrash}
                    title="Remove"
                    variant="secondary"
                    accent="danger"
                    onClick={() => removeFilterOption(item.id)}
                  />
                </Section2>
              </StyledFilterCard>
            );
          case '4':
            return (
              <StyledFilterCard>
                <StyledAreaLabel>
                  <StyledComboInputContainer>
                    <TextContainer>
                      <IconUsersGroup /> <StyledFilter>Location</StyledFilter>
                    </TextContainer>
                    <TextContainer>
                      <IconEqual /> <StyledFilter>is equal to</StyledFilter>
                    </TextContainer>
                    <TextInput
                      value={locationValue}
                      placeholder={'Enter lead location'}
                      name="leadLocationInput"
                      required
                      onChange={() => handleLocationChange(event)}
                    />
                  </StyledComboInputContainer>
                </StyledAreaLabel>
                <Section2>
                  <Button
                    Icon={IconTrash}
                    title="Remove"
                    variant="secondary"
                    accent="danger"
                    onClick={() => removeFilterOption(item.id)}
                  />
                </Section2>
              </StyledFilterCard>
            );

          case '5':
            return (
              <StyledFilterCard>
                <StyledAreaLabel>
                  <StyledComboInputContainer>
                    <TextContainer>
                      <IconUsersGroup /> <StyledFilter>Age</StyledFilter>
                    </TextContainer>
                    <TextContainer>
                      <IconEqual /> <StyledFilter>is equal to</StyledFilter>
                    </TextContainer>
                    <TextInput
                      value={ageValue}
                      placeholder={'Enter lead age'}
                      name="leadAgeInput"
                      required
                      onChange={() => handleAgeChange(event)}
                    />
                  </StyledComboInputContainer>
                </StyledAreaLabel>
                <Section2>
                  <Button
                    Icon={IconTrash}
                    title="Remove"
                    variant="secondary"
                    accent="danger"
                    onClick={() => removeFilterOption(item.id)}
                  />
                </Section2>
              </StyledFilterCard>
            );

          default:
            return null;
        }
      }
      return null;
    });
  };

  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <StyledTitle></StyledTitle>
        </StyledTitleCard>
        <StyledInputCard>
          <Section>
            <StyledComboInputContainer1>
              <H2Title
                title="Extract Leads"
                description="Filter out the Leads for your campaign"
              />
            </StyledComboInputContainer1>
            <StyledComboInputContainer1>
              <Dropdown
                dropdownId={'dropdownId'}
                clickableComponent={
                  <Button title="Add Filters" Icon={IconPlus} />
                }
                dropdownComponents={
                  <DropdownMenuItemsContainer hasMaxHeight>
                    {filterOptions.map((item) => (
                      <MenuItemMultiSelectAvatar
                        key={item.id}
                        selected={selectedFilterOptions[item.id]}
                        onSelectChange={(checked) =>
                          setSelectedFilterOptions((previous) => ({
                            ...previous,
                            [item.id]: checked,
                          }))
                        }
                        avatar={undefined}
                        text={item.name}
                      />
                    ))}
                  </DropdownMenuItemsContainer>
                }
                dropdownHotkeyScope={{
                  scope: 'dropdownId',
                }}
              />
            </StyledComboInputContainer1>
            <Button title="Submit" variant="tertiary" onClick={handleSubmit} />
          </Section>

          {displayFilterSection()}

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

      <ModalWrapper isOpen={modalOpen} onClose={handleCloseModal}>
        {!loading && data && <PreviewLeadsData data={data} />}
      </ModalWrapper>
    </>
  );
};
