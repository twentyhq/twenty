/* eslint-disable prefer-arrow/prefer-arrow-functions */
/* eslint-disable no-restricted-imports */
import { ChangeEvent } from 'react';
import styled from '@emotion/styled';
import { IconArrowLeft } from '@tabler/icons-react';
import { IconArrowRight } from '@tabler/icons-react';
import {
  Checkbox,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
} from 'tsup.ui.index';

import { Button } from '@/ui/input/button/components/Button';
import { Section } from '@/ui/layout/section/components/Section';
import { useCampaign } from '~/pages/campaigns/CampaignUseContext';
import { H2Title } from '@/ui/display/typography/components/H2Title';
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
  align-items: center;
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  height: 50%;
  justify-content: space-evenly;
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
const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.light};
  font-size: ${({ theme }) => theme.font.size.xs};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  margin-bottom: ${({ theme }) => theme.spacing(1)};
  text-transform: uppercase;
  display: flex;
`;

const StyledCheckboxLabel = styled.span`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
  justify-content: flex-start;
`;

const StyledSection = styled(Section)`
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  margin-left: 0;
`;
export const MessagingChannel = () => {
  const { setCurrentStep, currentStep } = useCampaign();

  const onSelectCheckBoxChange = (
    _event: ChangeEvent<HTMLInputElement>,
    arg1: string,
  ): void => {
    throw new Error('Function not implemented.');
  };

  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <H2Title
              title="Messaging Channel"
              description="Choose the message channels that align with your audience's behaviors and preferences."
          />
         </StyledTitleCard>
        <StyledInputCard>
          <StyledSection>
            <StyledLabel>
              <Checkbox
                checked={false}
                indeterminate={false}
                onChange={(event) => onSelectCheckBoxChange(event, 'SMS')}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />{' '}
              <StyledCheckboxLabel>SMS </StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                checked={false}
                indeterminate={false}
                onChange={(event) => onSelectCheckBoxChange(event, 'Whatsapp')}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>WhatsApp</StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                checked={false}
                indeterminate={false}
                onChange={(event) => onSelectCheckBoxChange(event, 'GBM')}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>GBM</StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                // id="call-checkbox"
                checked={false}
                indeterminate={false}
                onChange={(event) => onSelectCheckBoxChange(event, 'Call')}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>CALL</StyledCheckboxLabel>
            </StyledLabel>
          </StyledSection>
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
