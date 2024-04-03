/* eslint-disable no-restricted-imports */
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import { GRAY_SCALE } from '@/ui/theme/constants/GrayScale';
import {
  IconPlayerPlay,
  IconPlus,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import { Button, Select, TextArea, TextInput } from 'tsup.ui.index';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useState } from 'react';
import { PageHeader } from '@/ui/layout/page/PageHeader';

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
  justify-content: space-between;
  width: 100%;
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

const SytledHR = styled.hr`
  background: ${GRAY_SCALE.gray0};
  color: ${GRAY_SCALE.gray0};
  bordercolor: ${GRAY_SCALE.gray0};
  height: 0.2px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(10)};
`;

export const Segment = () => {
  const [selectedFilterOptions, setSelectedFilterOptions] = useState<
    Record<string, string>
  >({});
  const [filterDivs, setFilterDivs] = useState<string[]>([]);
  const handleRunQuery = async () => {
    console.error('Run Query');
  };

  const [segmentName, setSegmentName] = useState('');
  const [segmentDescription, setSegmentDescription] = useState('');

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

  const conditions = createOptions(['AND', 'OR']);
  const operators = createOptions(['=', '>', '<', '!=']);
  const fields = createOptions(['Field1', 'Field2', 'Field3', 'Field4']);

  const handleSelectChange = (key: string, value: string) => {
    setSelectedFilterOptions((prevOptions) => ({
      ...prevOptions,
      [key]: value,
    }));
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
                size="medium"
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
          </StyledInputCard>
        </StyledBoardContainer>
      </PageContainer>
    </>
  );
};
