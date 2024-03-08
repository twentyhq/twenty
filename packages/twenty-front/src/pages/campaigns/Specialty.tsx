/* eslint-disable no-restricted-imports */
import { useState } from 'react';
import { useQuery } from '@apollo/client';
import styled from '@emotion/styled';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { Select } from '@/ui/input/components/Select';
import { Section } from '@/ui/layout/section/components/Section';
import { GET_SPECIALTY } from '@/users/graphql/queries/getSpecialtyDetails';
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
export const Specialty = () => {
  const { setCurrentStep, currentStep } = useCampaign();

  let Specialty: any = [];
  const SpecialtyTypes: any = {};
  const [specialty, setSpecialty] = useState('');
  const [subSpecialty, setSubSpecialty] = useState('');
  const { loading: queryLoading, data: queryData } = useQuery(GET_SPECIALTY);

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

  const handleSpecialtySelectChange = (selectedValue: any) => {
    setSpecialty(selectedValue);
  };

  const handleSubSpecialtySelectChange = (selectedValue: any) => {
    setSubSpecialty(selectedValue);
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
              title="Specialty Type"
              description="Select a medical specialty that is focused on particular area of medical practice"
            />
            <Select
              fullWidth
              dropdownId="Specialty Type"
              value={specialty}
              options={Specialty}
              onChange={handleSpecialtySelectChange}
            />
          </Section>
          {specialty && (
            <Section>
              <H2Title
                title="Subspecialty Type"
                description="Select sub specialization within a medical specialty"
              />

              <Select
                fullWidth
                dropdownId="Sub Specialty Type"
                value={subSpecialty}
                options={SpecialtyTypes[specialty]}
                onChange={handleSubSpecialtySelectChange}
              />
            </Section>
          )}
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
