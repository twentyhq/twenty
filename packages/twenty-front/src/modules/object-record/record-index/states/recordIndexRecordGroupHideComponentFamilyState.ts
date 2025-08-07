import { createComponentFamilyState } from '@/ui/utilities/state/component-state/utils/createComponentFamilyState';
import { ViewComponentInstanceContext } from '@/views/states/contexts/ViewComponentInstanceContext';
import { ViewType } from '@/views/types/ViewType';

export const recordIndexRecordGroupHideComponentFamilyState =
  createComponentFamilyState<boolean, ViewType>({
    key: 'recordIndexRecordGroupHideComponentFamilyState',
    defaultValue: ({ familyKey }) => {
      switch (familyKey) {
        case ViewType.Kanban:
          return false;
        case ViewType.Table:
          return false;
        default:
          return false;
      }
    },
    componentInstanceContext: ViewComponentInstanceContext,
  });
