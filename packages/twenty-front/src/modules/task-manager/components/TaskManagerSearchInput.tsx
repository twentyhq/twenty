import { type KeyboardEvent, useRef, useState } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Tag } from 'twenty-ui/primitives/data-display';
import { SearchInput } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useTaskManagerIssueSearch } from '@/task-manager/hooks/useTaskManagerIssueSearch';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const CLICK_OUTSIDE_LISTENER_ID = 'task-manager-search-input';

const StyledContainer = styled.div`
  position: relative;
  width: 280px;
`;

const StyledResultsPanel = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  left: 0;
  margin-top: ${themeCssVariables.spacing['1']};
  max-height: 320px;
  overflow-y: auto;
  padding: ${themeCssVariables.spacing['1']};
  position: absolute;
  top: 100%;
  width: 100%;
  z-index: 1000;
`;

const StyledResultRow = styled.button<{ isHighlighted: boolean }>`
  align-items: center;
  background: ${({ isHighlighted }) =>
    isHighlighted ? themeCssVariables.background.transparent.light : 'none'};
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  cursor: pointer;
  display: flex;
  gap: ${themeCssVariables.spacing['2']};
  padding: ${themeCssVariables.spacing['1']} ${themeCssVariables.spacing['2']};
  text-align: left;
  width: 100%;
`;

const StyledResultText = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
`;

const StyledResultTitle = styled.span`
  color: ${themeCssVariables.font.color.primary};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledResultSubtitle = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledEmptyState = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing['2']};
`;

type IssueProjectValue = { name?: string } | null;
type IssueStatusValue = { name?: string } | null;

export const TaskManagerSearchInput = () => {
  const { t } = useLingui();
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState('');
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { issues, loading, hasSearchInput } =
    useTaskManagerIssueSearch(searchInput);

  useListenClickOutside({
    refs: [containerRef],
    listenerId: CLICK_OUTSIDE_LISTENER_ID,
    callback: () => setIsPanelOpen(false),
    enabled: isPanelOpen,
  });

  const handleSearchChange = (nextSearchInput: string) => {
    setSearchInput(nextSearchInput);
    setHighlightedIndex(0);
    setIsPanelOpen(true);
  };

  const handleIssueSelect = (issueId: string) => {
    setIsPanelOpen(false);
    setSearchInput('');

    openRecordInSidePanel({ recordId: issueId, objectNameSingular: 'issue' });
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      setIsPanelOpen(false);
      return;
    }

    if (issues.length === 0) {
      return;
    }

    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setHighlightedIndex((previousIndex) =>
        previousIndex === issues.length - 1 ? 0 : previousIndex + 1,
      );
      return;
    }

    if (event.key === 'ArrowUp') {
      event.preventDefault();
      setHighlightedIndex((previousIndex) =>
        previousIndex === 0 ? issues.length - 1 : previousIndex - 1,
      );
      return;
    }

    if (event.key === 'Enter') {
      event.preventDefault();
      handleIssueSelect(issues[highlightedIndex].id);
    }
  };

  const shouldShowPanel = isPanelOpen && hasSearchInput;

  return (
    <StyledContainer
      ref={containerRef}
      onFocus={() => setIsPanelOpen(true)}
      onKeyDown={handleKeyDown}
    >
      <SearchInput
        value={searchInput}
        onChange={handleSearchChange}
        placeholder={t`Search by key or title`}
      />
      {shouldShowPanel && (
        <StyledResultsPanel>
          {issues.map((issue, issueIndex) => (
            <StyledResultRow
              key={issue.id}
              type="button"
              isHighlighted={issueIndex === highlightedIndex}
              onMouseEnter={() => setHighlightedIndex(issueIndex)}
              onClick={() => handleIssueSelect(issue.id)}
            >
              <StyledResultText>
                <StyledResultTitle>
                  {issue.issueKey}: {issue.title}
                </StyledResultTitle>
                <StyledResultSubtitle>
                  {(issue.project as IssueProjectValue)?.name}
                </StyledResultSubtitle>
              </StyledResultText>
              <Tag
                text={(issue.status as IssueStatusValue)?.name ?? ''}
                color="gray"
              />
            </StyledResultRow>
          ))}
          {issues.length === 0 && (
            <StyledEmptyState>
              {loading ? t`Searching...` : t`No issues found`}
            </StyledEmptyState>
          )}
        </StyledResultsPanel>
      )}
    </StyledContainer>
  );
};
