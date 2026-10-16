import { useLingui } from '@lingui/react/macro';
import { type ColorLabels } from 'twenty-ui/components/navigation';

export const useColorLabels = (): ColorLabels => {
  const { t } = useLingui();

  return {
    gray: t`Gray`,
    tomato: t`Tomato`,
    red: t`Red`,
    ruby: t`Ruby`,
    crimson: t`Crimson`,
    pink: t`Pink`,
    plum: t`Plum`,
    purple: t`Purple`,
    violet: t`Violet`,
    iris: t`Iris`,
    cyan: t`Cyan`,
    turquoise: t`Turquoise`,
    sky: t`Sky`,
    blue: t`Blue`,
    jade: t`Jade`,
    green: t`Green`,
    grass: t`Grass`,
    mint: t`Mint`,
    lime: t`Lime`,
    bronze: t`Bronze`,
    gold: t`Gold`,
    brown: t`Brown`,
    orange: t`Orange`,
    amber: t`Amber`,
    yellow: t`Yellow`,
  };
};
