import { useStore } from 'jotai';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { isAiChatArtifactSurface } from '@/ai/utils/isAiChatArtifactSurface';
import { fieldMetadataItemByIdMapSelector } from '@/object-metadata/states/fieldMetadataItemByIdMapSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { useOpenRecordsInSidePanel } from '@/side-panel/hooks/useOpenRecordsInSidePanel';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenSettingsFieldMetadataInSidePanel } from '@/side-panel/hooks/useOpenSettingsFieldMetadataInSidePanel';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useChatTargetNavigation = () => {
  const store = useStore();
  const navigateApp = useNavigateApp();
  const navigateSettings = useNavigateSettings();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRecordsInSidePanel } = useOpenRecordsInSidePanel();
  const { openSettingsFieldMetadataInSidePanel } =
    useOpenSettingsFieldMetadataInSidePanel();

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
    if (isArtifactSurface()) {
      openRecordsInSidePanel({
        objectNameSingular,
        viewId,
      });

      return;
    }

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

    navigateApp(
      AppPath.RecordIndexPage,
      { objectNamePlural: objectMetadataItem.namePlural },
      isDefined(viewId) ? { viewId } : undefined,
    );
  };

  const openFieldMetadataTarget = ({
    fieldMetadataId,
  }: {
    fieldMetadataId: string;
  }) => {
    if (isArtifactSurface()) {
      openSettingsFieldMetadataInSidePanel({ fieldMetadataId });

      return;
    }

    const fieldMetadataItem = store
      .get(fieldMetadataItemByIdMapSelector.atom)
      .get(fieldMetadataId);
    const objectMetadataItem = isDefined(fieldMetadataItem?.objectMetadataId)
      ? store
          .get(objectMetadataItemsByIdMapSelector.atom)
          .get(fieldMetadataItem.objectMetadataId)
      : undefined;

    if (!isDefined(fieldMetadataItem) || !isDefined(objectMetadataItem)) {
      throw new Error(`Field metadata ${fieldMetadataId} not found.`);
    }

    navigateSettings(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: objectMetadataItem.namePlural,
      fieldName: fieldMetadataItem.name,
    });
  };

  return { openRecordTarget, openViewTarget, openFieldMetadataTarget };
};
