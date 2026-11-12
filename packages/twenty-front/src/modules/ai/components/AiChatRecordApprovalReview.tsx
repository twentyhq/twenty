import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isString } from '@sniptt/guards';
import { capitalize, isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables, useTheme } from 'twenty-ui/theme';

import { AiChatApprovalRecordReview } from '@/ai/components/AiChatApprovalRecordReview';
import { AiChatToolCallApprovalFieldDisplay } from '@/ai/components/internal/AiChatToolCallApprovalFieldDisplay';
import { AiChatToolCallApprovalRecord } from '@/ai/components/internal/AiChatToolCallApprovalRecord';
import { AiChatToolCallApprovalRecordStoreEffect } from '@/ai/components/internal/AiChatToolCallApprovalRecordStoreEffect';
import { AI_CHAT_RECORD_APPROVAL_REVIEW_COLUMN_WIDTH } from '@/ai/constants/AiChatRecordApprovalReviewColumnWidth';
import { useToolCallApprovalFieldDefinitions } from '@/ai/hooks/useToolCallApprovalFieldDefinitions';
import { type AgentChatPendingRecordApproval } from '@/ai/types/AgentChatPendingRecordApproval';
import { isFieldRelationManyToOne } from '@/object-record/record-field/ui/types/guards/isFieldRelationManyToOne';

const RECORD_COLUMN_ID = 'id';

const StyledRawValue = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  overflow: hidden;
  text-overflow: ellipsis;
`;

type AiChatRecordApprovalReviewProps = {
  objectNameSingular: string;
  operation: 'create' | 'update' | 'delete';
  label: string;
  recordApprovals: AgentChatPendingRecordApproval[];
  selectedToolCallIds: string[];
  onSelectedToolCallIdsChange: (toolCallIds: string[]) => void;
  disabled: boolean;
};

export const AiChatRecordApprovalReview = ({
  objectNameSingular,
  operation,
  label,
  recordApprovals,
  selectedToolCallIds,
  onSelectedToolCallIdsChange,
  disabled,
}: AiChatRecordApprovalReviewProps) => {
  const { t } = useLingui();
  const theme = useTheme();
  const { getIcon } = useIcons();
  const { objectMetadataItem, fieldDefinitionsByArgumentName } =
    useToolCallApprovalFieldDefinitions(objectNameSingular);

  const argumentNames = [
    ...new Set(
      recordApprovals.flatMap(({ proposal }) =>
        Object.keys(proposal.arguments),
      ),
    ),
  ].filter((argumentName) => argumentName !== RECORD_COLUMN_ID);

  const columnIds =
    operation === 'create'
      ? argumentNames
      : [RECORD_COLUMN_ID, ...argumentNames];

  const columns = columnIds.map((columnId) => {
    const fieldDefinition = fieldDefinitionsByArgumentName.get(columnId);
    const isRecordColumn = columnId === RECORD_COLUMN_ID;
    const iconName = isRecordColumn
      ? objectMetadataItem.icon
      : fieldDefinition?.iconName;
    const Icon = getIcon(iconName);

    return {
      id: columnId,
      label:
        (isRecordColumn
          ? objectMetadataItem.labelSingular
          : fieldDefinition?.label) ?? columnId,
      icon: isDefined(iconName) ? (
        <Icon size={theme.icon.size.sm} />
      ) : undefined,
      width: AI_CHAT_RECORD_APPROVAL_REVIEW_COLUMN_WIDTH,
    };
  });

  return (
    <>
      {recordApprovals.map(({ toolCallId, proposal }) => (
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
        operation={operation}
        columns={columns}
        records={recordApprovals.map(({ toolCallId, proposal }) => ({
          id: toolCallId,
          label: proposal.summary,
        }))}
        selectedRecordIds={selectedToolCallIds}
        onSelectedRecordIdsChange={onSelectedToolCallIdsChange}
        disabled={disabled}
        renderCell={({ recordId: toolCallId, columnId }) => {
          const proposal = recordApprovals.find(
            (recordApproval) => recordApproval.toolCallId === toolCallId,
          )?.proposal;

          if (!isDefined(proposal)) {
            return { value: null };
          }

          if (columnId === RECORD_COLUMN_ID) {
            return {
              value: isDefined(proposal.recordId) ? (
                <AiChatToolCallApprovalRecord
                  objectNameSingular={objectNameSingular}
                  recordId={proposal.recordId}
                />
              ) : null,
            };
          }

          if (!(columnId in proposal.arguments)) {
            return { value: null };
          }

          const fieldDefinition = fieldDefinitionsByArgumentName.get(columnId);
          const value = proposal.arguments[columnId];

          if (
            !isDefined(fieldDefinition) ||
            isFieldRelationManyToOne(fieldDefinition)
          ) {
            return {
              value: (
                <StyledRawValue>
                  {isString(value) ? value : JSON.stringify(value)}
                </StyledRawValue>
              ),
            };
          }

          return {
            value: isDefined(value) ? (
              <AiChatToolCallApprovalFieldDisplay
                objectNameSingular={objectNameSingular}
                recordId={toolCallId}
                fieldDefinition={fieldDefinition}
              />
            ) : (
              <StyledRawValue>{t`Empty`}</StyledRawValue>
            ),
            previousValue: isDefined(proposal.recordId) ? (
              <AiChatToolCallApprovalFieldDisplay
                objectNameSingular={objectNameSingular}
                recordId={proposal.recordId}
                fieldDefinition={fieldDefinition}
              />
            ) : undefined,
            isChanged: isDefined(proposal.recordId),
          };
        }}
      />
    </>
  );
};
