import { styled } from '@linaria/atomic';

import { PaymentFile, PaymentFileFormat } from '../types/banking.types';

type PaymentFileGeneratorProps = {
  files: PaymentFile[];
  onGenerate?: (format: PaymentFileFormat) => void;
  onDownload?: (fileId: string) => void;
};

const FORMAT_LABELS: Record<PaymentFileFormat, string> = {
  ach: 'ACH (US)',
  spei: 'SPEI (MX)',
  pse: 'PSE (CO)',
  sepa: 'SEPA (EU)',
  swift: 'SWIFT',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const FormatSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const FormatButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  &:hover {
    background: #f0f9ff;
    border-color: #3b82f6;
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
  border-bottom: 1px solid #e5e7eb;
  font-weight: 600;
  color: #6b7280;
`;

const Td = styled.td`
  padding: 8px 12px;
  border-bottom: 1px solid #f3f4f6;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => {
    switch (props.status) {
      case 'draft':
        return '#94a3b8';
      case 'generated':
        return '#3b82f6';
      case 'submitted':
        return '#f59e0b';
      case 'processed':
        return '#22c55e';
      default:
        return '#94a3b8';
    }
  }};
`;

const DownloadButton = styled.button`
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

export const PaymentFileGenerator = ({
  files,
  onGenerate,
  onDownload,
}: PaymentFileGeneratorProps) => {
  const formatAmount = (amount: number, currency: string) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(
      amount,
    );

  return (
    <Container>
      <FormatSelector>
        {Object.entries(FORMAT_LABELS).map(([format, label]) => (
          <FormatButton
            key={format}
            onClick={() => onGenerate?.(format as PaymentFileFormat)}
          >
            Generate {label}
          </FormatButton>
        ))}
      </FormatSelector>

      <Table>
        <thead>
          <tr>
            <Th>File</Th>
            <Th>Format</Th>
            <Th>Amount</Th>
            <Th>Transactions</Th>
            <Th>Status</Th>
            <Th>Created</Th>
            <Th>Actions</Th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id}>
              <Td>{file.fileName}</Td>
              <Td>{FORMAT_LABELS[file.format]}</Td>
              <Td>{formatAmount(file.totalAmount, file.currency)}</Td>
              <Td>{file.transactionCount}</Td>
              <Td>
                <StatusBadge status={file.status}>
                  {file.status}
                </StatusBadge>
              </Td>
              <Td>
                {new Date(file.createdAt).toLocaleDateString()}
              </Td>
              <Td>
                {file.status === 'generated' && (
                  <DownloadButton
                    onClick={() => onDownload?.(file.id)}
                  >
                    Download
                  </DownloadButton>
                )}
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>
    </Container>
  );
};
