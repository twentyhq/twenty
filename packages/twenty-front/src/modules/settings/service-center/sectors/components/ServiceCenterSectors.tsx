import { ServiceCenterFieldActionDropdown } from '@/settings/service-center/sectors/components/ServiceCenterFieldActionDropdown';
import { ServiceCenterSectorTableRow } from '@/settings/service-center/sectors/components/ServiceCenterSectorTableRow';
import { useDeleteSector } from '@/settings/service-center/sectors/hooks/useDeleteSector';
import { Sector } from '@/settings/service-center/sectors/types/Sector';
import { SettingsPath } from '@/types/SettingsPath';
import { useIsMobile } from '@/ui/utilities/responsive/hooks/useIsMobile';
import styled from '@emotion/styled';
import { useNavigate } from 'react-router-dom';
import { Section } from 'twenty-ui/layout';
import { getSettingsPath } from '~/utils/navigation/getSettingsPath';

const StyledShowServiceCenterTabs = styled.div<{ isMobile: boolean }>`
  display: flex;
  flex: 1 0 0;
  flex-direction: column;
  justify-content: start;
  width: 100%;
`;

const StyledSection = styled(Section)`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.medium};
  border-radius: ${({ theme }) => theme.spacing(1)};
  margin-top: ${({ theme }) => theme.spacing(4)};
`;

export const TAB_LIST_COMPONENT_ID = 'show-page-right-tab-list';

type ServiceCenterSectorsProps = {
  sectors: Sector[];
  refetchSectors: () => void;
  isRightDrawer?: boolean;
  loading?: boolean;
};

export const ServiceCenterSectors = ({
  sectors,
  refetchSectors,
  loading,
  isRightDrawer = false,
}: ServiceCenterSectorsProps) => {
  // const { t } = useTranslation();
  const navigate = useNavigate();
  const isMobile = useIsMobile() || isRightDrawer;

  const { deleteSectorById } = useDeleteSector();

  const handleEditSector = (sectorName: string) => {
    const path = getSettingsPath(SettingsPath.ServiceCenterEditSector).replace(
      ':sectorSlug',
      sectorName,
    );

    navigate(path);
  };

  return (
    <StyledShowServiceCenterTabs isMobile={isMobile}>
      {sectors?.length > 0 && (
        <StyledSection>
          {sectors.map((sector) => (
            <ServiceCenterSectorTableRow
              key={sector.id}
              sectorName={sector.name}
              sectorIcon={sector.icon}
              accessory={
                <ServiceCenterFieldActionDropdown
                  modalMessage={{
                    title: 'Delete sector',
                    subtitle: 'This will permanently delete this sector.',
                  }}
                  scopeKey={sector.name}
                  onEdit={() => {
                    handleEditSector(sector.name);
                  }}
                  onDelete={async () => {
                    await deleteSectorById(sector.id);
                    refetchSectors();
                  }}
                />
              }
            />
          ))}
        </StyledSection>
      )}
    </StyledShowServiceCenterTabs>
  );
};
