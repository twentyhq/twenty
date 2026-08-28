import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { IconSettings } from 'twenty-ui/icon';
import { IconButton } from 'twenty-ui/input';

import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenSettingsObjectMetadataInSidePanel } from '@/side-panel/hooks/useOpenSettingsObjectMetadataInSidePanel';
import { viewableRecordsObjectMetadataIdComponentState } from '@/side-panel/pages/records-page/states/viewableRecordsObjectMetadataIdComponentState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export const SidePanelRecordsDataModelButton = () => {
  const { t } = useLingui();
  const { openSettingsObjectMetadataInSidePanel } =
    useOpenSettingsObjectMetadataInSidePanel();

  const viewableRecordsObjectMetadataId = useAtomComponentStateValue(
    viewableRecordsObjectMetadataIdComponentState,
  );
  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  if (!isDefined(viewableRecordsObjectMetadataId) || !hasDataModelPermission) {
    return null;
  }

  return (
    <IconButton
      Icon={IconSettings}
      size="small"
      variant="tertiary"
      onClick={() =>
        openSettingsObjectMetadataInSidePanel({
          objectMetadataId: viewableRecordsObjectMetadataId,
        })
      }
      ariaLabel={t`Data model`}
    />
  );
};
