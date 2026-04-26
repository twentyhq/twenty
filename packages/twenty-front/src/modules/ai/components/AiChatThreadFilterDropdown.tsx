import { msg } from '@lingui/core/macro';
import { type MessageDescriptor } from '@lingui/core';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { IconAdjustments, IconChevronLeft } from 'twenty-ui/display';
import { LightIconButton } from 'twenty-ui/input';
import { MenuItem, MenuItemSelect } from 'twenty-ui/navigation';

import {
  AGENT_CHAT_THREAD_FILTER_STATUS,
  type AgentChatThreadFilterStatus,
} from '@/ai/constants/AgentChatThreadFilterStatus';
import {
  AGENT_CHAT_THREAD_GROUP_BY,
  type AgentChatThreadGroupBy,
} from '@/ai/constants/AgentChatThreadGroupBy';
import {
  AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER,
  type AgentChatThreadLastActivityFilter,
} from '@/ai/constants/AgentChatThreadLastActivityFilter';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadGroupByState } from '@/ai/states/agentChatThreadGroupByState';
import { agentChatThreadLastActivityFilterState } from '@/ai/states/agentChatThreadLastActivityFilterState';
import { Dropdown } from '@/ui/layout/dropdown/components/Dropdown';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownMenuHeader } from '@/ui/layout/dropdown/components/DropdownMenuHeader/DropdownMenuHeader';
import { DropdownMenuHeaderLeftComponent } from '@/ui/layout/dropdown/components/DropdownMenuHeader/internal/DropdownMenuHeaderLeftComponent';
import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { DropdownMenuSeparator } from '@/ui/layout/dropdown/components/DropdownMenuSeparator';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';

type FilterPage = 'root' | 'status' | 'groupBy' | 'lastActivity';

type AiChatThreadFilterDropdownProps = {
  scopeId: string;
};

export const getAiChatThreadFilterDropdownId = (scopeId: string) =>
  `ai-chat-thread-filter-${scopeId}`;

const STATUS_LABELS: Record<AgentChatThreadFilterStatus, MessageDescriptor> = {
  active: msg`Active`,
  archived: msg`Archived`,
  all: msg`All`,
};

const GROUP_BY_LABELS: Record<AgentChatThreadGroupBy, MessageDescriptor> = {
  date: msg`Date`,
  none: msg`None`,
};

const LAST_ACTIVITY_LABELS: Record<
  AgentChatThreadLastActivityFilter,
  MessageDescriptor
> = {
  all: msg`All`,
  '1d': msg`1d`,
  '3d': msg`3d`,
  '7d': msg`7d`,
  '30d': msg`30d`,
};

