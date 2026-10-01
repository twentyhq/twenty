import { useStore } from 'jotai';
import { AppPath } from 'twenty-shared/types';
import { getAppPath, isDefined } from 'twenty-shared/utils';

import { useAiChatArtifactSurface } from '@/ai/hooks/useAiChatArtifactSurface';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const { isAiChatArtifactSurface, openAiChatArtifact } =
    useAiChatArtifactSurface();

  const openRecordTarget = ({
    recordId,
    objectNameSingular,
  }: {
    recordId: string;
    objectNameSingular: string;
  }) => {
    if (isAiChatArtifactSurface) {
      openAiChatArtifact(({ resetNavigationStack }) =>
        openRecordInSidePanel({
          recordId,
          objectNameSingular,
          resetNavigationStack,
        }),
      );

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
      openAiChatArtifact(({ resetNavigationStack }) =>
        openRoutedPageInSidePanel({
          path: getAppPath(
            AppPath.RecordIndexPage,
            recordIndexParams,
            recordIndexQueryParams,
          ),
          resetNavigationStack,
        }),
      );

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
