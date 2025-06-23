import { SettingsSummaryCard } from '@/settings/components/SettingsSummaryCard';
import { SettingsIntegrationDatabaseConnectionSyncStatus } from '@/settings/integrations/database-connection/components/SettingsIntegrationDatabaseConnectionSyncStatus';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import styled from '@emotion/styled';
import { IconDotsVertical, IconPencil, IconTrash } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem, UndecoratedLink } from 'twenty-ui/navigation';

type SettingsIntegrationDatabaseConnectionSummaryCardProps = {
  databaseLogoUrl: string;
  connectionId: string;
  connectionLabel: string;
  onRemove: () => void;
};

const StyledDatabaseLogoContainer = styled.div`
  align-items: center;
  display: flex;
  height: ${({ theme }) => theme.spacing(4)};
  justify-content: center;
  width: ${({ theme }) => theme.spacing(4)};
`;

const StyledDatabaseLogo = styled.img`
  height: 100%;
`;

export const SettingsIntegrationDatabaseConnectionSummaryCard = ({
  databaseLogoUrl,
  connectionId,
  connectionLabel,
  onRemove,
}: SettingsIntegrationDatabaseConnectionSummaryCardProps) => {
  const dropdownId =
    'settings-integration-database-connection-summary-card-dropdown';

  return (
    <SettingsSummaryCard
      title={
        <>
          <StyledDatabaseLogoContainer>
            <StyledDatabaseLogo alt="" src={databaseLogoUrl} />
          </StyledDatabaseLogoContainer>
          {connectionLabel}
        </>
      }
      rightComponent={
        <>
          <SettingsIntegrationDatabaseConnectionSyncStatus
            connectionId={connectionId}
            shouldFetchPendingSchemaUpdates
          />
          <Dropdown
            dropdownId={dropdownId}
            clickableComponent={
              <LightIconButton Icon={IconDotsVertical} accent="tertiary" />
            }
            dropdownComponents={
              <DropdownContent>
                <DropdownMenuItemsContainer>
                  <MenuItem
                    LeftIcon={IconTrash}
                    text="Remove"
                    onClick={onRemove}
                  />
                  <UndecoratedLink to="./edit">
                    <MenuItem LeftIcon={IconPencil} text="Edit" />
                  </UndecoratedLink>
                </DropdownMenuItemsContainer>
              </DropdownContent>
            }
          />
        </>
      }
    />
  );
};