export const AiChatThreadFilterDropdown = ({
  scopeId,
}: AiChatThreadFilterDropdownProps) => {
  const { t } = useLingui();
  const dropdownId = getAiChatThreadFilterDropdownId(scopeId);
  const { closeDropdown } = useCloseDropdown();
  const [page, setPage] = useState<FilterPage>('root');
  const [agentChatThreadFilterStatus, setAgentChatThreadFilterStatus] =
    useAtomState(agentChatThreadFilterStatusState);
  const [agentChatThreadGroupBy, setAgentChatThreadGroupBy] = useAtomState(
    agentChatThreadGroupByState,
  );
  const [
    agentChatThreadLastActivityFilter,
    setAgentChatThreadLastActivityFilter,
  ] = useAtomState(agentChatThreadLastActivityFilterState);

  const isAtDefaults =
    agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE &&
    agentChatThreadGroupBy === AGENT_CHAT_THREAD_GROUP_BY.DATE &&
    agentChatThreadLastActivityFilter ===
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL;

  const handleClearFilters = () => {
    setAgentChatThreadFilterStatus(AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE);
    setAgentChatThreadGroupBy(AGENT_CHAT_THREAD_GROUP_BY.DATE);
    setAgentChatThreadLastActivityFilter(
      AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
    );
    closeDropdown(dropdownId);
  };

  const renderRoot = () => (
    <DropdownContent>
      <DropdownMenuItemsContainer>
        <MenuItemSelect
          text={t`Status`}
          contextualText={t(STATUS_LABELS[agentChatThreadFilterStatus])}
          contextualTextPosition="right"
          hasSubMenu
          selected={false}
          needIconCheck={false}
          onClick={() => setPage('status')}
        />
        <MenuItemSelect
          text={t`Group by`}
          contextualText={t(GROUP_BY_LABELS[agentChatThreadGroupBy])}
          contextualTextPosition="right"
          hasSubMenu
          selected={false}
          needIconCheck={false}
          onClick={() => setPage('groupBy')}
        />
        <MenuItemSelect
          text={t`Last activity`}
          contextualText={t(
            LAST_ACTIVITY_LABELS[agentChatThreadLastActivityFilter],
          )}
          contextualTextPosition="right"
          hasSubMenu
          selected={false}
          needIconCheck={false}
          onClick={() => setPage('lastActivity')}
        />
        {!isAtDefaults && (
          <>
            <DropdownMenuSeparator />
            <MenuItem text={t`Clear filters`} onClick={handleClearFilters} />
          </>
        )}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderStatus = () => (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setPage('root')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Status`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {(
          [
            AGENT_CHAT_THREAD_FILTER_STATUS.ACTIVE,
            AGENT_CHAT_THREAD_FILTER_STATUS.ARCHIVED,
            AGENT_CHAT_THREAD_FILTER_STATUS.ALL,
          ] as const
        ).map((option) => (
          <MenuItemSelect
            key={option}
            text={t(STATUS_LABELS[option])}
            selected={agentChatThreadFilterStatus === option}
            onClick={() => {
              setAgentChatThreadFilterStatus(option);
              setPage('root');
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderGroupBy = () => (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setPage('root')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Group by`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {(
          [
            AGENT_CHAT_THREAD_GROUP_BY.DATE,
            AGENT_CHAT_THREAD_GROUP_BY.NONE,
          ] as const
        ).map((option) => (
          <MenuItemSelect
            key={option}
            text={t(GROUP_BY_LABELS[option])}
            selected={agentChatThreadGroupBy === option}
            onClick={() => {
              setAgentChatThreadGroupBy(option);
              setPage('root');
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const renderLastActivity = () => (
    <DropdownContent>
      <DropdownMenuHeader
        StartComponent={
          <DropdownMenuHeaderLeftComponent
            onClick={() => setPage('root')}
            Icon={IconChevronLeft}
          />
        }
      >
        {t`Last activity`}
      </DropdownMenuHeader>
      <DropdownMenuItemsContainer>
        {(
          [
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ONE_DAY,
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.THREE_DAYS,
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.SEVEN_DAYS,
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.THIRTY_DAYS,
            AGENT_CHAT_THREAD_LAST_ACTIVITY_FILTER.ALL,
          ] as const
        ).map((option) => (
          <MenuItemSelect
            key={option}
            text={t(LAST_ACTIVITY_LABELS[option])}
            selected={agentChatThreadLastActivityFilter === option}
            onClick={() => {
              setAgentChatThreadLastActivityFilter(option);
              setPage('root');
            }}
          />
        ))}
      </DropdownMenuItemsContainer>
    </DropdownContent>
  );

  const dropdownComponents = (() => {
    switch (page) {
      case 'status':
        return renderStatus();
      case 'groupBy':
        return renderGroupBy();
      case 'lastActivity':
        return renderLastActivity();
      default:
        return renderRoot();
    }
  })();

  return (
    <Dropdown
      dropdownId={dropdownId}
      dropdownPlacement="bottom-end"
      onClose={() => setPage('root')}
      clickableComponent={
        <LightIconButton
          aria-label={t`Filter chats`}
          Icon={IconAdjustments}
          accent="tertiary"
          size="small"
        />
      }
      dropdownComponents={dropdownComponents}
    />
  );
};
