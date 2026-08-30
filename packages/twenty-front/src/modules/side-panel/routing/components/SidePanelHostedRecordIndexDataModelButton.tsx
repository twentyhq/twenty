import { useLingui } from '@lingui/react/macro';
import { matchPath } from 'react-router-dom';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { SETTINGS_DATA_MODEL_PERMISSION } from '@/settings/constants/SettingsDataModelPermission';
import { useCurrentSidePanelRoutedPath } from '@/side-panel/routing/hooks/useCurrentSidePanelRoutedPath';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { getPathnameFromPath } from '@/side-panel/routing/utils/getPathnameFromPath';

export const SidePanelHostedRecordIndexDataModelButton = () => {
  const { t } = useLingui();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  const currentRoutedPath = useCurrentSidePanelRoutedPath();
  const hasDataModelPermission = useHasPermissionFlag(
    SETTINGS_DATA_MODEL_PERMISSION,
  );

  const recordIndexMatch = isDefined(currentRoutedPath)
    ? matchPath(AppPath.RecordIndexPage, getPathnameFromPath(currentRoutedPath))
    : null;

  const objectNamePlural = recordIndexMatch?.params.objectNamePlural;

  if (!isDefined(objectNamePlural) || !hasDataModelPermission) {
    return null;
  }

  return (
    <IconButton
      Icon={IconSettings}
      size="small"
      variant="tertiary"
      onClick={() =>
        openRoutedPageInSidePanel({
          path: getSettingsPath(SettingsPath.ObjectDetail, {
            objectNamePlural,
          }),
        })
      }
      ariaLabel={t`Data model`}
    />
  );
};
