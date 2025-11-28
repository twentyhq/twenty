import { useTheme } from '@emotion/react';
import { useIcons } from 'twenty-ui/display';
import {
  StyledIconChevronRight,
  StyledIconContainer,
  StyledRow,
  StyledRowLeftContent,
  StyledText,
} from './WorkflowAiAgentPermissionsStyles';

type WorkflowAiAgentPermissionsObjectRowProps = {
  objectMetadata: {
    id: string;
    icon?: string | null;
    labelPlural: string;
  };
  onClick?: () => void;
  readonly: boolean;
};

export const WorkflowAiAgentPermissionsObjectRow = ({
  objectMetadata,
  onClick,
  readonly,
}: WorkflowAiAgentPermissionsObjectRowProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const IconComponent = getIcon(objectMetadata.icon);

  return (
    <StyledRow
      key={objectMetadata.id}
      onClick={!readonly ? onClick : undefined}
    >
      <StyledRowLeftContent>
        <StyledIconContainer>
          <IconComponent size={theme.icon.size.sm} />
        </StyledIconContainer>
        <StyledText>{objectMetadata.labelPlural}</StyledText>
      </StyledRowLeftContent>
      <StyledIconChevronRight size={theme.icon.size.sm} />
    </StyledRow>
  );
};
