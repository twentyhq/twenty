import { ActivityList } from '@/activities/components/ActivityList';
import { ActivityRow } from '@/activities/components/ActivityRow';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { SMSText, TwilioMessage } from '@/activities/types/SMSText';
import styled from '@emotion/styled';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { H1Title, H1TitleFontColor, Section } from 'twenty-ui';
import { formatToHumanReadableDate } from '~/utils/date-utils';

// Styled components copied from EmailThread
const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(6)};
  padding: ${({ theme }) => theme.spacing(6, 6, 2)};
  height: 100%;
  overflow: auto;
`;
const StyledH1Title = styled(H1Title)`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;
const StyledTextCount = styled.span`
  color: ${({ theme }) => theme.font.color.light};
`;
const StyledSenderNames = styled.span`
  display: flex;
  margin: ${({ theme }) => theme.spacing(0, 1)};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const StyledBody = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;
const StyledReceivedAt = styled.div`
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ theme }) => theme.font.weight.regular};
  padding: ${({ theme }) => theme.spacing(0, 1)};
  margin-left: auto;
`;

// // Call API with twilio node package
// import twilio from 'twilio';
// const client = twilio(accountSid, authToken);
// const smsTextDataSelector = selectorFamily({
//   key: 'smsTextDataSelector',
//   get: (targetableObject) => async () => {
//     const messages = await client.messages.list({ limit: 3 });
//     messages.forEach((m) => console.log(m.body));
//   },
// });

export const SMSTexts = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {

// //   const fakeTexts: SMSText[] = [
// //     {
// //       id: '1',
// //       sender: 'You',
// //       body: 'Ok will do',
// //       date: new Date(),
// //     },
// //     {
// //       id: '2',
// //       sender: 'Your Agent',
// //       body: 'Please send over your completed underwriting form, then I can go ahead and submit it for approval. Let me know if you have any questions on completing the form',
// //       date: new Date(2025, 2, 28),
// //     },
// //     {
// //       id: '3',
// //       sender: 'Byrider Admin',
// //       body: 'New recommendation: 2018 Kia Forte just listed for sale at our Philadelphia location. Find out more at this link: https://www.byrider.com/inventory',
// //       date: new Date(2025, 2, 23),
// //     },
// //     {
// //       id: '4',
// //       sender: 'Byrider Admin',
// //       body: "Welcome to Byrider! You're signed up for texts regarding upcoming appointments, new inventory, and more. View your profile and manage preferences here:",
// //       date: new Date(2025, 2, 18),
// //     },
// //   ];

  const [textData, setTextData] = useState([]);

  useEffect(() => {
    async function fetchTexts() {
        const apiUrl = process.env.REACT_APP_TWILIO_API_URL;
        const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID as string;
        const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN as string;
    
        try {
          const response = await axios.get(
            // doesn't filter by user's phone number yet
            `${apiUrl}/2010-04-01/Accounts/${accountSid}/Messages.json`,
            {
              auth: {
                username: accountSid,
                password: authToken,
              },
            },
          );
        //   console.log('Twilio messages:', response.data.messages);
          setTextData(response.data.messages);
        } catch (error) {
          console.error('Error fetching Twilio messages:', error);
          throw error;
        }
    }
    fetchTexts();
  });

  const transformedTexts = textData.map((text: TwilioMessage) => ({
    id: text.sid,
    sender: text.from,
    body: text.body,
    date: new Date(text.date_sent),
  }));

//   console.log('transformed', transformedTexts);

  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              SMS Text History
              <StyledTextCount>{transformedTexts.length}</StyledTextCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />

        <ActivityList>
          {transformedTexts?.map((text : SMSText) => (
            // can't click on each text
            <ActivityRow onClick={() => {}} key={text.id}>
              <StyledSenderNames>{text.sender}</StyledSenderNames>
              <StyledBody>{text.body}</StyledBody>
              <StyledReceivedAt>
                {formatToHumanReadableDate(text.date)}
              </StyledReceivedAt>
            </ActivityRow>
          ))}
        </ActivityList>
      </Section>
    </StyledContainer>
  );
};