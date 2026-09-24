import { type IconComponentProps } from 'twenty-ui/icon';
import IconListViewGripRaw from './list-view-grip.svg?react';

type IconListViewGripProps = Pick<IconComponentProps, 'size' | 'stroke'>;

export const IconListViewGrip = (props: IconListViewGripProps) => {
  const width = props.size ?? 8;
  const height = props.size ?? 32;

  return <IconListViewGripRaw height={height} width={width} />;
};
