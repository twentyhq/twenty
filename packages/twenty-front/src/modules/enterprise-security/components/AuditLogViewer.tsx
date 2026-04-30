import { styled } from '@linaria/atomic';
import { useState } from 'react';

import { AuditAction, AuditLogEntry } from '../types/security.types';

type AuditLogViewerProps = {
  entries: AuditLogEntry[];
  onExport?: () => void;
};

const ALL_ACTIONS: AuditAction[] = [
  'login',
  'logout',
  'password_change',
  'role_change',
  'data_export',
  'record_delete',
  'setting_update',
];

const ACTION_COLORS: Record<AuditAction, string> = {
  login: '#22c55e',
  logout: '#6b7280',
  password_change: '#f59e0b',
  role_change: '#8b5cf6',
  data_export: '#3b82f6',
  record_delete: '#ef4444',
  setting_update: '#0ea5e9',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FilterBar = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterInput = styled.input`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
  &:focus {
    outline: 2px solid #3b82f6;
  }
`;

const FilterSelect = styled.select`
  padding: 6px 10px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 13px;
`;

const ExportButton = styled.button`
  margin-left: auto;
  padding: 6px 14px;
  border: 1px solid #3b82f6;
  border-radius: 6px;
  background: #3b82f6;
  color: white;
  font-size: 12px;
  cursor: pointer;
  &:hover {
    background: #2563eb;
  }
`;

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
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const ActionBadge = styled.span<{ color: string }>`
  padding: 2px 8px;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

export const AuditLogViewer = ({ entries, onExport }: AuditLogViewerProps) => {
  const [userFilter, setUserFilter] = useState('');
  const [actionFilter, setActionFilter] = useState<AuditAction | ''>('');
  const [dateFrom, setDateFrom] = useState('');

  const filtered = entries.filter((entry) => {
    if (userFilter && !entry.userName.toLowerCase().includes(userFilter.toLowerCase())) {
      return false;
    }
    if (actionFilter && entry.action !== actionFilter) return false;
    if (dateFrom && entry.createdAt < dateFrom) return false;
    return true;
  });

  return (
    <Container>
      <FilterBar>
        <FilterInput
          placeholder="Filter by user..."
          value={userFilter}
          onChange={(event) => setUserFilter(event.target.value)}
        />
        <FilterSelect
          value={actionFilter}
          onChange={(event) => setActionFilter(event.target.value as AuditAction | '')}
        >
          <option value="">All actions</option>
          {ALL_ACTIONS.map((action) => (
            <option key={action} value={action}>
              {action.replace('_', ' ')}
            </option>
          ))}
        </FilterSelect>
        <FilterInput
          type="date"
          value={dateFrom}
          onChange={(event) => setDateFrom(event.target.value)}
        />
        {onExport && <ExportButton onClick={onExport}>Export</ExportButton>}
      </FilterBar>
      <Table>
        <thead>
          <tr>
            <Th>User</Th>
            <Th>Action</Th>
            <Th>Resource</Th>
            <Th>Details</Th>
            <Th>IP</Th>
            <Th>Date</Th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((entry) => (
            <tr key={entry.id}>
              <Td>{entry.userName}</Td>
              <Td>
                <ActionBadge color={ACTION_COLORS[entry.action]}>
                  {entry.action.replace('_', ' ')}
                </ActionBadge>
              </Td>
              <Td>{entry.resource}</Td>
              <Td>{entry.details}</Td>
              <Td>{entry.ipAddress}</Td>
              <Td>{new Date(entry.createdAt).toLocaleString()}</Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
