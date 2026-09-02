import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/data-display';

import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type CoreWorkflowVersionStatus } from '~/generated/graphql';

const StyledRow = styled.div<{ isSelected: boolean; isSelectable: boolean }>`
  align-items: center;
  background-color: ${({ isSelected }) =>
    isSelected
      ? themeCssVariables.background.transparent.light
      : 'transparent'};
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isSelectable }) => (isSelectable ? 'pointer' : 'default')};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  opacity: ${({ isSelectable }) => (isSelectable ? 1 : 0.5)};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${({ isSelected, isSelectable }) =>
      isSelectable || isSelected
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }
`;

const StyledDate = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

type CoreWorkflowVersionsListItemProps = {
  id: string;
  createdAt: string;
  status: CoreWorkflowVersionStatus;
  isSelected: boolean;
  isSelectable: boolean;
  onSelect: () => void;
};

export const CoreWorkflowVersionsListItem = ({
  id,
  createdAt,
  status,
  isSelected,
  isSelectable,
  onSelect,
}: CoreWorkflowVersionsListItemProps) => {
  const { t } = useLingui();
  const tagProps = CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[status];

  return (
    <SelectableListItem
      itemId={id}
      onEnter={isSelectable ? onSelect : () => {}}
    >
      <StyledRow
        isSelected={isSelected}
        isSelectable={isSelectable}
        onClick={isSelectable ? onSelect : undefined}
      >
        <StyledDate>
          {new Date(createdAt).toLocaleDateString(undefined, {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </StyledDate>
        <Tag color={tagProps.color} text={t(tagProps.label)} />
      </StyledRow>
    </SelectableListItem>
  );
};
