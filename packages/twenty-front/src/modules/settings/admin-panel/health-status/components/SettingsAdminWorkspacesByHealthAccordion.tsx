import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconChevronDown, IconChevronRight } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { Card } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledAccordionHeader = styled(Card.Content)`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[4]};
  text-align: left;
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

  if (workspaces.length === 0) {
    return (
      <Card.Root>
        <StyledAccordionHeader>{emptyLabel}</StyledAccordionHeader>
      </Card.Root>
    );
  }

  return (
    <Card.Root>
      <Collapsible.Root open={isExpanded} onOpenChange={setIsExpanded}>
        <StyledAccordionHeader render={<Collapsible.Trigger />}>
          <span>{filledLabel}</span>
          {isExpanded ? (
            <IconChevronDown size={16} />
          ) : (
            <IconChevronRight size={16} />
          )}
        </StyledAccordionHeader>
        <Collapsible.Panel dimension="height">
          <StyledAccordionContent>
            <StyledWorkspaceList>
              {workspaces.map((workspace) => (
                <li key={workspace.id}>
                  <ListItem
                    render={
                      <Link
                        to={getSettingsPath(
                          SettingsPath.AdminPanelWorkspaceDetail,
                          { workspaceId: workspace.id },
                        )}
                      />
                    }
                    description={workspace.id}
                  >
                    {workspace.name ?? t`Unknown workspace`}
                  </ListItem>
                </li>
              ))}
            </StyledWorkspaceList>
          </StyledAccordionContent>
        </Collapsible.Panel>
      </Collapsible.Root>
    </Card.Root>
  );
};
