import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatApprovalConfirmation } from '@/ai/components/AiChatApprovalConfirmation';
import { AiChatApprovalMergeReview } from '@/ai/components/AiChatApprovalMergeReview';
import { type AiChatApprovalMergeFixture } from '@/ai/components/__stories__/AiChatApprovalMergeFixture';
import { AiChatApprovalMergeReviewFields } from '@/ai/components/__stories__/AiChatApprovalMergeReviewFields';
import { type AiChatApprovalMergeReviewSnapshot } from '@/ai/components/__stories__/AiChatApprovalMergeReviewSnapshot';
import { AI_CHAT_APPROVAL_MERGE_FIXTURES } from '@/ai/components/__stories__/aiChatApprovalMergeFixtures';
import { type AiChatApprovalMergePair } from '@/ai/types/AiChatApprovalMergePair';
import { type AiChatApprovalMergeSourceRecord } from '@/ai/types/AiChatApprovalMergeSourceRecord';
import { type AiChatApprovalReviewStatus } from '@/ai/types/AiChatApprovalReviewStatus';

const createSourceRecord = (
  source: AiChatApprovalMergeFixture['sources'][number],
): AiChatApprovalMergeSourceRecord => ({
  id: source.id,
  name: source.name,
  subtitle: source.subtitle,
  avatarIcon: source.avatarIcon,
  content: <AiChatApprovalMergeReviewFields fields={source.fields} />,
});

const mapMergeFixturesById = <TValue,>(
  getValue: (fixture: AiChatApprovalMergeFixture) => TValue,
): Record<string, TValue> =>
  Object.fromEntries(
    AI_CHAT_APPROVAL_MERGE_FIXTURES.map((fixture) => [
      fixture.id,
      getValue(fixture),
    ]),
  );

type AiChatApprovalMergeReviewExampleProps = {
  initialStatus?: AiChatApprovalReviewStatus;
  initialStatuses?: Record<string, AiChatApprovalReviewStatus>;
  initialActiveIndex?: number;
  initialPriorityRecordIds?: Record<string, string>;
  initialActiveTab?: AiChatApprovalMergePair['activeTab'];
  onMerge: (snapshot: AiChatApprovalMergeReviewSnapshot) => void;
  onSkip: (pairId: string) => void;
};

export const AiChatApprovalMergeReviewExample = ({
  initialStatus = 'pending',
  initialStatuses,
  initialActiveIndex = 0,
  initialPriorityRecordIds,
  initialActiveTab = 'preview',
  onMerge,
  onSkip,
}: AiChatApprovalMergeReviewExampleProps) => {
  const { t } = useLingui();
  const [activeIndex, setActiveIndex] = useState(initialActiveIndex);
  const [statuses, setStatuses] = useState(() =>
    mapMergeFixturesById(({ id }) => initialStatuses?.[id] ?? initialStatus),
  );
  const [priorityRecordIds, setPriorityRecordIds] = useState(() =>
    mapMergeFixturesById(
      ({ id, sources }) => initialPriorityRecordIds?.[id] ?? sources[0].id,
    ),
  );
  const [activeTabs, setActiveTabs] = useState(() =>
    mapMergeFixturesById(() => initialActiveTab),
  );
  const [confirmation, setConfirmation] =
    useState<AiChatApprovalMergeReviewSnapshot | null>(null);

  const handleRequestMerge = (pairIds: string[]) => {
    setConfirmation({
      pairs: AI_CHAT_APPROVAL_MERGE_FIXTURES.filter(
        ({ id }) => pairIds.includes(id) && statuses[id] === 'pending',
      ).map(({ id, sources }) => ({
        pairId: id,
        priorityRecordId: priorityRecordIds[id],
        sourceRecordIds: [sources[0].id, sources[1].id],
      })),
    });
  };

  const handleConfirm = () => {
    if (!isDefined(confirmation)) {
      return;
    }

    onMerge(confirmation);
    setStatuses((currentStatuses) => ({
      ...currentStatuses,
      ...Object.fromEntries(
        confirmation.pairs.map(({ pairId }) => [pairId, 'success']),
      ),
    }));
    setConfirmation(null);
  };

  const handleSkip = (pairId: string) => {
    setStatuses((currentStatuses) => ({
      ...currentStatuses,
      [pairId]: 'skipped',
    }));
    onSkip(pairId);
  };

  const pairs: AiChatApprovalMergePair[] = AI_CHAT_APPROVAL_MERGE_FIXTURES.map(
    (fixture) => {
      const priorityRecordId = priorityRecordIds[fixture.id];
      const previewFields = fixture.previews[priorityRecordId];
      const status = statuses[fixture.id];

      return {
        id: fixture.id,
        title: fixture.title,
        sources: [
          createSourceRecord(fixture.sources[0]),
          createSourceRecord(fixture.sources[1]),
        ],
        priorityRecordId,
        activeTab: activeTabs[fixture.id],
        preview: isDefined(previewFields) ? (
          <AiChatApprovalMergeReviewFields fields={previewFields} />
        ) : null,
        status,
        outcomeMessage:
          status === 'uncertain'
            ? t`Check the merge result before trying again`
            : undefined,
        progress: status === 'running' ? { completed: 1, total: 2 } : undefined,
      };
    },
  );

  return (
    <>
      <AiChatApprovalMergeReview
        pairs={pairs}
        activeIndex={activeIndex}
        onActiveIndexChange={setActiveIndex}
        onTabChange={({ pairId, tab }) =>
          setActiveTabs((currentTabs) => ({ ...currentTabs, [pairId]: tab }))
        }
        onPriorityRecordChange={({ pairId, priorityRecordId }) =>
          setPriorityRecordIds((currentPriorities) => ({
            ...currentPriorities,
            [pairId]: priorityRecordId,
          }))
        }
        onRequestMerge={handleRequestMerge}
        onSkip={handleSkip}
        disabled={isDefined(confirmation)}
      />
      {isDefined(confirmation) && (
        <AiChatApprovalConfirmation
          cards={confirmation.pairs.map(({ pairId }) => {
            const fixture = AI_CHAT_APPROVAL_MERGE_FIXTURES.find(
              ({ id }) => id === pairId,
            );
            const firstSourceName = fixture?.sources[0].name;
            const secondSourceName = fixture?.sources[1].name;

            return {
              id: pairId,
              title: t`Merge ${firstSourceName} and ${secondSourceName}`,
              selectedCount: 2,
              skippedCount: 0,
            };
          })}
          onConfirm={handleConfirm}
          onCancel={() => setConfirmation(null)}
        />
      )}
    </>
  );
};
