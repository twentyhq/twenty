import { useStore } from 'jotai';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { getAppPath, getSettingsPath, isDefined } from 'twenty-shared/utils';

import { isAiChatArtifactSurface } from '@/ai/utils/isAiChatArtifactSurface';
import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const navigateSettings = useNavigateSettings();
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

  const openFieldMetadataTarget = ({
    fieldMetadataId,
  }: {
    fieldMetadataId: string;
  }) => {
    const fieldMetadataItem = store
      .get(fieldMetadataItemByIdMapSelector.atom)
      .get(fieldMetadataId);
    const objectMetadataItem = isDefined(fieldMetadataItem?.objectMetadataId)
      ? store
          .get(objectMetadataItemsByIdMapSelector.atom)
          .get(fieldMetadataItem.objectMetadataId)
      : undefined;

    // A chat message can outlive the field it names, and this runs from a
    // click handler, where throwing would reach no one.
    if (!isDefined(fieldMetadataItem) || !isDefined(objectMetadataItem)) {
      return;
    }

    const fieldPathParams = {
      objectNamePlural: objectMetadataItem.namePlural,
      fieldName: fieldMetadataItem.name,
    };

    if (isArtifactSurface()) {
      openRoutedPageInSidePanel({
        path: getSettingsPath(SettingsPath.ObjectFieldEdit, fieldPathParams),
      });

      return;
    }

    navigateSettings(SettingsPath.ObjectFieldEdit, fieldPathParams);
  };

  return { openRecordTarget, openViewTarget, openFieldMetadataTarget };
};
