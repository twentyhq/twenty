import { useState } from 'react';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { v4 } from 'uuid';
import {
  type ObjectRecordPermissionPolicy,
  type RecordCapabilities,
  type RecordPermissionAction,
  type RecordPermissionRule,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { themeCssVariables } from 'twenty-ui/theme';
import { Button, Checkbox } from 'twenty-ui/primitives/input';
import {
  IconChevronDown,
  IconChevronUp,
  IconEye,
  IconPencil,
  IconTrash,
  IconTrashX,
  IconInbox,
  IconShare,
  IconPlus,
  IconLock,
} from 'twenty-ui/icon';
import { ObjectMetadataIcon } from '@/object-metadata/components/ObjectMetadataIcon';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { RecordPermissionFieldPicker } from '@/settings/record-permissions/components/RecordPermissionFieldPicker';
import { RecordPermissionConditionEditor } from '@/settings/record-permissions/components/RecordPermissionConditionEditor';

const StyledCard = styled.div`
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
`;
const StyledHeader = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: ${themeCssVariables.font.color.primary};
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[3]} ${themeCssVariables.spacing[2]};
  text-align: left;
  width: 100%;
  &:hover {
    background: ${themeCssVariables.background.transparent.lighter};
  }
`;
const StyledSummary = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  margin-left: auto;
`;
const StyledBody = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-bottom: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
`;
const StyledLabel = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[2]} 0;
`;
const StyledAction = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: 20px minmax(100px, 1fr) minmax(120px, 180px) 20px;
  min-height: 34px;
`;
const StyledRule = styled.div`
  border-top: 1px solid ${themeCssVariables.border.color.light};
  margin-top: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;
const StyledRuleActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[3]};
  padding-top: ${themeCssVariables.spacing[2]};
`;
const StyledPermissionLabel = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[1]};
`;

type RecordPermissionObjectCardProps = {
  roleId: string;
  roleUniversalIdentifier: string;
  objectMetadataItem: EnrichedObjectMetadataItem;
  policy: ObjectRecordPermissionPolicy;
  capabilities: RecordCapabilities;
  disabled: boolean;
  canUseRowLevelSecurity: boolean;
  isRecordSharingEnabled: boolean;
  onResetDefaults: () => void;
  onChange: (policy: ObjectRecordPermissionPolicy) => void;
};

