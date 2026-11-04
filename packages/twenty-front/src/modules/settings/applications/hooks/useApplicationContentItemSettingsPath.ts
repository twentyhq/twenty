import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';

import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

// Only items installed in this workspace have a settings page to open
export const useApplicationContentItemSettingsPath = (
  installedApplicationId: string | undefined,
) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const findObjectMetadataItem = (
    objectUniversalIdentifier: string | null | undefined,
  ) =>
    objectMetadataItems.find(
      (objectMetadataItem) =>
        objectMetadataItem.universalIdentifier === objectUniversalIdentifier,
    );

  return (
    contentType: ApplicationContentType,
    item: ApplicationContentItem,
  ): string | undefined => {
    switch (contentType) {
      case 'objects': {
        const objectMetadataItem = findObjectMetadataItem(
          item.universalIdentifier,
        );

        return isDefined(objectMetadataItem)
          ? getSettingsPath(SettingsPath.ObjectDetail, {
              objectNamePlural: objectMetadataItem.namePlural,
            })
          : undefined;
      }
      case 'fields': {
        const objectMetadataItem = findObjectMetadataItem(
          item.objectUniversalIdentifier,
        );
        const fieldMetadataItem = objectMetadataItem?.fields.find(
          (field) => field.universalIdentifier === item.universalIdentifier,
        );

        return isDefined(objectMetadataItem) && isDefined(fieldMetadataItem)
          ? getSettingsPath(SettingsPath.ObjectFieldEdit, {
              objectNamePlural: objectMetadataItem.namePlural,
              fieldName: fieldMetadataItem.name,
            })
          : undefined;
      }
      case 'skills':
        return isDefined(item.id)
          ? getSettingsPath(SettingsPath.AiSkillDetail, { skillId: item.id })
          : undefined;
      case 'roles':
        return isDefined(item.id)
          ? getSettingsPath(SettingsPath.RoleDetail, { roleId: item.id })
          : undefined;
    }

    if (!isDefined(item.id) || !isDefined(installedApplicationId)) {
      return undefined;
    }

    switch (contentType) {
      case 'logicFunctions':
        return getSettingsPath(SettingsPath.ApplicationLogicFunctionDetail, {
          applicationId: installedApplicationId,
          logicFunctionId: item.id,
        });
      case 'frontComponents':
        return getSettingsPath(SettingsPath.ApplicationFrontComponentDetail, {
          applicationId: installedApplicationId,
          frontComponentId: item.id,
        });
      case 'commandMenuItems':
        return getSettingsPath(SettingsPath.ApplicationCommandMenuItemDetail, {
          applicationId: installedApplicationId,
          commandMenuItemId: item.id,
        });
      default:
        return undefined;
    }
  };
};
