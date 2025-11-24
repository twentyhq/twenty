import { type GraphLabelData } from '@/page-layout/widgets/graph/types/GraphLabelData';

type GraphLabelStyles = {
  x: number;
  y: number;
  textAnchor: 'start' | 'middle' | 'end';
  dominantBaseline: 'auto' | 'hanging' | 'central';
  transformOffset: string;
};

export const calculateGraphLabelStyles = (
  label: GraphLabelData,
  offset: number,
  isVerticalLayout: boolean,
): GraphLabelStyles => {
  const offsetSign = isVerticalLayout
    ? label.shouldRenderBelow
      ? 1
      : -1
    : label.shouldRenderBelow
      ? -1
      : 1;

  const axis = isVerticalLayout ? 'Y' : 'X';
  const transformOffset = `translate${axis}(${offsetSign * offset}px)`;

  const textAnchor = isVerticalLayout
    ? 'middle'
    : label.shouldRenderBelow
      ? 'end'
      : 'start';

  const dominantBaseline = isVerticalLayout
    ? label.shouldRenderBelow
      ? 'hanging'
      : 'auto'
    : 'central';

  return {
    x: label.x,
    y: label.y,
    textAnchor,
    dominantBaseline,
    transformOffset,
  };
};
