import { t } from '@lingui/core/macro';
import { type ReactNode } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';

type CoreWorkflowsPermissionGateProps = {
  children: ReactNode;
};

export const CoreWorkflowsPermissionGate = ({
  children,
}: CoreWorkflowsPermissionGateProps) => {
  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);

  if (!canManageWorkflows) {
    return (
      <WorkspaceRouteUnavailable>{t`You do not have permission to access workflows.`}</WorkspaceRouteUnavailable>
    );
  }

  return <>{children}</>;
};
