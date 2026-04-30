import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { MobileSessionData } from '../types/mobile.types';

const MOCK_SESSIONS: MobileSessionData[] = [
  { id: 'MS-1', userName: 'Ana Torres', device: 'iPhone 15 Pro', os: 'iOS 19.2', appVersion: '2.4.1', lastActiveAt: '2026-04-29T09:15:00Z', isOnline: true },
  { id: 'MS-2', userName: 'Luis Reyes', device: 'Samsung Galaxy S25', os: 'Android 16', appVersion: '2.4.0', lastActiveAt: '2026-04-29T08:45:00Z', isOnline: true },
  { id: 'MS-3', userName: 'Carlos Mendez', device: 'Pixel 9', os: 'Android 16', appVersion: '2.3.8', lastActiveAt: '2026-04-28T17:30:00Z', isOnline: false },
  { id: 'MS-4', userName: 'Maria Lopez', device: 'iPad Air M3', os: 'iPadOS 19.2', appVersion: '2.4.1', lastActiveAt: '2026-04-29T07:00:00Z', isOnline: false },
];

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const StyledTh = styled.th`
  text-align: left;
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.font.color.tertiary};
  border-bottom: 1px solid ${themeCssVariables.border.color.medium};
`;

const StyledTd = styled.td`
  padding: ${themeCssVariables.spacing[2]};
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;

const StyledOnlineDot = styled.span<{ isOnline: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
  background: ${({ isOnline }) =>
    isOnline ? themeCssVariables.color.green : themeCssVariables.color.gray50};
`;

export const SessionList = () => {
  useLingui();

  return (
    <StyledContainer>
      <StyledTitle>{t`Mobile Sessions`}</StyledTitle>
      <StyledTable>
        <thead>
          <tr>
            <StyledTh>{t`User`}</StyledTh>
            <StyledTh>{t`Device`}</StyledTh>
            <StyledTh>{t`OS`}</StyledTh>
            <StyledTh>{t`App Version`}</StyledTh>
            <StyledTh>{t`Status`}</StyledTh>
          </tr>
        </thead>
        <tbody>
          {MOCK_SESSIONS.map((session) => (
            <tr key={session.id}>
              <StyledTd>{session.userName}</StyledTd>
              <StyledTd>{session.device}</StyledTd>
              <StyledTd>{session.os}</StyledTd>
              <StyledTd>{session.appVersion}</StyledTd>
              <StyledTd>
                <StyledOnlineDot isOnline={session.isOnline} />
                {session.isOnline ? t`Online` : t`Offline`}
              </StyledTd>
            </tr>
          ))}
        </tbody>
      </StyledTable>
    </StyledContainer>
  );
};
