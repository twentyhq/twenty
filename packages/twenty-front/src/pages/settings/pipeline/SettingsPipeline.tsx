import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath } from 'twenty-shared/types';
import styled from '@emotion/styled';
import { H2Title, IconButton, Badge } from 'twenty-ui';
import { IconPlus, IconGripVertical } from '@tabler/icons-react';

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
  min-height: 500px;
`;

const StageColumn = styled.div<{ color?: string }>`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  min-width: 300px;
  max-width: 300px;
  padding: 16px;
  border-top: 4px solid ${({ color }) => color ?? '#3B82F6'};
  display: flex;
  flex-direction: column;
`;

const StageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
`;

const StageTitle = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const DealCount = styled.span`
  background: ${({ theme }) => theme.background.transparent.light};
  color: ${({ theme }) => theme.font.color.secondary};
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 12px;
`;

const DealList = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DealCard = styled.div`
  background: ${({ theme }) => theme.background.primary};
  border-radius: 8px;
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s;
  border: 1px solid ${({ theme }) => theme.border.color.light};
  
  &:hover {
    border-color: ${({ theme }) => theme.color.blue};
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-1px);
  }
`;

const DealHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 8px;
`;

const DealTitle = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: ${({ theme }) => theme.font.color.primary};
`;

const DealCompany = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: 8px;
`;

const DealFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 8px;
`;

const DealValue = styled.div`
  font-weight: 600;
  color: ${({ theme }) => theme.color.green};
`;

const DealDate = styled.div`
  font-size: 11px;
  color: ${({ theme }) => theme.font.color.tertiary};
`;

const AddDealButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 10px;
  margin-top: 8px;
  background: transparent;
  border: 1px dashed ${({ theme }) => theme.border.color.medium};
  border-radius: 6px;
  color: ${({ theme }) => theme.font.color.secondary};
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
  
  &:hover {
    background: ${({ theme }) => theme.background.transparent.light};
    border-color: ${({ theme }) => theme.color.blue};
    color: ${({ theme }) => theme.color.blue};
  }
`;

const PipelineSummary = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
`;

const SummaryCard = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 8px;
  padding: 20px;
  text-align: center;
`;

const SummaryValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const SummaryLabel = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
  margin-top: 4px;
  text-transform: uppercase;
`;

export interface Deal {
  id: string;
  title: string;
  company: string;
  value: number;
  stage: string;
  createdAt: string;
}

const PIPELINE_STAGES = [
  { id: 'new', name: 'Nuevo', color: '#3B82F6' },
  { id: 'discovery', name: 'Descubrimiento', color: '#8B5CF6' },
  { id: 'proposal', name: 'Propuesta', color: '#F59E0B' },
  { id: 'negotiation', name: 'Negociación', color: '#EF4444' },
  { id: 'closed_won', name: 'Cerrado Ganado', color: '#10B981' },
  { id: 'closed_lost', name: 'Cerrado Perdido', color: '#6B7280' },
];

const MOCK_DEALS: Deal[] = [
  { id: '1', title: 'Demo with Acme Corp', company: 'Acme Corp', value: 15000, stage: 'new', createdAt: '2024-01-15' },
  { id: '2', title: 'Enterprise License', company: 'Tech Solutions', value: 45000, stage: 'discovery', createdAt: '2024-01-10' },
  { id: '3', title: 'Startup Package', company: 'Innovate Labs', value: 8000, stage: 'proposal', createdAt: '2024-01-08' },
  { id: '4', title: 'Annual Contract', company: 'Global Inc', value: 72000, stage: 'negotiation', createdAt: '2024-01-05' },
  { id: '5', title: 'SMB Deal', company: 'Local Shop', value: 3500, stage: 'closed_won', createdAt: '2024-01-01' },
  { id: '6', title: 'Consulting', company: 'Expert Co', value: 12000, stage: 'new', createdAt: '2024-01-18' },
  { id: '7', title: 'Expansion', company: 'Big Corp', value: 55000, stage: 'proposal', createdAt: '2024-01-12' },
];

export const SettingsPipeline = () => {
  const { t } = useTranslation();
  const [deals] = useState<Deal[]>(MOCK_DEALS);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const getDealsByStage = (stageId: string) => {
    return deals.filter(deal => deal.stage === stageId);
  };

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.value, 0);
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;

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

        <PipelineSummary>
          <SummaryCard>
            <SummaryValue>{deals.length}</SummaryValue>
            <SummaryLabel>Total Deals</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{formatCurrency(totalValue)}</SummaryValue>
            <SummaryLabel>Valor Total</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{formatCurrency(wonValue)}</SummaryValue>
            <SummaryLabel>Ganado</SummaryLabel>
          </SummaryCard>
          <SummaryCard>
            <SummaryValue>{activeDeals}</SummaryValue>
            <SummaryLabel>Activos</SummaryLabel>
          </SummaryCard>
        </PipelineSummary>

        <PipelineBoard>
          {PIPELINE_STAGES.map((stage) => {
            const stageDeals = getDealsByStage(stage.id);
            const stageValue = stageDeals.reduce((sum, d) => sum + d.value, 0);
            
            return (
              <StageColumn key={stage.id} color={stage.color}>
                <StageHeader>
                  <StageTitle>
                    <IconGripVertical size={16} />
                    {stage.name}
                  </StageTitle>
                  <DealCount>{stageDeals.length}</DealCount>
                </StageHeader>
                
                <div style={{ fontSize: '11px', color: '#888', marginBottom: '8px' }}>
                  {formatCurrency(stageValue)}
                </div>
                
                <DealList>
                  {stageDeals.map((deal) => (
                    <DealCard key={deal.id}>
                      <DealHeader>
                        <DealTitle>{deal.title}</DealTitle>
                      </DealHeader>
                      <DealCompany>{deal.company}</DealCompany>
                      <DealFooter>
                        <DealValue>{formatCurrency(deal.value)}</DealValue>
                        <DealDate>{deal.createdAt}</DealDate>
                      </DealFooter>
                    </DealCard>
                  ))}
                </DealList>
                
                <AddDealButton>
                  <IconPlus size={16} />
                  {t('Agregar deal')}
                </AddDealButton>
              </StageColumn>
            );
          })}
        </PipelineBoard>
      </StyledContainer>
    </SubMenuTopBarContainer>
  );
};
