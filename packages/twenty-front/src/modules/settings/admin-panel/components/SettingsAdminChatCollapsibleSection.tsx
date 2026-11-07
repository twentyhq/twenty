import { styled } from '@linaria/react';
import { type ReactNode, useState } from 'react';

import { Button } from 'twenty-ui/primitives/input';
import { IconChevronDown } from 'twenty-ui/icon';
import { Collapsible } from 'twenty-ui/primitives/layout';
import { themeCssVariables } from 'twenty-ui/theme';

type SettingsAdminChatCollapsibleSectionProps = {
  label: string;
  defaultExpanded?: boolean;
  children: ReactNode;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledChevron = styled.span`
  display: flex;
  transform: rotate(0deg);

  [data-panel-open] & {
    transform: rotate(180deg);
  }
`;

export const SettingsAdminChatCollapsibleSection = ({
  label,
  defaultExpanded = false,
  children,
}: SettingsAdminChatCollapsibleSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  return (
    <Collapsible.Root
      open={isExpanded}
      onOpenChange={setIsExpanded}
      render={<StyledContainer />}
    >
      <Collapsible.Trigger render={<Button variant="link" />}>
        {label}
        <StyledChevron>
          <IconChevronDown size={14} />
        </StyledChevron>
      </Collapsible.Trigger>
      <Collapsible.Panel>{children}</Collapsible.Panel>
    </Collapsible.Root>
  );
};
