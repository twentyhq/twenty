import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentStateV2 } from '@/ui/utilities/state/jotai/utils/createComponentStateV2';
import { ViewSortDirection } from '~/generated-metadata/graphql';

export const selectedRecordSortDirectionComponentState =
  createComponentStateV2<ViewSortDirection>({
    key: 'selectedRecordSortDirectionComponentState',
    defaultValue: ViewSortDirection.ASC,
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });
