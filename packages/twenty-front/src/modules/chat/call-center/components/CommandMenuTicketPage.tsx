import { Timeline } from '@/chat/call-center/components/Timeline';
import { InfoSection } from '@/chat/internal/components/InfoSection';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Person } from '@/people/types/Person';
import { RightDrawerStepListContainer } from '@/workflow/workflow-steps/components/RightDrawerWorkflowSelectStepContainer';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import { selectedChatState } from '@/chat/call-center/state/selectedChatState';
import { ITimeline } from '@/chat/types/WhatsappDocument';
import { formatDate } from '@/chat/utils/formatDate';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
  IconHelp,
  IconIdBadge2,
  IconMail,
  IconPhone,
  IconPlus,
  IconProgressCheck,
  IconUser,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { v4 } from 'uuid';

const StyledDiv = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: ${({ theme }) => theme.spacing(13.75)};
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  position: relative;
`;

const StyledTicketHeader = styled.div`
  font-size: ${({ theme }) => theme.font.size.lg};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: 600;
`;

const StyledProfileData = styled.div`
  display: flex;
  flex-direction: column;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledButtonsContainer = styled.div`
  padding: ${({ theme }) => theme.spacing(3)};
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-bottom: ${({ theme }) => theme.spacing(3)};
`;

const StyledTimelineHeader = styled.div`
  font-size: ${({ theme }) => theme.font.size.md};
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: 600;
  padding: ${({ theme }) => theme.spacing(3)};
`;

const StyledTimelineDividerContainer = styled.div`
  align-items: center;
  display: flex;
`;

const StyledTimelineTitle = styled.div`
  margin: ${({ theme }) => theme.spacing(3)};
  color: ${({ theme }) => theme.font.color.primary};
  white-space: nowrap;
`;

const StyledTimelineDivider = styled.div`
  height: 1px;
  width: 100%;
  margin: ${({ theme }) => theme.spacing(3)};
  background: ${({ theme }) => theme.background.transparent.light};
`;

export const CommandMenuTicketPage = () => {
  const EMAIL_EXAMPLE = 'email@example.com';

  const selectedChat = useRecoilValue(selectedChatState);

  const [formattedTimeline, setFormattedTimeline] = useState<string[]>([]);

  const { createOneRecord: createOneOpportunity } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });

  const { createOneRecord: createOnePerson } = useCreateOneRecord({
    objectNameSingular: CoreObjectNameSingular.Person,
  });

  // const { createOneRecord: createOneSupport } = useCreateOneRecord({
  //   objectNameSingular: CoreObjectNameSingular.Support,
  // });

  const { records } = useFindManyRecords<Person>({
    objectNameSingular: CoreObjectNameSingular.Person,
    filter: {
      or: [
        {
          additionalEmails: {
            eq: EMAIL_EXAMPLE,
          },
        },
        {
          phones: {
            eq: selectedChat?.client.phone,
          },
        },
      ],
    },
  });

  const handleAddButtonClick = async () => {
    let personId: string | undefined;

    if (records.length > 0) {
      personId = records[0].id;
    } else {
      const rawPhone = selectedChat?.client.phone || '';
      const callingCode = rawPhone.slice(0, 2);
      const phoneNumber = rawPhone.slice(2);

      const newPerson = await createOnePerson({
        id: v4(),
        name: {
          firstName: selectedChat?.client.name,
          lastName: '',
        },
        emails: { primaryEmail: EMAIL_EXAMPLE },

        phones: {
          primaryPhoneNumber: phoneNumber,
          primaryPhoneCountryCode: 'BR',
          primaryPhoneCallingCode: `+${callingCode}`,
          additionalPhones: null,
        },
        position: 'first',
      });

      personId = newPerson?.id;
    }

    createOneOpportunity({
      id: v4(),
      name: selectedChat?.client.name,
      position: 'first',
      pointOfContactId: personId,
    });
  };

  const handleOpenSupportTicket = async () => {
    // TO DO: Implement functionality to open support ticket
    console.log('Open support ticket');
    // createOneSupport({
    //   id: v4(),
    //   name: ticketData.name,
    //   email: ticketData.email,
    //   phone: ticketData.phone,
    //   position: 'first',
    // });
  };

  const getUniqueFormattedDates = (timeline: ITimeline[]) => {
    const formattedDate = timeline.map((item) => formatDate(item.date).date);
    const uniqueDate = Array.from(new Set(formattedDate));
    return uniqueDate;
  };

  useEffect(() => {
    const dates = getUniqueFormattedDates(selectedChat?.timeline ?? []);
    setFormattedTimeline(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEventsByDate = (date: string) => {
    return (
      selectedChat?.timeline.filter(
        (item) => formatDate(item.date).date === date,
      ) ?? []
    );
  };

  const formatMonthYear = (date: string): string => {
    const formattedDate = parse(date, 'dd/MM/yyyy', new Date());
    return format(formattedDate, 'MMMM yyyy');
  };

  return (
    <RightDrawerStepListContainer>
      <StyledDiv>
        <StyledTicketHeader>{'Service Data'}</StyledTicketHeader>
      </StyledDiv>
      <StyledProfileData>
        <InfoSection
          Icon={IconUser}
          title={'Name'}
          data={selectedChat?.client.name}
          type={'text'}
        />
        <InfoSection
          Icon={IconMail}
          title={'Email'}
          data={EMAIL_EXAMPLE}
          type={'text'}
        />
        <InfoSection
          Icon={IconPhone}
          title={'Phone'}
          data={selectedChat?.client.phone}
          type={'text'}
        />
        <InfoSection
          Icon={IconProgressCheck}
          title={'Status'}
          type={'select'}
          data={selectedChat?.status}
        />
        <InfoSection
          Icon={IconIdBadge2}
          title={'Sector'}
          type={'select'}
          data={selectedChat?.sector}
        />
      </StyledProfileData>
      <StyledButtonsContainer>
        <Button
          Icon={IconPlus}
          title={'Add opportunity'}
          size="medium"
          variant="secondary"
          onClick={handleAddButtonClick}
          to={'/objects/opportunities'}
          target="_blank"
          justify="center"
        />
        <Button
          Icon={IconHelp}
          title={'Open support ticket'}
          size="medium"
          variant="secondary"
          onClick={handleOpenSupportTicket}
          to={'/objects/supports'}
          target="_blank"
          justify="center"
        />
      </StyledButtonsContainer>
      <StyledTimelineHeader>{'Timeline'}</StyledTimelineHeader>
      {formattedTimeline.map((date, index) => (
        <div key={index}>
          <StyledTimelineDividerContainer>
            <StyledTimelineTitle>{formatMonthYear(date)}</StyledTimelineTitle>
            <StyledTimelineDivider />
          </StyledTimelineDividerContainer>
          <div>
            <Timeline data={getEventsByDate(date)} />
          </div>
        </div>
      ))}
    </RightDrawerStepListContainer>
  );
};
