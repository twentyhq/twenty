import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableObjectMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableObjectMetadataIdComponentState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useExpandSettingsObjectMetadataSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();
    const navigateSettings = useNavigateSettings();
    const { closeSidePanelMenu } = useSidePanelMenu();

    const viewableObjectMetadataId = useAtomComponentStateValue(
      viewableObjectMetadataIdComponentState,
    );
    const objectMetadataItemsByIdMap = useAtomStateValue(
      objectMetadataItemsByIdMapSelector,
    );
    const hasDataModelPermission = useHasPermissionFlag(
      PermissionFlagType.DATA_MODEL,
    );

    const objectMetadataItem = isDefined(viewableObjectMetadataId)
      ? objectMetadataItemsByIdMap.get(viewableObjectMetadataId)
      : undefined;

    if (!isDefined(objectMetadataItem) || !hasDataModelPermission) {
      return null;
    }

    return {
      label: t`Expand to settings`,
      hasExpandShortcut: true,
      expand: () => {
        void closeSidePanelMenu();

        navigateSettings(SettingsPath.ObjectDetail, {
          objectNamePlural: objectMetadataItem.namePlural,
        });
      },
    };
  };
