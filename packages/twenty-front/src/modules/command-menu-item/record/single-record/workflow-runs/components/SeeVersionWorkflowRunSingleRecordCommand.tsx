import { CommandLink } from '@/command-menu-item/display/components/CommandLink';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SeeVersionWorkflowRunSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  if (!isDefined(recordStore) || !isDefined(recordStore?.workflowVersion?.id)) {
    return null;
  }

  return (
    <CommandLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: recordStore.workflowVersion.id,
      }}
    />
  );
};
