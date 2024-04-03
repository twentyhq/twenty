import { TablerIconsProps } from 'twenty-ui';

import IconTwentyStarFilledRaw from '../assets/twenty-star-filled.svg?react';

type IconTwentyStarFilledProps = TablerIconsProps;

export const IconTwentyStarFilled = (
  props: IconTwentyStarFilledProps,
): JSX.Element => {
  const size = props.size ?? 24;
  const stroke = props.stroke ?? 2;

  return (
    <IconTwentyStarFilledRaw height={size} width={size} strokeWidth={stroke} />
  );
};
