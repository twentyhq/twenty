import { useStore } from 'jotai';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import {
  assertUnreachable,
  getAppPath,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';

import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { useChatTargetNavigation } from '@/ai/hooks/useChatTargetNavigation';
import { isAiChatArtifactSurface } from '@/ai/utils/isAiChatArtifactSurface';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export type ChatReferenceTarget = {
  // The page the reference links to, and what a modifier click opens in a new
  // tab. Undefined for something the assistant only proposes creating.
  to?: string;
  // Set on the artifact surface only, where the reference opens beside the
  // conversation instead of replacing it.
  onClick?: () => void;
};

// Every chat reference resolves its destination here, so a reference kind can
// never end up clickable on one surface and inert on the other.
export const useChatReferenceTarget = (
  reference: ChatReferenceIdentity,
): ChatReferenceTarget => {
  const store = useStore();
  const { openRecordTarget, openViewTarget, openFieldMetadataTarget } =
    useChatTargetNavigation();

  const hasDataModelPermission = useHasPermissionFlag(
    PermissionFlagType.DATA_MODEL,
  );

  const referencedObjectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName:
        'objectNameSingular' in reference ? reference.objectNameSingular : '',
      objectNameType: 'singular',
    },
  );

  const { view } = useViewById(
    reference.kind === 'view' ? reference.viewId : null,
  );

  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );

  const {
    foundFieldMetadataItem: legacyFieldMetadataItem,
    foundObjectMetadataItem: legacyFieldObjectMetadataItem,
  } = useAtomFamilySelectorValue(fieldMetadataItemByIdSelector, {
    fieldMetadataItemId:
      reference.kind === 'legacyFieldById' ? reference.fieldMetadataItemId : '',
  });

  const buildFieldTarget = ({
    fieldMetadataItem,
    objectMetadataItem,
  }: {
    fieldMetadataItem: { id: string; name: string } | undefined;
    objectMetadataItem: { namePlural: string } | undefined;
  }): ChatReferenceTarget => {
    if (
      !isDefined(fieldMetadataItem) ||
      !isDefined(objectMetadataItem) ||
      !hasDataModelPermission
    ) {
      return {};
    }

    return {
      to: getSettingsPath(SettingsPath.ObjectFieldEdit, {
        objectNamePlural: objectMetadataItem.namePlural,
        fieldName: fieldMetadataItem.name,
      }),
      onClick: isAiChatArtifactSurface(store)
        ? () =>
            openFieldMetadataTarget({ fieldMetadataId: fieldMetadataItem.id })
        : undefined,
    };
  };

  switch (reference.kind) {
    case 'record': {
      if (!isDefined(referencedObjectMetadataItem)) {
        return {};
      }

      const { objectNameSingular, recordId } = reference;

      return {
        to: getLinkToShowPage(objectNameSingular, { id: recordId }),
        onClick: isAiChatArtifactSurface(store)
          ? () => openRecordTarget({ objectNameSingular, recordId })
          : undefined,
      };
    }
    case 'object': {
      if (!isDefined(referencedObjectMetadataItem)) {
        return {};
      }

      const { objectNameSingular } = reference;

      return {
        to: getAppPath(AppPath.RecordIndexPage, {
          objectNamePlural: referencedObjectMetadataItem.namePlural,
        }),
        onClick: isAiChatArtifactSurface(store)
          ? () => openViewTarget({ objectNameSingular })
          : undefined,
      };
    }
    case 'view': {
      const viewObjectMetadataItem = isDefined(view)
        ? objectMetadataItemsByIdMap.get(view.objectMetadataId)
        : undefined;

      if (!isDefined(view) || !isDefined(viewObjectMetadataItem)) {
        return {};
      }

      const { viewId } = reference;

      return {
        to: getAppPath(
          AppPath.RecordIndexPage,
          { objectNamePlural: viewObjectMetadataItem.namePlural },
          { viewId },
        ),
        onClick: isAiChatArtifactSurface(store)
          ? () =>
              openViewTarget({
                objectNameSingular: viewObjectMetadataItem.nameSingular,
                viewId,
              })
          : undefined,
      };
    }
    case 'field': {
      const { fieldName } = reference;

      return buildFieldTarget({
        fieldMetadataItem: referencedObjectMetadataItem?.fields.find(
          (fieldMetadataItem) => fieldMetadataItem.name === fieldName,
        ),
        objectMetadataItem: referencedObjectMetadataItem ?? undefined,
      });
    }
    case 'legacyFieldById': {
      return buildFieldTarget({
        fieldMetadataItem: legacyFieldMetadataItem,
        objectMetadataItem: legacyFieldObjectMetadataItem,
      });
    }
    default:
      return assertUnreachable(reference);
  }
};
