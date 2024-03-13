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

import { H2Title } from '@/ui/display/typography/components/H2Title';
import { Button } from '@/ui/input/button/components/Button';
import { Section } from '@/ui/layout/section/components/Section';
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
  const { setCurrentStep, currentStep, campaignData, setCampaignData } =
    useCampaign();

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
    <>
      <StyledCard>
        <StyledTitleCard></StyledTitleCard>
        <StyledInputCard>
          <Section>
            <H2Title
              title="Messaging Channel"
              description="Choose the message channels that align with your audience's behaviors and preferences."
            />
          </Section>

          <StyledSection>
            <StyledLabel>
              <Checkbox
                checked={campaignData.SMS || false}
                indeterminate={false}
                onChange={(event) => {
                  onSelectCheckBoxChange(event, 'SMS');
                  setCampaignData({
                    ...campaignData,
                    SMS: event.target.checked,
                  });
                }}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />{' '}
              <StyledCheckboxLabel>SMS </StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                checked={campaignData.Whatsapp || false}
                indeterminate={false}
                onChange={(event) => {
                  onSelectCheckBoxChange(event, 'Whatsapp');
                  setCampaignData({
                    ...campaignData,
                    Whatsapp: event.target.checked,
                  });
                }}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>WhatsApp</StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                checked={campaignData.Email || false}
                indeterminate={false}
                onChange={(event) => {
                  onSelectCheckBoxChange(event, 'Email');
                  setCampaignData({
                    ...campaignData,
                    Email: event.target.checked,
                  });
                }}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>Email</StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                checked={campaignData.GBM || false}
                indeterminate={false}
                onChange={(event) => {
                  onSelectCheckBoxChange(event, 'GBM');
                  setCampaignData({
                    ...campaignData,
                    GBM: event.target.checked,
                  });
                }}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>GBM</StyledCheckboxLabel>
            </StyledLabel>

            <StyledLabel>
              <Checkbox
                // id="call-checkbox"
                checked={campaignData.CALL || false}
                indeterminate={false}
                onChange={(event) => {
                  onSelectCheckBoxChange(event, 'CALL');
                  setCampaignData({
                    ...campaignData,
                    CALL: event.target.checked,
                  });
                }}
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
