import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { viewableRecordsObjectMetadataIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsObjectMetadataIdComponentState';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SidePanelRecordsDataModelButton = () => {
  const { t } = useLingui();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  const viewableRecordsObjectMetadataId = useAtomComponentStateValue(
    viewableRecordsObjectMetadataIdComponentState,
  );
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const objectMetadataItem = isDefined(viewableRecordsObjectMetadataId)
    ? objectMetadataItemsByIdMap.get(viewableRecordsObjectMetadataId)
    : undefined;

  if (!isDefined(objectMetadataItem) || !hasDataModelPermission) {
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
            objectNamePlural: objectMetadataItem.namePlural,
          }),
        })
      }
      ariaLabel={t`Data model`}
    />
  );
};
