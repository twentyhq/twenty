/* eslint-disable no-restricted-imports */
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';
import { useMutation } from '@apollo/client';
import { v4 as uuidv4 } from 'uuid';
import {
  IconCalendar,
  IconPlayerPlay,
  IconPlus,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import {
  Button,
  Checkbox,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
  Select,
  TextArea,
  TextInput,
} from 'tsup.ui.index';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useState } from 'react';
import { PageHeader } from '@/ui/layout/page/PageHeader';
import { useLazyQuery } from '@apollo/client';
import { FILTER_LEADS } from '@/users/graphql/queries/filterLeads';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { PreviewLeadsData } from '~/pages/campaigns/PreviewLeadsData';
import { ModalWrapper } from '@/spreadsheet-import/components/ModalWrapper';
import DateTimePicker from '@/ui/input/components/internal/date/components/DateTimePicker';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ADD_SEGMENT } from '@/users/graphql/queries/addSegment';

const StyledBoardContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  flex-direction: column;
  justify-content: flex-start;
  background: ${({ theme }) => theme.background.noisy};
  padding: ${({ theme }) => theme.spacing(2)};
  overflow-y: scroll;
`;

const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  overflow-y: scroll;
`;

const StyledInputCard = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: auto%;
  justify-content: space-between;
  width: 70%;
  align-items: center;
`;

const StyledButton = styled.span`
  display: flex;
  gap: 15px;
  width: 100%;
  margin-right: ${({ theme }) => theme.spacing(4)};
`;

const StyledComboInputContainer1 = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(6)};
  }
  width: 100%;
  padding-top: ${({ theme }) => theme.spacing(6)};
  justify-content: space-evenly;
`;

const StyledCheckboxContainer = styled.div`
  display: flex;
  align-items: center;
  margin: ${({ theme }) => theme.spacing(2)};
`;

const SytledHR = styled.hr`
  background: ${GRAY_SCALE.gray0};
  color: ${GRAY_SCALE.gray0};
  bordercolor: ${GRAY_SCALE.gray0};
  height: 0.2px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(10)};
`;

