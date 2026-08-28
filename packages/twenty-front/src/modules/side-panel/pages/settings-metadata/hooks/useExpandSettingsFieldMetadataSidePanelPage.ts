import { useLingui } from '@lingui/react/macro';
import { SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { viewableFieldMetadataIdComponentState } from '@/side-panel/pages/settings-metadata/states/viewableFieldMetadataIdComponentState';
import { type SidePanelExpandTarget } from '@/side-panel/types/SidePanelExpandTarget';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { PermissionFlagType } from '~/generated-metadata/graphql';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useExpandSettingsFieldMetadataSidePanelPage =
  (): SidePanelExpandTarget | null => {
    const { t } = useLingui();
    const navigateSettings = useNavigateSettings();
    const { closeSidePanelMenu } = useSidePanelMenu();

    const viewableFieldMetadataId = useAtomComponentStateValue(
      viewableFieldMetadataIdComponentState,
    );
    const { foundFieldMetadataItem, foundObjectMetadataItem } =
      useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
        fieldMetadataItemId: viewableFieldMetadataId ?? '',
      });
    const hasDataModelPermission = useHasPermissionFlag(
      PermissionFlagType.DATA_MODEL,
    );

    if (
      !isDefined(foundFieldMetadataItem) ||
      !isDefined(foundObjectMetadataItem) ||
      !hasDataModelPermission
    ) {
      return null;
    }

    return {
      label: t`Expand to settings`,
      hasExpandShortcut: true,
      expand: () => {
        void closeSidePanelMenu();

        navigateSettings(SettingsPath.ObjectFieldEdit, {
          objectNamePlural: foundObjectMetadataItem.namePlural,
          fieldName: foundFieldMetadataItem.name,
        });
      },
    };
  };
