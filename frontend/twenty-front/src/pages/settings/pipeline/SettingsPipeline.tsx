import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SubMenuTopBarContainer } from '@/ui/layout/page/components/SubMenuTopBarContainer';
import { getSettingsPath } from 'twenty-shared/utils';
import { SettingsPath, CoreObjectNameSingular } from 'twenty-shared/types';
import styled from '@emotion/styled';
import { H2Title, IconButton, Badge } from 'twenty-ui';
import { IconPlus, IconGripVertical } from '@tabler/icons-react';
import { useFindManyRecords } from '@/object-record/hooks/useFindManyRecords';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

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
  margin-bottom: 4px;
`;

const DealCompany = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.font.color.secondary};
  margin-bottom: 8px;
`;

const DealStage = styled.div<{ color?: string }>`
  display: inline-block;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  background: ${({ color }) => color ?? '#3B82F6'}20;
  color: ${({ color }) => color ?? '#3B82F6'};
  font-weight: 500;
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

const STAGE_MAP: Record<string, { name: string; color: string }> = {
  new: { name: 'Nuevo', color: '#3B82F6' },
  discovery: { name: 'Descubrimiento', color: '#8B5CF6' },
  proposal: { name: 'Propuesta', color: '#F59E0B' },
  negotiation: { name: 'Negociación', color: '#EF4444' },
  closed_won: { name: 'Cerrado Ganado', color: '#10B981' },
  closed_lost: { name: 'Cerrado Perdido', color: '#6B7280' },
};

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

const PIPELINE_STAGES = [
  { id: 'new', name: 'Nuevo', color: '#3B82F6' },
  { id: 'discovery', name: 'Descubrimiento', color: '#8B5CF6' },
  { id: 'proposal', name: 'Propuesta', color: '#F59E0B' },
  { id: 'negotiation', name: 'Negociación', color: '#EF4444' },
  { id: 'closed_won', name: 'Cerrado Ganado', color: '#10B981' },
  { id: 'closed_lost', name: 'Cerrado Perdido', color: '#6B7280' },
];

export const SettingsPipeline = () => {
  const { t } = useTranslation();
  
  const { objectMetadataItem: opportunityMetadata } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
  });

  const { records: opportunities, loading } = useFindManyRecords({
    objectNameSingular: CoreObjectNameSingular.Opportunity,
    limit: 100,
  });

  interface Deal {
    id: string;
    name: string;
    companyName: string;
    amount: number;
    stage: string;
    createdAt: string;
  }

  const deals: Deal[] = opportunities.map((opp: any) => ({
    id: opp.id,
    name: opp.name || 'Sin nombre',
    companyName: opp.company?.name || 'Sin empresa',
    amount: opp.amount?.amount ? parseFloat(opp.amount.amount) : 0,
    stage: opp.stage || 'new',
    createdAt: opp.createdAt || new Date().toISOString(),
  }));

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

  const totalValue = deals.reduce((sum, deal) => sum + deal.amount, 0);
  const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((sum, d) => sum + d.amount, 0);
  const activeDeals = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).length;

  if (loading) {
    return (
      <SubMenuTopBarContainer
        title={t('Pipeline de Ventas')}
        links={[
          { children: t('Workspace'), href: getSettingsPath(SettingsPath.Workspace) },
          { children: t('Pipeline') },
        ]}
      >
        <StyledContainer>
          <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            {t('Cargando...')}
          </div>
        </StyledContainer>
      </SubMenuTopBarContainer>
    );
  }

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
            const stageValue = stageDeals.reduce((sum, d) => sum + d.amount, 0);
            
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
                  {stageDeals.map((deal) => {
                    const stageInfo = STAGE_MAP[deal.stage] || STAGE_MAP.new;
                    return (
                      <DealCard key={deal.id}>
                        <DealHeader>
                          <DealTitle>{deal.name}</DealTitle>
                        </DealHeader>
                        <DealCompany>{deal.companyName}</DealCompany>
                        <DealStage color={stageInfo.color}>{stageInfo.name}</DealStage>
                        <DealFooter>
                          <DealValue>{formatCurrency(deal.amount)}</DealValue>
                          <DealDate>{new Date(deal.createdAt).toLocaleDateString('es-CO')}</DealDate>
                        </DealFooter>
                      </DealCard>
                    );
                  })}
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
