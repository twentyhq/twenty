import { styled } from '@linaria/atomic';

import { InvoiceSequenceConfig } from '../types/fiscal.types';

type InvoiceSequenceProps = {
  sequences: InvoiceSequenceConfig[];
  onEdit?: (sequenceId: string) => void;
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 13px;
`;

const Th = styled.th`
  text-align: left;
  padding: 8px 12px;
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const ActiveBadge = styled.span<{ isActive: boolean }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => (props.isActive ? '#22c55e' : '#94a3b8')};
`;

const SequencePreview = styled.span`
  font-family: monospace;
  font-size: 13px;
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 4px;
`;

const EditButton = styled.button`
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

const ProgressBar = styled.div`
  width: 80px;
  height: 6px;
  background: #f3f4f6;
  border-radius: 3px;
  overflow: hidden;
  display: inline-block;
  vertical-align: middle;
  margin-left: 8px;
`;

const ProgressFill = styled.div<{ percent: number }>`
  height: 100%;
  width: ${(props) => props.percent}%;
  background: ${(props) => (props.percent > 90 ? '#ef4444' : '#3b82f6')};
  border-radius: 3px;
`;

export const InvoiceSequence = ({
  sequences,
  onEdit,
}: InvoiceSequenceProps) => {
  return (
    <Container>
      <Table>
        <thead>
          <tr>
            <Th>Country</Th>
            <Th>Prefix</Th>
            <Th>Current / Range</Th>
            <Th>Resolution</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {sequences.map((sequence) => {
            const rangeTotal = sequence.rangeEnd - sequence.rangeStart;
            const used = sequence.currentSequence - sequence.rangeStart;
            const percentUsed =
              rangeTotal > 0 ? (used / rangeTotal) * 100 : 0;

            return (
              <tr key={sequence.id}>
                <Td>{sequence.country}</Td>
                <Td>
                  <SequencePreview>{sequence.prefix}</SequencePreview>
                </Td>
                <Td>
                  {sequence.currentSequence.toLocaleString()} /{' '}
                  {sequence.rangeEnd.toLocaleString()}
                  <ProgressBar>
                    <ProgressFill percent={percentUsed} />
                  </ProgressBar>
                </Td>
                <Td>
                  {sequence.resolutionNumber ?? '-'}
                  {sequence.resolutionDate !== null && (
                    <span style={{ marginLeft: '6px', fontSize: '11px', color: '#6b7280' }}>
                      ({new Date(sequence.resolutionDate).toLocaleDateString()})
                    </span>
                  )}
                </Td>
                <Td>
                  <ActiveBadge isActive={sequence.isActive}>
                    {sequence.isActive ? 'Active' : 'Inactive'}
                  </ActiveBadge>
                </Td>
                <Td>
                  <EditButton onClick={() => onEdit?.(sequence.id)}>
                    Edit
                  </EditButton>
                </Td>
              </tr>
            );
          })}
        </tbody>
      </Table>
    </Container>
  );
};
