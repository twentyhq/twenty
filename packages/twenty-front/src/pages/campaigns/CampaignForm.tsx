import { useEffect, useState } from 'react';
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
import base64 from 'base64-js';
import { H2Title } from '@/ui/display/typography/components/H2Title';
import { useParams } from 'react-router-dom';
import AnimatedPlaceholder from '@/ui/layout/animated-placeholder/components/AnimatedPlaceholder';
import { AnimatedPlaceholderEmptyTextContainer } from '@/ui/layout/animated-placeholder/components/EmptyPlaceholderStyled';
import {
  AnimatedPlaceholderErrorContainer,
  AnimatedPlaceholderErrorTitle,
} from '@/ui/layout/animated-placeholder/components/ErrorPlaceholderStyled';
import { Spinner } from '@/ui/feedback/loader/components/spinner';

const StyledCard = styled.div`
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: ${({ theme }) => theme.font.color.secondary};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  display: flex;
  flex-direction: column;
  justify-content: center;
  background: ${({ theme }) => theme.background.primary};
  height: 95%;
  width: 70%;
  margin: auto;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing(2)}
  overflow-y: scroll;
`;

const StyledFormTitle = styled.h3`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledTitleContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`;

const StyledTitle = styled.h2`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: ${({ theme }) => theme.font.size.lg};
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
  padding: ${({ theme }) => theme.spacing(6)};
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

// const generateRandomId = (username: string, formId: string, campaignname: string) => {
//   const randomId = `${username}-${formId}-${campaignname}`;
//   const encodedRandomId = base64.fromByteArray(new TextEncoder().encode(randomId));
//   return encodedRandomId;
// }

// const username = "Ertha Creboe";
// const formname = "abc";
// const campaignname = "Healthy Lives";

// const randomId = generateRandomId(username, formname, campaignname);
// console.log("Encoded Random ID:", randomId);

export const CampaignForm = () => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [contact, setContact] = useState('');
  const [email, setEmail] = useState('');
  const [comments, setComments] = useState('');
  const [loading, setLoading] = useState(true);
  const [errorType, setErrorType] = useState('');
  const { userid } = useParams<{ userid: string }>();
  console.log('USERID', userid);

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/campaign?id=${userid}`,
        );
        if (!response.ok) {
          throw new Error('Failed to fetch user details');
        }
        const userData = await response.json();
        console.log('setting user details....');
        setFirstName(userData.name);
        setEmail(userData.email);
        setLoading(false);
      } catch (error: any) {
        console.error('error in fetching user details', error);
        if (error.message === 'Form expired') {
          setErrorType('formexpired');
        } else {
          setErrorType('othererror');
        }
      }
    };
    fetchUserDetails();
  }, [userid]);

  if (loading) {
    return (
      <>
        <AnimatedPlaceholderErrorContainer>
          <Spinner />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderErrorTitle>
              Collecting form data...
            </AnimatedPlaceholderErrorTitle>
          </AnimatedPlaceholderEmptyTextContainer>
        </AnimatedPlaceholderErrorContainer>
      </>
    );
  } else if (loading && errorType === 'formexpired') {
    return (
      <>
        <AnimatedPlaceholderErrorContainer>
          <AnimatedPlaceholder type="error404" />
          <AnimatedPlaceholderEmptyTextContainer>
            <AnimatedPlaceholderErrorTitle>
              Oops! We are not taking responses anymore.
            </AnimatedPlaceholderErrorTitle>
          </AnimatedPlaceholderEmptyTextContainer>
        </AnimatedPlaceholderErrorContainer>
      </>
    );
  }

  return (
    <>
      <StyledCard>
        <StyledTitleContainer>
          <StyledTitle>Campaign Form</StyledTitle>
        </StyledTitleContainer>
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
