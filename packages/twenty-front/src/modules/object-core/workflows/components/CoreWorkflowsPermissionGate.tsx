import { type ReactNode } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { WorkspaceRouteUnavailable } from '@/ui/layout/page/components/WorkspaceRouteUnavailable';
import { useLingui } from '@lingui/react/macro';

type CoreWorkflowsPermissionGateProps = {
  children: ReactNode;
};

export const CoreWorkflowsPermissionGate = ({
  children,
}: CoreWorkflowsPermissionGateProps) => {
  const { t } = useLingui();
  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);

  if (!canManageWorkflows) {
    return (
      <WorkspaceRouteUnavailable>{t`You do not have permission to access workflows.`}</WorkspaceRouteUnavailable>
    );
  }

  return <>{children}</>;
};
