import { ActivityList } from '@/activities/components/ActivityList';
import { ActivityRow } from '@/activities/components/ActivityRow';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { SMSText, TwilioMessage } from '@/activities/types/SMSText';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { Person } from '@/people/types/Person';
import styled from '@emotion/styled';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
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

const StyledScrollableContainer = styled.div`
  max-height: 70vh;
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

export const SMSTexts = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const [textData, setTextData] = useState<any[]>([]);

  const { record: person, loading } = useFindOneRecord<Person>({
    objectNameSingular: targetableObject.targetObjectNameSingular,
    objectRecordId: targetableObject.id,
    recordGqlFields: {
      phones: true,
    },
  });

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line prefer-arrow/prefer-arrow-functions
    async function fetchTexts() {
      if (!person || loading) return;

      const apiUrl = process.env.REACT_APP_TWILIO_API_URL;
      const accountSid = process.env.REACT_APP_TWILIO_ACCOUNT_SID as string;
      const authToken = process.env.REACT_APP_TWILIO_AUTH_TOKEN as string;
      const personPhoneNumber = `${person.phones.primaryPhoneCallingCode}${person.phones.primaryPhoneNumber}`;

      try {
        const [toResponse, fromResponse] = await Promise.all([
          await axios.get(
            `${apiUrl}/2010-04-01/Accounts/${accountSid}/Messages.json?To=${personPhoneNumber}`,
            {
              auth: {
                username: accountSid,
                password: authToken,
              },
            },
          ),
          await axios.get(
            `${apiUrl}/2010-04-01/Accounts/${accountSid}/Messages.json?From=${personPhoneNumber}`,
            {
              auth: {
                username: accountSid,
                password: authToken,
              },
            },
          ),
        ]);

        const texts = [
          ...toResponse.data.messages,
          ...fromResponse.data.messages,
        ];
        const textsSortedByDateDescending = texts.sort(
          (a, b) =>
            new Date(a.date_sent).valueOf() - new Date(b.date_sent).valueOf(),
        );
        setTextData(textsSortedByDateDescending);
        //   console.log('Twilio response sorted:', textsSortedByDateDescending);
      } catch (error) {
        console.error('Error fetching Twilio messages:', error);
        throw error;
      }
    }
    fetchTexts();
  }, [person, loading]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [textData]);

  const transformedTexts = textData.map((text: TwilioMessage) => ({
    id: text.sid,
    sender: text.from,
    body: text.body,
    date: new Date(text.date_sent),
  }));

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

        <StyledScrollableContainer ref={scrollRef}>
          <ActivityList>
            {transformedTexts?.map((text: SMSText) => (
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
        </StyledScrollableContainer>
      </Section>
    </StyledContainer>
  );
};
