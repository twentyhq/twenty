import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconArrowMerge, IconSettings } from 'twenty-ui/icon';
import { Avatar, Chip } from 'twenty-ui/primitives/data-display';
import { Tabs } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { type AiChatApprovalMergePair } from '@/ai/types/AiChatApprovalMergePair';
import { MergePrioritySettings } from '@/object-record/record-merge/components/MergePrioritySettings';
import { getPositionNumberIcon } from '@/object-record/record-merge/utils/getPositionNumberIcon';
import { getPositionWordLabel } from '@/object-record/record-merge/utils/getPositionWordLabel';

const MERGE_REVIEW_ICON_SIZE = 16;
const MERGE_REVIEW_HEADER_HEIGHT = 40;
const TAB_FOCUS_RING_OUTSET = 3;
const SOURCE_TAB_VALUES = ['first', 'second'] as const;

const StyledReview = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${MERGE_REVIEW_HEADER_HEIGHT}px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledName = styled.div`
  color: ${themeCssVariables.font.color.primary};
  flex: 1;
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  min-width: 0;
  overflow-wrap: anywhere;
`;

const StyledSubtitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.md};
  overflow-wrap: anywhere;
`;

const StyledSources = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledTabsScrollContainer = styled.div`
  margin: -${TAB_FOCUS_RING_OUTSET}px 0;
  overflow-x: auto;
  padding: ${TAB_FOCUS_RING_OUTSET}px 0;
`;

const StyledTabsList = styled.div`
  min-width: max-content;
  padding: 0 ${themeCssVariables.spacing[2]};
`;

const StyledContent = styled.div`
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFields = styled.div`
  background: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  min-width: 0;
  padding: ${themeCssVariables.spacing[1]};
`;

type AiChatApprovalMergeReviewContentProps = {
  pair: Pick<
    AiChatApprovalMergePair,
    'id' | 'sources' | 'priorityRecordId' | 'activeTab' | 'preview'
  >;
  onTabChange: (tab: AiChatApprovalMergePair['activeTab']) => void;
  onPriorityRecordChange: (recordId: string) => void;
  disabled?: boolean;
};

export const AiChatApprovalMergeReviewContent = ({
  pair,
  onTabChange,
  onPriorityRecordChange,
  disabled = false,
}: AiChatApprovalMergeReviewContentProps) => {
  const { t } = useLingui();
  const priorityRecordIndex = pair.sources.findIndex(
    ({ id }) => id === pair.priorityRecordId,
  );
  const priorityRecord = pair.sources[priorityRecordIndex];
  const displayedRecord = {
    preview: priorityRecord,
    first: pair.sources[0],
    second: pair.sources[1],
    settings: priorityRecord,
  }[pair.activeTab];

  return (
    <StyledReview>
      <StyledHeader>
        {isDefined(displayedRecord) && (
          <>
            <Avatar
              name={displayedRecord.name}
              src={displayedRecord.avatarUrl}
              icon={displayedRecord.avatarIcon}
              shape="square"
              size="lg"
            />
            <StyledName>{displayedRecord.name}</StyledName>
            <StyledSubtitle>{displayedRecord.subtitle}</StyledSubtitle>
          </>
        )}
      </StyledHeader>
      <StyledSources role="group" aria-label={t`Source records`}>
        {pair.sources.map(({ id, name }, index) => {
          const positionLabel = getPositionWordLabel(index);

          return (
            <Chip
              key={id}
              variant="soft"
              endElement={
                id === pair.priorityRecordId ? t`Survives` : undefined
              }
              endElementDivider
            >
              {t`${positionLabel}: ${name}`}
            </Chip>
          );
        })}
      </StyledSources>
      <Tabs.Root value={pair.activeTab} onValueChange={onTabChange}>
        <StyledTabsScrollContainer>
          <Tabs.List
            aria-label={t`Merge review tabs`}
            render={<StyledTabsList />}
          >
            <Tabs.Tab
              value="preview"
              size="compact"
              startIcon={<IconArrowMerge size={MERGE_REVIEW_ICON_SIZE} />}
            >{t`Merge preview`}</Tabs.Tab>
            {pair.sources.map((source, index) => {
              const Icon = getPositionNumberIcon(index);

              return (
                <Tabs.Tab
                  key={source.id}
                  value={SOURCE_TAB_VALUES[index]}
                  size="compact"
                  startIcon={<Icon size={MERGE_REVIEW_ICON_SIZE} />}
                >
                  {getPositionWordLabel(index)}
                </Tabs.Tab>
              );
            })}
            <Tabs.Tab
              value="settings"
              size="compact"
              startIcon={<IconSettings size={MERGE_REVIEW_ICON_SIZE} />}
            >{t`Settings`}</Tabs.Tab>
            <Tabs.Indicator />
          </Tabs.List>
        </StyledTabsScrollContainer>
        <Tabs.Panel value="preview">
          {isDefined(priorityRecord) && (
            <StyledContent>
              <StyledFields>{pair.preview}</StyledFields>
            </StyledContent>
          )}
        </Tabs.Panel>
        {pair.sources.map((source, index) => (
          <Tabs.Panel key={source.id} value={SOURCE_TAB_VALUES[index]}>
            <StyledContent>
              <StyledFields>{source.content}</StyledFields>
            </StyledContent>
          </Tabs.Panel>
        ))}
        <Tabs.Panel value="settings">
          <StyledContent>
            <MergePrioritySettings
              selectedRecordCount={pair.sources.length}
              priorityRecordIndex={priorityRecordIndex}
              onPriorityRecordIndexChange={(index) => {
                const source = pair.sources[index];

                if (isDefined(source)) {
                  onPriorityRecordChange(source.id);
                }
              }}
              dropdownId={`merge-review-priority-${pair.id}`}
              disabled={disabled}
            />
          </StyledContent>
        </Tabs.Panel>
      </Tabs.Root>
    </StyledReview>
  );
};