export const RecordPermissionObjectCard = ({
  roleId,
  roleUniversalIdentifier,
  objectMetadataItem,
  policy,
  capabilities,
  disabled,
  canUseRowLevelSecurity,
  isRecordSharingEnabled,
  onResetDefaults,
  onChange,
}: RecordPermissionObjectCardProps) => {
  const [expanded, setExpanded] = useState(false);
  const rules = policy.rules.filter(
    (rule) => rule.roleUniversalIdentifier === roleUniversalIdentifier,
  );
  const allRecordsRules = rules.filter((rule) => rule.condition === null);
  const allActions = new Set(allRecordsRules.flatMap((rule) => rule.actions));
  const conditionalRules = rules.filter((rule) => rule.condition !== null);
  const actions: {
    action: RecordPermissionAction;
    label: string;
    Icon: typeof IconEye;
  }[] = [
    { action: 'read', label: t`See`, Icon: IconEye },
    { action: 'update', label: t`Edit`, Icon: IconPencil },
    { action: 'softDelete', label: t`Delete`, Icon: IconTrash },
    { action: 'destroy', label: t`Destroy`, Icon: IconTrashX },
    { action: 'receive', label: t`Receive`, Icon: IconInbox },
    { action: 'share', label: t`Share`, Icon: IconShare },
  ];
  const replaceRule = (rule: RecordPermissionRule) =>
    onChange({
      ...policy,
      rules: policy.rules.map((current) =>
        current.universalIdentifier === rule.universalIdentifier
          ? rule
          : current,
      ),
    });
  const setAllRecords = (
    actions: RecordPermissionAction[],
    shareAccessLevel = allRecordsRules[0]?.shareAccessLevel ??
      RecordShareAccessLevel.FULL,
  ) => {
    const others = policy.rules.filter(
      (rule) =>
        rule.roleUniversalIdentifier !== roleUniversalIdentifier ||
        rule.condition !== null,
    );
    onChange({
      ...policy,
      rules: [
        ...others,
        ...(actions.length === 0
          ? []
          : [
              {
                universalIdentifier:
                  allRecordsRules[0]?.universalIdentifier ?? v4(),
                label: t`All records`,
                roleUniversalIdentifier,
                actions,
                condition: null,
                shareAccessLevel,
              },
            ]),
      ],
    });
  };
  const addRule = () =>
    onChange({
      ...policy,
      rules: [
        ...policy.rules,
        {
          universalIdentifier: v4(),
          label: t`Some records`,
          roleUniversalIdentifier,
          actions: ['read'],
          condition: { kind: 'all', conditions: [] },
          shareAccessLevel: RecordShareAccessLevel.READ,
        },
      ],
    });
  const summary =
    conditionalRules.length > 0 || policy.inheritancePaths.length > 0
      ? t`Advanced`
      : allActions.has('update')
        ? t`See, edit`
        : allActions.has('read')
          ? t`See`
          : t`No access`;
  const shareLevelOptions = [
    { value: RecordShareAccessLevel.READ, label: t`Can view` },
    { value: RecordShareAccessLevel.READ_WRITE, label: t`Can edit` },
    { value: RecordShareAccessLevel.FULL, label: t`Full access` },
  ];

  return (
    <StyledCard>
      <StyledHeader
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <ObjectMetadataIcon objectMetadataItem={objectMetadataItem} />
        <span>{objectMetadataItem.labelPlural}</span>
        <StyledSummary>{summary}</StyledSummary>
        {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </StyledHeader>
      {expanded && (
        <StyledBody>
          {Object.values(capabilities).some((value) => value === false) && (
            <StyledLabel>
              <IconLock size={14} />{' '}
              {t`Some actions are managed by the application and cannot be allowed by a role.`}
            </StyledLabel>
          )}
          <StyledRuleActions>
            <StyledLabel>{t`All records`}</StyledLabel>
            <Button
              size="sm"
              variant="ghost"
              disabled={disabled}
              onClick={onResetDefaults}
            >{t`Use defaults`}</Button>
          </StyledRuleActions>
          {actions.map(({ action, label, Icon }) => (
            <StyledAction key={action}>
              <Icon size={16} />
              <span>{label}</span>
              {action === 'read' || action === 'update' ? (
                <RecordPermissionFieldPicker
                  roleId={roleId}
                  objectMetadataItem={objectMetadataItem}
                  action={action}
                  disabled={disabled || capabilities[action] === false}
                />
              ) : action === 'share' ? (
                <Select
                  dropdownId={`share-level-${roleId}-${objectMetadataItem.id}`}
                  options={shareLevelOptions}
                  value={
                    allRecordsRules[0]?.shareAccessLevel ??
                    RecordShareAccessLevel.FULL
                  }
                  disabled={
                    disabled ||
                    capabilities.share === false ||
                    !isRecordSharingEnabled
                  }
                  onChange={(level) => setAllRecords([...allActions], level)}
                />
              ) : (
                <span />
              )}
              <Checkbox
                aria-label={`${label} ${objectMetadataItem.labelPlural}`}
                checked={
                  allActions.has(action) && capabilities[action] !== false
                }
                disabled={
                  disabled ||
                  capabilities[action] === false ||
                  ((action === 'share' || action === 'receive') &&
                    !isRecordSharingEnabled)
                }
                onCheckedChange={(checked) =>
                  setAllRecords(
                    checked === true
                      ? [...allActions, action]
                      : [...allActions].filter((current) => current !== action),
                  )
                }
              />
            </StyledAction>
          ))}
          <StyledLabel>{t`Some records`}</StyledLabel>
          {conditionalRules.map((rule) => (
            <StyledRule key={rule.universalIdentifier}>
              {rule.condition && (
                <fieldset
                  disabled={disabled || !canUseRowLevelSecurity}
                  style={{ border: 0, margin: 0, padding: 0 }}
                >
                  <RecordPermissionConditionEditor
                    ruleId={rule.universalIdentifier}
                    objectMetadataItem={objectMetadataItem}
                    condition={rule.condition}
                    onChange={(condition) =>
                      replaceRule({ ...rule, condition })
                    }
                  />
                </fieldset>
              )}
              <StyledRuleActions>
                {actions.map(({ action, label }) => (
                  <StyledPermissionLabel
                    key={action}
                    title={
                      rule.actions.length === 1 && rule.actions.includes(action)
                        ? t`A rule must allow at least one action. Remove the rule to stop granting access.`
                        : undefined
                    }
                  >
                    <Checkbox
                      checked={
                        rule.actions.includes(action) &&
                        capabilities[action] !== false
                      }
                      disabled={
                        disabled ||
                        !canUseRowLevelSecurity ||
                        (rule.actions.length === 1 &&
                          rule.actions.includes(action)) ||
                        capabilities[action] === false ||
                        ((action === 'share' || action === 'receive') &&
                          !isRecordSharingEnabled)
                      }
                      onCheckedChange={(checked) =>
                        replaceRule({
                          ...rule,
                          actions:
                            checked === true
                              ? [...rule.actions, action]
                              : rule.actions.filter(
                                  (current) => current !== action,
                                ),
                        })
                      }
                    />
                    {label}
                  </StyledPermissionLabel>
                ))}
                {rule.actions.includes('share') && (
                  <Select
                    dropdownId={`share-level-${rule.universalIdentifier}`}
                    options={shareLevelOptions}
                    value={rule.shareAccessLevel ?? RecordShareAccessLevel.FULL}
                    disabled={
                      disabled ||
                      !canUseRowLevelSecurity ||
                      capabilities.share === false ||
                      !isRecordSharingEnabled
                    }
                    onChange={(shareAccessLevel) =>
                      replaceRule({ ...rule, shareAccessLevel })
                    }
                  />
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  aria-label={t`Remove rule`}
                  disabled={disabled}
                  startIcon={<IconTrash size={14} />}
                  onClick={() =>
                    onChange({
                      ...policy,
                      rules: policy.rules.filter(
                        (current) =>
                          current.universalIdentifier !==
                          rule.universalIdentifier,
                      ),
                    })
                  }
                />
              </StyledRuleActions>
            </StyledRule>
          ))}
          <Button
            size="sm"
            variant="ghost"
            disabled={disabled || !canUseRowLevelSecurity}
            startIcon={<IconPlus size={14} />}
            onClick={addRule}
          >{t`New rule`}</Button>
          {!canUseRowLevelSecurity && (
            <StyledLabel>{t`Conditional permissions require enterprise row-level security.`}</StyledLabel>
          )}
          {policy.inheritancePaths.length > 0 && (
            <StyledLabel>{t`This object also inherits access through its related-record paths.`}</StyledLabel>
          )}
        </StyledBody>
      )}
    </StyledCard>
  );
};
