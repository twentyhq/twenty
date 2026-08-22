import { WidgetActionTimelineCreate } from '@/page-layout/widgets/timeline/components/WidgetActionTimelineCreate';
import { WidgetActionTimelineFilter } from '@/page-layout/widgets/timeline/components/WidgetActionTimelineFilter';

export const WidgetActionTimeline = () => (
  <>
    <WidgetActionTimelineFilter />
    <WidgetActionTimelineCreate />
  </>
);
