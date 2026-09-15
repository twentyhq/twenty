import { animated, useSpring } from '@react-spring/web';

const COUNT_UP_ANIMATION_CONFIG = {
  tension: 300,
  friction: 30,
};

export const AnimatedFormattedNumber = ({
  formatValue,
  value,
}: {
  formatValue: (value: number) => string;
  value: number;
}) => {
  const { animatedValue } = useSpring({
    animatedValue: value,
    config: COUNT_UP_ANIMATION_CONFIG,
  });

  return (
    <animated.span style={{ fontVariantNumeric: 'tabular-nums' }}>
      {animatedValue.to(formatValue)}
    </animated.span>
  );
};
