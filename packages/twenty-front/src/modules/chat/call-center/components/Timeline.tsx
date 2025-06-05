import { getCleanName } from '@/chat/call-center/utils/getCleanName';
import { MessageEventType } from '@/chat/types/MessageEventType';
import { MessageType } from '@/chat/types/MessageType';
import { ITimeline } from '@/chat/types/WhatsappDocument';
import { formatDate } from '@/chat/utils/formatDate';
import styled from '@emotion/styled';
// eslint-disable-next-line no-restricted-imports
import { IconPin } from '@tabler/icons-react';

const StyledActivityGroup = styled.div`
  display: flex;
  flex-flow: column;
  gap: ${({ theme }) => theme.spacing(4)};
  margin-bottom: ${({ theme }) => theme.spacing(4)};
  margin-left: ${({ theme }) => theme.spacing(4)};
  max-width: 320px;
`;

const StyledActivityGroupContainer = styled.div`
  padding-bottom: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(2)};
  position: relative;
`;

const StyledActivityGroupBar = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.xl};
  display: flex;
  flex-direction: column;
  height: 100%;
  justify-content: center;
  position: absolute;
  top: 0;
  width: 24px;
`;

const StyledTimelineItemContainer = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  height: 'auto';
  margin-right: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
  overflow: hidden;
`;

const StyledLeftContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const StyledIconContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.font.color.tertiary};
  height: 16px;
  width: 16px;
  margin: 5px;
  user-select: none;
  text-decoration-line: underline;
  z-index: 2;
`;

const StyledVerticalLineContainer = styled.div`
  display: flex;
  flex-shrink: 0;
  justify-content: center;
  z-index: 2;
  height: 100%;
`;

const StyledVerticalLine = styled.div`
  background: ${({ theme }) => theme.border.color.light};
  width: 2px;
  height: 100%;
`;

const StyledSummary = styled.summary`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: row;
  gap: ${({ theme }) => theme.spacing(1)};
  color: ${({ theme }) => theme.font.color.primary};
  flex-direction: column;
`;

const StyledSummaryTitle = styled.p`
  color: ${({ theme }) => theme.font.color.primary};
  font-weight: bold;
  margin: 0;
  padding: 0;
  text-align: left;
  white-space: nowrap;
`;

const StyledSummaryDescription = styled.p`
  padding: 0;
  margin: 0;
  color: ${({ theme }) => theme.font.color.tertiary};
  text-align: left;
`;

const StyledItemContainer = styled.div<{ isMarginBottom?: boolean }>`
  align-items: flex-start;
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  overflow: hidden;
  margin-bottom: ${({ isMarginBottom, theme }) =>
    isMarginBottom ? theme.spacing(3) : 0};
  min-height: 26px;
  max-width: 160px;
`;

const StyledItemTitleContainer = styled(StyledItemContainer)`
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 80px;
`;

const StyledItemTitleDate = styled.summary`
  align-items: center;
  flex: 1;
  color: ${({ theme }) => theme.font.color.tertiary};
  display: flex;
  gap: ${({ theme }) => theme.spacing(1)};
  max-width: 80px;
  justify-content: center;
`;

const SummaryComponent = ({ item }: { item: ITimeline }) => {
  let message;

  switch (item.event) {
    case MessageType.STARTED:
      message = `${MessageEventType.STARTED}`;
      break;
    case MessageType.TRANSFER:
      message = `${MessageEventType.TRANSFER} ${item.transferTo}`;
      break;
    case MessageType.END:
      message = `${MessageEventType.END}`;
      break;
    case MessageType.ONHOLD:
      message = `${MessageEventType.ONHOLD}`;
      break;
    default:
      break;
  }

  return (
    <>
      <StyledSummaryTitle>{getCleanName(item.agent ?? '')}</StyledSummaryTitle>
      <StyledSummaryDescription>{message}</StyledSummaryDescription>
    </>
  );
};

export const Timeline = ({ data }: { data: ITimeline[] }) => {
  return (
    <StyledActivityGroup>
      <StyledActivityGroupContainer>
        <StyledActivityGroupBar />
        {data.map((item, index) => {
          const isLastEvent = index === data.length - 1;
          return (
            <StyledTimelineItemContainer key={index}>
              <StyledLeftContainer>
                <StyledIconContainer>
                  <IconPin />
                </StyledIconContainer>
                {!isLastEvent && (
                  <StyledVerticalLineContainer>
                    <StyledVerticalLine />
                  </StyledVerticalLineContainer>
                )}
              </StyledLeftContainer>
              <StyledItemContainer isMarginBottom={!isLastEvent}>
                <StyledSummary>
                  <SummaryComponent item={item} />
                </StyledSummary>
              </StyledItemContainer>
              <StyledItemTitleContainer isMarginBottom={!isLastEvent}>
                <StyledItemTitleDate>
                  {formatDate(item.date).date}
                </StyledItemTitleDate>
              </StyledItemTitleContainer>
            </StyledTimelineItemContainer>
          );
        })}
      </StyledActivityGroupContainer>
    </StyledActivityGroup>
  );
};
