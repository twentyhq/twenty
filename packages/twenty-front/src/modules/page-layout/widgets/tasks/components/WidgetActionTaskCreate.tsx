import { WidgetActionActivityCreate } from '@/page-layout/widgets/components/WidgetActionActivityCreate';
import { t } from '@lingui/core/macro';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const WidgetActionTaskCreate = () => (
  <WidgetActionActivityCreate
    activityObjectNameSingular={CoreObjectNameSingular.Task}
    label={t`New task`}
  />
);
