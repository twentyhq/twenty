import { WidgetActionActivityCreate } from '@/page-layout/widgets/components/WidgetActionActivityCreate';
import { StandardObjectNameSingular } from 'twenty-shared/types';

export const WidgetActionNoteCreate = () => (
  <WidgetActionActivityCreate
    activityObjectNameSingular={StandardObjectNameSingular.Note}
  />
);
