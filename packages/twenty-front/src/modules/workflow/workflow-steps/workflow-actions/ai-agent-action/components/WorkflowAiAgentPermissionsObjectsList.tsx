import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { t } from '@lingui/core/macro';
import { WorkflowAiAgentPermissionsObjectRow } from './WorkflowAiAgentPermissionsObjectRow';

type WorkflowAiAgentPermissionsObjectsListProps = {
  objects: Array<
    Pick<
      EnrichedObjectMetadataItem,
      'id' | 'icon' | 'labelPlural' | 'nameSingular' | 'color' | 'isSystem'
    >
  >;
  onObjectClick: (objectId: string) => void;
  readonly: boolean;
};

export const WorkflowAiAgentPermissionsObjectsList = ({
  objects,
  onObjectClick,
  readonly,
}: WorkflowAiAgentPermissionsObjectsListProps) => {
  return (
    <SidePanelGroup heading={t`Objects`}>
      {objects.map((objectMetadata) => (
        <WorkflowAiAgentPermissionsObjectRow
          key={objectMetadata.id}
          objectMetadata={objectMetadata}
          onClick={() => onObjectClick(objectMetadata.id)}
          readonly={readonly}
        />
      ))}
    </SidePanelGroup>
  );
};
