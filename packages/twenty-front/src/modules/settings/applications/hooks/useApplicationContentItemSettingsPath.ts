import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { type ApplicationContentItem } from '@/settings/applications/types/ApplicationContentItem';
import { type ApplicationContentType } from '@/settings/applications/types/ApplicationContentType';
import { getApplicationContentItemSettingsPath } from '@/settings/applications/utils/getApplicationContentItemSettingsPath';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useApplicationContentItemSettingsPath = (
  installedApplicationId: string | undefined,
) => {
  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  return ({
    contentType,
    item,
  }: {
    contentType: ApplicationContentType;
    item: Pick<
      ApplicationContentItem,
      'id' | 'universalIdentifier' | 'objectUniversalIdentifier'
    >;
  }) =>
    getApplicationContentItemSettingsPath({
      contentType,
      item,
      objectMetadataItems,
      installedApplicationId,
    });
};
