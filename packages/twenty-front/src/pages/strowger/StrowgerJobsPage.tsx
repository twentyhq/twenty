import { styled } from '@linaria/react';
import { useEffect, useRef, useState } from 'react';
import { Tag, type TagColor } from 'twenty-ui/components';
import { type IconComponent } from 'twenty-ui/display';
import { MenuItem } from 'twenty-ui/navigation';
import {
  IconArrowsSort,
  IconBox,
  IconBriefcase,
  IconCalendarEvent,
  IconCalendarTime,
  IconCalendarX,
  IconChevronDown,
  IconCube,
  IconCurrencyDollar,
  IconFilter,
  IconLink,
  IconList,
  IconMail,
  IconNumber,
  IconPhone,
  IconPin,
  IconPlus,
  IconProgressCheck,
  IconRefresh,
  IconTag,
  IconUser,
  IconUserCircle,
  IconWorld,
} from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { PageContainer } from '@/ui/layout/page/components/PageContainer';

const STROWGER_GRAPHQL_URL = '/strowger-api/graphql';

type StrowgerJob = {
  id: string;
  providerJobId: string | null;
  provider: string | null;
  openDate: string | null;
  bookDate: string | null;
  cancelDate: string | null;
  moveType: string | null;
  status: string | null;
  rep: string | null;
  userName: string | null;
  firstName: string | null;
  lastName: string | null;
  phoneNumber: string | null;
  email: string | null;
  originCity: string | null;
  originState: string | null;
  originZip: string | null;
  destinationCity: string | null;
  destinationState: string | null;
  destinationZip: string | null;
  miles: number | null;
  estimateCubicFeet: number | null;
  actualCubicFeet: number | null;
  estimateAmountInCents: number | null;
  actualCostAmountInCents: number | null;
  balanceAmountInCents: number | null;
  paidAmountInCents: number | null;
  moveDate: string | null;
  source: string | null;
  priority: string | null;
  refNo: string | null;
  jobLink: string | null;
};

type FetchState =
  | { status: 'loading' }
  | { status: 'error'; message: string }
  | { status: 'ready'; jobs: StrowgerJob[] };

type ColumnDef = {
  key: string;
  label: string;
  Icon: IconComponent;
  width: string;
  render: (job: StrowgerJob) => React.ReactNode;
};

const STATUS_COLORS: Record<string, TagColor> = {
  CREATED: 'gray',
  QUOTED: 'yellow',
  FOLLOW_UP: 'orange',
  BOOKED: 'green',
  COMPLETE: 'blue',
  CANCELED: 'red',
  BAD_LEAD: 'red',
};

const formatLocation = (city: string | null, state: string | null) => {
  if (!city && !state) return '—';
  if (city && state) return `${city}, ${state}`;
  return city ?? state ?? '—';
};

