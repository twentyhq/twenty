import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';

import { isDefined } from 'twenty-shared/utils';
import { IconPlus, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsRolePermissionsObjectLevelRecordVisibilityPolicyConditionRow } from '@/settings/roles/role-permissions/object-level-permissions/record-visibility-policy/components/SettingsRolePermissionsObjectLevelRecordVisibilityPolicyConditionRow';
import { Select } from '@/ui/input/components/Select';
import {
  convertFilterToRecordVisibilityPolicyDraft,
  convertRecordVisibilityPolicyDraftToFilter,
  getRecordVisibilityPolicyEligibleRelationFields,
  getRecordVisibilityPolicyEligibleStaticFields,
} from '@/settings/roles/role-permissions/object-level-permissions/record-visibility-policy/utils/recordVisibilityPolicyConversion';
import { type RecordVisibilityPolicyStaticCondition } from '@/settings/roles/role-permissions/object-level-permissions/record-visibility-policy/types/RecordVisibilityPolicyCondition';
import { settingsDraftRoleFamilyState } from '@/settings/roles/states/settingsDraftRoleFamilyState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledCurrentMemberSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  margin-top: ${themeCssVariables.spacing[2]};
`;

const StyledCurrentMemberLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

// Select and Button/IconButton have different intrinsic heights when the
// Select is given its own internal `label` prop (label text stacked above
// the control) — putting the label outside instead, as a sibling above the
// row, keeps both controls the same height so `align-items: center` actually
// centers them relative to each other.
const StyledCurrentMemberRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsRolePermissionsObjectLevelRecordVisibilityPolicyContentProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  roleId: string;
};

export const SettingsRolePermissionsObjectLevelRecordVisibilityPolicyContent =
  ({
    objectMetadataItem,
    roleId,
  }: SettingsRolePermissionsObjectLevelRecordVisibilityPolicyContentProps) => {
    const settingsDraftRole = useAtomFamilyStateValue(
      settingsDraftRoleFamilyState,
      roleId,
    );
    const setSettingsDraftRole = useSetAtomFamilyState(
      settingsDraftRoleFamilyState,
      roleId,
    );

    const existingPolicy = settingsDraftRole.recordVisibilityPolicies?.find(
      (policy) => policy.objectMetadataId === objectMetadataItem.id,
    );

    // settingsDraftRoleFamilyState defaults to an empty stub (id: '') until
    // the GetRoles query resolves — initializing from that stub before real
    // data arrives would permanently lock in an empty condition list, since
    // the init effect below only ever runs once.
    const isRoleLoaded = settingsDraftRole.id === roleId;

    const [hasInitialized, setHasInitialized] = useState(false);
    const [staticConditions, setStaticConditions] = useState<
      RecordVisibilityPolicyStaticCondition[]
    >([]);
    const [currentMemberFieldName, setCurrentMemberFieldName] = useState<
      string | null
    >(null);
    // Reuses the persisted policy's own id if there is one, otherwise mints
    // one client-side — computed once on mount (not regenerated on every
    // keystroke) so the draft policy's id stays stable across edits.
    const [policyId] = useState(() => existingPolicy?.id ?? uuidv4());

    useEffect(() => {
      if (hasInitialized || !isRoleLoaded) {
        return;
      }

      const draft = convertFilterToRecordVisibilityPolicyDraft({
        filter: existingPolicy?.filter,
        currentMemberFieldName: existingPolicy?.currentMemberFieldName,
        fields: objectMetadataItem.fields,
      });

      setStaticConditions(draft.staticConditions);
      setCurrentMemberFieldName(draft.currentMemberFieldName);
      setHasInitialized(true);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [hasInitialized, isRoleLoaded]);

    useEffect(() => {
      if (!hasInitialized) {
        return;
      }

      const { filter, currentMemberFieldName: resolvedCurrentMemberField } =
        convertRecordVisibilityPolicyDraftToFilter({
          staticConditions,
          currentMemberFieldName,
        });

      const hasAnyCondition =
        staticConditions.length > 0 || isDefined(currentMemberFieldName);

      setSettingsDraftRole((previousRole) => {
        const otherObjectPolicies = (
          previousRole.recordVisibilityPolicies ?? []
        ).filter(
          (policy) => policy.objectMetadataId !== objectMetadataItem.id,
        );

        if (!hasAnyCondition) {
          return {
            ...previousRole,
            recordVisibilityPolicies: otherObjectPolicies,
          };
        }

        return {
          ...previousRole,
          recordVisibilityPolicies: [
            ...otherObjectPolicies,
            {
              __typename: 'RecordVisibilityPolicy' as const,
              id: policyId,
              roleId,
              objectMetadataId: objectMetadataItem.id,
              filter,
              currentMemberFieldName: resolvedCurrentMemberField,
            },
          ],
        };
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [staticConditions, currentMemberFieldName, hasInitialized]);

    const staticFields = useMemo(
      () =>
        getRecordVisibilityPolicyEligibleStaticFields(
          objectMetadataItem.fields,
        ),
      [objectMetadataItem.fields],
    );

    const relationFields = useMemo(
      () =>
        getRecordVisibilityPolicyEligibleRelationFields(
          objectMetadataItem.fields,
        ),
      [objectMetadataItem.fields],
    );

    const handleAddCondition = () => {
      const firstField = staticFields[0];

      if (!isDefined(firstField)) {
        return;
      }

      setStaticConditions((previous) => [
        ...previous,
        {
          id: uuidv4(),
          fieldMetadataId: firstField.id,
          fieldName: firstField.name,
          fieldType: firstField.type,
          value: '',
        },
      ]);
    };

    const handleRemoveCondition = (conditionId: string) => {
      setStaticConditions((previous) =>
        previous.filter((condition) => condition.id !== conditionId),
      );
    };

    const handleChangeCondition = (
      conditionId: string,
      updated: Partial<RecordVisibilityPolicyStaticCondition>,
    ) => {
      setStaticConditions((previous) =>
        previous.map((condition) =>
          condition.id === conditionId
            ? { ...condition, ...updated }
            : condition,
        ),
      );
    };

    const currentMemberFieldOptions = [
      { label: t`No restriction`, value: '' },
      ...relationFields.map((field) => ({
        label: field.label,
        value: field.name,
      })),
    ];

    return (
      <StyledContainer>
        {staticConditions.map((condition) => (
          <SettingsRolePermissionsObjectLevelRecordVisibilityPolicyConditionRow
            key={condition.id}
            condition={condition}
            fields={staticFields}
            onChange={(updated) =>
              handleChangeCondition(condition.id, updated)
            }
            onRemove={() => handleRemoveCondition(condition.id)}
          />
        ))}
        <Button
          Icon={IconPlus}
          title={t`Add condition`}
          size="small"
          variant="secondary"
          accent="default"
          onClick={handleAddCondition}
        />
        <StyledCurrentMemberSection>
          <StyledCurrentMemberLabel>
            {t`Only show records that belong to the person viewing them`}
          </StyledCurrentMemberLabel>
          <StyledCurrentMemberRow>
            <Select
              dropdownId={`record-visibility-policy-current-member-${roleId}-${objectMetadataItem.id}`}
              options={currentMemberFieldOptions}
              value={currentMemberFieldName ?? ''}
              onChange={(value) =>
                setCurrentMemberFieldName(value === '' ? null : value)
              }
              fullWidth
            />
            {isDefined(currentMemberFieldName) && (
              <Button
                Icon={IconTrash}
                title={t`Clear`}
                size="small"
                variant="secondary"
                accent="danger"
                onClick={() => setCurrentMemberFieldName(null)}
              />
            )}
          </StyledCurrentMemberRow>
        </StyledCurrentMemberSection>
      </StyledContainer>
    );
  };
