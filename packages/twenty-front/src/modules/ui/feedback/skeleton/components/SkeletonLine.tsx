import { type ComponentProps, Fragment } from 'react';
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
  containerClassName?: string;
};

export const SkeletonLine = ({
  width,
  height,
  count = 1,
  containerClassName,
  className,
  style,
  baseColor = themeCssVariables.background.tertiary,
  highlightColor = themeCssVariables.background.transparent.lighter,
  borderRadius = 4,
  animated = true,
  render,
  ref,
}: SkeletonLineProps) => (
  <span className={containerClassName} aria-live="polite" aria-busy={animated}>
    {Array.from({ length: count }, (_, index) => (
      <Fragment key={index}>
        <Skeleton
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
        <br />
      </Fragment>
    ))}
  </span>
);
