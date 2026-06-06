import { ReactFlowProvider } from '@xyflow/react';

import { SettingsDataModelOverview } from '@/settings/data-model/graph-overview/components/SettingsDataModelOverview';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { t } from '@lingui/core/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';

export const SettingsObjectOverview = () => {
  return (
    <SettingsPageLayout
      links={[
        {
          children: t`Workspace`,
          href: getSettingsPath(SettingsPath.General),
        },
        { children: t`Objects`, href: getSettingsPath(SettingsPath.Objects) },
        {
          children: t`Overview`,
        },
      ]}
    >
      <ReactFlowProvider>
        <SettingsDataModelOverview />
      </ReactFlowProvider>
    </SettingsPageLayout>
  );
};
