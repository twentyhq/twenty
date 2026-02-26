import { ObjectSortDropdownComponentInstanceContext } from '@/object-record/object-sort-dropdown/states/context/ObjectSortDropdownComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';
import { ViewSortDirection } from '~/generated-metadata/graphql';

export const selectedRecordSortDirectionComponentState =
  createAtomComponentState<ViewSortDirection>({
    key: 'selectedRecordSortDirectionComponentState',
    defaultValue: ViewSortDirection.ASC,
    componentInstanceContext: ObjectSortDropdownComponentInstanceContext,
  });
