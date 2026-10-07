import { type ComponentProps } from 'react';
import { Skeleton } from 'twenty-ui/primitives/feedback';
import { themeCssVariables } from 'twenty-ui/theme';

type SkeletonLineProps = Pick<
  ComponentProps<typeof Skeleton>,
  | 'width'
  | 'height'
  | 'count'
  | 'containerClassName'
  | 'className'
  | 'style'
  | 'baseColor'
  | 'highlightColor'
  | 'borderRadius'
  | 'animated'
  | 'render'
  | 'ref'
>;

export const SkeletonLine = ({
  width,
  height,
  count,
  containerClassName,
  className,
  style,
  baseColor = themeCssVariables.background.tertiary,
  highlightColor = themeCssVariables.background.transparent.lighter,
  borderRadius = 4,
  animated,
  render,
  ref,
}: SkeletonLineProps) => (
  <Skeleton
    layout="line"
    width={width}
    height={height}
    count={count}
    containerClassName={containerClassName}
    className={className}
    style={style}
    baseColor={baseColor}
    highlightColor={highlightColor}
    borderRadius={borderRadius}
    animated={animated}
    render={render}
    ref={ref}
  />
);
