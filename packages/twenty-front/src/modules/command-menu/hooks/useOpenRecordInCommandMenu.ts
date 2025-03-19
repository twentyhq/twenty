import { useCommandMenu } from '@/command-menu/hooks/useCommandMenu';
import { viewableRecordIdComponentState } from '@/command-menu/pages/record-page/states/viewableRecordIdComponentState';
import { viewableRecordNameSingularComponentState } from '@/command-menu/pages/record-page/states/viewableRecordNameSingularComponentState';
import { commandMenuNavigationMorphItemByPageState } from '@/command-menu/states/commandMenuNavigationMorphItemsState';
import { CommandMenuPages } from '@/command-menu/types/CommandMenuPages';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreViewType } from '@/context-store/types/ContextStoreViewType';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useRecoilCallback } from 'recoil';
import { capitalize } from 'twenty-shared';
import { useIcons } from 'twenty-ui';
import { v4 } from 'uuid';

export const useOpenRecordInCommandMenu = () => {
  const { navigateCommandMenu } = useCommandMenu();

  const theme = useTheme();
  const { getIcon } = useIcons();

  const openRecordInCommandMenu = useRecoilCallback(
    ({ set, snapshot }) => {
      return ({
        recordId,
        objectNameSingular,
        isNewRecord = false,
      }: {
        recordId: string;
        objectNameSingular: string;
        isNewRecord?: boolean;
      }) => {
        const pageComponentInstanceId = v4();

        set(
          viewableRecordNameSingularComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          objectNameSingular,
        );
        set(
          viewableRecordIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          recordId,
        );
        set(viewableRecordIdState, recordId);

        const objectMetadataItem = snapshot
          .getLoadable(
            objectMetadataItemFamilySelector({
              objectName: objectNameSingular,
              objectNameType: 'singular',
            }),
          )
          .getValue();

        if (!objectMetadataItem) {
          throw new Error(
            `No object metadata item found for object name ${objectNameSingular}`,
          );
        }

        set(
          contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          objectMetadataItem.id,
        );

        set(
          contextStoreTargetedRecordsRuleComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          {
            mode: 'selection',
            selectedRecordIds: [recordId],
          },
        );

        set(
          contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          1,
        );

        set(
          contextStoreCurrentViewTypeComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          ContextStoreViewType.ShowPage,
        );

        set(
          contextStoreCurrentViewIdComponentState.atomFamily({
            instanceId: pageComponentInstanceId,
          }),
          snapshot
            .getLoadable(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
              }),
            )
            .getValue(),
        );

        const currentMorphItems = snapshot
          .getLoadable(commandMenuNavigationMorphItemByPageState)
          .getValue();

        const morphItemToAdd = {
          objectMetadataId: objectMetadataItem.id,
          recordId,
        };

        const newMorphItems = new Map(currentMorphItems);
        newMorphItems.set(pageComponentInstanceId, morphItemToAdd);

        set(commandMenuNavigationMorphItemByPageState, newMorphItems);

        const Icon = objectMetadataItem?.icon
          ? getIcon(objectMetadataItem.icon)
          : getIcon('IconList');

        const IconColor = getIconColorForObjectType({
          objectType: objectMetadataItem.nameSingular,
          theme,
        });

        const capitalizedObjectNameSingular = capitalize(objectNameSingular);

        navigateCommandMenu({
          page: CommandMenuPages.ViewRecord,
          pageTitle: isNewRecord
            ? t`New ${capitalizedObjectNameSingular}`
            : capitalizedObjectNameSingular,
          pageIcon: Icon,
          pageIconColor: IconColor,
          pageId: pageComponentInstanceId,
          resetNavigationStack: false,
        });
      };
    },
    [getIcon, navigateCommandMenu, theme],
  );

  return {
    openRecordInCommandMenu,
  };
};
