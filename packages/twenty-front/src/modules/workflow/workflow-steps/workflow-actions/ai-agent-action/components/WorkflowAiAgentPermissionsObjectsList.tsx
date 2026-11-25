import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SidePanelGroup } from '@/side-panel/components/SidePanelGroup';
import { isDefined } from 'twenty-shared/utils';
import { ListItemButton } from 'twenty-ui/components/navigation';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { IconSettings } from 'twenty-ui/icon';
import { WorkflowAiAgentPermissionsObjectRow } from './WorkflowAiAgentPermissionsObjectRow';
import { useLingui } from '@lingui/react/macro';

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
  const { t } = useLingui();
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
      {isDefined(onSystemObjectsClick) &&
        (readonly ? (
          <ListItem startIcon={<IconSettings />}>{t`System objects`}</ListItem>
        ) : (
          <ListItemButton
            startIcon={<IconSettings />}
            hasSubmenu
            onClick={onSystemObjectsClick}
          >
            {t`System objects`}
          </ListItemButton>
        ))}
    </SidePanelGroup>
  );
};
