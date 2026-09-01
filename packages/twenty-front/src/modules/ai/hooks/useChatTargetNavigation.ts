import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { isAiChatArtifactSurface } from '@/ai/utils/isAiChatArtifactSurface';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();

  const isArtifactSurface = () => isAiChatArtifactSurface(store);

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isArtifactSurface()) {
      openRecordInSidePanel({
        recordId,
        objectNameSingular,
      });

      return;
    }

    navigateApp(AppPath.RecordShowPage, {
      objectNameSingular,
      objectRecordId: recordId,
    });
  };

  const openViewTarget = ({
    objectNameSingular,
    viewId,
  }: {
    objectNameSingular: string;
    viewId?: string;
  }) => {
    const objectMetadataItem = store.get(
      objectMetadataItemFamilySelector.selectorFamily({
        objectName: objectNameSingular,
        objectNameType: 'singular',
      }),
    );

    if (!isDefined(objectMetadataItem)) {
      throw new Error(
        `Object with singular name ${objectNameSingular} not found.`,
      );
    }

    const recordIndexParams = {
      objectNamePlural: objectMetadataItem.namePlural,
    };
    const recordIndexQueryParams = isDefined(viewId) ? { viewId } : undefined;

    if (isArtifactSurface()) {
      openRoutedPageInSidePanel({
        path: getAppPath(
          AppPath.RecordIndexPage,
          recordIndexParams,
          recordIndexQueryParams,
        ),
      });

      return;
    }

    navigateApp(
      AppPath.RecordIndexPage,
      recordIndexParams,
      recordIndexQueryParams,
    );
  };

  return { openRecordTarget, openViewTarget };
};
