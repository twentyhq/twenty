import { styled } from '@linaria/react';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';
import { IconBuildingSkyscraper, IconTrash, IconUser } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatApprovalConfirmation } from '@/ai/components/AiChatApprovalConfirmation';
import { AiChatApprovalRecordReview } from '@/ai/components/AiChatApprovalRecordReview';
import { AiChatApprovalReviewDeck } from '@/ai/components/AiChatApprovalReviewDeck';
import { AI_CHAT_APPROVAL_REVIEW_FIXTURES } from '@/ai/components/__stories__/aiChatApprovalReviewFixtures';
import { AiChatApprovalReviewExampleCell } from '@/ai/components/__stories__/AiChatApprovalReviewExampleCell';
import { type AiChatApprovalReviewSnapshot } from '@/ai/components/__stories__/AiChatApprovalReviewSnapshot';
import { getAiChatApprovalReviewRecordStatus } from '@/ai/components/__stories__/getAiChatApprovalReviewRecordStatus';
import { type AiChatApprovalReviewCard } from '@/ai/types/AiChatApprovalReviewCard';
import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';
import { TextDisplay } from '@/ui/field/display/components/TextDisplay/TextDisplay';

const APPROVAL_REVIEW_ICON_SIZE = 16;
const APPROVAL_REVIEW_ICONS = {
  create: IconUser,
  update: IconBuildingSkyscraper,
  delete: IconTrash,
};

const StyledExample = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  min-width: 0;
`;

type AiChatApprovalReviewExampleProps = {
  initialStatus?: AiChatApprovalReviewStatus;
  initialActiveIndex?: number;
  initialSelectedRecordIds?: Record<string, string[]>;
  onApprove: (snapshot: AiChatApprovalReviewSnapshot) => void;
  onDeny: (cardId: string) => void;
};

export const AiChatApprovalReviewExample = ({
  initialStatus = 'pending',
  initialActiveIndex = 0,
  initialSelectedRecordIds,
  onApprove,
  onDeny,
}: AiChatApprovalReviewExampleProps) => {
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [statuses, setStatuses] = useState<
    Record<string, AiChatApprovalReviewStatus>
  >(() =>
    Object.fromEntries(
      AI_CHAT_APPROVAL_REVIEW_FIXTURES.map(({ id }) => [id, initialStatus]),
    ),
  );
  const [selectedRecordIds, setSelectedRecordIds] = useState<
    Record<string, string[]>
  >(() =>
    Object.fromEntries(
      AI_CHAT_APPROVAL_REVIEW_FIXTURES.map(({ id, records }) => [
        id,
        initialSelectedRecordIds?.[id] ?? records.map((record) => record.id),
      ]),
    ),
  );
  const [recordValues, setRecordValues] = useState<
    Record<string, Record<string, string>>
  >(() =>
    Object.fromEntries(
      AI_CHAT_APPROVAL_REVIEW_FIXTURES.flatMap(({ records }) =>
        records.map(({ id, values }) => [id, { ...values }]),
      ),
    ),
  );
  const [confirmation, setConfirmation] =
    useState<AiChatApprovalReviewSnapshot | null>(null);

  const handleRequestApproval = (cardIds: string[]) => {
    setConfirmation({
      cards: AI_CHAT_APPROVAL_REVIEW_FIXTURES.filter(({ id }) =>
        cardIds.includes(id),
      ).map(({ id, title, records }) => {
        const selectedIds = selectedRecordIds[id] ?? [];

        return {
          id,
          title,
          selectedRecordIds: [...selectedIds],
          skippedRecordIds: records
            .filter((record) => !selectedIds.includes(record.id))
            .map((record) => record.id),
          records: records.map((record) => ({
            id: record.id,
            values: { ...recordValues[record.id] },
          })),
        };
      }),
    });
  };

  const handleConfirm = () => {
    if (!isDefined(confirmation)) {
      return;
    }

    onApprove(confirmation);
    setStatuses((currentStatuses) => ({
      ...currentStatuses,
      ...Object.fromEntries(
        confirmation.cards.map(({ id, selectedRecordIds }) => [
          id,
          selectedRecordIds.length > 0 ? 'success' : 'skipped',
        ]),
      ),
    }));
    setConfirmation(null);
  };

  const handleDeny = (cardId: string) => {
    setStatuses((currentStatuses) => ({
      ...currentStatuses,
      [cardId]: 'skipped',
    }));
    onDeny(cardId);
  };

  const cards: AiChatApprovalReviewCard[] =
    AI_CHAT_APPROVAL_REVIEW_FIXTURES.map((fixture) => {
      const selectedIds = selectedRecordIds[fixture.id] ?? [];
      const status = statuses[fixture.id] ?? 'pending';
      const isDisabled = status !== 'pending' || isDefined(confirmation);
      const Icon = APPROVAL_REVIEW_ICONS[fixture.operation];

      return {
        id: fixture.id,
        title: fixture.title,
        approveLabel: `${fixture.approveVerb} ${selectedIds.length}`,
        selectedCount: selectedIds.length,
        skippedCount: fixture.records.length - selectedIds.length,
        status,
        icon: <Icon size={APPROVAL_REVIEW_ICON_SIZE} />,
        isDestructive: fixture.operation === 'delete',
        hint: fixture.hint,
        progress:
          status === 'running'
            ? { completed: 1, total: fixture.records.length }
            : undefined,
        content: (
          <AiChatApprovalRecordReview
            label={`${fixture.title} review`}
            columns={fixture.columns}
            records={fixture.records.map((record) => ({
              ...record,
              status: getAiChatApprovalReviewRecordStatus({
                status,
                isSelected: selectedIds.includes(record.id),
              }),
            }))}
            selectedRecordIds={selectedIds}
            disabled={isDisabled}
            operation={fixture.operation}
            onSelectedRecordIdsChange={(recordIds) =>
              setSelectedRecordIds((currentIds) => ({
                ...currentIds,
                [fixture.id]: recordIds,
              }))
            }
            renderCell={({ recordId, columnId, isReadOnly }) => {
              const record = fixture.records.find(
                (candidate) => candidate.id === recordId,
              );
              const column = fixture.columns.find(
                (candidate) => candidate.id === columnId,
              );
              const value = recordValues[recordId]?.[columnId] ?? '';
              const previousValue = record?.previousValues?.[columnId];

              return {
                value: (
                  <AiChatApprovalReviewExampleCell
                    operation={fixture.operation}
                    column={column}
                    recordLabel={record?.label}
                    value={value}
                    isReadOnly={isReadOnly}
                    onValueChange={(nextValue) =>
                      setRecordValues((currentValues) => ({
                        ...currentValues,
                        [recordId]: {
                          ...currentValues[recordId],
                          [columnId]: nextValue,
                        },
                      }))
                    }
                  />
                ),
                previousValue: isDefined(previousValue) ? (
                  <TextDisplay text={previousValue} />
                ) : undefined,
                isChanged: isDefined(previousValue) && value !== previousValue,
              };
            }}
          />
        ),
      };
    });

  return (
    <StyledExample>
      <AiChatApprovalReviewDeck
        cards={cards}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onRequestApproval={handleRequestApproval}
        onDeny={handleDeny}
        disabled={isDefined(confirmation)}
      />
      {isDefined(confirmation) && (
        <AiChatApprovalConfirmation
          cards={confirmation.cards.map((card) => ({
            id: card.id,
            title: card.title,
            selectedCount: card.selectedRecordIds.length,
            skippedCount: card.skippedRecordIds.length,
          }))}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </StyledExample>
  );
};
