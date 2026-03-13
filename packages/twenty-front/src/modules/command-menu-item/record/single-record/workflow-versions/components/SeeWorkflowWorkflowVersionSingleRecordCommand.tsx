import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const SeeWorkflowWorkflowVersionSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return (
    <CommandLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: recordStore?.workflow?.id,
      }}
    />
  );
};
