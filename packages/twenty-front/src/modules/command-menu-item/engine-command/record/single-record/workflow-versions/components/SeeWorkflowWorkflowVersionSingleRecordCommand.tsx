import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useSelectedRecordIdOrThrow } from '@/command-menu-item/record/single-record/hooks/useSelectedRecordIdOrThrow';
import { CoreObjectNameSingular, AppPath } from 'twenty-shared/types';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { isDefined } from 'twenty-shared/utils';

export const SeeWorkflowWorkflowVersionSingleRecordCommand = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const recordStore = useAtomFamilyStateValue(recordStoreFamilyState, recordId);

  if (!isDefined(recordStore) || !isDefined(recordStore?.workflow?.id)) {
    return null;
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: recordStore.workflow.id,
      }}
    />
  );
};
