import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { Tag } from 'twenty-ui/data-display';

import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { type CoreWorkflowVersionStatus } from '~/generated/graphql';

const StyledRow = styled.div<{ isSelectable: boolean }>`
  align-items: center;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: ${({ isSelectable }) => (isSelectable ? 'pointer' : 'default')};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
  opacity: ${({ isSelectable }) => (isSelectable ? 1 : 0.5)};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background-color: ${({ isSelectable }) =>
      isSelectable
        ? themeCssVariables.background.transparent.light
        : 'transparent'};
  }
`;

const StyledLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledDate = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  margin-right: auto;
`;

type CoreWorkflowVersionsListItemProps = {
  id: string;
  label: string;
  createdAt: string;
  status: CoreWorkflowVersionStatus;
  isSelectable: boolean;
  onSelect: () => void;
};

export const CoreWorkflowVersionsListItem = ({
  id,
  label,
  createdAt,
  status,
  isSelectable,
  onSelect,
}: CoreWorkflowVersionsListItemProps) => {
  const { t } = useLingui();
  const tagProps = CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[status];

  return (
    <SelectableListItem itemId={id} onEnter={onSelect}>
      <StyledRow
        isSelectable={isSelectable}
        onClick={isSelectable ? onSelect : undefined}
      >
        <StyledLabel>{label}</StyledLabel>
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
