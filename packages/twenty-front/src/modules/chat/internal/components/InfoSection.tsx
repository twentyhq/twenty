/* eslint-disable @nx/workspace-explicit-boolean-predicates-in-if */
/* eslint-disable @nx/workspace-no-hardcoded-colors */
import { serviceActionsState } from '@/chat/call-center/state/serviceActionsState';
import { SectorPill } from '@/chat/internal/components/SectorPill';
import { SelectServiceStatus } from '@/chat/internal/components/SelectServiceStatus';
import { statusEnum } from '@/chat/types/WhatsappDocument';
import { formatStatusLabel } from '@/chat/utils/formatStatusLabel';
import { useFindAllSectors } from '@/settings/service-center/sectors/hooks/useFindAllSectors';
import { TextInput } from '@/ui/input/components/TextInput';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { IconComponent } from 'twenty-ui/display';

interface ServiceStatusPillProps {
  status: statusEnum;
}

const StyledMainContainer = styled.div`
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  padding-left: ${({ theme }) => theme.spacing(4)};
  padding-top: ${({ theme }) => theme.spacing(3)};
`;

const StyledDataSection = styled.div`
  align-items: center;
  display: flex;
`;

const StyledIconLabel = styled.div`
  display: flex;
  align-items: center;
  color: #999;
  gap: 4px;
  width: 92px;
  height: 24px;
`;

const StyledStatusPill = styled.div<ServiceStatusPillProps>`
  align-items: center;
  background-color: ${({ status }) => {
    switch (status) {
      case 'Resolved':
        return '#DDFCD8';
      case 'InProgress':
        return '#FFF6D7';
      case 'Waiting':
        return '#D1DFFB';
      case 'OnHold':
        return '#E9DFFF';
      case 'Pending':
        return '#FED8D8';
      default:
        return 'gray';
    }
  }};
  border-radius: 4px;
  color: ${({ status }) => {
    switch (status) {
      case 'Resolved':
        return '#2A5822';
      case 'InProgress':
        return '#746224';
      case 'Waiting':
        return '#18356D';
      case 'OnHold':
        return '#483473';
      case 'Pending':
        return '#712727';
      default:
        return 'gray';
    }
  }};
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  max-height: 20px;
  padding: 4px 8px;
`;

export type InfoSectionProps = {
  Icon?: IconComponent;
  title: string;
  data?: string;
  type: 'text' | 'select';
  value: string;
  onTextChange?: (newText: string) => void;
};

export const InfoSection = ({
  Icon,
  title,
  data,
  type,
  value,
  onTextChange,
}: InfoSectionProps) => {
  const [statusOpen, setStatusOpen] = useState<boolean>(false);
  const [status, setStatus] = useState<statusEnum>(
    data ? (data as statusEnum) : statusEnum.Pending,
  );

  const { sectors } = useFindAllSectors();
  const [selectedSector, setSelectedSector] = useState<string | null>(null);

  const serviceActions = useRecoilValue(serviceActionsState);

  useEffect(() => {
    if (data) {
      setStatus(data as statusEnum);
    }
  }, [data]);

  useEffect(() => {
    if (data) {
      setSelectedSector(data);
    }
  }, [data]);

  if (!serviceActions) return null;

  const { startService, finalizeService, holdService } = serviceActions;

  const handleChange = (newText: string) => {
    if (onTextChange) {
      onTextChange(newText);
    }
  };

  const handleCloseStatusModal = () => {
    setStatusOpen(false);
  };

  const handleStatusChange = (newStatus: statusEnum) => {
    setStatus(newStatus);

    switch (newStatus) {
      case statusEnum.InProgress:
        startService();
        break;
      case statusEnum.Resolved:
        finalizeService();
        break;
      case statusEnum.OnHold:
        holdService();
        break;
      default:
        break;
    }
  };

  return (
    <StyledMainContainer>
      {type === 'text' ? (
        <StyledDataSection>
          <StyledIconLabel>
            {Icon && <Icon size={16} color="#999" />}
            {title}
          </StyledIconLabel>
          <TextInput value={value} onChange={handleChange} />
        </StyledDataSection>
      ) : (
        <StyledDataSection>
          <StyledIconLabel>
            {Icon && <Icon size={16} color="#999" />}
            {title}
          </StyledIconLabel>
          {title.toLocaleLowerCase() === 'status' ? (
            <StyledStatusPill
              status={status}
              onClick={() => setStatusOpen(!statusOpen)}
            >
              {formatStatusLabel(status)}
            </StyledStatusPill>
          ) : (
            <SectorPill
              options={
                sectors?.map((sector) => ({
                  label: sector.name,
                  value: sector.id,
                  icon: sector.icon,
                })) ?? []
              }
              scopeKey={'sector-ticket'}
              selectedValue={selectedSector}
            />
          )}
          {statusOpen && (
            <SelectServiceStatus
              currentStatus={status}
              onStatusChange={handleStatusChange}
              onClose={handleCloseStatusModal}
            />
          )}
        </StyledDataSection>
      )}
    </StyledMainContainer>
  );
};
