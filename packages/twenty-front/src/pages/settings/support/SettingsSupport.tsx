import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import { H2Title, Section, Badge } from 'twenty-ui';
import styled from '@emotion/styled';
import { IconHeadset, IconTicket } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const Card = styled.div<{ accentColor?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 20px;
  border-top: 3px solid ${({ accentColor }) => accentColor ?? '#3B82F6'};
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-2px);
  }
`;

const CardTitle = styled.div`
  font-weight: 600;
  font-size: 16px;
  margin-bottom: 8px;
`;

const CardDescription = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 13px;
`;

const TicketList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const TicketItem = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 6px;
  padding: 12px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const SettingsSupport = () => {
  const { t } = useTranslation();

  return (
    <SubMenuTopBarContainer
      title={t('Soporte')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Soporte') },
      ]}
    >
      <StyledContainer>
        <H2Title title={t('Tickets de Soporte')} />
        <Grid>
          <Card accentColor="#3B82F6">
            <CardTitle>
              <IconHeadset size={20} style={{ marginRight: 8 }} />
              Centro de Ayuda
            </CardTitle>
            <CardDescription>Base de conocimientos y FAQs</CardDescription>
          </Card>
          <Card accentColor="#10B981">
            <CardTitle>
              <IconTicket size={20} style={{ marginRight: 8 }} />
              Tickets
            </CardTitle>
            <CardDescription>Gestiona tickets de soporte</CardDescription>
          </Card>
        </Grid>
        <H2Title title={t('Tickets Recientes')} />
        <TicketList>
          <TicketItem>
            <span>No puedo acceder a mi cuenta</span>
            <Badge variant="warning">Abierto</Badge>
          </TicketItem>
          <TicketItem>
            <span>Error en el pago</span>
            <Badge variant="success">Resuelto</Badge>
          </TicketItem>
        </TicketList>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
