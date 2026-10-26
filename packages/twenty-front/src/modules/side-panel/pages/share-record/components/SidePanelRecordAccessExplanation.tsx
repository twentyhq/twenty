import { gql } from '@apollo/client';
import { useLazyQuery } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import {
  type RecordPermissionAction,
  type RecordPermissionExplanation,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { Button } from 'twenty-ui/primitives/input';
import { ListItem } from 'twenty-ui/primitives/navigation';
import { themeCssVariables } from 'twenty-ui/theme';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { SidePanelShareRecordGroup } from '@/side-panel/pages/share-record/components/SidePanelShareRecordGroup';
import { Select } from '@/ui/input/components/Select';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { getWorkspaceMemberNameOrEmail } from '@/workspace-member/utils/getWorkspaceMemberNameOrEmail';
import { type RecordTargetInput } from '~/generated-metadata/graphql';

const EXPLAIN_RECORD_PERMISSION = gql`
  query ExplainRecordPermission(
    $target: RecordTargetInput!
    $workspaceMemberId: UUID!
    $action: String!
  ) {
    explainRecordPermission(
      target: $target
      workspaceMemberId: $workspaceMemberId
      action: $action
    )
  }
`;
const StyledControls = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;
const StyledNotice = styled.div`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
  padding: ${themeCssVariables.spacing[2]};
`;

type SidePanelRecordAccessExplanationProps = { target: RecordTargetInput };

export const SidePanelRecordAccessExplanation = ({
  target,
}: SidePanelRecordAccessExplanationProps) => {
  const { t } = useLingui();
  const currentWorkspaceMembers = useAtomStateValue(
    currentWorkspaceMembersState,
  );
  const currentWorkspaceMember = useAtomStateValue(currentWorkspaceMemberState);
  const { objectMetadataItems } = useFilteredObjectMetadataItems();
  const [expanded, setExpanded] = useState(false);
  const [workspaceMemberId, setWorkspaceMemberId] = useState(
    currentWorkspaceMember?.id ?? currentWorkspaceMembers[0]?.id ?? '',
  );
  const [action, setAction] = useState<RecordPermissionAction>('read');
  const [result, setResult] = useState<RecordPermissionExplanation>();
  const [failed, setFailed] = useState(false);
  const [explain, { loading }] = useLazyQuery<
    { explainRecordPermission: RecordPermissionExplanation },
    { target: RecordTargetInput; workspaceMemberId: string; action: string }
  >(EXPLAIN_RECORD_PERMISSION, { fetchPolicy: 'network-only' });
  const check = async () => {
    setResult(undefined);
    setFailed(false);
    try {
      const response = await explain({
        variables: { target, workspaceMemberId, action },
      });
      if (!isDefined(response.data?.explainRecordPermission))
        throw new Error('No access explanation returned');
      setResult(response.data.explainRecordPermission);
    } catch {
      setFailed(true);
    }
  };
  return (
    <SidePanelShareRecordGroup heading={t`Explain access`}>
      <Button variant="ghost" size="sm" onClick={() => setExpanded(!expanded)}>
        {expanded ? t`Hide access check` : t`Check a member's access`}
      </Button>
      {expanded && (
        <>
          <StyledControls>
            <Select
              dropdownId="permission-explanation-member"
              label={t`Member`}
              value={workspaceMemberId}
              withSearchInput
              fullWidth
              disabled={loading}
              options={currentWorkspaceMembers.map((member) => ({
                value: member.id,
                label: getWorkspaceMemberNameOrEmail(member),
              }))}
              onChange={(id) => {
                setWorkspaceMemberId(id);
                setResult(undefined);
              }}
            />
            <Select<RecordPermissionAction>
              dropdownId="permission-explanation-action"
              label={t`Action`}
              value={action}
              fullWidth
              disabled={loading}
              options={[
                { value: 'read', label: t`See` },
                { value: 'update', label: t`Edit` },
                { value: 'softDelete', label: t`Delete` },
                { value: 'destroy', label: t`Destroy` },
                { value: 'receive', label: t`Receive` },
                { value: 'share', label: t`Share` },
              ]}
              onChange={(value) => {
                setAction(value);
                setResult(undefined);
              }}
            />
            <Button
              variant="outline"
              disabled={loading || !workspaceMemberId}
              onClick={() => void check()}
            >
              {loading ? t`Checking…` : t`Check access`}
            </Button>
          </StyledControls>
          {failed && (
            <StyledNotice role="alert">{t`Access could not be checked. Try again.`}</StyledNotice>
          )}
          {isDefined(result) && (
            <>
              <StyledNotice role="status">
                {result.allowed
                  ? t`Allowed`
                  : result.reason === 'capability'
                    ? t`Blocked by this object's record capabilities`
                    : t`No matching grant`}
              </StyledNotice>
              {result.sources.map((source) => {
                const sourceObject = objectMetadataItems.find(
                  (object) =>
                    object.universalIdentifier ===
                    source.sourceObjectUniversalIdentifier,
                );
                const fields = source.fieldUniversalIdentifiers
                  .map(
                    (id) =>
                      objectMetadataItems
                        .flatMap((object) => object.fields)
                        .find((field) => field.universalIdentifier === id)
                        ?.label,
                  )
                  .filter(isDefined)
                  .join(' → ');
                return (
                  <ListItem
                    key={source.id}
                    description={[
                      source.kind === 'share'
                        ? t`Record sharing`
                        : t`Role rule`,
                      sourceObject?.labelPlural,
                      fields,
                    ]
                      .filter(Boolean)
                      .join(' · ')}
                    descriptionPlacement="below"
                  >
                    {source.kind === 'share'
                      ? t`Record share`
                      : source.conditional
                        ? t`Conditional rule`
                        : t`All records`}
                  </ListItem>
                );
              })}
              {result.hasMoreSources && (
                <StyledNotice>{t`Showing the first 100 matching sources.`}</StyledNotice>
              )}
            </>
          )}
          <StyledNotice>{t`This checks the member's role on the current record. Field restrictions and any additional application or API authority still apply.`}</StyledNotice>
        </>
      )}
    </SidePanelShareRecordGroup>
  );
};
