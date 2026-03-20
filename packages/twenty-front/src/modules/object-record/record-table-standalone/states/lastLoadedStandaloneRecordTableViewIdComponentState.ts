import { RecordFieldsComponentInstanceContext } from '@/object-record/record-field/states/context/RecordFieldsComponentInstanceContext';
import { createAtomComponentState } from '@/ui/utilities/state/jotai/utils/createAtomComponentState';

export const lastLoadedStandaloneRecordTableViewIdComponentState =
  createAtomComponentState<string | null>({
    key: 'lastLoadedStandaloneRecordTableViewIdComponentState',
    defaultValue: null,
    componentInstanceContext: RecordFieldsComponentInstanceContext,
  });
