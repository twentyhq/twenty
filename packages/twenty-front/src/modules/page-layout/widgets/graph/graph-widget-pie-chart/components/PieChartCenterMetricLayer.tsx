import { usePieChartCenterMetricData } from '@/page-layout/widgets/graph/graph-widget-pie-chart/hooks/usePieChartCenterMetricData';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext } from 'react';
import { type PieChartConfiguration } from '~/generated-metadata/graphql';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';

type PieChartCenterMetricProps = {
  objectMetadataItemId: string;
  configuration: PieChartConfiguration;
  show: boolean;
  hasNoData?: boolean;
};

const StyledCenterMetricContainerBase = styled.div`
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
const StyledCenterMetricContainer = motion.create(
  StyledCenterMetricContainerBase,
);

const StyledValue = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: clamp(12px, 10cqmin, 48px);
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: clamp(10px, 5cqmin, 24px);
`;

const StyledNoDataText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
`;

export const PieChartCenterMetric = ({
  objectMetadataItemId,
  configuration,
  show,
  hasNoData = false,
}: PieChartCenterMetricProps) => {
  const { theme } = useContext(ThemeContext);
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
