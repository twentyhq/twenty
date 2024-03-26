import { useState } from 'react';
import styled from '@emotion/styled';
import { Section } from '@react-email/components';
import {
  Button,
  Checkbox,
  CheckboxShape,
  CheckboxSize,
  CheckboxVariant,
  TextArea,
  TextInput,
} from 'tsup.ui.index';

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
  height: 100%;
  width: 100%;
  margin: auto;
  align-items: center;
`;

const StyledInputCard = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 1005%;
  justify-content: space-between;
  width: 70%;
  align-items: center;
`;

const StyledCheckboxInput = styled.div`
  margin-top: ${({ theme }) => theme.spacing(4)};
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

const StyledAreaLabel = styled.span`
  align-content: flex-start;
  display: flex;
  flex-direction: column;
  margin-bottom: 2%;
  width: 100%;
`;
const StyledButton = styled.span`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const StyledTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.secondary};
  font-weight: ${({ theme }) => theme.font.weight.medium};
  font-size: ${({ theme }) => theme.font.size.md};
`;

const StyledCheckboxLabel = styled.span`
  margin-left: ${({ theme }) => theme.spacing(2)};
`;

const StyledComboInputContainer = styled.div`
  display: flex;
  flex-direction: row;
  > * + * {
    margin-left: ${({ theme }) => theme.spacing(4)};
  }
`;

export const CampaignForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  return (
    <>
      <StyledCard>
        <StyledTitleCard>
          <StyledTitle></StyledTitle>
        </StyledTitleCard>
        <StyledInputCard>
          <Section>
            <H2Title title="First Name" description="Enter your first name" />
            <TextInput
              placeholder={'Enter first name'}
              value={firstName}
              name="firstName"
              required
              fullWidth
              onChange={(e) => setFirstName(e)}
            />
          </Section>
          <Section>
            <H2Title title="Email" description="Enter your email address" />
            <TextInput
              placeholder={'Enter email address'}
              value={email}
              name="email"
              required
              fullWidth
              onChange={(e) => setEmail(e)}
            />
          </Section>
          <Section>
            <H2Title title="Last Name" description="Enter your last name" />
            <TextInput
              placeholder={'Enter last name'}
              value={lastName}
              name="lastName"
              required
              fullWidth
              onChange={(e) => setLastName(e)}
            />
          </Section>
          <Section>
            <H2Title
              title="Contact Number"
              description="Enter your contact number"
            />
            <TextInput
              placeholder={'Enter contact number'}
              value={contact}
              name="contact"
              required
              fullWidth
              onChange={(e) => setContact(e)}
            />
          </Section>

          <StyledAreaLabel>
            <Section>
              <H2Title
                title="Campaign Description"
                description="Describe the main objectives and goals of the campaign "
              />
            </Section>
            <TextArea
              value={comments}
              placeholder={'State the reason for the apppointment'}
              minRows={5}
              onChange={(e) => setComments(e)}
            />

            <StyledCheckboxInput>
              <H2Title
                title="Consent*"
                description="Read the terms and conditions before agreeing."
              />
            </StyledCheckboxInput>
            <StyledComboInputContainer>
              <Checkbox
                checked={false}
                indeterminate={false}
                variant={CheckboxVariant.Primary}
                size={CheckboxSize.Small}
                shape={CheckboxShape.Squared}
              />
              <StyledCheckboxLabel>
                I agree to the terms and conditions.
              </StyledCheckboxLabel>
            </StyledComboInputContainer>
          </StyledAreaLabel>
          <StyledButton>
            <Button title="Submit" variant="primary" accent="blue" />
          </StyledButton>
        </StyledInputCard>
      </StyledCard>
    </>
  );
};
