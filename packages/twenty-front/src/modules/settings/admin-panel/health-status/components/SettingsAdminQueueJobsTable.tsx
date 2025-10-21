import { SettingsAdminDeleteJobsConfirmationModal } from '@/settings/admin-panel/health-status/components/SettingsAdminDeleteJobsConfirmationModal';
import { SettingsAdminJobDetailsExpandable } from '@/settings/admin-panel/health-status/components/SettingsAdminJobDetailsExpandable';
import { SettingsAdminJobStateBadge } from '@/settings/admin-panel/health-status/components/SettingsAdminJobStateBadge';
import { SettingsAdminQueueJobRowDropdownMenu } from '@/settings/admin-panel/health-status/components/SettingsAdminQueueJobRowDropdownMenu';
import { SettingsAdminRetryJobsConfirmationModal } from '@/settings/admin-panel/health-status/components/SettingsAdminRetryJobsConfirmationModal';
import { useDeleteJobs } from '@/settings/admin-panel/health-status/hooks/useDeleteJobs';
import { useRetryJobs } from '@/settings/admin-panel/health-status/hooks/useRetryJobs';
import { Select } from '@/ui/input/components/Select';
import { useModal } from '@/ui/layout/modal/hooks/useModal';
import { Table } from '@/ui/layout/table/components/Table';
import { TableBody } from '@/ui/layout/table/components/TableBody';
import { TableCell } from '@/ui/layout/table/components/TableCell';
import { TableHeader } from '@/ui/layout/table/components/TableHeader';
import { TableRow } from '@/ui/layout/table/components/TableRow';
import styled from '@emotion/styled';
import { plural, t } from '@lingui/core/macro';
import { useState } from 'react';
import { IconRefresh, IconTrash } from 'twenty-ui/display';
import { Button, Checkbox } from 'twenty-ui/input';
import {
  JobState,
  type QueueJob,
  useGetQueueJobsQuery,
} from '~/generated-metadata/graphql';
import { beautifyPastDateRelativeToNow } from '~/utils/date-utils';

type SettingsAdminQueueJobsTableProps = {
  queueName: string;
  onRetentionConfigLoaded?: (config: {
    completedMaxAge: number;
    completedMaxCount: number;
    failedMaxAge: number;
    failedMaxCount: number;
  }) => void;
};

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing(4)};
`;

const StyledControlsContainer = styled.div`
  align-items: center;
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
  justify-content: space-between;
`;

const StyledEmptyState = styled.div`
  color: ${({ theme }) => theme.font.color.tertiary};
  padding: ${({ theme }) => theme.spacing(8)};
  text-align: center;
`;

const StyledPaginationContainer = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledTableCell = styled(TableCell)`
  max-width: 200px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const StyledExpandableTableRow = styled(TableRow)<{ isExpanded: boolean }>`
  cursor: pointer;
  background-color: ${({ theme, isExpanded }) =>
    isExpanded ? theme.background.transparent.light : 'transparent'};

  &:hover {
    background-color: ${({ theme }) => theme.background.transparent.light};
  }
`;

const StyledJobRowWrapper = styled.div`
  display: contents;
`;

const StyledCheckboxCell = styled(TableCell)`
  justify-content: center;
  padding: 0;
  padding-left: ${({ theme }) => theme.spacing(1)};
`;

const StyledHeaderCheckboxCell = styled(TableHeader)`
  align-items: center;
  display: flex;
  justify-content: center;
  padding-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledButtonGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing(2)};
`;

const RETRY_MODAL_ID = 'retry-jobs-modal';
const DELETE_MODAL_ID = 'delete-jobs-modal';
const LIMIT = 50;

export const SettingsAdminQueueJobsTable = ({
  queueName,
  onRetentionConfigLoaded,
}: SettingsAdminQueueJobsTableProps) => {
  const [page, setPage] = useState(0);
  const [stateFilter, setStateFilter] = useState<JobState>(JobState.COMPLETED);
  const [expandedJobId, setExpandedJobId] = useState<string | null>(null);
  const [selectedJobIds, setSelectedJobIds] = useState<Set<string>>(new Set());
  const { openModal } = useModal();

  const jobStateOptions: { value: JobState; label: string }[] = [
    { value: JobState.COMPLETED, label: t`Completed` },
    { value: JobState.FAILED, label: t`Failed` },
    { value: JobState.ACTIVE, label: t`Active` },
    { value: JobState.WAITING, label: t`Waiting` },
    { value: JobState.DELAYED, label: t`Delayed` },
    { value: JobState.PRIORITIZED, label: t`Prioritized` },
    { value: JobState.WAITING_CHILDREN, label: t`Waiting Children` },
  ];

  const offset = page * LIMIT;

  const { data, loading, refetch } = useGetQueueJobsQuery({
    variables: {
      queueName,
      state: stateFilter,
      limit: LIMIT,
      offset,
    },
    fetchPolicy: 'network-only',
  });

  const { retryJobs, isRetrying } = useRetryJobs(queueName, () => {
    refetch();
    setSelectedJobIds(new Set());
  });

  const { deleteJobs, isDeleting } = useDeleteJobs(queueName, () => {
    refetch();
    setSelectedJobIds(new Set());
  });

  const jobs = data?.getQueueJobs?.jobs || [];
  const hasMore = data?.getQueueJobs?.hasMore || false;
  const totalCount = data?.getQueueJobs?.totalCount || 0;
  const failedJobs = jobs.filter((job) => job.state === JobState.FAILED);

  // Pass retention config to parent when data loads
  const shouldPassConfig =
    data?.getQueueJobs?.retentionConfig !== undefined &&
    onRetentionConfigLoaded !== undefined;

  if (shouldPassConfig) {
    onRetentionConfigLoaded(data.getQueueJobs.retentionConfig);
  }

  const selectedCount = selectedJobIds.size;
  const allJobsSelected =
    jobs.length > 0 && jobs.every((job) => selectedJobIds.has(job.id));
  const someJobsSelected =
    jobs.some((job) => selectedJobIds.has(job.id)) && !allJobsSelected;

  // Check if all selected jobs are failed (for showing retry button)
  const selectedJobs = jobs.filter((job) => selectedJobIds.has(job.id));
  const allSelectedAreFailed =
    selectedJobs.length > 0 &&
    selectedJobs.every((job) => job.state === JobState.FAILED);

  const handleToggleAll = () => {
    const shouldClearSelection = allJobsSelected === true;

    if (shouldClearSelection) {
      setSelectedJobIds(new Set());
    } else {
      setSelectedJobIds(new Set(jobs.map((job) => job.id)));
    }
  };

  const handleToggleJob = (event: React.MouseEvent, jobId: string) => {
    event.stopPropagation();
    const newSelected = new Set(selectedJobIds);

    if (newSelected.has(jobId)) {
      newSelected.delete(jobId);
    } else {
      newSelected.add(jobId);
    }
    setSelectedJobIds(newSelected);
  };

  const handleRetrySelected = () => {
    openModal(RETRY_MODAL_ID);
  };

  const confirmRetrySelected = async () => {
    const jobIdsToRetry = selectedCount > 0 ? Array.from(selectedJobIds) : [];

    await retryJobs(jobIdsToRetry);
  };

  const handleDeleteSelected = () => {
    openModal(DELETE_MODAL_ID);
  };

  const confirmDeleteSelected = async () => {
    await deleteJobs(Array.from(selectedJobIds));
  };

  const handleRetryOne = async (jobId: string) => {
    await retryJobs([jobId]);
  };

  const handleDeleteOne = async (jobId: string) => {
    await deleteJobs([jobId]);
  };

  const handleRowClick = (jobId: string) => {
    setExpandedJobId(expandedJobId === jobId ? null : jobId);
  };

  const formatTimestampRelative = (timestamp?: number | null) => {
    if (!timestamp) return '-';

    return beautifyPastDateRelativeToNow(timestamp);
  };

  const formatTimestampFull = (timestamp?: number | null) => {
    if (!timestamp) return '';

    return new Date(timestamp).toLocaleString();
  };

  return (
    <StyledContainer>
      <StyledControlsContainer>
        <Select
          dropdownId="job-state-filter"
          value={stateFilter}
          options={jobStateOptions}
          onChange={(value) => {
            setStateFilter(value as JobState);
            setPage(0);
            setSelectedJobIds(new Set());
          }}
          selectSizeVariant="small"
        />
        <StyledButtonGroup>
          {selectedCount > 0 && (
            <Button
              Icon={IconTrash}
              title={plural(selectedCount, {
                one: `Delete ${selectedCount} Job`,
                other: `Delete ${selectedCount} Jobs`,
              })}
              onClick={handleDeleteSelected}
              disabled={isDeleting || loading}
              size="small"
              variant="secondary"
              accent="danger"
            />
          )}
          {allSelectedAreFailed && (
            <Button
              Icon={IconRefresh}
              title={plural(selectedCount, {
                one: `Retry ${selectedCount} Job`,
                other: `Retry ${selectedCount} Jobs`,
              })}
              onClick={handleRetrySelected}
              disabled={isRetrying || loading}
              size="small"
              variant="secondary"
            />
          )}
          {failedJobs.length > 0 && selectedCount === 0 && (
            <Button
              Icon={IconRefresh}
              title={t`Retry All Failed`}
              onClick={handleRetrySelected}
              disabled={isRetrying || loading}
              size="small"
              variant="secondary"
            />
          )}
        </StyledButtonGroup>
      </StyledControlsContainer>

      {loading && jobs.length === 0 ? (
        <StyledEmptyState>{t`Loading jobs...`}</StyledEmptyState>
      ) : jobs.length === 0 ? (
        <StyledEmptyState>{t`No jobs found`}</StyledEmptyState>
      ) : (
        <>
          <Table>
            <TableRow gridAutoColumns="32px 2fr 1fr 2fr 32px">
              <StyledHeaderCheckboxCell>
                {jobs.length > 0 && (
                  <Checkbox
                    checked={allJobsSelected}
                    indeterminate={someJobsSelected}
                    onChange={handleToggleAll}
                  />
                )}
              </StyledHeaderCheckboxCell>
              <TableHeader>{t`Job Name`}</TableHeader>
              <TableHeader>{t`State`}</TableHeader>
              <TableHeader align="right">{t`Timestamp`}</TableHeader>
              <TableHeader></TableHeader>
            </TableRow>
            <TableBody>
              {jobs.map((job: QueueJob) => {
                const isExpanded = expandedJobId === job.id;
                const isSelected = selectedJobIds.has(job.id);

                return (
                  <StyledJobRowWrapper key={job.id}>
                    <StyledExpandableTableRow
                      gridAutoColumns="32px 2fr 1fr 2fr 32px"
                      onClick={() => handleRowClick(job.id)}
                      isExpanded={isExpanded}
                    >
                      <StyledCheckboxCell
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleJob(e, job.id);
                        }}
                      >
                        <Checkbox checked={isSelected} />
                      </StyledCheckboxCell>
                      <StyledTableCell title={job.name}>
                        {job.name}
                      </StyledTableCell>
                      <TableCell>
                        <SettingsAdminJobStateBadge
                          state={job.state}
                          attemptsMade={job.attemptsMade}
                        />
                      </TableCell>
                      <TableCell
                        align="right"
                        title={formatTimestampFull(
                          job.finishedOn || job.processedOn || job.timestamp,
                        )}
                      >
                        {formatTimestampRelative(
                          job.finishedOn || job.processedOn || job.timestamp,
                        )}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <SettingsAdminQueueJobRowDropdownMenu
                          jobId={job.id}
                          jobState={job.state}
                          onRetry={
                            job.state === JobState.FAILED
                              ? () => handleRetryOne(job.id)
                              : undefined
                          }
                          onDelete={() => handleDeleteOne(job.id)}
                        />
                      </TableCell>
                    </StyledExpandableTableRow>
                    <SettingsAdminJobDetailsExpandable
                      job={job}
                      isExpanded={isExpanded}
                    />
                  </StyledJobRowWrapper>
                );
              })}
            </TableBody>
          </Table>

          <StyledPaginationContainer>
            <Button
              title={t`Previous`}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              size="small"
              variant="secondary"
            />
            <div>
              {t`Page`} {page + 1} {totalCount > 0 ? t`of` : ''}{' '}
              {totalCount > 0 ? Math.max(1, Math.ceil(totalCount / LIMIT)) : ''}
            </div>
            <Button
              title={t`Next`}
              onClick={() => setPage((p) => p + 1)}
              disabled={!hasMore || loading}
              size="small"
              variant="secondary"
            />
          </StyledPaginationContainer>
        </>
      )}

      <SettingsAdminRetryJobsConfirmationModal
        modalId={RETRY_MODAL_ID}
        jobCount={selectedCount > 0 ? selectedCount : failedJobs.length}
        onConfirm={confirmRetrySelected}
      />
      <SettingsAdminDeleteJobsConfirmationModal
        modalId={DELETE_MODAL_ID}
        jobCount={selectedCount}
        onConfirm={confirmDeleteSelected}
      />
    </StyledContainer>
  );
};
