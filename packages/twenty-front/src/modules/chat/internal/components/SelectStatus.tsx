/* eslint-disable @nx/workspace-no-hardcoded-colors */
import styled from '@emotion/styled';
import { useContext } from 'react';
import { ChatContext } from '../context/chatContext';
import { ChatContextType } from '../types/chat';

interface StatusPillProps {
  status: 'Available' | 'Busy' | 'Away' | string;
}

interface BgColorProps {
  selected: boolean;
}

const StyledStatusPill = styled.div<StatusPillProps>`
  background-color: ${({ status }) => {
    switch (status) {
      case 'Available':
        return '#DDFCD8';
      case 'Busy':
        return '#FED8D8';
      case 'Away':
        return '#FFF6D7';
      default:
        return 'gray';
    }
  }};
  border-radius: ${({ theme }) => theme.border.radius.pill};
  color: ${({ status }) => {
    switch (status) {
      case 'Available':
        return '#2A5822';
      case 'Busy':
        return '#712727';
      case 'Away':
        return '#746224';
      default:
        return 'gray';
    }
  }};
  font-size: ${({ theme }) => theme.font.size.md};
  margin-left: ${({ theme }) => theme.spacing(2)};
  padding-block: ${({ theme }) => theme.spacing(0.5)};
  padding-inline: ${({ theme }) => theme.spacing(2)};
  width: fit-content;
`;

const StyledTextPill = styled.p<StatusPillProps>`
  display: flex;
  margin: 0;
  padding: 0;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    align-self: center;
    background-color: ${({ status }) => {
      switch (status) {
        case 'Available':
          return '#2A5822';
        case 'Busy':
          return '#712727';
        case 'Away':
          return '#746224';
        default:
          return 'gray';
      }
    }};
    border-radius: 50%;
    margin-right: ${({ theme }) => theme.spacing(1)};
  }
`;

const StyledBackgroundColor = styled.div<BgColorProps>`
  background-color: ${({ selected }) =>
    selected ? 'rgba(0, 0, 0, 0.04)' : 'transparent'};
  padding: ${({ theme }) => theme.spacing(1)};
  border-radius: ${({ theme }) => theme.border.radius.md};
  cursor: pointer;
  transition: background-color 0.2s;
`;

const StyledMainContainer = styled.div`
  background-color: #f1f1f1;
  border-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1)};
  left: 40px;
  padding: ${({ theme }) => theme.spacing(2)};
  position: absolute;
  top: 50px;
  width: 130px;
`;

export const SelectStatus = () => {
  const status = ['Available', 'Busy', 'Away'];

  const { setThisUserStatus, thisUserStatus } = useContext(
    ChatContext,
  ) as ChatContextType;

  return (
    <StyledMainContainer>
      {status.map((status) => (
        <StyledBackgroundColor
          onClick={() =>
            setThisUserStatus(status as 'Available' | 'Busy' | 'Away')
          }
          selected={thisUserStatus === status}
        >
          <StyledStatusPill status={status}>
            <StyledTextPill status={status}>{status}</StyledTextPill>
          </StyledStatusPill>
        </StyledBackgroundColor>
      ))}
    </StyledMainContainer>
  );
};
