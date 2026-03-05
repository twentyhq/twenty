import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';
import { calculateGraphLabelStyles } from '@/page-layout/widgets/graph/utils/calculateGraphLabelStyles';
import { animated } from '@react-spring/web';
import { isDefined } from 'twenty-shared/utils';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

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
  const styles = calculateGraphLabelStyles(label, offset, isVerticalLayout);

  return (
    <animated.text
      key={label.key}
      x={styles.x}
      y={styles.y}
      textAnchor={styles.textAnchor}
      dominantBaseline={styles.dominantBaseline}
      style={{
        fill: resolveThemeVariable(themeCssVariables.font.color.light),
        fontSize: 11,
        fontWeight: resolveThemeVariable(themeCssVariables.font.weight.medium),
        transform: styles.transformOffset,
      }}
    >
      {isDefined(formatValue) ? formatValue(label.value) : label.value}
    </animated.text>
  );
};
