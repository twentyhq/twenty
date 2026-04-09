import styled from '@emotion/styled';

const FunnelContainer = styled.div`
  background: ${({ theme }) => theme.background.secondary};
  border-radius: 12px;
  padding: 24px;
  height: 100%;
`;

const FunnelTitle = styled.h3`
  margin: 0 0 20px 0;
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.font.color.primary};
`;

const FunnelStage = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const StageBar = styled.div<{ width: number; color: string }>`
  height: 40px;
  background: ${({ color }) => color};
  border-radius: 6px;
  width: ${({ width }) => width}%;
  display: flex;
  align-items: center;
  padding: 0 16px;
  min-width: 120px;
  transition: width 0.3s ease;
`;

const StageLabel = styled.span`
  color: white;
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
`;

const StageInfo = styled.div`
  flex: 1;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
`;

const StageCount = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: ${({ theme }) => theme.font.color.primary};
`;

const StageRate = styled.span<{ color: string }>`
  font-size: 13px;
  color: ${({ color }) => color};
`;

interface FunnelStageData {
  stage: string;
  count: number;
  conversionRate: number;
}

interface FunnelWidgetProps {
  title?: string;
  data: FunnelStageData[];
}

const STAGE_COLORS = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#F59E0B', // Amber
  '#10B981', // Green
  '#EC4899', // Pink
  '#06B6D4', // Cyan
];

export const FunnelWidget = ({ title = 'Embudo de Ventas', data }: FunnelWidgetProps) => {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <FunnelContainer>
      <FunnelTitle>{title}</FunnelTitle>
      {data.map((stage, index) => {
        const width = (stage.count / maxCount) * 100;
        const color = STAGE_COLORS[index % STAGE_COLORS.length];

        return (
          <FunnelStage key={stage.stage}>
            <StageBar width={width} color={color}>
              <StageLabel>{stage.stage}</StageLabel>
            </StageBar>
            <StageInfo>
              <StageCount>{stage.count.toLocaleString('es-CO')}</StageCount>
              <StageRate color={color}>
                {stage.conversionRate}% de conversión
              </StageRate>
            </StageInfo>
          </FunnelStage>
        );
      })}
    </FunnelContainer>
  );
};
