import { usePieChartCenterMetricData } from '@/page-layout/widgets/graph/graphWidgetPieChart/hooks/usePieChartCenterMetricData';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { type PieChartConfiguration } from '~/generated/graphql';

type PieChartCenterMetricProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
  show: boolean;
  hasNoData?: boolean;
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

const StyledNoDataText = styled.span`
  color: ${({ theme }) => theme.font.color.tertiary};
  font-size: ${({ theme }) => theme.font.size.md};
`;

export const PieChartCenterMetric = ({
  objectMetadataItemId,
  configuration,
  show,
  hasNoData = false,
}: PieChartCenterMetricProps) => {
  const theme = useTheme();
  const { t } = useLingui();

  const { centerMetricValue, centerMetricLabel } = usePieChartCenterMetricData({
    objectMetadataItemId,
    configuration,
    skip: !show && !hasNoData,
  });

  const shouldShowContent = show || hasNoData;

  return (
    <AnimatePresence>
      {shouldShowContent && (
        <StyledCenterMetricContainer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{
            duration: theme.animation.duration.fast,
            ease: 'easeInOut',
          }}
        >
          {hasNoData ? (
            <StyledNoDataText>{t`No data`}</StyledNoDataText>
          ) : (
            <>
              <StyledValue>{centerMetricValue}</StyledValue>
              <StyledLabel>{centerMetricLabel}</StyledLabel>
            </>
          )}
        </StyledCenterMetricContainer>
      )}
    </AnimatePresence>
  );
};
