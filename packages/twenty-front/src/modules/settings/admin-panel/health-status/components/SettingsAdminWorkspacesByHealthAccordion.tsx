import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight } from 'twenty-ui/display';
import { AnimatedExpandableContainer, Card } from 'twenty-ui/layout';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledAccordionHeaderButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  text-align: left;
  width: 100%;
`;

const StyledAccordionHeaderButtonDisabled = styled(StyledAccordionHeaderButton)`
  cursor: default;
`;

const StyledAccordionContent = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.medium};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
`;

const StyledWorkspaceList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
`;

const StyledWorkspaceListItem = styled.li`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  font-size: ${themeCssVariables.font.size.sm};

  &:last-child {
    border-bottom: none;
  }
`;

const StyledWorkspaceLink = styled(Link)`
  color: ${themeCssVariables.font.color.secondary};
  display: block;
  padding: ${themeCssVariables.spacing[2]} 0;
  text-decoration: none;

  &:hover {
    color: ${themeCssVariables.font.color.primary};
    text-decoration: underline;
  }
`;

type WorkspaceUpgradeRefItem = {
  id: string;
  name?: string | null;
};

type SettingsAdminWorkspacesByHealthAccordionProps = {
  filledLabel: string;
  emptyLabel: string;
  workspaces: WorkspaceUpgradeRefItem[];
  defaultExpanded?: boolean;
};

export const SettingsAdminWorkspacesByHealthAccordion = ({
  filledLabel,
  emptyLabel,
  workspaces,
  defaultExpanded = false,
}: SettingsAdminWorkspacesByHealthAccordionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const hasWorkspaces = workspaces.length > 0;

  return (
    <Card rounded={true}>
      {hasWorkspaces ? (
        <StyledAccordionHeaderButton
          onClick={() => setIsExpanded((currentValue) => !currentValue)}
        >
          <span>{filledLabel}</span>
          {isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </StyledAccordionHeaderButton>
      ) : (
        <StyledAccordionHeaderButtonDisabled>
          <span>{emptyLabel}</span>
        </StyledAccordionHeaderButtonDisabled>
      )}
      {hasWorkspaces && (
        <AnimatedExpandableContainer
          isExpanded={isExpanded}
          dimension="height"
          mode="scroll-height"
        >
          <StyledAccordionContent>
            <StyledWorkspaceList>
              {workspaces.map((workspace) => (
                <StyledWorkspaceListItem key={workspace.id}>
                  <StyledWorkspaceLink
                    to={getSettingsPath(
                      SettingsPath.AdminPanelWorkspaceDetail,
                      { workspaceId: workspace.id },
                    )}
                  >
                    {workspace.name ?? t`Unknown workspace`}
                    {' - '}
                    {workspace.id}
                  </StyledWorkspaceLink>
                </StyledWorkspaceListItem>
              ))}
            </StyledWorkspaceList>
          </StyledAccordionContent>
        </AnimatedExpandableContainer>
      )}
    </Card>
  );
};
