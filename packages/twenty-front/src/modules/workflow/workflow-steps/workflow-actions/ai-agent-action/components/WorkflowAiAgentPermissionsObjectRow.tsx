import { isDefined } from 'twenty-shared/utils';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ListItem } from 'twenty-ui/primitives/navigation';

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
    <ListItem
      hasSubmenu={!readonly}
      onClick={
        !readonly && isDefined(onClick)
          ? (event) => {
              event.preventDefault();
              onClick();
            }
          : undefined
      }
      startIcon={<ObjectMetadataIcon objectMetadataItem={objectMetadata} />}
    >
      {objectMetadata.labelPlural}
    </ListItem>
  );
};
