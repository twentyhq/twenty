import { ActivityList } from '@/activities/components/ActivityList';
import { ActivityRow } from '@/activities/components/ActivityRow';
import { ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { SMSText } from '@/activities/types/SMSText';
import styled from '@emotion/styled';
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

export const SMSTexts = ({
  targetableObject,
}: {
  targetableObject: ActivityTargetableObject;
}) => {
  const texts: SMSText[] = [
    {
      sender: 'You',
      body: 'Ok will do',
      date: new Date(),
    },
    {
      sender: 'Your Agent',
      body: 'Please send over your completed underwriting form, then I can go ahead and submit it for approval. Let me know if you have any questions on completing the form',
      date: new Date(2025, 2, 28),
    },
    {
      sender: 'Byrider Admin',
      body: 'New recommendation: 2018 Kia Forte just listed for sale at our Philadelphia location. Find out more at this link: https://www.byrider.com/inventory',
      date: new Date(2025, 2, 23),
    },
    {
      sender: 'Byrider Admin',
      body: "Welcome to Byrider! You're signed up for texts regarding upcoming appointments, new inventory, and more. View your profile and manage preferences here:",
      date: new Date(2025, 2, 18),
    },
  ];

  // can't click on each text, also not grouped by 'thread'
  return (
    <StyledContainer>
      <Section>
        <StyledH1Title
          title={
            <>
              SMS Text History
              <StyledTextCount>{texts.length}</StyledTextCount>
            </>
          }
          fontColor={H1TitleFontColor.Primary}
        />

        <ActivityList>
          {texts?.map((text) => (
            <ActivityRow onClick={() => {}}>
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