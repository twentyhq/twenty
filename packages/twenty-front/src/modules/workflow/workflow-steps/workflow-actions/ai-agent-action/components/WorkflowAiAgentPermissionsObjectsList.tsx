import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/icon';
import { MenuItem } from 'twenty-ui/navigation';
import { WorkflowAiAgentPermissionsObjectRow } from './WorkflowAiAgentPermissionsObjectRow';

type WorkflowAiAgentPermissionsObjectsListProps = {
  heading?: string;
  objects: Array<
    Pick<
      EnrichedObjectMetadataItem,
      'id' | 'icon' | 'labelPlural' | 'nameSingular' | 'color' | 'isSystem'
    >
  >;
  onObjectClick: (objectId: string) => void;
  onSystemObjectsClick?: () => void;
  readonly: boolean;
};

export const WorkflowAiAgentPermissionsObjectsList = ({
  heading,
  objects,
  onObjectClick,
  onSystemObjectsClick,
  readonly,
}: WorkflowAiAgentPermissionsObjectsListProps) => {
  return (
    <SidePanelGroup heading={heading ?? t`Objects`}>
      {objects.map((objectMetadata) => (
        <WorkflowAiAgentPermissionsObjectRow
          key={objectMetadata.id}
          objectMetadata={objectMetadata}
          onClick={() => onObjectClick(objectMetadata.id)}
          readonly={readonly}
        />
      ))}
      {isDefined(onSystemObjectsClick) && (
        <MenuItem
          LeftIcon={IconSettings}
          text={t`System objects`}
          hasSubMenu={!readonly}
          onClick={!readonly ? onSystemObjectsClick : undefined}
        />
      )}
    </SidePanelGroup>
  );
};
