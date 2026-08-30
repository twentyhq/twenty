import { useLingui } from '@lingui/react/macro';
import { type PathMatch } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SidePanelHostedRecordIndexDataModelButton = ({
  match,
}: {
  match: PathMatch<string>;
}) => {
  const { t } = useLingui();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const objectNamePlural = match.params.objectNamePlural;

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
