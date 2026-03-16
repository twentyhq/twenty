import { useEffect, useRef, useState } from 'react';

import styled from '@emotion/styled';

export type StateFilter = 'all' | 'unread' | 'needs_reply';
export type SortOrder = 'newest' | 'oldest';
export type AssignmentFilter = 'all' | 'me' | 'unassigned';
export type SegmentFilter = 'all' | 'leads' | 'clients';
export type NeedsReplyThreshold = 'any' | '24h' | '48h' | '72h';

const PROGRAM_COLORS: Record<string, string> = {
  JP: '#3b82f6',
  BPA: '#06b6d4',
  BPE: '#6366f1',
  CERT: '#10b981',
  Alumni: '#64748b',
  Canceled: '#f43f5e',
  Lead: '#a8a29e',
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(1.5)};
  padding: ${({ theme }) => theme.spacing(1)} 0;
`;

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing(1)};
`;

const StyledLabel = styled.span`
  color: #9CA3AF;
  font-size: 11px;
  font-weight: 500;
  min-width: 70px;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  white-space: nowrap;
`;

const StyledPill = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? '#EBF0FF' : '#F3F4F6'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? '#1A6CFF' : '#E5E7EB'};
  border-radius: 12px;
  color: ${({ isActive }) =>
    isActive ? '#1A6CFF' : '#6B7280'};
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  padding: 3px 10px;
  transition: all 120ms ease;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive }) =>
      isActive ? '#EBF0FF' : '#E5E7EB'};
    color: ${({ isActive }) =>
      isActive ? '#1A6CFF' : '#374151'};
  }
`;

const StyledToggle = styled.button<{ isActive: boolean }>`
  background: ${({ isActive }) =>
    isActive ? '#EBF0FF' : 'transparent'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? '#1A6CFF' : '#E5E7EB'};
  border-radius: 6px;
  color: ${({ isActive }) =>
    isActive ? '#1A6CFF' : '#6B7280'};
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  padding: 3px 8px;
  white-space: nowrap;

  &:hover {
    color: #374151;
  }
`;

const StyledSortSelect = styled.select`
  background: #F3F4F6;
  border: 1px solid #E5E7EB;
  border-radius: 6px;
  color: #6B7280;
  cursor: pointer;
  font-family: inherit;
  font-size: 11px;
  margin-left: auto;
  outline: none;
  padding: 3px 6px;
`;

const StyledSpacer = styled.div`
  flex: 1;
`;

const StyledDropdownWrapper = styled.div`
  position: relative;
`;

const StyledDropdownButton = styled.button<{ isActive: boolean }>`
  align-items: center;
  background: ${({ isActive }) =>
    isActive ? '#EBF0FF' : '#F3F4F6'};
  border: 1px solid
    ${({ isActive }) =>
      isActive ? '#1A6CFF' : '#E5E7EB'};
  border-radius: 6px;
  color: ${({ isActive }) =>
    isActive ? '#1A6CFF' : '#6B7280'};
  cursor: pointer;
  display: flex;
  font-family: inherit;
  font-size: 11px;
  font-weight: 500;
  gap: 4px;
  padding: 4px 10px;
  white-space: nowrap;

  &:hover {
    background: ${({ isActive }) =>
      isActive ? '#EBF0FF' : '#E5E7EB'};
    color: ${({ isActive }) =>
      isActive ? '#1A6CFF' : '#374151'};
  }
`;

const StyledBadge = styled.span`
  align-items: center;
  background: #1A6CFF;
  border-radius: 10px;
  color: #FFFFFF;
  display: inline-flex;
  font-size: 10px;
  font-weight: 700;
  height: 16px;
  justify-content: center;
  min-width: 16px;
  padding: 0 4px;
`;

const StyledDropdownPanel = styled.div`
  background: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
  left: 0;
  max-height: 280px;
  min-width: 200px;
  overflow-y: auto;
  position: absolute;
  top: calc(100% + 4px);
  z-index: 10;
`;

const StyledDropdownHeader = styled.div`
  align-items: center;
  border-bottom: 1px solid #F3F4F6;
  display: flex;
  justify-content: space-between;
  padding: 6px 8px;
`;

const StyledDropdownTitle = styled.span`
  color: #111827;
  font-size: 12px;
  font-weight: 600;
`;

const StyledDropdownClear = styled.button`
  background: none;
  border: none;
  color: #1A6CFF;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledCheckboxRow = styled.label`
  align-items: center;
  cursor: pointer;
  display: flex;
  gap: 6px;
  padding: 4px 8px;

  &:hover {
    background: #F5F6F7;
  }
