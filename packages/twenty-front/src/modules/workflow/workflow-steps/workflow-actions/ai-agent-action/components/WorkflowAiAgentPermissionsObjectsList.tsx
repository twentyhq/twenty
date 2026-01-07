import { t } from '@lingui/core/macro';
import { WorkflowAiAgentPermissionsObjectRow } from './WorkflowAiAgentPermissionsObjectRow';
import { StyledLabel, StyledList } from './WorkflowAiAgentPermissionsStyles';

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
      <StyledLabel>{t`Objects`}</StyledLabel>
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
