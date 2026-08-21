import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useIcons } from 'twenty-ui/icon';

import { CoreObjectNameCell } from '@/object-core/components/cells/CoreObjectNameCell';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';

type CoreWorkflowNameCellProps = {
  name: string | null | undefined;
};

export const CoreWorkflowNameCell = ({ name }: CoreWorkflowNameCellProps) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.Workflow,
  });
  const { getIcon } = useIcons();

  return (
    <CoreObjectNameCell name={name} Icon={getIcon(objectMetadataItem.icon)} />
  );
};
