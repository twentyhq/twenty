import { useLingui } from '@lingui/react/macro';
import { useNavigate } from 'react-router-dom';
import { assertUnreachable } from 'twenty-shared/utils';

import { useOpenSettingsMenu } from '@/navigation/hooks/useOpenSettings';
import { useCurrentSidePanelArtifact } from '@/side-panel/artifacts/hooks/useCurrentSidePanelArtifact';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { useNavigateToRecordPageFromSidePanel } from '@/side-panel/pages/record-page/hooks/useNavigateToRecordPageFromSidePanel';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const useExpandSidePanelArtifact = (): SidePanelExpandTarget | null => {
  const { t } = useLingui();
  const artifact = useCurrentSidePanelArtifact();
  const navigate = useNavigate();
  const { openSettingsMenu } = useOpenSettingsMenu();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const { navigateToRecordPage } = useNavigateToRecordPageFromSidePanel();
  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  if (artifact === null) {
    return null;
  }

  switch (artifact.kind) {
    case 'record':
      return {
        label: t`Expand record`,
        hasExpandShortcut: true,
        expand: () =>
          navigateToRecordPage({
            objectNameSingular: artifact.objectMetadataItem.nameSingular,
            recordId: artifact.recordId,
            artifactPath: artifact.artifactPath,
          }),
      };
    case 'recordIndex':
      return {
        label: t`Expand view`,
        hasExpandShortcut: true,
        expand: () => {
          navigate(artifact.artifactPath);

          void closeSidePanelMenu();
        },
      };
    case 'settingsField':
      return hasDataModelPermission
        ? {
            label: t`Expand to settings`,
            hasExpandShortcut: true,
            expand: () => {
              void closeSidePanelMenu();
              openSettingsMenu();

              navigate(artifact.artifactPath);
            },
          }
        : null;
    default:
      return assertUnreachable(artifact);
  }
};
