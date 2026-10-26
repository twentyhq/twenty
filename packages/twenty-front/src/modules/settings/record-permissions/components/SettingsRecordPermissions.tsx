import { updateRecordPermissionRoleOverride } from '@/settings/record-permissions/utils/updateRecordPermissionRoleOverride';
import { RecordPermissionPolicyTransfer } from '@/settings/record-permissions/components/RecordPermissionPolicyTransfer';
import { resolveObjectRecordPermissionPolicy } from 'twenty-shared/utils';
import { RecordPermissionDefaults } from '@/settings/record-permissions/components/RecordPermissionDefaults';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { checkIfBillingEntitlementIsEnabledOnWorkspace } from '@/workspace/utils/checkIfBillingEntitlementIsEnabledOnWorkspace';
import { useState } from 'react';
import { t } from '@lingui/core/macro';
import { Section } from 'twenty-ui/components/layout';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useRecordPermissionPolicy } from '@/settings/record-permissions/hooks/useRecordPermissionPolicy';
import { RecordPermissionObjectCard } from '@/settings/record-permissions/components/RecordPermissionObjectCard';
import { RecordPermissionPolicyStatus } from '@/settings/record-permissions/components/RecordPermissionPolicyStatus';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  BillingEntitlementKey,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';

type SettingsRecordPermissionsProps = { roleId: string; isEditable: boolean };
export const SettingsRecordPermissions = ({
  roleId,
  isEditable,
}: SettingsRecordPermissionsProps) => {
  const {
    state,
    definition: draftDefinition,
    loading,
    updateDefinition,
  } = useRecordPermissionPolicy();
  const [showActive, setShowActive] = useState(false);
  const isViewingActive =
    showActive &&
    Boolean(state?.candidateRevisionId) &&
    Boolean(state?.activeDefinition);
  const definition = isViewingActive
    ? state?.activeDefinition
    : draftDefinition;
  const { activeNonSystemObjectMetadataItems } =
    useFilteredObjectMetadataItems();
  const settingsDraftRole = useAtomFamilyStateValue(
    settingsDraftRoleFamilyState,
    roleId,
  );
  const isRecordSharingEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_RECORD_LEVEL_SHARING_ENABLED,
  );
  const isRowLevelSecurityEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_ROW_LEVEL_SECURITY_ENABLED,
  );
  const currentWorkspace = useAtomStateValue(currentWorkspaceState);
  const canUseRowLevelSecurity =
    isRowLevelSecurityEnabled &&
    checkIfBillingEntitlementIsEnabledOnWorkspace(
      BillingEntitlementKey.RLS,
      currentWorkspace,
    );
  const [search, setSearch] = useState('');
  const disabled =
    isViewingActive ||
    !isEditable ||
    Boolean(state?.candidateRevisionId) ||
    !settingsDraftRole.universalIdentifier;
  return (
    <Section.Root>
      <Section.Header
        title={t`Objects`}
        description={t`Object and field permission settings. Access is private until a permission allows it.`}
      />
      <RecordPermissionPolicyStatus
        isViewingActive={isViewingActive}
        onToggleActive={() => setShowActive(!showActive)}
      />
      {loading && <span role="status">{t`Loading permissions…`}</span>}
      {definition && (
        <>
          <RecordPermissionDefaults
            roleUniversalIdentifier={
              settingsDraftRole.universalIdentifier ?? ''
            }
            definition={definition}
            disabled={disabled}
            isRecordSharingEnabled={isRecordSharingEnabled}
            onChange={updateDefinition}
          />
          <SettingsTextInput
            instanceId={`permission-object-search-${roleId}`}
            placeholder={t`Search objects`}
            value={search}
            onChange={setSearch}
          />
          {activeNonSystemObjectMetadataItems
            .filter((object) =>
              object.labelPlural.toLowerCase().includes(search.toLowerCase()),
            )
            .sort((first, second) =>
              first.labelPlural.localeCompare(second.labelPlural),
            )
            .map((object) => {
              const objectPolicy = resolveObjectRecordPermissionPolicy(
                definition,
                object.universalIdentifier,
              );
              return (
                <RecordPermissionObjectCard
                  key={object.id}
                  roleId={roleId}
                  roleUniversalIdentifier={
                    settingsDraftRole.universalIdentifier ?? ''
                  }
                  objectMetadataItem={object}
                  policy={objectPolicy}
                  capabilities={
                    state?.capabilitiesByObjectUniversalIdentifier[
                      object.universalIdentifier
                    ] ?? {}
                  }
                  disabled={disabled}
                  canUseRowLevelSecurity={canUseRowLevelSecurity}
                  isRecordSharingEnabled={isRecordSharingEnabled}
                  onResetDefaults={() =>
                    updateDefinition((current) => ({
                      ...current,
                      objects: current.objects.map((policy) =>
                        policy.objectUniversalIdentifier !==
                        object.universalIdentifier
                          ? policy
                          : {
                              ...policy,
                              rules: policy.rules.filter(
                                (rule) =>
                                  rule.roleUniversalIdentifier !==
                                    settingsDraftRole.universalIdentifier ||
                                  rule.condition !== null,
                              ),
                              defaultOverrideRoleUniversalIdentifiers:
                                policy.defaultOverrideRoleUniversalIdentifiers?.filter(
                                  (identifier) =>
                                    identifier !==
                                    settingsDraftRole.universalIdentifier,
                                ),
                            },
                      ),
                    }))
                  }
                  onChange={(updated) =>
                    updateDefinition((current) =>
                      updateRecordPermissionRoleOverride({
                        definition: current,
                        policy: updated,
                        roleUniversalIdentifier:
                          settingsDraftRole.universalIdentifier ?? '',
                      }),
                    )
                  }
                />
              );
            })}
          <RecordPermissionPolicyTransfer
            disabled={disabled}
            exportedDefinition={definition}
          />
        </>
      )}
    </Section.Root>
  );
};
