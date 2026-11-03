import { type ConditionalDisplayRuleMode } from '@/conditional-display/types/ConditionalDisplayRuleMode';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { Link } from 'react-router-dom';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { IconEye, IconEyeX } from 'twenty-ui/icon';
import { themeCssVariables } from 'twenty-ui/theme';

const StyledHint = styled.span`
  color: ${themeCssVariables.font.color.light};
  display: block;
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};

  & > a {
    color: ${themeCssVariables.font.color.light};

    &:hover {
      color: ${themeCssVariables.font.color.tertiary};
    }
  }
`;

type ConditionalDisplayRuleModeSelectProps = {
  dropdownId: string;
  label: string;
  ruleMode: ConditionalDisplayRuleMode;
  onRuleModeChange: (ruleMode: ConditionalDisplayRuleMode) => void;
};

export const ConditionalDisplayRuleModeSelect = ({
  dropdownId,
  label,
  ruleMode,
  onRuleModeChange,
}: ConditionalDisplayRuleModeSelectProps) => {
  const { t } = useLingui();

  const rolesSettingsPath = getSettingsPath(SettingsPath.Roles);

  return (
    <div>
      <Select<ConditionalDisplayRuleMode>
        dropdownId={dropdownId}
        label={label}
        fullWidth
        value={ruleMode}
        onChange={onRuleModeChange}
        options={[
          { label: t`Everyone`, value: 'EVERYONE', Icon: IconEye },
          { label: t`Custom rule`, value: 'CUSTOM_RULE', Icon: IconEyeX },
        ]}
      />
      <StyledHint>
        <Trans>
          Hiding an item does not restrict access to data. Use{' '}
          <Link to={rolesSettingsPath}>role permissions</Link> for that.
        </Trans>
      </StyledHint>
    </div>
  );
};
