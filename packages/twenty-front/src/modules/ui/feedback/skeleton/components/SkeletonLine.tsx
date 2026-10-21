import { styled } from '@linaria/react';
import { type ComponentProps } from 'react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

type SkeletonLineProps = Pick<
  ComponentProps<typeof Skeleton>,
  | 'width'
  | 'height'
  | 'className'
  | 'style'
  | 'baseColor'
  | 'highlightColor'
  | 'borderRadius'
  | 'animated'
  | 'render'
  | 'ref'
> & {
  count?: number;
  gap?: string;
  containerClassName?: string;
};

const StyledSkeletonLineContainer = styled.div<{ gap?: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ gap }) => gap ?? '0'};
`;

export const SkeletonLine = ({
  width,
  height,
  count = 1,
  gap,
  containerClassName,
  className,
  style,
  baseColor = themeCssVariables.background.tertiary,
  highlightColor = themeCssVariables.background.transparent.lighter,
  borderRadius,
  animated = true,
  render,
  ref,
}: SkeletonLineProps) => (
  <StyledSkeletonLineContainer
    className={containerClassName}
    gap={gap}
    aria-live="polite"
    aria-busy={animated}
  >
    {Array.from({ length: count }, (_, index) => (
      <Skeleton
        key={index}
        width={width}
        height={height}
        className={className}
        style={style}
        baseColor={baseColor}
        highlightColor={highlightColor}
        borderRadius={borderRadius}
        animated={animated}
        render={render}
        ref={ref}
      />
    ))}
  </StyledSkeletonLineContainer>
);
