import { useState } from 'react';

import { Droppable } from '@hello-pangea/dnd';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/primitives/data-display';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { useUpdateOneRecord } from '@/object-record/hooks/useUpdateOneRecord';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { BacklogIssueRow } from '@/task-manager/backlog/components/BacklogIssueRow';
import { useCompleteSprint } from '@/task-manager/backlog/hooks/useCompleteSprint';

const StyledSection = styled.div`
  margin-bottom: ${themeCssVariables.spacing['6']};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  padding: ${themeCssVariables.spacing['2']};
`;

const StyledSectionTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledSectionCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledDropZone = styled.div<{ isDraggingOver: boolean }>`
  background: ${({ isDraggingOver }) =>
    isDraggingOver ? themeCssVariables.background.tertiary : 'transparent'};
  min-height: 40px;
`;

const STATE_COLOR: Record<string, 'sky' | 'purple' | 'green'> = {
  FUTURE: 'sky',
  ACTIVE: 'purple',
  CLOSED: 'green',
};

type BacklogSprintSectionProps = {
  sprint?: ObjectRecord;
  droppableId: string;
  title: string;
  issues: ObjectRecord[];
  priorityField?: FieldMetadataItem;
  nextFutureSprintId?: string;
  onSprintChanged: () => void;
};

export const BacklogSprintSection = ({
  sprint,
  droppableId,
  title,
  issues,
  priorityField,
  nextFutureSprintId,
  onSprintChanged,
}: BacklogSprintSectionProps) => {
  const { t } = useLingui();
  const { updateOneRecord } = useUpdateOneRecord();
  const { completeSprint, loading: isCompleting } = useCompleteSprint();
  const [isStarting, setIsStarting] = useState(false);

  const handleStartSprint = async () => {
    if (!sprint) {
      return;
    }

    setIsStarting(true);
    try {
      await updateOneRecord({
        objectNameSingular: 'sprint',
        idToUpdate: sprint.id,
        updateOneRecordInput: {
          state: 'ACTIVE',
          startDate: new Date().toISOString(),
        },
      });
      onSprintChanged();
    } finally {
      setIsStarting(false);
    }
  };

  const handleCompleteSprint = async () => {
    if (!sprint) {
      return;
    }

    await completeSprint(sprint.id, nextFutureSprintId ?? null);
    onSprintChanged();
  };

  return (
    <StyledSection>
      <StyledSectionHeader>
        <StyledSectionTitle>{title}</StyledSectionTitle>
        {sprint && (
          <Tag
            text={sprint.state as string}
            color={STATE_COLOR[sprint.state as string] ?? 'gray'}
          />
        )}
        <StyledSectionCount>
          <Trans>{issues.length} issues</Trans>
        </StyledSectionCount>
        {sprint?.state === 'FUTURE' && (
          <Button
            title={t`Start sprint`}
            onClick={handleStartSprint}
            disabled={isStarting}
            variant="secondary"
          />
        )}
        {sprint?.state === 'ACTIVE' && (
          <Button
            title={t`Complete sprint`}
            onClick={handleCompleteSprint}
            disabled={isCompleting}
            variant="secondary"
          />
        )}
      </StyledSectionHeader>
      <Droppable droppableId={droppableId}>
        {(provided, snapshot) => (
          <StyledDropZone
            ref={provided.innerRef}
            // oxlint-disable-next-line react/jsx-props-no-spreading
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
          >
            {issues.map((issue, index) => (
              <BacklogIssueRow
                key={issue.id}
                issue={issue}
                index={index}
                priorityField={priorityField}
              />
            ))}
            {provided.placeholder}
          </StyledDropZone>
        )}
      </Droppable>
    </StyledSection>
  );
};
