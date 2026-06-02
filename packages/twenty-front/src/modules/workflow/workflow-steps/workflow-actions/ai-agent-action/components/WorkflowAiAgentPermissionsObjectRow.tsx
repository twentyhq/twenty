import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { MenuItem } from 'twenty-ui/navigation';

type WorkflowAiAgentPermissionsObjectRowProps = {
  objectMetadata: Pick<
    EnrichedObjectMetadataItem,
    'id' | 'icon' | 'labelPlural' | 'nameSingular' | 'color' | 'isSystem'
  >;
  onClick?: () => void;
  readonly: boolean;
};

export const WorkflowAiAgentPermissionsObjectRow = ({
  objectMetadata,
  onClick,
  readonly,
}: WorkflowAiAgentPermissionsObjectRowProps) => {
  return (
    <MenuItem
      LeftComponent={<ObjectMetadataIcon objectMetadataItem={objectMetadata} />}
      text={objectMetadata.labelPlural}
      hasSubMenu={!readonly}
      onClick={!readonly ? onClick : undefined}
    />
  );
};
