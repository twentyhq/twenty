import { buildConditionalDisplayContextFieldMetadataItem } from '@/conditional-display/utils/buildConditionalDisplayContextFieldMetadataItem';
import { type FieldSelectLeadingSection } from '@/object-record/advanced-filter/types/FieldSelectLeadingSection';
import { t } from '@lingui/core/macro';
import { type Role } from '~/generated-metadata/graphql';

export const buildConditionalDisplayFieldSelectLeadingSections = (
  roles: Pick<Role, 'id' | 'label'>[],
): FieldSelectLeadingSection[] => [
  {
    id: 'current-user',
    label: t`Current user`,
    fieldMetadataItems: [
      buildConditionalDisplayContextFieldMetadataItem({
        contextKey: 'currentRoleId',
        roles,
      }),
      buildConditionalDisplayContextFieldMetadataItem({
        contextKey: 'currentWorkspaceMemberId',
        roles,
      }),
    ],
  },
  {
    id: 'device',
    label: t`Device`,
    fieldMetadataItems: [
      buildConditionalDisplayContextFieldMetadataItem({
        contextKey: 'device',
        roles,
      }),
    ],
  },
];
