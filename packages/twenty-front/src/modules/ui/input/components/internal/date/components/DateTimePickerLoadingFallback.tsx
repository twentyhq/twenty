import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { DatePickerLoadingFallback } from '@/ui/input/components/internal/date/components/DatePickerLoadingFallback';
import { SKELETON_HEIGHT_SIZES } from 'twenty-ui/primitives/feedback';

const DATE_TIME_PICKER_LOADING_ROWS = [
  { width: 200, height: SKELETON_HEIGHT_SIZES.m },
  { width: 240, height: SKELETON_HEIGHT_SIZES.l },
  { width: 220, height: SKELETON_HEIGHT_SIZES.m },
  { width: 180, height: SKELETON_HEIGHT_SIZES.s },
];

export const DateTimePickerLoadingFallback = () => (
  <DatePickerLoadingFallback>
    {DATE_TIME_PICKER_LOADING_ROWS.map(({ width, height }) => (
      <SkeletonLine key={width} width={width} height={height} />
    ))}
  </DatePickerLoadingFallback>
);