`;

const StyledCheckbox = styled.input`
  accent-color: #1A6CFF;
  cursor: pointer;
  height: 14px;
  margin: 0;
  width: 14px;
`;

const StyledColorDot = styled.span<{ dotColor: string }>`
  background: ${({ dotColor }) => dotColor};
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
  height: 8px;
  width: 8px;
`;

const StyledCheckboxLabel = styled.span`
  color: #374151;
  font-size: 12px;
`;

const StyledCountRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  padding-top: ${({ theme }) => theme.spacing(0.5)};
`;

const StyledCountText = styled.span`
  color: #9CA3AF;
  font-size: 12px;
`;

const StyledClearLink = styled.button`
  background: none;
  border: none;
  color: #1A6CFF;
  cursor: pointer;
  font-family: inherit;
  font-size: 12px;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const StyledChevron = styled.span`
  font-size: 10px;
  line-height: 1;
`;

type ConversationFiltersProps = {
  stateFilter: StateFilter;
  onStateFilterChange: (filter: StateFilter) => void;
  sortOrder: SortOrder;
  onSortOrderChange: (order: SortOrder) => void;
  showArchived: boolean;
  onShowArchivedChange: (show: boolean) => void;
  assignmentFilter: AssignmentFilter;
  onAssignmentFilterChange: (filter: AssignmentFilter) => void;
  segmentFilter: SegmentFilter;
  onSegmentFilterChange: (filter: SegmentFilter) => void;
  needsReplyThreshold: NeedsReplyThreshold;
  onNeedsReplyThresholdChange: (threshold: NeedsReplyThreshold) => void;
  selectedPrograms: string[];
  onSelectedProgramsChange: (programs: string[]) => void;
  selectedDurations: string[];
  onSelectedDurationsChange: (durations: string[]) => void;
  selectedMops: string[];
  onSelectedMopsChange: (mops: string[]) => void;
  availablePrograms: string[];
  availableDurations: string[];
  availableMops: string[];
  resultCount?: number;
  totalCount?: number;
  onClearFilters?: () => void;
  hasActiveFilters?: boolean;
};

const MultiSelectDropdown = ({
  label,
  selected,
  options,
  onChange,
  renderOption,
}: {
  label: string;
  selected: string[];
  options: string[];
  onChange: (selected: string[]) => void;
  renderOption?: (option: string) => React.ReactNode;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleToggle = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter((s) => s !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  return (
    <StyledDropdownWrapper ref={wrapperRef}>
      <StyledDropdownButton
        isActive={selected.length > 0}
        onClick={() => setIsOpen(!isOpen)}
      >
        {label}
        {selected.length > 0 && <StyledBadge>{selected.length}</StyledBadge>}
        <StyledChevron>{isOpen ? '\u25B4' : '\u25BE'}</StyledChevron>
      </StyledDropdownButton>
      {isOpen && (
        <StyledDropdownPanel>
          <StyledDropdownHeader>
            <StyledDropdownTitle>{label}</StyledDropdownTitle>
            {selected.length > 0 && (
              <StyledDropdownClear onClick={() => onChange([])}>
                Clear
              </StyledDropdownClear>
            )}
          </StyledDropdownHeader>
          {options.map((option) => (
            <StyledCheckboxRow key={option}>
              <StyledCheckbox
                type="checkbox"
                checked={selected.includes(option)}
                onChange={() => handleToggle(option)}
              />
              {renderOption ? (
                renderOption(option)
              ) : (
                <StyledCheckboxLabel>{option}</StyledCheckboxLabel>
              )}
            </StyledCheckboxRow>
          ))}
        </StyledDropdownPanel>
      )}
    </StyledDropdownWrapper>
  );
};

export const ConversationFilters = ({
  stateFilter,
  onStateFilterChange,
  sortOrder,
  onSortOrderChange,
  showArchived,
  onShowArchivedChange,
  assignmentFilter,
  onAssignmentFilterChange,
  segmentFilter,
  onSegmentFilterChange,
  needsReplyThreshold,
  onNeedsReplyThresholdChange,
  selectedPrograms,
  onSelectedProgramsChange,
  selectedDurations,
  onSelectedDurationsChange,
  selectedMops,
  onSelectedMopsChange,
  availablePrograms,
  availableDurations,
  availableMops,
  resultCount,
  totalCount,
  onClearFilters,
  hasActiveFilters,
}: ConversationFiltersProps) => {
  return (
    <StyledContainer>
      {/* Assignment row */}
      <StyledRow>
        <StyledLabel>Assigned</StyledLabel>
        <StyledPill
          isActive={assignmentFilter === 'all'}
          onClick={() => onAssignmentFilterChange('all')}
        >
          All
        </StyledPill>
        <StyledPill
          isActive={assignmentFilter === 'me'}
          onClick={() => onAssignmentFilterChange('me')}
        >
          Me
        </StyledPill>
        <StyledPill
          isActive={assignmentFilter === 'unassigned'}
          onClick={() => onAssignmentFilterChange('unassigned')}
        >
          Unassigned
        </StyledPill>
      </StyledRow>

      {/* Segment row */}
      <StyledRow>
        <StyledLabel>Segment</StyledLabel>
        <StyledPill
          isActive={segmentFilter === 'all'}
          onClick={() => onSegmentFilterChange('all')}
        >
          All
        </StyledPill>
        <StyledPill
          isActive={segmentFilter === 'leads'}
          onClick={() => onSegmentFilterChange('leads')}
        >
          Leads
        </StyledPill>
        <StyledPill
          isActive={segmentFilter === 'clients'}
          onClick={() => onSegmentFilterChange('clients')}
        >
          Clients
        </StyledPill>
      </StyledRow>

      {/* State row */}
      <StyledRow>
        <StyledLabel>State</StyledLabel>
        <StyledPill
          isActive={stateFilter === 'all'}
          onClick={() => onStateFilterChange('all')}
        >
          All
        </StyledPill>
        <StyledPill
          isActive={stateFilter === 'unread'}
          onClick={() => onStateFilterChange('unread')}
        >
          Unread
        </StyledPill>
        <StyledPill
          isActive={stateFilter === 'needs_reply'}
          onClick={() => onStateFilterChange('needs_reply')}
        >
          Needs reply
        </StyledPill>
        <StyledToggle
          isActive={showArchived}
          onClick={() => onShowArchivedChange(!showArchived)}
        >
          Archived
        </StyledToggle>
        <StyledSortSelect
          value={sortOrder}
          onChange={(e) => onSortOrderChange(e.target.value as SortOrder)}
        >
          <option value="newest">Newest</option>
          <option value="oldest">Oldest</option>
        </StyledSortSelect>
      </StyledRow>

      {/* Needs reply threshold sub-row */}
      {stateFilter === 'needs_reply' && (
        <StyledRow>
          <StyledLabel />
          <StyledPill
            isActive={needsReplyThreshold === 'any'}
            onClick={() => onNeedsReplyThresholdChange('any')}
          >
            Any
          </StyledPill>
          <StyledPill
            isActive={needsReplyThreshold === '24h'}
            onClick={() => onNeedsReplyThresholdChange('24h')}
          >
            &gt;24h
          </StyledPill>
          <StyledPill
            isActive={needsReplyThreshold === '48h'}
            onClick={() => onNeedsReplyThresholdChange('48h')}
          >
            &gt;48h
          </StyledPill>
          <StyledPill
            isActive={needsReplyThreshold === '72h'}
            onClick={() => onNeedsReplyThresholdChange('72h')}
          >
            &gt;72h
          </StyledPill>
        </StyledRow>
      )}

      {/* Advanced filters row */}
      <StyledRow>
        <StyledLabel>Filters</StyledLabel>
        <MultiSelectDropdown
          label="Program"
          selected={selectedPrograms}
          options={availablePrograms}
          onChange={onSelectedProgramsChange}
          renderOption={(option) => (
            <>
              <StyledColorDot
                dotColor={PROGRAM_COLORS[option] ?? '#94a3b8'}
              />
              <StyledCheckboxLabel>{option}</StyledCheckboxLabel>
            </>
          )}
        />
        <MultiSelectDropdown
          label="Duration"
          selected={selectedDurations}
          options={availableDurations}
          onChange={onSelectedDurationsChange}
        />
        {availableMops.length > 0 && (
          <MultiSelectDropdown
            label="MOP"
            selected={selectedMops}
            options={availableMops}
            onChange={onSelectedMopsChange}
          />
        )}
        <StyledSpacer />
      </StyledRow>

      {/* Count + Clear row */}
      {(resultCount !== undefined && totalCount !== undefined) ||
      hasActiveFilters ? (
        <StyledCountRow>
          {resultCount !== undefined && totalCount !== undefined && (
            <StyledCountText>
              Showing {resultCount} of {totalCount}
            </StyledCountText>
          )}
          {hasActiveFilters && onClearFilters && (
            <StyledClearLink onClick={onClearFilters}>
              Clear filters
            </StyledClearLink>
          )}
        </StyledCountRow>
      ) : null}
    </StyledContainer>
  );
};
