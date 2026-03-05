import { useIcons } from 'twenty-ui/display';
import {
  StyledIconChevronRight,
  StyledIconContainer,
  StyledRow,
  StyledRowLeftContent,
  StyledText,
} from './WorkflowAiAgentPermissionsStyles';
import {
  resolveThemeVariableAsNumber,
  themeCssVariables,
} from 'twenty-ui/theme-constants';
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
  const { getIcon } = useIcons();
  const IconComponent = getIcon(objectMetadata.icon);

  return (
    <StyledRow
      key={objectMetadata.id}
      onClick={!readonly ? onClick : undefined}
    >
      <StyledRowLeftContent>
        <StyledIconContainer>
          <IconComponent
            size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.sm)}
          />
        </StyledIconContainer>
        <StyledText>{objectMetadata.labelPlural}</StyledText>
      </StyledRowLeftContent>
      <StyledIconChevronRight
        size={resolveThemeVariableAsNumber(themeCssVariables.icon.size.sm)}
      />
    </StyledRow>
  );
};
