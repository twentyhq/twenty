import { useState } from 'react';
import { t } from '@lingui/core/macro';
import { styled } from '@linaria/react';
import { v4 } from 'uuid';
import {
  type RecordPermissionAction,
  type RecordPermissionPolicyDefinition,
  RecordShareAccessLevel,
} from 'twenty-shared/types';
import { Checkbox } from 'twenty-ui/primitives/input';
import { IconBox, IconChevronDown, IconChevronUp } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

import { Select } from '@/ui/input/components/Select';

const StyledCard = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  margin-bottom: ${themeCssVariables.spacing[4]};
`;
const StyledHeader = styled.button`
  align-items: center;
  background: transparent;
  border: 0;
  color: inherit;
  cursor: pointer;
  display: flex;
  font: inherit;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[3]};
  text-align: left;
  width: 100%;
`;
const StyledTitle = styled.div`
  flex: 1;
`;
const StyledDescription = styled.div`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;
const StyledAction = styled.label`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 36px;
  padding: 0 ${themeCssVariables.spacing[3]};
  span {
    flex: 1;
  }
`;

type RecordPermissionDefaultsProps = {
  roleUniversalIdentifier: string;
  definition: RecordPermissionPolicyDefinition;
  disabled: boolean;
  isRecordSharingEnabled: boolean;
  onChange: (
    update: (
      definition: RecordPermissionPolicyDefinition,
    ) => RecordPermissionPolicyDefinition,
  ) => void;
};

export const RecordPermissionDefaults = ({
  roleUniversalIdentifier,
  definition,
  disabled,
  isRecordSharingEnabled,
  onChange,
}: RecordPermissionDefaultsProps) => {
  const [expanded, setExpanded] = useState(false);
  const rule = definition.defaults?.find(
    (candidate) =>
      candidate.roleUniversalIdentifier === roleUniversalIdentifier,
  );
  const actions = rule?.actions ?? [];
  const update = (
    actions: RecordPermissionAction[],
    shareAccessLevel = rule?.shareAccessLevel ?? RecordShareAccessLevel.READ,
  ) =>
    onChange((current) => ({
      ...current,
      defaults: [
        ...(current.defaults ?? []).filter(
          (candidate) =>
            candidate.roleUniversalIdentifier !== roleUniversalIdentifier,
        ),
        ...(actions.length === 0
          ? []
          : [
              {
                universalIdentifier: rule?.universalIdentifier ?? v4(),
                roleUniversalIdentifier,
                label: t`All objects`,
                actions,
                condition: null,
                shareAccessLevel,
              },
            ]),
      ],
    }));
  const labels: { action: RecordPermissionAction; label: string }[] = [
    { action: 'read', label: t`See` },
    { action: 'update', label: t`Edit` },
    { action: 'softDelete', label: t`Delete` },
    { action: 'destroy', label: t`Destroy` },
    { action: 'receive', label: t`Receive` },
    { action: 'share', label: t`Share` },
  ];

  return (
    <StyledCard>
      <StyledHeader
        type="button"
        aria-expanded={expanded}
        onClick={() => setExpanded(!expanded)}
      >
        <IconBox size={20} />
        <StyledTitle>
          {t`All objects`}
          <StyledDescription>{t`Applies to all objects before overrides, including new objects.`}</StyledDescription>
        </StyledTitle>
        {expanded ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
      </StyledHeader>
      {expanded &&
        labels.map(({ action, label }) => (
          <StyledAction key={action}>
            <span>{label}</span>
            {action === 'share' && (
              <Select
                dropdownId={`default-share-level-${roleUniversalIdentifier}`}
                disabled={disabled || !isRecordSharingEnabled}
                value={rule?.shareAccessLevel ?? RecordShareAccessLevel.READ}
                onChange={(level) => update(actions, level)}
                options={[
                  { value: RecordShareAccessLevel.READ, label: t`Can view` },
                  {
                    value: RecordShareAccessLevel.READ_WRITE,
                    label: t`Can edit`,
                  },
                  { value: RecordShareAccessLevel.FULL, label: t`Full access` },
                ]}
              />
            )}
            <Checkbox
              aria-label={`${label} ${t`all objects`}`}
              disabled={
                disabled ||
                ((action === 'receive' || action === 'share') &&
                  !isRecordSharingEnabled)
              }
              checked={actions.includes(action)}
              onCheckedChange={(checked) =>
                update(
                  checked === true
                    ? [...actions, action]
                    : actions.filter((current) => current !== action),
                )
              }
            />
          </StyledAction>
        ))}
    </StyledCard>
  );
};
