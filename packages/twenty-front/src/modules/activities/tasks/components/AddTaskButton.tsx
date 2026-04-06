import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useAICElement } from '@aicorg/sdk-react';
import { t } from '@lingui/core/macro';
import { IconPlus } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';

export const AddTaskButton = ({
  activityTargetableObject,
}: {
  activityTargetableObject: ActivityTargetableObject;
}) => {
  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular: CoreObjectNameSingular.Task,
  });

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: activityTargetableObject.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasObjectUpdatePermissions = objectPermissions.canUpdateObjectRecords;

  if (!hasObjectUpdatePermissions) {
    return null;
  }

  const taskAction = useAICElement({
    agentId: `${activityTargetableObject.targetObjectNameSingular}.task.add.list.${activityTargetableObject.id}`,
    agentAction: 'open',
    agentDescription:
      'Open the task creation flow for the current record without leaving the current record page.',
    agentEntityId: activityTargetableObject.id,
    agentEntityLabel: `${activityTargetableObject.targetObjectNameSingular} ${activityTargetableObject.id}`,
    agentEntityType: activityTargetableObject.targetObjectNameSingular,
    agentExamples: ['Follow up with Google procurement before proposal review.'],
    agentLabel: `Add task to ${activityTargetableObject.targetObjectNameSingular}`,
    agentRisk: 'medium',
    agentWorkflowStep: `${activityTargetableObject.targetObjectNameSingular}.add_task`,
  });

  return (
    <div {...taskAction.attributes}>
      <Button
        Icon={IconPlus}
        size="small"
        variant="secondary"
        title={t`Add task`}
        onClick={() =>
          openCreateActivity({
            targetableObjects: [activityTargetableObject],
          })
        }
      />
    </div>
  );
};
