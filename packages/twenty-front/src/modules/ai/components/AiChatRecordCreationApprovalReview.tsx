import { styled } from '@linaria/react';
import { isString } from '@sniptt/guards';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatApprovalRecordReview } from '@/ai/components/AiChatApprovalRecordReview';
import { AiChatToolCallApprovalFieldDisplay } from '@/ai/components/internal/AiChatToolCallApprovalFieldDisplay';
import { AiChatToolCallApprovalRecordStoreEffect } from '@/ai/components/internal/AiChatToolCallApprovalRecordStoreEffect';
import { AI_CHAT_RECORD_CREATION_REVIEW_COLUMN_WIDTH } from '@/ai/constants/AiChatRecordCreationReviewColumnWidth';
import { useToolCallApprovalFieldDefinitions } from '@/ai/hooks/useToolCallApprovalFieldDefinitions';
import { type AgentChatPendingRecordCreation } from '@/ai/types/AgentChatPendingRecordCreation';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';

const StyledRawValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

type AiChatRecordCreationApprovalReviewProps = {
  objectNameSingular: string;
  label: string;
  recordCreations: AgentChatPendingRecordCreation[];
  selectedToolCallIds: string[];
  onSelectedToolCallIdsChange: (toolCallIds: string[]) => void;
  disabled: boolean;
};

export const AiChatRecordCreationApprovalReview = ({
  objectNameSingular,
  label,
  recordCreations,
  selectedToolCallIds,
  onSelectedToolCallIdsChange,
  disabled,
}: AiChatRecordCreationApprovalReviewProps) => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { fieldDefinitionsByArgumentName } =
    useToolCallApprovalFieldDefinitions(objectNameSingular);

  const argumentNames = [
    ...new Set(
      recordCreations.flatMap(({ proposal }) =>
        Object.keys(proposal.arguments),
      ),
    ),
  ].filter((argumentName) => argumentName !== 'id');

  const columns = argumentNames.map((argumentName) => {
    const fieldDefinition = fieldDefinitionsByArgumentName.get(argumentName);
    const Icon = getIcon(fieldDefinition?.iconName);

    return {
      id: argumentName,
      label: fieldDefinition?.label ?? argumentName,
      icon: isDefined(fieldDefinition) ? (
        <Icon size={theme.icon.size.sm} />
      ) : undefined,
      width: AI_CHAT_RECORD_CREATION_REVIEW_COLUMN_WIDTH,
    };
  });

  return (
    <>
      {recordCreations.map(({ toolCallId, proposal }) => (
        <AiChatToolCallApprovalRecordStoreEffect
          key={toolCallId}
          record={{
            ...proposal.arguments,
            id: toolCallId,
            __typename: capitalize(objectNameSingular),
          }}
        />
      ))}
      <AiChatApprovalRecordReview
        label={label}
        operation="create"
        columns={columns}
        records={recordCreations.map(({ toolCallId, proposal }) => ({
          id: toolCallId,
          label: proposal.summary,
        }))}
        selectedRecordIds={selectedToolCallIds}
        onSelectedRecordIdsChange={onSelectedToolCallIdsChange}
        disabled={disabled}
        renderCell={({ recordId, columnId }) => {
          const fieldDefinition = fieldDefinitionsByArgumentName.get(columnId);
          const value = recordCreations.find(
            ({ toolCallId }) => toolCallId === recordId,
          )?.proposal.arguments[columnId];

          if (!isDefined(value)) {
            return { value: null };
          }

          return {
            value:
              isDefined(fieldDefinition) &&
              !isFieldRelationManyToOne(fieldDefinition) ? (
                <AiChatToolCallApprovalFieldDisplay
                  objectNameSingular={objectNameSingular}
                  recordId={recordId}
                  fieldDefinition={fieldDefinition}
                />
              ) : (
                <StyledRawValue>
                  {isString(value) ? value : JSON.stringify(value)}
                </StyledRawValue>
              ),
          };
        }}
      />
    </>
  );
};
