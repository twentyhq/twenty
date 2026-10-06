import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useOpenCoreWorkflowVersionsSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionsSidePanel';

export const SeeVersionsWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { openCoreWorkflowVersionsSidePanel } =
    useOpenCoreWorkflowVersionsSidePanel();

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to see versions workflow');
  }

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={() => openCoreWorkflowVersionsSidePanel(recordId)}
    />
  );
};
