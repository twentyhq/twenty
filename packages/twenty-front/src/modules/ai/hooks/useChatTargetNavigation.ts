import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { useIsAiChatArtifactSurface } from '@/ai/hooks/useIsAiChatArtifactSurface';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const isAiChatArtifactSurface = useIsAiChatArtifactSurface();

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isAiChatArtifactSurface) {
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

    if (isAiChatArtifactSurface) {
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
