import { CommandMenuItemLink } from '@/command-menu-item/actions/components/CommandMenuItemLink';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';

export const SeeWorkflowWorkflowVersionSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  return (
    <CommandMenuItemLink
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: recordStore?.workflow?.id,
      }}
    />
  );
};
