import { FrontComponentRenderer } from '@/front-components/components/FrontComponentRenderer';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { type IconComponent, Label } from 'twenty-ui/display';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(2)};
  min-height: 120px;
  padding: ${({ theme }) => theme.spacing(2)} 0;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

type CommandMenuItemFrontComponentDisplayProps = {
  frontComponentId: string;
  displayLabel: string;
  itemKey: string;
  Icon: IconComponent;
};

export const CommandMenuItemFrontComponentDisplay = ({
  frontComponentId,
  displayLabel,
  itemKey,
  Icon,
}: CommandMenuItemFrontComponentDisplayProps) => {
  const theme = useTheme();

  return (
    <SelectableListItem itemId={itemKey}>
      <StyledContainer>
        <StyledHeader>
          <Icon size={theme.icon.size.sm} />
          <Label>{displayLabel}</Label>
        </StyledHeader>
        <FrontComponentRenderer frontComponentId={frontComponentId} />
      </StyledContainer>
    </SelectableListItem>
  );
};
