import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode } from 'react';
import { AppPath, SettingsPath } from 'twenty-shared/types';
import {
  assertUnreachable,
  getAppPath,
  getSettingsPath,
  isDefined,
} from 'twenty-shared/utils';
import { AvatarOrIcon } from 'twenty-ui/data-display';
import { IconApps, IconLock, useIcons } from 'twenty-ui/icon';
import { useTheme } from 'twenty-ui/theme-constants';

import { CHAT_REFERENCE_PERMISSION_FLAG_BY_KIND } from '@/ai/constants/ChatReferencePermissionFlagByKind';
import { useIsAiChatArtifactSurface } from '@/ai/hooks/useIsAiChatArtifactSurface';
import { type ChatReferenceMatch } from '@/ai/types/ChatReferenceMatch';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { objectMetadataItemsByIdMapSelector } from '@/object-metadata/states/objectMetadataItemsByIdMapSelector';
import { getLinkToShowPage } from '@/object-metadata/utils/getLinkToShowPage';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useOpenRoutedPageInSidePanel } from '@/side-panel/routing/hooks/useOpenRoutedPageInSidePanel';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useViewById } from '@/views/hooks/useViewById';

const PROPOSED_OBJECT_METADATA_ICON = 'IconListNumbers';
const PROPOSED_FIELD_METADATA_ICON = 'IconTag';

type ChatReferenceDestination = {
  path: string | undefined;
  leftComponent: ReactNode;
};

type ChatReferenceTarget = ChatReferenceDestination & {
  to: string | undefined;
  onClick: (() => void) | undefined;
};

export const useChatReferenceTarget = (
  reference: ChatReferenceMatch,
): ChatReferenceTarget | null => {
  const theme = useTheme();
  const { getIcon } = useIcons();
  const isAiChatArtifactSurface = useIsAiChatArtifactSurface();
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();
  const { openRoutedPageInSidePanel } = useOpenRoutedPageInSidePanel();
  const hasPermission = useHasPermissionFlag(
    CHAT_REFERENCE_PERMISSION_FLAG_BY_KIND[reference.kind],
  );
  const objectMetadataItem = useAtomFamilySelectorValue(
    objectMetadataItemFamilySelector,
    {
      objectName:
        'objectNameSingular' in reference ? reference.objectNameSingular : '',
      objectNameType: 'singular',
    },
  );
  const objectMetadataItemsByIdMap = useAtomStateValue(
    objectMetadataItemsByIdMapSelector,
  );
  const { view } = useViewById(
    reference.kind === 'view' ? reference.viewId : null,
  );

  const iconSize = theme.icon.size.sm;
  const iconStroke = theme.icon.stroke.sm;

  const resolveDestination = (): ChatReferenceDestination | null => {
    switch (reference.kind) {
      case 'record': {
        if (
          !isDefined(objectMetadataItem) ||
          !isNonEmptyString(reference.recordId)
        ) {
          return null;
        }

        const recordPath = getLinkToShowPage(reference.objectNameSingular, {
          id: reference.recordId,
        });

        return {
          path: isNonEmptyString(recordPath) ? recordPath : undefined,
          leftComponent: (
            <AvatarOrIcon
              placeholder={reference.displayName}
              placeholderColorSeed={reference.recordId}
              avatarType="rounded"
              avatarUrl=""
            />
          ),
        };
      }
      case 'records': {
        const recordsObjectMetadataItem = objectMetadataItemsByIdMap.get(
          reference.objectMetadataId,
        );

        if (!isDefined(recordsObjectMetadataItem)) {
          return null;
        }

        return {
          path: getAppPath(AppPath.RecordIndexPage, {
            objectNamePlural: recordsObjectMetadataItem.namePlural,
          }),
          leftComponent: (
            <ObjectMetadataIcon
              objectMetadataItem={recordsObjectMetadataItem}
              size={iconSize}
              stroke={iconStroke}
            />
          ),
        };
      }
      case 'object':
        return {
          path: isDefined(objectMetadataItem)
            ? getSettingsPath(SettingsPath.ObjectDetail, {
                objectNamePlural: objectMetadataItem.namePlural,
              })
            : undefined,
          leftComponent: (
            <ObjectMetadataIcon
              objectMetadataItem={
                objectMetadataItem ?? {
                  icon: PROPOSED_OBJECT_METADATA_ICON,
                  nameSingular: reference.objectNameSingular,
                  color: null,
                  isSystem: false,
                }
              }
              size={iconSize}
              stroke={iconStroke}
            />
          ),
        };
      case 'field': {
        const fieldMetadataItem = objectMetadataItem?.fields.find(
          (field) => field.name === reference.fieldName,
        );
        const Icon = getIcon(
          fieldMetadataItem?.icon ?? PROPOSED_FIELD_METADATA_ICON,
        );

        return {
          path:
            isDefined(objectMetadataItem) && isDefined(fieldMetadataItem)
              ? getSettingsPath(SettingsPath.ObjectFieldEdit, {
                  objectNamePlural: objectMetadataItem.namePlural,
                  fieldName: fieldMetadataItem.name,
                })
              : undefined,
          leftComponent: <Icon size={iconSize} stroke={iconStroke} />,
        };
      }
      case 'view': {
        const viewObjectMetadataItem = isDefined(view)
          ? objectMetadataItemsByIdMap.get(view.objectMetadataId)
          : undefined;

        if (!isDefined(view) || !isDefined(viewObjectMetadataItem)) {
          return null;
        }

        const Icon = getIcon(view.icon);

        return {
          path: getAppPath(
            AppPath.RecordIndexPage,
            { objectNamePlural: viewObjectMetadataItem.namePlural },
            { viewId: reference.viewId },
          ),
          leftComponent: <Icon size={iconSize} stroke={iconStroke} />,
        };
      }
      case 'role':
        return {
          path: getSettingsPath(SettingsPath.RoleDetail, {
            roleId: reference.roleId,
          }),
          leftComponent: <IconLock size={iconSize} stroke={iconStroke} />,
        };
      case 'app':
        return {
          path: getSettingsPath(SettingsPath.ApplicationDetail, {
            applicationId: reference.applicationId,
          }),
          leftComponent: <IconApps size={iconSize} stroke={iconStroke} />,
        };
      default:
        return assertUnreachable(reference);
    }
  };

  const getOpenArtifact = (path: string): (() => void) | undefined => {
    switch (reference.kind) {
      case 'record':
        return () =>
          openRecordInSidePanel({
            recordId: reference.recordId,
            objectNameSingular: reference.objectNameSingular,
          });
      // The application settings page is not routed on the side panel, so
      // its chip keeps navigating the way a plain link does.
      case 'app':
        return undefined;
      default:
        return () => openRoutedPageInSidePanel({ path });
    }
  };

  const destination = resolveDestination();

  if (!isDefined(destination)) {
    return null;
  }

  const to = hasPermission ? destination.path : undefined;

  return {
    ...destination,
    to,
    onClick:
      isAiChatArtifactSurface && isNonEmptyString(to)
        ? getOpenArtifact(to)
        : undefined,
  };
};
