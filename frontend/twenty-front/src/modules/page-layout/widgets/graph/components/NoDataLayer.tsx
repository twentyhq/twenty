import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { ThemeContext } from 'twenty-ui/theme-constants';

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
  const { theme } = useContext(ThemeContext);
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
      fill={theme.font.color.tertiary}
      fontSize={theme.font.size.md}
    >
      {t`No data`}
    </text>
  );
};
