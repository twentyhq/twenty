import { styled } from '@linaria/atomic';

import { DeviceSession, DeviceType } from '../types/security.types';

type DeviceSessionsProps = {
  sessions: DeviceSession[];
  onRevoke?: (sessionId: string) => void;
};

const DEVICE_ICONS: Record<DeviceType, string> = {
  desktop: '\u{1F5A5}',
  mobile: '\u{1F4F1}',
  tablet: '\u{1F4BB}',
  unknown: '\u{2753}',
};

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 2px solid #e5e7eb;
  font-weight: 600;
  color: #374151;
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
  vertical-align: middle;
`;

const CurrentBadge = styled.span`
  display: inline-block;
  padding: 2px 6px;
  border-radius: 10px;
  font-size: 10px;
  font-weight: 700;
  color: white;
  background: #22c55e;
  margin-left: 6px;
`;

const RevokeButton = styled.button`
  padding: 4px 10px;
  border: 1px solid #ef4444;
  border-radius: 6px;
  background: transparent;
  color: #ef4444;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: #fef2f2;
  }
  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }
`;

export const DeviceSessions = ({
  sessions,
  onRevoke,
}: DeviceSessionsProps) => {
  return (
    <Table>
      <thead>
        <tr>
          <Th>Device</Th>
          <Th>Browser</Th>
          <Th>IP / Location</Th>
          <Th>Last Active</Th>
          <Th />
        </tr>
      </thead>
      <tbody>
        {sessions.map((session) => (
          <tr key={session.id}>
            <Td>
              {DEVICE_ICONS[session.deviceType]} {session.deviceName}
              {session.isCurrent && <CurrentBadge>Current</CurrentBadge>}
            </Td>
            <Td>{session.browser}</Td>
            <Td>
              {session.ipAddress} &middot; {session.location}
            </Td>
            <Td>{new Date(session.lastActiveAt).toLocaleString()}</Td>
            <Td>
              <RevokeButton
                disabled={session.isCurrent}
                onClick={() => onRevoke?.(session.id)}
              >
                Revoke
              </RevokeButton>
            </Td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};
