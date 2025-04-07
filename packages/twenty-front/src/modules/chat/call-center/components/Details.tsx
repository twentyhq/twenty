import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useCreateOneRecord } from '@/object-record/hooks/useCreateOneRecord';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { Person } from '@/people/types/Person';
import styled from '@emotion/styled';

import { Timeline } from '@/chat/call-center/components/Timeline';
import { InfoSection } from '@/chat/internal/components/InfoSection';
// eslint-disable-next-line no-restricted-imports
import { TicketDataType } from '@/chat/types/TicketDataType';
import { ITimeline } from '@/chat/types/WhatsappDocument';
import { formatDate } from '@/chat/utils/formatDate';
import { format, parse } from 'date-fns';
import { useEffect, useState } from 'react';
import {
  IconHelp,
  IconIdBadge2,
  IconMail,
  IconPhone,
  IconPlus,
  IconProgressCheck,
  IconUser,
  IconX,
} from 'twenty-ui/display';
import { Button, IconButton } from 'twenty-ui/input';
import { v4 } from 'uuid';

type DetailsProps = {
  ticketData: TicketDataType;
  setIsDetailsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const StyledMainContainer = styled.div`
  background-color: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  min-height: 100dvh;
  position: fixed;
  right: 0;
  top: 0;
  transition: transform 0.3s ease;
  width: 320px;
  z-index: 100;
`;

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

const StyledIconButton = styled(IconButton)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: ${({ theme }) => theme.spacing(13.75)} / 2;
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

const StyledTimelineContent = styled.div``;

export const Details = ({ ticketData, setIsDetailsOpen }: DetailsProps) => {
  // const { t } = useTranslation();
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
          email: {
            eq: ticketData.email,
          },
        },
        {
          phone: {
            eq: ticketData.phone,
          },
        },
      ],
    },
  });

  const [firstName, lastName = ''] = ticketData.name.split(' ', 2);

  const handleAddButtonClick = async () => {
    let personId: string | undefined;

    if (records.length > 0) {
      personId = records[0].id;
    } else {
      const newPerson = await createOnePerson({
        id: v4(),
        name: {
          firstName: firstName,
          lastName: lastName,
        },
        email: ticketData.email,
        phone: ticketData.phone,
        position: 'first',
      });

      personId = newPerson?.id;
    }

    createOneOpportunity({
      id: v4(),
      name: ticketData.name,
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
    const dates = getUniqueFormattedDates(ticketData.timeline);
    setFormattedTimeline(dates);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getEventsByDate = (date: string) => {
    return ticketData.timeline.filter(
      (item) => formatDate(item.date).date === date,
    );
  };

  const formatMonthYear = (date: string): string => {
    const formattedDate = parse(date, 'dd/MM/yyyy', new Date());
    return format(formattedDate, 'MMMM yyyy');
  };

  return (
    <StyledMainContainer style={{ height: '90%', overflow: 'auto' }}>
      <StyledDiv>
        <StyledTicketHeader>{'Service Data'}</StyledTicketHeader>
        <StyledIconButton
          Icon={IconX}
          variant="tertiary"
          accent="default"
          onClick={() => setIsDetailsOpen(false)}
        />
      </StyledDiv>
      <StyledProfileData>
        <InfoSection
          Icon={IconUser}
          title={'Name'}
          data={ticketData.name}
          type={'text'}
        />
        <InfoSection
          Icon={IconMail}
          title={'Email'}
          data={ticketData.email}
          type={'text'}
        />
        <InfoSection
          Icon={IconPhone}
          title={'Phone'}
          data={ticketData.phone}
          type={'text'}
        />
        <InfoSection
          Icon={IconProgressCheck}
          title={'Status'}
          type={'select'}
          data={ticketData.status}
        />
        <InfoSection
          Icon={IconIdBadge2}
          title={'Sector'}
          type={'select'}
          data={ticketData.sector}
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
          <StyledTimelineContent>
            <Timeline data={getEventsByDate(date)} />
          </StyledTimelineContent>
        </div>
      ))}
    </StyledMainContainer>
  );
};
