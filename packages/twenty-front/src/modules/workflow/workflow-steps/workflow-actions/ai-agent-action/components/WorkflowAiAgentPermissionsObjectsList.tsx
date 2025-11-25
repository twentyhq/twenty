import { StyledLabel, StyledList } from './WorkflowAiAgentPermissions.styles';
import { WorkflowAiAgentPermissionsObjectRow } from './WorkflowAiAgentPermissionsObjectRow';

type WorkflowAiAgentPermissionsObjectsListProps = {
  objects: Array<{
    id: string;
    icon?: string | null;
    labelPlural: string;
  }>;
  onObjectClick: (objectId: string) => void;
  readonly: boolean;
};

export const WorkflowAiAgentPermissionsObjectsList = ({
  objects,
  onObjectClick,
  readonly,
}: WorkflowAiAgentPermissionsObjectsListProps) => {
  return (
    <div>
      <StyledLabel>Objects</StyledLabel>
      <StyledList>
        {objects.map((objectMetadata) => (
          <WorkflowAiAgentPermissionsObjectRow
            key={objectMetadata.id}
            objectMetadata={objectMetadata}
            onClick={() => onObjectClick(objectMetadata.id)}
            readonly={readonly}
          />
        ))}
      </StyledList>
    </div>
  );
};
