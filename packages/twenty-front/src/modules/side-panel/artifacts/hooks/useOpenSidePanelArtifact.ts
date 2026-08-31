import { useStore } from 'jotai';
import { useCallback } from 'react';
import { ContextStorePageType } from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { type IconComponent, useIcons } from 'twenty-ui/icon';
import { v4 } from 'uuid';

import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';
import { contextStoreCurrentObjectMetadataItemIdComponentState } from '@/context-store/states/contextStoreCurrentObjectMetadataItemIdComponentState';
import { contextStoreCurrentPageTypeComponentState } from '@/context-store/states/contextStoreCurrentPageTypeComponentState';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { contextStoreCurrentViewTypeComponentState } from '@/context-store/states/contextStoreCurrentViewTypeComponentState';
import { contextStoreNumberOfSelectedRecordsComponentState } from '@/context-store/states/contextStoreNumberOfSelectedRecordsComponentState';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { getContextStoreViewType } from '@/context-store/utils/getContextStoreViewType';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { getIconColorForObjectType } from '@/object-metadata/utils/getIconColorForObjectType';
import { resolveSidePanelArtifact } from '@/side-panel/artifacts/utils/resolveSidePanelArtifact';
import { SIDE_PANEL_ARTIFACT_PAGE } from '@/side-panel/constants/SidePanelArtifactPage';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { sidePanelNavigationMorphItemsByPageState } from '@/side-panel/states/sidePanelNavigationMorphItemsByPageState';
import { sidePanelNavigationStackState } from '@/side-panel/states/sidePanelNavigationStackState';
import { viewsSelector } from '@/views/states/selectors/viewsSelector';

type OpenSidePanelArtifactParams = {
  artifactPath: string;
  resetNavigationStack?: boolean;
  pageTitle?: string;
};

type SidePanelArtifactPageInfo = {
  title: string;
  Icon: IconComponent;
  iconColor?: string;
};

export const useOpenSidePanelArtifact = () => {
  const store = useStore();
  const { getIcon } = useIcons();
  const { navigateSidePanelMenu } = useSidePanelMenu();

  const openSidePanelArtifact = useCallback(
    ({
      artifactPath,
      resetNavigationStack = false,
      pageTitle,
    }: OpenSidePanelArtifactParams): boolean => {
      const artifact = resolveSidePanelArtifact({
        artifactPath,
        objectMetadataItems: store.get(objectMetadataItemsSelector.atom),
        views: store.get(viewsSelector.atom),
      });

      if (artifact === null) {
        return false;
      }

      const currentNavigationStackItem = store
        .get(sidePanelNavigationStackState.atom)
        .at(-1);

      if (currentNavigationStackItem?.artifactPath === artifactPath) {
        return false;
      }

      const pageId = v4();

      switch (artifact.kind) {
        case 'record': {
          store.set(
            contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
              instanceId: pageId,
            }),
            artifact.objectMetadataItem.id,
          );
          store.set(
            contextStoreTargetedRecordsRuleComponentState.atomFamily({
              instanceId: pageId,
            }),
            {
              mode: 'selection',
              selectedRecordIds: [artifact.recordId],
            },
          );
          store.set(
            contextStoreNumberOfSelectedRecordsComponentState.atomFamily({
              instanceId: pageId,
            }),
            1,
          );
          store.set(
            contextStoreCurrentPageTypeComponentState.atomFamily({
              instanceId: pageId,
            }),
            ContextStorePageType.Record,
          );
          store.set(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: pageId,
            }),
            store.get(
              contextStoreCurrentViewIdComponentState.atomFamily({
                instanceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
              }),
            ),
          );
          break;
        }
        case 'recordIndex': {
          store.set(
            contextStoreCurrentObjectMetadataItemIdComponentState.atomFamily({
              instanceId: pageId,
            }),
            artifact.objectMetadataItem.id,
          );
          store.set(
            contextStoreCurrentViewIdComponentState.atomFamily({
              instanceId: pageId,
            }),
            artifact.view.id,
          );
          store.set(
            contextStoreCurrentPageTypeComponentState.atomFamily({
              instanceId: pageId,
            }),
            ContextStorePageType.Index,
          );
          store.set(
            contextStoreCurrentViewTypeComponentState.atomFamily({
              instanceId: pageId,
            }),
            getContextStoreViewType(artifact.view.type),
          );
          break;
        }
        case 'settingsField':
          break;
        default:
          assertUnreachable(artifact);
      }

      const pageInfo: SidePanelArtifactPageInfo = (() => {
        switch (artifact.kind) {
          case 'record':
            return {
              title: artifact.objectMetadataItem.labelSingular,
              Icon: getIcon(artifact.objectMetadataItem.icon ?? 'IconList'),
              iconColor: getIconColorForObjectType(
                artifact.objectMetadataItem.nameSingular,
              ),
            };
          case 'recordIndex':
            return {
              title: artifact.view.name,
              Icon: getIcon(artifact.view.icon),
            };
          case 'settingsField':
            return {
              title: artifact.fieldMetadataItem.label,
              Icon: getIcon(artifact.fieldMetadataItem.icon),
            };
          default:
            return assertUnreachable(artifact);
        }
      })();

      navigateSidePanelMenu({
        page: SIDE_PANEL_ARTIFACT_PAGE,
        artifactPath,
        pageTitle: pageTitle ?? pageInfo.title,
        pageIcon: pageInfo.Icon,
        pageIconColor: pageInfo.iconColor,
        pageId,
        resetNavigationStack,
      });

      if (artifact.kind === 'record') {
        const navigationMorphItems = store.get(
          sidePanelNavigationMorphItemsByPageState.atom,
        );
        const nextNavigationMorphItems = new Map(navigationMorphItems);

        nextNavigationMorphItems.set(pageId, [
          {
            objectMetadataId: artifact.objectMetadataItem.id,
            recordId: artifact.recordId,
          },
        ]);

        store.set(
          sidePanelNavigationMorphItemsByPageState.atom,
          nextNavigationMorphItems,
        );
      }

      return true;
    },
    [getIcon, navigateSidePanelMenu, store],
  );

  return { openSidePanelArtifact };
};
