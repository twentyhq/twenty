import { AdminHealthService } from '@/settings/admin-panel/types/AdminHealthService';
import { Table } from '@/ui/layout/table/components/Table';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { useState } from 'react';
import { AnimatedExpandableContainer, Status } from 'twenty-ui';
import { SettingsListCard } from '../../components/SettingsListCard';
import { SettingsAdminHealthStatusRightContainer } from './SettingsAdminHealthStatusRightContainer';

const StyledExpandedContent = styled.div`
  margin-top: ${({ theme }) => theme.spacing(2)};
`;

export const SettingsHealthStatusListCard = ({
  services,
  loading,
  expandable = false,
}: {
  services: Array<AdminHealthService>;
  loading?: boolean;
  expandable?: boolean;
}) => {
  const [expandedService, setExpandedService] = useState<string | null>(null);

  return (
    <>
      <SettingsListCard
        items={services}
        getItemLabel={(service) => service.name}
        isLoading={loading}
        onRowClick={(service) =>
          setExpandedService(expandedService === service.id ? null : service.id)
        }
        RowRightComponent={({ item: service }) => (
          <SettingsAdminHealthStatusRightContainer service={service} />
        )}
      />
      {expandable &&
        services.map((service) => (
          <AnimatedExpandableContainer
            key={service.id}
            isExpanded={expandedService === service.id}
          >
            <StyledExpandedContent>
              <Table>
                <TableRow>
                  <TableHeader>Queue</TableHeader>
                  <TableHeader align="center">Workers</TableHeader>
                  <TableHeader align="right">Status</TableHeader>
                </TableRow>
                {service.queues?.map((queue) => (
                  <TableRow key={queue.name}>
                    <TableCell>{queue.name}</TableCell>
                    <TableCell align="center">{queue.workers}</TableCell>
                    <TableCell align="right">
                      <Status
                        color={queue.status === 'OPERATIONAL' ? 'green' : 'red'}
                        text={queue.status.toLowerCase()}
                        weight="medium"
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </Table>
            </StyledExpandedContent>
          </AnimatedExpandableContainer>
        ))}
    </>
  );
};
