import { Draggable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { Avatar, Tag } from 'twenty-ui/primitives/data-display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { getCssCompatibleDraggableProps } from '@/ui/layout/draggable-list/utils/getCssCompatibleDraggableProps';
import { getAbsoluteImageUrl } from '~/utils/image/getAbsoluteImageUrl';

const StyledRow = styled.div<{ isDragging: boolean }>`
  align-items: center;
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  box-shadow: ${({ isDragging }) =>
    isDragging ? themeCssVariables.boxShadow.strong : 'none'};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  padding: ${themeCssVariables.spacing['2']};
`;

const StyledIssueKey = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 56px;
`;

const StyledTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type BacklogIssueRowProps = {
  issue: ObjectRecord;
  index: number;
  priorityField?: FieldMetadataItem;
};

export const BacklogIssueRow = ({
  issue,
  index,
  priorityField,
}: BacklogIssueRowProps) => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const priorityOption = priorityField?.options?.find(
    (option) => option.value === issue.priority,
  );

  const assignee = issue.assignee as
    | {
        name?: { firstName?: string; lastName?: string };
        avatarUrl?: string | null;
      }
    | null
    | undefined;
  const assigneeName = assignee?.name
    ? `${assignee.name.firstName ?? ''} ${assignee.name.lastName ?? ''}`.trim()
    : undefined;

  return (
    <Draggable draggableId={issue.id} index={index}>
      {(provided, snapshot) => (
        <StyledRow
          ref={provided.innerRef}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...getCssCompatibleDraggableProps(provided.draggableProps)}
          // oxlint-disable-next-line react/jsx-props-no-spreading
          {...provided.dragHandleProps}
          isDragging={snapshot.isDragging}
          onClick={() =>
            openRecordInSidePanel({
              recordId: issue.id,
              objectNameSingular: 'issue',
            })
          }
        >
          <StyledIssueKey>{issue.issueKey}</StyledIssueKey>
          <StyledTitle>{issue.title}</StyledTitle>
          {priorityOption && (
            <Tag text={priorityOption.label} color={priorityOption.color} />
          )}
          {issue.storyPoints !== null && issue.storyPoints !== undefined && (
            <Tag text={`${issue.storyPoints} pts`} color="gray" />
          )}
          {assigneeName && (
            <Avatar
              placeholder={assigneeName}
              avatarUrl={getAbsoluteImageUrl(assignee?.avatarUrl)}
              type="rounded"
              size="lg"
            />
          )}
        </StyledRow>
      )}
    </Draggable>
  );
};
