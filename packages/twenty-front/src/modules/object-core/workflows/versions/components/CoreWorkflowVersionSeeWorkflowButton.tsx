import { useLingui } from '@lingui/react/macro';
import { AppPath, CoreObjectNameSingular } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/input';
import { IconSettingsAutomation } from 'twenty-ui/icon';

export const CoreWorkflowVersionSeeWorkflowButton = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { t } = useLingui();

  return (
    <Button
      title={t`See Workflow`}
      Icon={IconSettingsAutomation}
      variant="secondary"
      size="small"
      to={getAppPath(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.Workflow,
        objectRecordId: workflowId,
      })}
    />
  );
};
