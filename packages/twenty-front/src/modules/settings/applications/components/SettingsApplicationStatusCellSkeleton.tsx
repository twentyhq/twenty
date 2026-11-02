import { SkeletonLine } from '@/ui/feedback/skeleton/components/SkeletonLine';
import { themeCssVariables } from 'twenty-ui/theme';

const STATUS_SKELETON_WIDTH = 88;

export const SettingsApplicationStatusCellSkeleton = () => (
  <SkeletonLine
    width={STATUS_SKELETON_WIDTH}
    height={themeCssVariables.spacing[5]}
    borderRadius={themeCssVariables.border.radius.pill}
  />
);
