import { createComponentFamilyStateV2 } from '@/ui/utilities/state/component-state/utils/createComponentFamilyStateV2';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';

export const recordIndexRecordGroupHideComponentFamilyState =
  createComponentFamilyStateV2<boolean, ViewType>({
    key: 'recordIndexRecordGroupHideComponentFamilyState',
    defaultValue: ({ familyKey }) => {
      switch (familyKey) {
        case ViewType.Kanban:
          return false;
        case ViewType.Table:
          return true;
        default:
          return false;
      }
    },
    componentInstanceContext: ViewComponentInstanceContext,
  });
