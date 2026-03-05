import { useLingui } from '@lingui/react/macro';
import {
  resolveThemeVariable,
  themeCssVariables,
} from 'twenty-ui/theme-constants';

type NoDataLayerProps = {
  innerWidth: number;
  innerHeight: number;
  hasNoData: boolean;
};

export const NoDataLayer = ({
  innerWidth,
  innerHeight,
  hasNoData,
}: NoDataLayerProps) => {
  const { t } = useLingui();

  if (!hasNoData) {
    return null;
  }

  return (
    <text
      x={innerWidth / 2}
      y={innerHeight / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fill={resolveThemeVariable(themeCssVariables.font.color.tertiary)}
      fontSize={resolveThemeVariable(themeCssVariables.font.size.md)}
    >
      {t`No data`}
    </text>
  );
};
