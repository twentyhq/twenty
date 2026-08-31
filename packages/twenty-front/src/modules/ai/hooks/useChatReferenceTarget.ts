import { AppPath, SettingsPath } from 'twenty-shared/types';
import { isNonEmptyString } from '@sniptt/guards';
import {
  assertUnreachable,
  getAppPath,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';

import { type ChatReferenceIdentity } from '@/ai/types/ChatReferenceIdentity';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { useOpenWorkspaceTarget } from '@/navigation/hooks/useOpenWorkspaceTarget';
import { fieldMetadataItemByIdSelector } from '@/object-metadata/states/fieldMetadataItemByIdSelector';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useViewById } from '@/views/hooks/useViewById';
import { type View } from '@/views/types/View';
import { PermissionFlagType } from '~/generated-metadata/graphql';

export type ChatReferenceTarget = {
  // The page the reference links to, and what a modifier click opens in a new
  // tab. Undefined for something the assistant only proposes creating.
  to?: string;
  // Ordinary clicks delegate to the surface-aware target navigator. Modifier
  // clicks bypass it and use the canonical link above.
  onClick?: () => void;
  // The icon and destination must come from the same metadata resolution.
  fieldMetadataItem?: FieldMetadataItem;
  objectMetadataItem?: EnrichedObjectMetadataItem;
  view?: View;
};

// Every chat reference resolves its destination here, so a reference kind can
// never end up clickable on one surface and inert on the other.
export const useChatReferenceTarget = (
  reference: ChatReferenceIdentity,
): ChatReferenceTarget => {
  const { openWorkspaceTarget } = useOpenWorkspaceTarget();

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
    fieldMetadataItem: FieldMetadataItem | undefined;
    objectMetadataItem: EnrichedObjectMetadataItem | undefined;
  }): ChatReferenceTarget => {
    if (
      !isDefined(fieldMetadataItem) ||
      !isDefined(objectMetadataItem) ||
      !hasDataModelPermission
    ) {
      return {
        fieldMetadataItem,
        objectMetadataItem,
      };
    }

    const path = getSettingsPath(SettingsPath.ObjectFieldEdit, {
      objectNamePlural: objectMetadataItem.namePlural,
      fieldName: fieldMetadataItem.name,
    });

    return {
      fieldMetadataItem,
      objectMetadataItem,
      to: path,
      onClick: () => openWorkspaceTarget({ path }),
    };
  };

  switch (reference.kind) {
    case 'record': {
      if (
        !isDefined(referencedObjectMetadataItem) ||
        !isNonEmptyString(reference.recordId)
      ) {
        return {};
      }

      const { objectNameSingular, recordId } = reference;
      const path = getLinkToShowPage(objectNameSingular, { id: recordId });

      return {
        objectMetadataItem: referencedObjectMetadataItem,
        to: path,
        onClick: () => openWorkspaceTarget({ path }),
      };
    }
    case 'object': {
      if (!isDefined(referencedObjectMetadataItem)) {
        return {};
      }

      const path = getAppPath(AppPath.RecordIndexPage, {
        objectNamePlural: referencedObjectMetadataItem.namePlural,
      });

      return {
        objectMetadataItem: referencedObjectMetadataItem,
        to: path,
        onClick: () => openWorkspaceTarget({ path }),
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
      const path = getAppPath(
        AppPath.RecordIndexPage,
        { objectNamePlural: viewObjectMetadataItem.namePlural },
        { viewId },
      );

      return {
        objectMetadataItem: viewObjectMetadataItem,
        view,
        to: path,
        onClick: () => openWorkspaceTarget({ path }),
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
