import { getConditionalDisplayDeviceLabel } from '@/conditional-display/utils/getConditionalDisplayDeviceLabel';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { t } from '@lingui/core/macro';
import {
  CONDITIONAL_DISPLAY_CONTEXT_KEYS,
  CONDITIONAL_DISPLAY_DEVICES,
} from 'twenty-shared/constants';
import {
  type ConditionalDisplayAdminContextKey,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { assertUnreachable } from 'twenty-shared/utils';
import { RelationType, type Role } from '~/generated-metadata/graphql';

export const buildConditionalDisplayContextFieldMetadataItem = ({
  contextKey,
  roles,
}: {
  contextKey: ConditionalDisplayAdminContextKey;
  roles: Pick<Role, 'id' | 'label'>[];
}): FieldMetadataItem => {
  const contextFieldMetadataItem = {
    id: contextKey,
    name: contextKey,
    universalIdentifier: contextKey,
    type: CONDITIONAL_DISPLAY_CONTEXT_KEYS[contextKey].subject.field.type,
    isActive: true,
    isNullable: true,
    createdAt: '',
    updatedAt: '',
  };

  switch (contextKey) {
    case 'currentRoleId':
      return {
        ...contextFieldMetadataItem,
        label: t`Role`,
        icon: 'IconUserCircle',
        options: roles.map((role, position) => ({
          id: role.id,
          label: role.label,
          value: role.id,
          position,
          color: 'gray',
        })),
      };
    case 'currentWorkspaceMemberId':
      return {
        ...contextFieldMetadataItem,
        label: t`Workspace member`,
        icon: 'IconUser',
        relation: {
          type: RelationType.MANY_TO_ONE,
          sourceFieldMetadata: { id: contextKey, name: contextKey },
          targetFieldMetadata: { id: '', name: '' },
          sourceObjectMetadata: { id: '', nameSingular: '', namePlural: '' },
          targetObjectMetadata: {
            id: '',
            nameSingular: CoreObjectNameSingular.WorkspaceMember,
            namePlural: '',
          },
        },
      };
    case 'device':
      return {
        ...contextFieldMetadataItem,
        label: t`Device`,
        icon: 'IconDeviceDesktop',
        options: CONDITIONAL_DISPLAY_DEVICES.map((device, position) => ({
          id: device,
          label: getConditionalDisplayDeviceLabel(device),
          value: device,
          position,
          color: 'gray',
        })),
      };
    default:
      return assertUnreachable(contextKey);
  }
};
