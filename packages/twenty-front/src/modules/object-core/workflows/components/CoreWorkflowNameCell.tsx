import { CoreObjectNameSingular } from 'twenty-shared/types';

import { CoreObjectNameCell } from '@/object-core/components/cells/CoreObjectNameCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getAvatarShape } from '@/object-metadata/utils/getAvatarShape';

type CoreWorkflowNameCellProps = {
  name: string | null | undefined;
  workflowId: string;
};

export const CoreWorkflowNameCell = ({
  name,
  workflowId,
}: CoreWorkflowNameCellProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });

  return (
    <CoreObjectNameCell
      name={name}
      avatarColorSeed={workflowId}
      avatarShape={getAvatarShape(objectMetadataItem)}
    />
  );
};
