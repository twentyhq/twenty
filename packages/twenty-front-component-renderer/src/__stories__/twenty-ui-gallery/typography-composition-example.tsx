import { useState } from 'react';
import {
  OverflowingTextWithTooltip,
  Text,
  type OverflowingTextWithTooltipProps,
  type TextProps,
} from 'twenty-ui/primitives/typography';

const OVERFLOW_PROPS = {
  text: 'https://twenty.com/developers/typography-composition',
  tooltipDelay: 0,
  style: { width: 160, display: 'block' },
} satisfies OverflowingTextWithTooltipProps;

const TEXT_PROPS = {
  lineClamp: 2,
  style: { width: 160 },
} satisfies TextProps;

export const TypographyCompositionExample = () => {
  const [activations, setActivations] = useState(0);

  return (
    <>
      <Text
        lineClamp={TEXT_PROPS.lineClamp}
        style={TEXT_PROPS.style}
        render={<p />}
        title="Clamped paragraph"
      >
        Caller-owned text spans several lines and keeps its semantic paragraph
        element in the renderer.
      </Text>
      <OverflowingTextWithTooltip
        text={OVERFLOW_PROPS.text}
        tooltipDelay={OVERFLOW_PROPS.tooltipDelay}
        style={OVERFLOW_PROPS.style}
        render={<a href="#typography" aria-label="Typography documentation" />}
        aria-label="Typography documentation"
        ref={(element) => {
          element?.setAttribute('data-ref-target', 'typography-link');
        }}
        onFocus={() => {
          setActivations((count) => count + 1);
        }}
      />
      <OverflowingTextWithTooltip
        text="https://twenty.com"
        aria-label="Plain URL"
      />
      <Text aria-label="Typography link focuses">{activations}</Text>
    </>
  );
};