const formatDate = (value: string | null) => {
  if (!value) return '—';
  const parsed = new Date(value.length === 10 ? `${value}T00:00:00` : value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

const formatEnumLabel = (value: string) =>
  value
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');

const formatVolume = (cubicFeet: number | null) => {
  if (cubicFeet === null || cubicFeet === undefined) return '—';
  return `${cubicFeet.toLocaleString('en-US')} ft³`;
};

const formatCurrency = (cents: number | null) => {
  if (cents === null || cents === undefined) return '—';
  return `$${(cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

const formatNumber = (value: number | null, suffix?: string) => {
  if (value === null || value === undefined) return '—';
  return suffix
    ? `${value.toLocaleString('en-US')} ${suffix}`
    : value.toLocaleString('en-US');
};

const ALL_COLUMNS: ColumnDef[] = [
  {
    key: 'jobNo',
    label: 'Job no.',
    Icon: IconNumber,
    width: '120px',
    render: (job) => job.providerJobId ?? '—',
  },
  {
    key: 'openDate',
    label: 'Open date',
    Icon: IconCalendarTime,
    width: '140px',
    render: (job) => formatDate(job.openDate),
  },
  {
    key: 'type',
    label: 'Type',
    Icon: IconBox,
    width: '140px',
    render: (job) => (job.moveType ? formatEnumLabel(job.moveType) : '—'),
  },
  {
    key: 'status',
    label: 'Status',
    Icon: IconProgressCheck,
    width: '120px',
    render: (job) =>
      job.status ? (
        <Tag
          color={STATUS_COLORS[job.status] ?? 'gray'}
          text={formatEnumLabel(job.status)}
        />
      ) : (
        '—'
      ),
  },
  {
    key: 'userRep',
    label: 'User rep',
    Icon: IconUserCircle,
    width: '160px',
    render: (job) => job.rep ?? job.userName ?? '—',
  },
  {
    key: 'customer',
    label: 'Customer',
    Icon: IconUser,
    width: '180px',
    render: (job) =>
      [job.firstName, job.lastName].filter(Boolean).join(' ') || '—',
  },
  {
    key: 'phone',
    label: 'Phone',
    Icon: IconPhone,
    width: '140px',
    render: (job) => job.phoneNumber ?? '—',
  },
  {
    key: 'email',
    label: 'Email',
    Icon: IconMail,
    width: '220px',
    render: (job) => job.email ?? '—',
  },
  {
    key: 'fromTo',
    label: 'From → To',
    Icon: IconPin,
    width: '260px',
    render: (job) =>
      `${formatLocation(job.originCity, job.originState)} → ${formatLocation(job.destinationCity, job.destinationState)}`,
  },
  {
    key: 'volume',
    label: 'Volume',
    Icon: IconCube,
    width: '120px',
    render: (job) => formatVolume(job.estimateCubicFeet),
  },
  {
    key: 'moveDate',
    label: 'Move date',
    Icon: IconCalendarEvent,
    width: '140px',
    render: (job) => formatDate(job.moveDate),
  },
  {
    key: 'source',
    label: 'Source',
    Icon: IconTag,
    width: '140px',
    render: (job) => job.source ?? '—',
  },
  {
    key: 'provider',
    label: 'Provider',
    Icon: IconWorld,
    width: '120px',
    render: (job) => (job.provider ? formatEnumLabel(job.provider) : '—'),
  },
  {
    key: 'bookDate',
    label: 'Book date',
    Icon: IconCalendarEvent,
    width: '140px',
    render: (job) => formatDate(job.bookDate),
  },
  {
    key: 'cancelDate',
    label: 'Cancel date',
    Icon: IconCalendarX,
    width: '140px',
    render: (job) => formatDate(job.cancelDate),
  },
  {
    key: 'miles',
    label: 'Miles',
    Icon: IconPin,
    width: '100px',
    render: (job) => formatNumber(job.miles, 'mi'),
  },
  {
    key: 'actualCubicFeet',
    label: 'Actual volume',
    Icon: IconCube,
    width: '140px',
    render: (job) => formatVolume(job.actualCubicFeet),
  },
  {
    key: 'estimateAmount',
    label: 'Estimate',
    Icon: IconCurrencyDollar,
    width: '120px',
    render: (job) => formatCurrency(job.estimateAmountInCents),
  },
  {
    key: 'actualCost',
    label: 'Actual cost',
    Icon: IconCurrencyDollar,
    width: '120px',
    render: (job) => formatCurrency(job.actualCostAmountInCents),
  },
  {
    key: 'balance',
    label: 'Balance',
    Icon: IconCurrencyDollar,
    width: '120px',
    render: (job) => formatCurrency(job.balanceAmountInCents),
  },
  {
    key: 'paid',
    label: 'Paid',
    Icon: IconCurrencyDollar,
    width: '120px',
    render: (job) => formatCurrency(job.paidAmountInCents),
  },
  {
    key: 'priority',
    label: 'Priority',
    Icon: IconRefresh,
    width: '120px',
    render: (job) => job.priority ?? '—',
  },
  {
    key: 'refNo',
    label: 'Ref no.',
    Icon: IconNumber,
    width: '120px',
    render: (job) => job.refNo ?? '—',
  },
  {
    key: 'originZip',
    label: 'Origin zip',
    Icon: IconPin,
    width: '110px',
    render: (job) => job.originZip ?? '—',
  },
  {
    key: 'destinationZip',
    label: 'Destination zip',
    Icon: IconPin,
    width: '130px',
    render: (job) => job.destinationZip ?? '—',
  },
  {
    key: 'jobLink',
    label: 'Job link',
    Icon: IconLink,
    width: '160px',
    render: (job) =>
      job.jobLink ? (
        <a
          href={job.jobLink}
          target="_blank"
          rel="noreferrer noopener"
          onClick={(event) => event.stopPropagation()}
        >
          Open
        </a>
      ) : (
        '—'
      ),
  },
];

const DEFAULT_VISIBLE_COLUMN_KEYS = [
  'jobNo',
  'openDate',
  'type',
  'status',
  'userRep',
  'customer',
  'phone',
  'email',
  'fromTo',
  'volume',
  'moveDate',
  'source',
];

const StyledPageRoot = styled.div`
  background: ${themeCssVariables.background.secondary};
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 100%;
  width: 100%;
`;

const StyledHeader = styled.div`
  align-items: center;
  background: ${themeCssVariables.background.secondary};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[5]};
`;

const StyledHeaderIcon = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;

  & > svg {
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledTitle = styled.h1`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledTableCard = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.md};
  display: flex;
  flex: 1;
  flex-direction: column;
  margin: 0 ${themeCssVariables.spacing[5]} ${themeCssVariables.spacing[5]};
  min-height: 0;
  overflow: hidden;
`;

const StyledTableScroll = styled.div`
  flex: 1;
  overflow: auto;
`;

const StyledTable = styled.div`
  display: flex;
  flex-direction: column;
  min-width: 100%;
  width: max-content;
`;

const StyledHeaderRow = styled.div`
  background: ${themeCssVariables.background.primary};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  position: sticky;
  top: 0;
  z-index: 1;
`;

const StyledRow = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;

const StyledHeaderCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  height: ${themeCssVariables.spacing[8]};
  padding: 0 ${themeCssVariables.spacing[2]};

  & > svg {
    color: ${themeCssVariables.font.color.tertiary};
    flex-shrink: 0;
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  height: ${themeCssVariables.spacing[8]};
  overflow: hidden;
  padding: 0 ${themeCssVariables.spacing[2]};
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledTableTopBar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

const StyledViewSelector = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }

  & > svg {
    color: ${themeCssVariables.font.color.tertiary};
    flex-shrink: 0;
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledViewCount = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-weight: ${themeCssVariables.font.weight.regular};
`;

const StyledTopBarActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledFilterAnchor = styled.div`
  position: relative;
`;

const StyledFilterPopover = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  margin-top: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 100%;
  width: 240px;
  z-index: 10;
`;

const StyledPopoverSearchWrap = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledPopoverSearchInput = styled.input`
  background: transparent;
  border: none;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  outline: none;
  width: 100%;

  &::placeholder {
    color: ${themeCssVariables.font.color.tertiary};
  }
`;

const StyledPopoverList = styled.div`
  display: flex;
  flex-direction: column;
  padding: ${themeCssVariables.spacing[1]};
`;

const StyledPopoverEmpty = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
  text-align: center;
`;

const StyledActionButton = styled.button`
  align-items: center;
  background: transparent;
  border: none;
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  cursor: pointer;
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[1]};
  padding: ${themeCssVariables.spacing[1]} ${themeCssVariables.spacing[2]};

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
    color: ${themeCssVariables.font.color.primary};
  }

  & > svg {
    flex-shrink: 0;
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledMessage = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[6]};
  text-align: center;
`;

const PLUS_CELL_WIDTH = '40px';

const StyledPlusHeaderCell = styled.div`
  align-items: center;
  border-right: 1px solid ${themeCssVariables.border.color.light};
  color: ${themeCssVariables.font.color.tertiary};
  cursor: pointer;
  display: flex;
  flex: 1;
  height: ${themeCssVariables.spacing[8]};
  justify-content: center;
  min-width: ${PLUS_CELL_WIDTH};
  position: relative;

  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
    color: ${themeCssVariables.font.color.primary};
  }

  & > svg {
    height: ${themeCssVariables.icon.size.md}px;
    width: ${themeCssVariables.icon.size.md}px;
  }
`;

const StyledPlusBodyCell = styled.div`
  border-right: 1px solid ${themeCssVariables.border.color.light};
  flex: 1;
  height: ${themeCssVariables.spacing[8]};
  min-width: ${PLUS_CELL_WIDTH};
`;

const StyledPlusPopover = styled.div`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.md};
  box-shadow: ${themeCssVariables.boxShadow.strong};
  display: flex;
  flex-direction: column;
  margin-top: ${themeCssVariables.spacing[1]};
  overflow: hidden;
  position: absolute;
  right: 0;
  top: 100%;
  width: 240px;
  z-index: 10;
`;

export const StrowgerJobsPage = () => {
  const [state, setState] = useState<FetchState>({ status: 'loading' });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const filterAnchorRef = useRef<HTMLDivElement | null>(null);

  const [isSortOpen, setIsSortOpen] = useState(false);
  const [sortSearch, setSortSearch] = useState('');
  const sortAnchorRef = useRef<HTMLDivElement | null>(null);

  const [visibleColumnKeys, setVisibleColumnKeys] = useState<string[]>(
    DEFAULT_VISIBLE_COLUMN_KEYS,
  );
  const [isAddColumnOpen, setIsAddColumnOpen] = useState(false);
  const [addColumnSearch, setAddColumnSearch] = useState('');
  const addColumnAnchorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isFilterOpen && !isSortOpen && !isAddColumnOpen) return;

    const handleClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        isFilterOpen &&
        filterAnchorRef.current &&
        !filterAnchorRef.current.contains(target)
      ) {
        setIsFilterOpen(false);
      }
      if (
        isSortOpen &&
        sortAnchorRef.current &&
        !sortAnchorRef.current.contains(target)
      ) {
        setIsSortOpen(false);
      }
      if (
        isAddColumnOpen &&
        addColumnAnchorRef.current &&
        !addColumnAnchorRef.current.contains(target)
      ) {
        setIsAddColumnOpen(false);
      }
    };

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsFilterOpen(false);
        setIsSortOpen(false);
        setIsAddColumnOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleKey);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleKey);
    };
  }, [isFilterOpen, isSortOpen, isAddColumnOpen]);

  const visibleColumns = visibleColumnKeys
    .map((key) => ALL_COLUMNS.find((column) => column.key === key))
    .filter((column): column is ColumnDef => column !== undefined);

  const hiddenColumns = ALL_COLUMNS.filter(
    (column) => !visibleColumnKeys.includes(column.key),
  );

  const addableColumns = hiddenColumns.filter((column) =>
    column.label.toLowerCase().includes(addColumnSearch.toLowerCase()),
  );

  const filterableColumns = visibleColumns.filter((column) =>
    column.label.toLowerCase().includes(filterSearch.toLowerCase()),
  );

  const sortableColumns = visibleColumns.filter((column) =>
    column.label.toLowerCase().includes(sortSearch.toLowerCase()),
  );

  const handleAddColumn = (key: string) => {
    setVisibleColumnKeys((current) =>
      current.includes(key) ? current : [...current, key],
    );
    setIsAddColumnOpen(false);
    setAddColumnSearch('');
  };

  useEffect(() => {
    const query = `
      query StrowgerJobs {
        jobs {
          id
          providerJobId
          provider
          openDate
          bookDate
          cancelDate
          moveType
          status
          rep
          userName
          firstName
          lastName
          phoneNumber
          email
          originCity
          originState
          originZip
          destinationCity
          destinationState
          destinationZip
          miles
          estimateCubicFeet
          actualCubicFeet
          estimateAmountInCents
          actualCostAmountInCents
          balanceAmountInCents
          paidAmountInCents
          moveDate
          source
          priority
          refNo
          jobLink
        }
      }
    `;

    const fetchJobs = async () => {
      try {
        const response = await fetch(STROWGER_GRAPHQL_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query }),
        });

        if (!response.ok) {
          setState({
            status: 'error',
            message: `Strowger HTTP ${response.status}`,
          });
          return;
        }

        const payload = await response.json();
        if (payload.errors) {
          setState({
            status: 'error',
            message: payload.errors[0]?.message ?? 'Strowger error',
          });
          return;
        }

        setState({ status: 'ready', jobs: payload.data.jobs });
      } catch (error) {
        setState({
          status: 'error',
          message:
            error instanceof Error ? error.message : 'Could not reach Strowger',
        });
      }
    };

    fetchJobs();
  }, []);

  return (
    <PageContainer>
      <StyledPageRoot>
        <StyledHeader>
          <StyledHeaderIcon>
            <IconBriefcase />
          </StyledHeaderIcon>
          <StyledTitle>Jobs</StyledTitle>
        </StyledHeader>

        <StyledTableCard>
          <StyledTableTopBar>
            <StyledViewSelector>
              <IconList />
              All Jobs
              {state.status === 'ready' && (
                <StyledViewCount>· {state.jobs.length}</StyledViewCount>
              )}
              <IconChevronDown />
            </StyledViewSelector>
            <StyledTopBarActions>
              <StyledFilterAnchor ref={filterAnchorRef}>
                <StyledActionButton
                  type="button"
                  onClick={() => setIsFilterOpen((open) => !open)}
                >
                  <IconFilter />
                  Filter
                </StyledActionButton>
                {isFilterOpen && (
                  <StyledFilterPopover>
                    <StyledPopoverSearchWrap>
                      <StyledPopoverSearchInput
                        autoFocus
                        placeholder="Search fields"
                        value={filterSearch}
                        onChange={(event) =>
                          setFilterSearch(event.target.value)
                        }
                      />
                    </StyledPopoverSearchWrap>
                    <StyledPopoverList>
                      {filterableColumns.length === 0 ? (
                        <StyledPopoverEmpty>No fields found</StyledPopoverEmpty>
                      ) : (
                        filterableColumns.map(({ key, label, Icon }) => (
                          <MenuItem
                            key={key}
                            text={label}
                            LeftIcon={Icon}
                            onClick={() => setIsFilterOpen(false)}
                          />
                        ))
                      )}
                    </StyledPopoverList>
                  </StyledFilterPopover>
                )}
              </StyledFilterAnchor>
              <StyledFilterAnchor ref={sortAnchorRef}>
                <StyledActionButton
                  type="button"
                  onClick={() => setIsSortOpen((open) => !open)}
                >
                  <IconArrowsSort />
                  Sort
                </StyledActionButton>
                {isSortOpen && (
                  <StyledFilterPopover>
                    <StyledPopoverSearchWrap>
                      <StyledPopoverSearchInput
                        autoFocus
                        placeholder="Search fields"
                        value={sortSearch}
                        onChange={(event) => setSortSearch(event.target.value)}
                      />
                    </StyledPopoverSearchWrap>
                    <StyledPopoverList>
                      {sortableColumns.length === 0 ? (
                        <StyledPopoverEmpty>No fields found</StyledPopoverEmpty>
                      ) : (
                        sortableColumns.map(({ key, label, Icon }) => (
                          <MenuItem
                            key={key}
                            text={label}
                            LeftIcon={Icon}
                            onClick={() => setIsSortOpen(false)}
                          />
                        ))
                      )}
                    </StyledPopoverList>
                  </StyledFilterPopover>
                )}
              </StyledFilterAnchor>
            </StyledTopBarActions>
          </StyledTableTopBar>
          <StyledTableScroll>
            {state.status === 'loading' && (
              <StyledMessage>Loading jobs from Strowger…</StyledMessage>
            )}
            {state.status === 'error' && (
              <StyledMessage>
                Could not load Strowger jobs: {state.message}
              </StyledMessage>
            )}
            {state.status === 'ready' && state.jobs.length === 0 && (
              <StyledMessage>No jobs found.</StyledMessage>
            )}
            {state.status === 'ready' && state.jobs.length > 0 && (
              <StyledTable>
                <StyledHeaderRow>
                  {visibleColumns.map(({ key, label, Icon, width }) => (
                    <StyledHeaderCell
                      key={key}
                      style={{ width, minWidth: width }}
                    >
                      <Icon />
                      {label}
                    </StyledHeaderCell>
                  ))}
                  <StyledPlusHeaderCell
                    ref={addColumnAnchorRef}
                    onClick={() => setIsAddColumnOpen((open) => !open)}
                    title="Add field"
                  >
                    <IconPlus />
                    {isAddColumnOpen && (
                      <StyledPlusPopover
                        onClick={(event) => event.stopPropagation()}
                      >
                        <StyledPopoverSearchWrap>
                          <StyledPopoverSearchInput
                            autoFocus
                            placeholder="Search fields"
                            value={addColumnSearch}
                            onChange={(event) =>
                              setAddColumnSearch(event.target.value)
                            }
                          />
                        </StyledPopoverSearchWrap>
                        <StyledPopoverList>
                          {addableColumns.length === 0 ? (
                            <StyledPopoverEmpty>
                              {hiddenColumns.length === 0
                                ? 'All fields shown'
                                : 'No fields found'}
                            </StyledPopoverEmpty>
                          ) : (
                            addableColumns.map(({ key, label, Icon }) => (
                              <MenuItem
                                key={key}
                                text={label}
                                LeftIcon={Icon}
                                onClick={() => handleAddColumn(key)}
                              />
                            ))
                          )}
                        </StyledPopoverList>
                      </StyledPlusPopover>
                    )}
                  </StyledPlusHeaderCell>
                </StyledHeaderRow>
                {state.jobs.map((job) => (
                  <StyledRow key={job.id}>
                    {visibleColumns.map(({ key, width, render }) => (
                      <StyledCell key={key} style={{ width, minWidth: width }}>
                        {render(job)}
                      </StyledCell>
                    ))}
                    <StyledPlusBodyCell />
                  </StyledRow>
                ))}
              </StyledTable>
            )}
          </StyledTableScroll>
        </StyledTableCard>
      </StyledPageRoot>
    </PageContainer>
  );
};
