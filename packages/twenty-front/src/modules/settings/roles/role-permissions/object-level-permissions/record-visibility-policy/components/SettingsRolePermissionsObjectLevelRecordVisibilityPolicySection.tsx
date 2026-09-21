import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordVisibilityPolicyContent } from '@/settings/roles/role-permissions/object-level-permissions/record-visibility-policy/components/SettingsRolePermissionsObjectLevelRecordVisibilityPolicyContent';

type SettingsRolePermissionsObjectLevelRecordVisibilityPolicySectionProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
};

// OSS equivalent of the Enterprise Record-Level section — see
// RECORD_VISIBILITY_POLICY_SPEC.md §7. Deliberately a separate, always-on
// panel rather than a replacement for the Record-Level (RLS) one above it:
// the two are independent enforcement layers server-side, so they stay
// independent here too.
export const SettingsRolePermissionsObjectLevelRecordVisibilityPolicySection =
  ({
    objectMetadataItem,
    roleId,
  }: SettingsRolePermissionsObjectLevelRecordVisibilityPolicySectionProps) => {
    return (
      <Section.Root>
        <Section.Header
          title={t`Which records can this role see`}
          description={t`Add conditions below to limit which records of this object are visible to this role. This works even without the paid Record-Level feature above.`}
        />
        <SettingsRolePermissionsObjectLevelRecordVisibilityPolicyContent
          objectMetadataItem={objectMetadataItem}
          roleId={roleId}
        />
      </Section.Root>
    );
  };
