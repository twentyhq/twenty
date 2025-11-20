import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { calculateGraphLabelStyles } from '@/page-layout/widgets/graph/utils/calculateGraphLabelStyles';
import { useTheme } from '@emotion/react';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';

type GraphDataLabelProps = {
  label: GraphLabelData;
  formatValue?: (value: number) => string;
  offset: number;
  isVerticalLayout: boolean;
};

export const GraphDataLabel = ({
  label,
  formatValue,
  offset,
  isVerticalLayout,
}: GraphDataLabelProps) => {
  const theme = useTheme();
  const styles = calculateGraphLabelStyles(label, offset, isVerticalLayout);

  return (
    <animated.text
      key={label.key}
      x={styles.x}
      y={styles.y}
      textAnchor={styles.textAnchor}
      dominantBaseline={styles.dominantBaseline}
      style={{
        fill: theme.font.color.light,
        fontSize: 11,
        fontWeight: theme.font.weight.medium,
        transform: styles.transformOffset,
      }}
    >
      {isDefined(formatValue) ? formatValue(label.value) : label.value}
    </animated.text>
  );
};
