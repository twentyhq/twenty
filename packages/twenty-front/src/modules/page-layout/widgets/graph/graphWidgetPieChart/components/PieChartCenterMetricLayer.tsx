import { usePieChartCenterMetricData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartCenterMetricData';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { AnimatePresence, motion } from 'framer-motion';
import { type PieChartConfiguration } from '~/generated/graphql';

type PieChartCenterMetricProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
  show: boolean;
};

const StyledCenterMetricContainer = styled(motion.div)`
  align-items: center;
  display: flex;
  flex-direction: column;
  justify-content: center;
  left: 50%;
  pointer-events: none;
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
`;

const StyledValue = styled.span`
  color: ${({ theme }) => theme.font.color.primary};
  font-size: clamp(12px, 10cqmin, 48px);
  font-weight: ${({ theme }) => theme.font.weight.semiBold};
`;

const StyledLabel = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: clamp(10px, 5cqmin, 24px);
`;

export const PieChartCenterMetric = ({
  objectMetadataItemId,
  configuration,
  show,
}: PieChartCenterMetricProps) => {
  const theme = useTheme();

  const { centerMetricValue, centerMetricLabel } = usePieChartCenterMetricData({
    objectMetadataItemId,
    configuration,
    skip: !show,
  });

  return (
    <AnimatePresence>
      {show && (
        <StyledCenterMetricContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: theme.animation.duration.fast,
            ease: 'easeInOut',
          }}
        >
          <StyledValue>{centerMetricValue}</StyledValue>
          <StyledLabel>{centerMetricLabel}</StyledLabel>
        </StyledCenterMetricContainer>
      )}
    </AnimatePresence>
  );
};
