import { styled } from '@linaria/atomic';

import { BankConnection, BankConnectionStatus } from '../types/banking.types';

type BankConnectionsProps = {
  connections: BankConnection[];
  onReconnect?: (connectionId: string) => void;
  onSync?: (connectionId: string) => void;
};

const STATUS_COLORS: Record<BankConnectionStatus, string> = {
  connected: '#22c55e',
  syncing: '#3b82f6',
  error: '#ef4444',
  disconnected: '#94a3b8',
  pending_auth: '#f59e0b',
};

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 12px;
`;

const Card = styled.div`
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const BankName = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const StatusDot = styled.span<{ color: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${(props) => props.color};
`;

const AccountNumber = styled.div`
  font-size: 12px;
  color: #6b7280;
  font-family: monospace;
`;

const Balance = styled.div`
  font-size: 20px;
  font-weight: 700;
  margin: 8px 0;
  font-variant-numeric: tabular-nums;
`;

const CardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const SyncMeta = styled.span`
  font-size: 11px;
  color: #6b7280;
`;

const ActionButton = styled.button`
  padding: 4px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 12px;
  &:hover {
    background: #f9fafb;
  }
`;

const ErrorMessage = styled.div`
  font-size: 11px;
  color: #ef4444;
  margin-top: 4px;
`;

export const BankConnections = ({
  connections,
  onReconnect,
  onSync,
}: BankConnectionsProps) => {
  const formatBalance = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount,
    );

  return (
    <Container>
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader>
            <BankName>{connection.bankName}</BankName>
            <StatusDot color={STATUS_COLORS[connection.status]} />
          </CardHeader>
          <AccountNumber>
            {connection.accountType} - ****
            {connection.accountNumber.slice(-4)}
          </AccountNumber>
          <Balance>
            {formatBalance(connection.balance, connection.currency)}
          </Balance>
          {connection.errorMessage !== null && (
            <ErrorMessage>{connection.errorMessage}</ErrorMessage>
          )}
          <CardFooter>
            <SyncMeta>
              {connection.lastSyncAt !== null
                ? `Synced ${new Date(connection.lastSyncAt).toLocaleString()}`
                : 'Never synced'}
            </SyncMeta>
            {connection.status === 'error' ||
            connection.status === 'disconnected' ? (
              <ActionButton
                onClick={() => onReconnect?.(connection.id)}
              >
                Reconnect
              </ActionButton>
            ) : (
              <ActionButton onClick={() => onSync?.(connection.id)}>
                Sync
              </ActionButton>
            )}
          </CardFooter>
        </Card>
      ))}
    </Container>
  );
};
