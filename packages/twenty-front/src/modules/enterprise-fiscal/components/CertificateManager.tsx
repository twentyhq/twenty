import { styled } from '@linaria/atomic';

import { FiscalCertificate, CertificateStatus } from '../types/fiscal.types';

type CertificateManagerProps = {
  certificates: FiscalCertificate[];
  onUpload?: (country: string) => void;
  onRevoke?: (certificateId: string) => void;
};

const STATUS_COLORS: Record<CertificateStatus, string> = {
  valid: '#22c55e',
  expiring_soon: '#f59e0b',
  expired: '#ef4444',
  not_configured: '#94a3b8',
};

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CertCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
`;

const CertInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const CertIssuer = styled.span`
  font-weight: 600;
  font-size: 14px;
`;

const CertMeta = styled.span`
  font-size: 12px;
  color: #6b7280;
`;

const StatusBadge = styled.span<{ color: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  color: white;
  background: ${(props) => props.color};
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
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

export const CertificateManager = ({
  certificates,
  onUpload,
  onRevoke,
}: CertificateManagerProps) => {
  return (
    <Container>
      {certificates.map((certificate) => (
        <CertCard key={certificate.id}>
          <CertInfo>
            <CertIssuer>
              {certificate.country} - {certificate.issuer}
            </CertIssuer>
            <CertMeta>
              Serial: {certificate.serialNumber} | Valid:{' '}
              {new Date(certificate.validFrom).toLocaleDateString()} -{' '}
              {new Date(certificate.validUntil).toLocaleDateString()}
            </CertMeta>
            <CertMeta>File: {certificate.fileName}</CertMeta>
          </CertInfo>
          <Actions>
            <StatusBadge color={STATUS_COLORS[certificate.status]}>
              {certificate.status.replace('_', ' ')}
            </StatusBadge>
            <ActionButton
              onClick={() => onUpload?.(certificate.country)}
            >
              Replace
            </ActionButton>
            <ActionButton onClick={() => onRevoke?.(certificate.id)}>
              Revoke
            </ActionButton>
          </Actions>
        </CertCard>
      ))}
    </Container>
  );
};