const StyledTitleBar = styled.h3`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-top: ${({ theme }) => theme.spacing(4)};
  place-items: center;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
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

export const Segment = () => {
  const { setLeadData, leadData } = useCampaign();
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<
    Record<string, string>
  >({});
  const [filterDivs, setFilterDivs] = useState<string[]>([]);
  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');
  const [showStartDateTimePicker, setShowStartDateTimePicker] = useState(false);
  const [showStopDateTimePicker, setShowStopDateTimePicker] = useState(false);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [stopDate, setStopDate] = useState<Date | null>(null);
  const { enqueueSnackBar } = useSnackBar();
  const [filterString, setFilterString] = useState("");
  const handleFilterButtonClick = () => {
    const key = `filter-${filterDivs.length + 1}`;
    setFilterDivs([...filterDivs, key]);
  };

  const handleFilterRemove = (keyToRemove: string) => {
    setFilterDivs(filterDivs.filter((key) => key !== keyToRemove));
    setSelectedFilterOptions((prevOptions) => {
      const {
        [keyToRemove + '-conditions']: _,
        [keyToRemove + '-field']: __,
        [keyToRemove + '-operators']: ___,
        ...rest
      } = prevOptions;
      return rest;
    });
  };
  const createOptions = (options: any[]) =>
    options.map((option: any) => ({ label: option, value: option }));
  const [modalOpen, setModalOpen] = useState(false);
  const conditions = createOptions(['AND', 'OR']);
  const operators = createOptions(['=', '>', '<', '!=']);
  const fields = createOptions([
    'advertisementSource',
    'campaignName',
    'location',
    'age',
  ]);

  const handleSelectChange = (key: string, value: string) => {
    setSelectedFilterOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
  };

  const [filterleads, { loading, error, data }] = useLazyQuery(FILTER_LEADS, {
    fetchPolicy: 'network-only',
  });

  const [addSegment] = useMutation(ADD_SEGMENT);

  const handleCloseModal = () => {};

  const handleRunQuery = async () => {
    const filter:any= {};

    filterDivs.forEach((key) => {
      const condition = selectedFilterOptions[`${key}-conditions`];
      const field = selectedFilterOptions[`${key}-field`];
      const operator = selectedFilterOptions[`${key}-operators`];
      const value = selectedFilterOptions[`${key}-value`];

      if (field && operator && value) {
        const conditionFilter = condition === 'OR' ? 'or' : 'and';

        if (!filter[conditionFilter]) {
          filter[conditionFilter] = [];
        }
        filter[conditionFilter].push({
          [field]: { ilike: `%${value}%` },
        });
      }
    });
    // const filterJson =  await filter.json()
    
    let filterString = `{ "filter": ${JSON.stringify(filter)}`;

    console.log('This is the filter:', filterString);

    const orderBy = { position: 'AscNullsFirst' };
    try {
      const result = await filterleads({ variables: { filter, orderBy } });
      console.log('Data:', result.data);

      setLeadData({ ...leadData, data: result });
      result.data.leads.edges.forEach((edge: { node: any }) => {
        const lead = edge.node;
        console.log('Lead ID:', lead.id);
        console.log('Lead Email:', lead.email);
        console.log('Lead Age:', lead.age);
        console.log('Lead Advertisement Name:', lead.advertisementName);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
    setFilterString(filterString)
  };

  
  const handlesave = async () => {
    try {
      const variables = {
        input: {
          id: uuidv4(),
          segmentName: segmentName,
          segmentDescription: segmentDescription,
          filters: filterString,
        },
      };
      const { data } = await addSegment({
        variables: variables,
      });
      enqueueSnackBar('Segment saved successfully', {
        variant: 'success',
      });
    } catch (errors: any) {
      console.log('Error saving segment', error);
      enqueueSnackBar(errors.message + 'Error while adding Campaign', {
        variant: 'error',
      });
    }
    
  };

  return (
    <>
      <PageContainer>
        <PageHeader title="Segment" Icon={IconUsersGroup}></PageHeader>
        <StyledBoardContainer>
          <StyledInputCard>
            <Section>
              <H2Title
                title="Segment Name"
                description="Enter Segment name here"
              />
              <TextInput
                placeholder={'Enter segment name'}
                value={segmentName}
                onChange={(e) => setSegmentName(e)}
                name="segmentName"
                required
                fullWidth
              />
            </Section>
            <SytledHR />
            <Section>
              <H2Title
                title="Segment Description"
                description="Enter segment description"
              />
            </Section>
            <TextArea
              placeholder={'Enter segment description'}
              minRows={5}
              value={segmentDescription}
              onChange={(e) => setSegmentDescription(e)}
            />

            <SytledHR />

            <StyledButton>
              <StyledButton>
                <Button
                  Icon={IconPlus}
                  title="Filter"
                  onClick={handleFilterButtonClick}
                />
              </StyledButton>

              <Button
                Icon={IconPlayerPlay}
                title="Run Query"
                onClick={handleRunQuery}
              />

              <Button
                title="Save"
                variant="primary"
                accent="dark"
                onClick={handlesave}
                // size="medium"
                // onClick={handlesave}
              />
            </StyledButton>
            {filterDivs.map((key) => (
              <div key={key}>
                <StyledComboInputContainer1>
                  <Button
                    Icon={IconX}
                    onClick={() => handleFilterRemove(key)}
                  />

                  <Select
                    fullWidth
                    dropdownId={`conditions-${key}`}
                    value={selectedFilterOptions[`${key}-conditions`] || ''}
                    onChange={(value: string) =>
                      handleSelectChange(`${key}-conditions`, value)
                    }
                    options={conditions}
                  />
                  <Select
                    fullWidth
                    dropdownId={`field-${key}`}
                    value={selectedFilterOptions[`${key}-field`] || ''}
                    onChange={(value: string) =>
                      handleSelectChange(`${key}-field`, value)
                    }
                    options={fields}
                  />

                  <Select
                    fullWidth
                    dropdownId={`operators-${key}`}
                    value={selectedFilterOptions[`${key}-operators`] || ''}
                    onChange={(value: string) =>
                      handleSelectChange(`${key}-operators`, value)
                    }
                    options={operators}
                  />

                  <TextInput
                    placeholder={'Value'}
                    value={selectedFilterOptions[`${key}-value`] || ''}
                    onChange={(e) => handleSelectChange(`${key}-value`, e)}
                    name="value"
                    required
                    fullWidth
                  />
                </StyledComboInputContainer1>
              </div>
            ))}
            <SytledHR />
            {!loading && data && <PreviewLeadsData data={data} />}
          </StyledInputCard>
        </StyledBoardContainer>
      </PageContainer>

      <ModalWrapper isOpen={modalOpen} onClose={handleCloseModal}>
        <Section>
          <StyledTitleBar>
            <StyledTitle>Run Campaign</StyledTitle>
          </StyledTitleBar>
          <StyledButton>
            <StyledButton>
              <H2Title title="Start" />
            </StyledButton>

            <Section>
              <StyledCheckboxContainer>
                <Checkbox
                  checked={false}
                  indeterminate={false}
                  variant={CheckboxVariant.Primary}
                  size={CheckboxSize.Small}
                  shape={CheckboxShape.Squared}
                />
                <StyledLabel>Immediately</StyledLabel>
              </StyledCheckboxContainer>
              <StyledCheckboxContainer>
                <Checkbox
                  checked={showStartDateTimePicker}
                  onChange={() =>
                    setShowStartDateTimePicker(!showStartDateTimePicker)
                  }
                  indeterminate={false}
                  variant={CheckboxVariant.Primary}
                  size={CheckboxSize.Small}
                  shape={CheckboxShape.Squared}
                />
                <StyledLabel>
                  Start Date/Time <IconCalendar />
                </StyledLabel>
                {showStartDateTimePicker && (
                  <DateTimePicker
                    onChange={(selectedDate) => setStartDate(selectedDate)}
                    minDate={new Date()}
                    value={undefined}
                  />
                )}
              </StyledCheckboxContainer>
            </Section>
          </StyledButton>
          <SytledHR />
          <StyledButton>
            <StyledButton>
              <H2Title title="Stop" />
            </StyledButton>

            <Section>
              <StyledCheckboxContainer>
                <Checkbox
                  checked={false}
                  indeterminate={false}
                  variant={CheckboxVariant.Primary}
                  size={CheckboxSize.Small}
                  shape={CheckboxShape.Squared}
                />
                <StyledLabel>Immediately</StyledLabel>
              </StyledCheckboxContainer>
              <StyledCheckboxContainer>
                <Checkbox
                  checked={showStopDateTimePicker}
                  onChange={() =>
                    setShowStopDateTimePicker(!showStopDateTimePicker)
                  }
                  indeterminate={false}
                  variant={CheckboxVariant.Primary}
                  size={CheckboxSize.Small}
                  shape={CheckboxShape.Squared}
                />
                <StyledLabel>
                  Start Date/Time <IconCalendar />
                </StyledLabel>
                {showStopDateTimePicker && (
                  <DateTimePicker
                    onChange={(selectedDate) => setStopDate(selectedDate)}
                    minDate={new Date()}
                    value={undefined}
                  />
                )}
              </StyledCheckboxContainer>
            </Section>
          </StyledButton>
        </Section>
      </ModalWrapper>
    </>
  );
};

