import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { Select } from '@/ui/input/components/Select';
import { CoreWorkflowVisibilitySelect } from '@/object-core/workflows/components/CoreWorkflowVisibilitySelect';
import { CoreWorkflowVersionRestoreButton } from '@/object-core/workflows/versions/components/CoreWorkflowVersionRestoreButton';
import { CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS } from '@/object-core/workflows/versions/constants/CoreWorkflowVersionStatusTagProps';
import {
  type GetCoreWorkflowVersionsQuery,
  type WorkflowVisibility,
} from '~/generated/graphql';

const StyledToolbar = styled.div`
  align-items: center;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
`;

type CoreWorkflowShowToolbarProps = {
  coreWorkflowId: string;
  versions: GetCoreWorkflowVersionsQuery['coreWorkflowVersions'];
  selectedVersionId: string | undefined;
  visibility: WorkflowVisibility;
  canChangeVisibility: boolean;
  isHistoricalVersion: boolean;
  isValidating: boolean;
  onVersionChange: (versionId: string) => void;
  onValidate: () => Promise<void>;
  onRefresh: () => Promise<void>;
};

export const CoreWorkflowShowToolbar = ({
  coreWorkflowId,
  versions,
  selectedVersionId,
  visibility,
  canChangeVisibility,
  isHistoricalVersion,
  isValidating,
  onVersionChange,
  onValidate,
  onRefresh,
}: CoreWorkflowShowToolbarProps) => (
  <StyledToolbar>
    <Select
      dropdownId={`core-workflow-version-${coreWorkflowId}`}
      aria-label={t`Version`}
      value={selectedVersionId ?? ''}
      options={versions.map((version) => ({
        value: version.id,
        label: `${version.label} · ${t(CORE_WORKFLOW_VERSION_STATUS_TAG_PROPS[version.status].label)}`,
      }))}
      onChange={onVersionChange}
    />
    {isHistoricalVersion && isDefined(selectedVersionId) && (
      <CoreWorkflowVersionRestoreButton
        workflowId={coreWorkflowId}
        coreWorkflowVersionId={selectedVersionId}
      />
    )}
    <Button
      size="sm"
      disabled={!isDefined(selectedVersionId) || isValidating}
      onClick={onValidate}
    >
      {t`Validate`}
    </Button>
    <Button size="sm" startIcon={<IconRefresh />} onClick={onRefresh}>
      {t`Refresh`}
    </Button>
    <CoreWorkflowVisibilitySelect
      coreWorkflowId={coreWorkflowId}
      visibility={visibility}
      disabled={!canChangeVisibility}
    />
  </StyledToolbar>
);
