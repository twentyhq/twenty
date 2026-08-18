import { WidgetActionActivityCreate } from '@/page-layout/widgets/components/WidgetActionActivityCreate';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const WidgetActionNoteCreate = () => (
  <WidgetActionActivityCreate
    activityObjectNameSingular={CoreObjectNameSingular.Note}
    label={t`New note`}
  />
);
