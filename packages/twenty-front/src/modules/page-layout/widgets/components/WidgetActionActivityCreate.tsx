import { useOpenCreateActivityDrawer } from '@/activities/hooks/useOpenCreateActivityDrawer';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { WidgetCardHeaderActionButton } from '@/page-layout/widgets/widget-card/components/WidgetCardHeaderActionButton';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { type CoreObjectNameSingular } from 'twenty-shared/types';
import { IconPlus } from 'twenty-ui/icon';

type WidgetActionActivityCreateProps = {
  activityObjectNameSingular:
    | CoreObjectNameSingular.Note
    | CoreObjectNameSingular.Task;
  label: string;
};

export const WidgetActionActivityCreate = ({
  activityObjectNameSingular,
  label,
}: WidgetActionActivityCreateProps) => {
  const targetRecord = useTargetRecord();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: targetRecord.targetObjectNameSingular,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const openCreateActivity = useOpenCreateActivityDrawer({
    activityObjectNameSingular,
  });

  if (!objectPermissions.canUpdateObjectRecords) {
    return null;
  }

  return (
    <WidgetCardHeaderActionButton
      Icon={IconPlus}
      label={label}
      onClick={() => openCreateActivity({ targetableObjects: [targetRecord] })}
    />
  );
};
