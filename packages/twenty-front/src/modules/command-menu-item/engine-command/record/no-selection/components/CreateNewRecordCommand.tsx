import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CreateNewIndexRecordNoSelectionRecordCommand } from '@/command-menu-item/engine-command/record/no-selection/components/CreateNewIndexRecordNoSelectionRecordCommand';
import { isObjectMetadataCommandMenuItemPayload } from '@/command-menu-item/engine-command/utils/isObjectMetadataCommandMenuItemPayload';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { createRecordObjectMetadataItemIdComponentState } from '@/side-panel/pages/create-record/states/createRecordObjectMetadataItemIdComponentState';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { isObjectMetadataManuallyCreatable } from 'twenty-shared/metadata';
import { SidePanelPages } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useIcons } from 'twenty-ui/display';
import { v4 } from 'uuid';

export const CreateNewRecordCommand = () => {
  const { payload } = useHeadlessCommandContextApi();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { navigateSidePanelMenu } = useSidePanelMenu();
  const store = useStore();
  const { getIcon } = useIcons();

  if (!isDefined(payload)) {
    return <CreateNewIndexRecordNoSelectionRecordCommand />;
  }

  const onExecute = () => {
    if (!isObjectMetadataCommandMenuItemPayload(payload)) {
      return;
    }

    const objectMetadataItem = objectMetadataItems.find(
      (item) => item.id === payload.objectMetadataItemId,
    );

    if (
      !isDefined(objectMetadataItem) ||
      !isObjectMetadataManuallyCreatable(objectMetadataItem)
    ) {
      return;
    }

    const pageComponentInstanceId = v4();

    store.set(
      createRecordObjectMetadataItemIdComponentState.atomFamily({
        instanceId: pageComponentInstanceId,
      }),
      objectMetadataItem.id,
    );

    const Icon = objectMetadataItem.icon
      ? getIcon(objectMetadataItem.icon)
      : getIcon('IconList');

    navigateSidePanelMenu({
      page: SidePanelPages.CreateRecord,
      pageTitle: t`New ${objectMetadataItem.labelSingular}`,
      pageIcon: Icon,
      pageIconColor: getIconColorForObjectType(objectMetadataItem.nameSingular),
      pageId: pageComponentInstanceId,
    });
  };

  return <HeadlessEngineCommandWrapperEffect execute={onExecute} />;
};
