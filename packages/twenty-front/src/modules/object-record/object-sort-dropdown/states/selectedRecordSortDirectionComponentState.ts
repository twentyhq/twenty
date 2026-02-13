import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createComponentState } from '@/ui/utilities/state/component-state/utils/createComponentState';
import { ViewSortDirection } from '~/generated-metadata/graphql';

export const selectedRecordSortDirectionComponentState =
  createComponentState<ViewSortDirection>({
    key: 'selectedRecordSortDirectionComponentState',
    defaultValue: ViewSortDirection.ASC,
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });
