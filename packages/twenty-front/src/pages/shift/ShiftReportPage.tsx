import { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { Button, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getObjectPermissionsForObject } from '@/object-metadata/utils/getObjectPermissionsForObject';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { ShiftPageShell } from '@/shift/components/ShiftPageShell';
import { ShiftReportStatCards } from '@/shift/components/ShiftReportStatCards';
import { ShiftReportTable } from '@/shift/components/ShiftReportTable';
import { ShiftTopBar } from '@/shift/components/ShiftTopBar';
import { useMyShifts } from '@/shift/hooks/useMyShifts';
import {
  type ShiftTemplateRecord,
  useShiftTemplates,
} from '@/shift/hooks/useShiftTemplates';
import { useShiftViews } from '@/shift/hooks/useShiftViews';
import {
  computeMonthReport,
  formatMonthLabel,
  getMonthRange,
  getRecentMonthValues,
} from '@/shift/utils/shiftReport';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

const RECENT_MONTHS_COUNT = 24;

const StyledPageBody = styled.div`
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: ${themeCssVariables.spacing['5']};
  overflow-y: auto;
  padding: ${themeCssVariables.spacing['6']};
`;

const StyledControls = styled.div`
  align-items: flex-end;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing['4']};
`;

const StyledControl = styled.div`
  min-width: 200px;
`;

const StyledFooterNote = styled.p`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin: 0;
`;

const StyledStateText = styled.p`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.md};
  margin: auto;
`;

const ShiftReportBody = () => {
  const { t } = useLingui();
  const [searchParams, setSearchParams] = useSearchParams();

  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const { shiftObjectMetadataItem } = useShiftViews();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();
  const objectPermissions = getObjectPermissionsForObject(
    objectPermissionsByObjectMetadataId,
    shiftObjectMetadataItem.id,
  );

  // Only a Leader/PO may read every member's report. canUpdateObjectRecords can't
  // decide this — a regular member has it too (to cancel their own shifts) — and
  // the row-level predicate lists are inert for shift (ownership runs through a
  // custom app-scope overlay + the server query hooks, not built-in predicates),
  // so the old gate collapsed to canUpdateObjectRecords and failed open.
  //
  // Gate on soft-delete/destroy instead: at go-live the member role is NOT granted
  // canSoftDeleteObjectRecords / canDestroyObjectRecords on shift, while Leader/PO
  // (all-records) has both. This is the client analogue of the server hook's
  // canUpdateAllObjectRecords elevation. It fails closed — anyone without the
  // elevated delete rights is locked to their own report, and the server findMany/
  // findOne hooks enforce the same scoping regardless of what the client renders.
  const canViewAllMembers =
    objectPermissions.canSoftDeleteObjectRecords &&
    objectPermissions.canDestroyObjectRecords;

  const monthValues = useMemo(
    () => getRecentMonthValues(RECENT_MONTHS_COUNT),
    [],
  );

  const selectedMonth = searchParams.get('month') ?? monthValues[0];

  // Non-leaders are always locked to their own report regardless of any ?member=
  // param, so a member can never read another member's shifts by editing the URL.
  const selectedMemberId = canViewAllMembers
    ? (searchParams.get('member') ?? currentWorkspaceMember?.id)
    : currentWorkspaceMember?.id;

  const { fromDate, toDate } = useMemo(
    () => getMonthRange(selectedMonth),
    [selectedMonth],
  );

  const { shifts, loading, error, refetch } = useMyShifts({
    memberId: selectedMemberId,
    fromDate,
    toDate,
  });
  const { shiftTemplates, loading: templatesLoading } = useShiftTemplates();

  const templatesById = useMemo(() => {
    const map: Record<string, ShiftTemplateRecord> = {};

    for (const template of shiftTemplates) {
      map[template.id] = template;
    }

    return map;
  }, [shiftTemplates]);

  const report = useMemo(
    () => computeMonthReport(shifts, templatesById),
    [shifts, templatesById],
  );

  const monthOptions: SelectOption<string>[] = useMemo(
    () =>
      monthValues.map((monthValue) => ({
        label: formatMonthLabel(monthValue),
        value: monthValue,
      })),
    [monthValues],
  );

  const memberOptions: SelectOption<string>[] = useMemo(
    () =>
      currentWorkspaceMembers.map((member) => {
        const fullName =
          `${member.name.firstName} ${member.name.lastName}`.trim();

        return {
          label: isNonEmptyString(fullName) ? fullName : member.userEmail,
          value: member.id,
        };
      }),
    [currentWorkspaceMembers],
  );

  const updateSearchParam = (key: string, value: string) => {
    const nextSearchParams = new URLSearchParams(searchParams);

    nextSearchParams.set(key, value);

    setSearchParams(nextSearchParams);
  };

  const isFirstLoad = (loading || templatesLoading) && shifts.length === 0;

  return (
    <StyledPageBody>
      <StyledControls>
        {canViewAllMembers && isDefined(selectedMemberId) && (
          <StyledControl>
            <Select
              dropdownId="shift-report-member-select"
              label={t`Member`}
              options={memberOptions}
              value={selectedMemberId}
              onChange={(memberId) => updateSearchParam('member', memberId)}
              withSearchInput={memberOptions.length > 5}
              fullWidth
            />
          </StyledControl>
        )}
        <StyledControl>
          <Select
            dropdownId="shift-report-month-select"
            label={t`Month`}
            options={monthOptions}
            value={selectedMonth}
            onChange={(monthValue) => updateSearchParam('month', monthValue)}
            fullWidth
          />
        </StyledControl>
      </StyledControls>

      {isFirstLoad ? (
        <StyledStateText>{t`Loading…`}</StyledStateText>
      ) : isDefined(error) && shifts.length === 0 ? (
        <>
          <StyledStateText>{t`Couldn't load the report.`}</StyledStateText>
          <Button
            title={t`Retry`}
            variant="primary"
            accent="blue"
            onClick={() => {
              void refetch();
            }}
          />
        </>
      ) : (
        <>
          <ShiftReportStatCards report={report} />
          {shifts.length === 0 ? (
            <StyledStateText>{t`No shifts this month.`}</StyledStateText>
          ) : (
            <ShiftReportTable shifts={shifts} templateById={templatesById} />
          )}
          <StyledFooterNote>
            <Trans>Verify totals and send to PO at month end</Trans>
          </StyledFooterNote>
        </>
      )}
    </StyledPageBody>
  );
};

export const ShiftReportPage = () => {
  const { tableView } = useShiftViews();

  if (!isDefined(tableView)) {
    return null;
  }

  return (
    <ShiftPageShell viewId={tableView.id}>
      <ShiftTopBar />
      <ShiftReportBody />
    </ShiftPageShell>
  );
};
