import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import styled from '@emotion/styled';
import { H2Title, IconButton } from 'twenty-ui';
import { IconPlus } from '@tabler/icons-react';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(8)};
  padding: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const PipelineBoard = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 16px 0;
`;

const StageColumn = styled.div<{ color?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  min-width: 280px;
  max-width: 280px;
  padding: 16px;
  border-top: 3px solid ${({ color }) => color ?? '#3B82F6'};
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const StageTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const DealCount = styled.span`
  background: ${({ theme }) => theme.background.transparent.light};
  color: ${({ theme }) => theme.font.color.secondary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const DealCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: box-shadow 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
`;

const DealTitle = styled.div`
  font-weight: 500;
  margin-bottom: 4px;
`;

const DealValue = styled.div`
  color: ${({ theme }) => theme.font.color.secondary};
  font-size: 12px;
`;

const AddDealButton = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  color: ${({ theme }) => theme.font.color.secondary};
  padding: 8px;
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
  }
`;

export const SettingsPipeline = () => {
  const { t } = useTranslation();

  const stages = [
    { id: 'new', name: 'Nuevo', color: '#3B82F6', deals: [] },
    { id: 'discovery', name: 'Descubrimiento', color: '#8B5CF6', deals: [] },
    { id: 'proposal', name: 'Propuesta', color: '#F59E0B', deals: [] },
    { id: 'negotiation', name: 'Negociación', color: '#EF4444', deals: [] },
    { id: 'closed_won', name: 'Cerrado Ganado', color: '#10B981', deals: [] },
    { id: 'closed_lost', name: 'Cerrado Perdido', color: '#6B7280', deals: [] },
  ];

  return (
    <SubMenuTopBarContainer
      title={t('Pipeline de Ventas')}
      links={[
        { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
        { children: t('Pipeline') },
      ]}
    >
      <StyledContainer>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <H2Title title={t('Pipeline de Ventas')} />
          <IconButton
            Icon={IconPlus}
            variant="primary"
            size="small"
            onClick={() => {}}
          />
        </div>
        <PipelineBoard>
          {stages.map((stage) => (
            <StageColumn key={stage.id} color={stage.color}>
              <StageHeader>
                <StageTitle>{stage.name}</StageTitle>
                <DealCount>{stage.deals.length}</DealCount>
              </StageHeader>
              <DealCard>
                <DealTitle>Demo with Acme Corp</DealTitle>
                <DealValue>$15,000 COP</DealValue>
              </DealCard>
              <AddDealButton>
                <IconPlus size={16} />
                <span>Agregar deal</span>
              </AddDealButton>
            </StageColumn>
          ))}
        </PipelineBoard>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
