import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { isObjectMetadataCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isObjectMetadataCommandMenuItemPayload';
import { isPathCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isPathCommandMenuItemPayload';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

export const NavigationEngineCommand = () => {
  const { payload } = useHeadlessCommandContextApi();
  const navigate = useNavigate();
  const { objectMetadataItems } = useObjectMetadataItems();

  const onExecute = () => {
    if (!isDefined(payload)) {
      return;
    }

    if (isObjectMetadataCommandMenuItemPayload(payload)) {
      const objectMetadataItem = objectMetadataItems.find(
        (item) => item.id === payload.objectMetadataItemId,
      );

      if (!isDefined(objectMetadataItem)) {
        return;
      }

      const path = getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: objectMetadataItem.namePlural,
      });

      // eslint-disable-next-line twenty/no-navigate-prefer-link
      navigate(path);

      return;
    }

    if (isPathCommandMenuItemPayload(payload)) {
      // eslint-disable-next-line twenty/no-navigate-prefer-link
      navigate(payload.path);
    }
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
