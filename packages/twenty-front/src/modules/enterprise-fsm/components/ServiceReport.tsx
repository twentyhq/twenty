import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useLingui } from '@lingui/react';
import { MOBILE_VIEWPORT, themeCssVariables } from 'twenty-ui/theme-constants';

import { ServiceReportData } from '../types/fsm.types';

const MOCK_REPORT: ServiceReportData = {
  id: 'SR-201',
  workOrderId: 'WO-104',
  technicianName: 'Juan Perez',
  arrivalTime: '2026-04-28T09:00:00Z',
  completionTime: '2026-04-28T11:30:00Z',
  checklist: [
    { id: 'CK1', label: 'Visual inspection of panels', checked: true },
    { id: 'CK2', label: 'Sensor calibration', checked: true },
    { id: 'CK3', label: 'Alarm test (all zones)', checked: true },
    { id: 'CK4', label: 'Sprinkler pressure check', checked: false },
    { id: 'CK5', label: 'Emergency lighting test', checked: true },
  ],
  notes: 'Sprinkler pressure check deferred — valve replacement needed. Parts ordered, ETA 3 business days.',
  photoCount: 4,
  customerSignature: true,
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[4]};
  gap: ${themeCssVariables.spacing[3]};
  max-width: 640px;
`;

const StyledTitle = styled.h2`
  font-size: ${themeCssVariables.font.size.lg};
  color: ${themeCssVariables.font.color.primary};
  margin: 0;
`;

const StyledMeta = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: ${themeCssVariables.spacing[2]};

  @media (max-width: ${MOBILE_VIEWPORT}px) {
    grid-template-columns: 1fr;
  }
`;

const StyledMetaItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const StyledLabel = styled.span`
  font-size: ${themeCssVariables.font.size.xs};
  color: ${themeCssVariables.font.color.tertiary};
  text-transform: uppercase;
`;

const StyledValue = styled.span`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
`;

const StyledSectionTitle = styled.h3`
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.secondary};
  margin: 0;
`;

const StyledCheckItem = styled.div<{ checked: boolean }>`
  display: flex;
  align-items: center;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[1]} 0;
  font-size: ${themeCssVariables.font.size.md};
  color: ${({ checked }) =>
    checked ? themeCssVariables.font.color.primary : themeCssVariables.color.orange};
`;

const StyledCheckbox = styled.span<{ checked: boolean }>`
  width: 16px;
  height: 16px;
  border-radius: 3px;
  border: 2px solid ${({ checked }) =>
    checked ? themeCssVariables.color.turquoise : themeCssVariables.border.color.medium};
  background: ${({ checked }) =>
    checked ? themeCssVariables.color.turquoise : 'transparent'};
  flex-shrink: 0;
`;

const StyledNotes = styled.div`
  padding: ${themeCssVariables.spacing[3]};
  background: ${themeCssVariables.background.transparent.lighter};
  border-radius: 8px;
  font-size: ${themeCssVariables.font.size.md};
  color: ${themeCssVariables.font.color.primary};
  line-height: 1.5;
`;

const StyledPhotoBadge = styled.span`
  font-size: ${themeCssVariables.font.size.sm};
  color: ${themeCssVariables.color.blue};
`;

export const ServiceReport = () => {
  useLingui();
  const report = MOCK_REPORT;

  return (
    <StyledContainer>
      <StyledTitle>{t`Service Report`} {report.id}</StyledTitle>
      <StyledMeta>
        <StyledMetaItem>
          <StyledLabel>{t`Work Order`}</StyledLabel>
          <StyledValue>{report.workOrderId}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Technician`}</StyledLabel>
          <StyledValue>{report.technicianName}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Arrival`}</StyledLabel>
          <StyledValue>{new Date(report.arrivalTime).toLocaleTimeString()}</StyledValue>
        </StyledMetaItem>
        <StyledMetaItem>
          <StyledLabel>{t`Completion`}</StyledLabel>
          <StyledValue>{new Date(report.completionTime).toLocaleTimeString()}</StyledValue>
        </StyledMetaItem>
      </StyledMeta>
      <StyledSectionTitle>{t`Checklist`}</StyledSectionTitle>
      {report.checklist.map((item) => (
        <StyledCheckItem key={item.id} checked={item.checked}>
          <StyledCheckbox checked={item.checked} />
          {item.label}
        </StyledCheckItem>
      ))}
      <StyledSectionTitle>{t`Notes`}</StyledSectionTitle>
      <StyledNotes>{report.notes}</StyledNotes>
      <StyledPhotoBadge>{report.photoCount} {t`photos attached`}</StyledPhotoBadge>
      <StyledValue>
        {report.customerSignature ? t`Customer signature: Received` : t`Customer signature: Pending`}
      </StyledValue>
    </StyledContainer>
  );
};
