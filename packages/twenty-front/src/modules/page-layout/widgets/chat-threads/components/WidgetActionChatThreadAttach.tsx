import { useLingui } from '@lingui/react/macro';
import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown, LightIconButton } from 'twenty-ui/components';
import { IconMessage, IconPlus } from 'twenty-ui/icon';

import { useChatThreadRecordAttachmentActions } from '@/ai/hooks/useChatThreadRecordAttachmentActions';
import { useChatThreadsForRecord } from '@/ai/hooks/useChatThreadsForRecord';
import { agentChatEditableThreadsSelector } from '@/ai/states/selectors/agentChatEditableThreadsSelector';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useTargetRecord } from '@/ui/layout/contexts/useTargetRecord';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

type WidgetActionChatThreadAttachProps = {
  widget: PageLayoutWidget;
};

// Only the first page of the record's conversations is loaded, so a
// conversation attached beyond it shows unchecked; checking it again is a no-op
// on the server.
export const WidgetActionChatThreadAttach = ({
  widget,
}: WidgetActionChatThreadAttachProps) => {
  const { t } = useLingui();
  const targetRecord = useTargetRecord();
  const hasAiPermission = useHasPermissionFlag(PermissionFlagType.AI);
  const [searchInputValue, setSearchInputValue] = useState('');

  const agentChatEditableThreads = useAtomStateValue(
    agentChatEditableThreadsSelector,
  );
  const threadsStoreEntry = useAtomValue(
    metadataStoreState.atomFamily('agentChatThreads'),
  );
  const { threads: attachedThreads } = useChatThreadsForRecord(targetRecord);
  const { attachChatThreadToRecord, detachChatThreadFromRecord } =
    useChatThreadRecordAttachmentActions(targetRecord);

  if (!hasAiPermission) {
    return null;
  }

  const getThreadTitle = (thread: FlatAgentChatThread) =>
    thread.title ?? t`Untitled`;

  const attachedThreadIds = new Set(attachedThreads.map(({ id }) => id));
  const normalizedSearchInputValue = normalizeSearchText(searchInputValue);
  const filteredThreads = agentChatEditableThreads.filter((thread) =>
    normalizeSearchText(getThreadTitle(thread)).includes(
      normalizedSearchInputValue,
    ),
  );
  const isLoading = threadsStoreEntry.status === 'empty';

  const handleThreadSelect = (threadId: string) =>
    attachedThreadIds.has(threadId)
      ? detachChatThreadFromRecord(threadId)
      : attachChatThreadToRecord(threadId);

  const label = t`Attach conversation`;

  return (
    <DropdownRoot
      dropdownId={`chat-threads-attach-${widget.id}-${targetRecord.id}`}
      type="picker"
      multiple
      onOpenChange={(open) => {
        if (!open) {
          setSearchInputValue('');
        }
      }}
    >
      {/* The same button WidgetCardHeaderActionButton renders, built here
          because the trigger has to pass its own props to it. */}
      <Dropdown.Trigger
        render={
          <LightIconButton
            aria-label={label}
            title={label}
            emphasis="subtle"
            size="sm"
          >
            <IconPlus />
          </LightIconButton>
        }
      />
      <DropdownContent
        align="end"
        width={GenericDropdownContentWidth.ExtraLarge}
        aria-label={label}
      >
        <Dropdown.Search
          value={searchInputValue}
          onValueChange={setSearchInputValue}
          placeholder={t`Search`}
          aria-label={t`Search conversations`}
        />
        <Dropdown.Separator />
        <Dropdown.Section scrollable>
          {isLoading ? (
            <Dropdown.Loading>{t`Loading…`}</Dropdown.Loading>
          ) : (
            filteredThreads.map((thread) => (
              <Dropdown.OptionItem
                key={thread.id}
                selected={attachedThreadIds.has(thread.id)}
                onSelect={() => void handleThreadSelect(thread.id)}
                startIcon={<IconMessage />}
              >
                {getThreadTitle(thread)}
              </Dropdown.OptionItem>
            ))
          )}
          {!isLoading && !isNonEmptyArray(filteredThreads) && (
            <Dropdown.Empty>{t`No conversations`}</Dropdown.Empty>
          )}
        </Dropdown.Section>
      </DropdownContent>
    </DropdownRoot>
  );
};
