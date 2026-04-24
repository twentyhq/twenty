import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { type HttpRouteTriggerSettings } from 'twenty-shared/application';
import { isDefined } from 'twenty-shared/utils';
import {
  H2Title,
  IconCopy,
  IconHttpGet,
  IconHttpPost,
  type IconComponent,
} from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { Section } from 'twenty-ui/layout';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const HTTP_METHOD_OPTIONS: Array<{
  label: string;
  value: 'GET' | 'POST';
  Icon: IconComponent;
}> = [
  { label: 'GET', value: 'GET', Icon: IconHttpGet },
  { label: 'POST', value: 'POST', Icon: IconHttpPost },
];

const DEFAULT_HTTP_SETTINGS: HttpRouteTriggerSettings = {
  path: '',
  httpMethod: 'POST',
  isAuthRequired: false,
};

const StyledHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  justify-content: space-between;
  margin-bottom: ${themeCssVariables.spacing[4]};
`;

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
`;

const StyledAuthRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledAuthLabel = styled.span`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
`;

type SettingsLogicFunctionHttpTriggerSectionProps = {
  value: HttpRouteTriggerSettings | null;
  onChange: (value: HttpRouteTriggerSettings | null) => void;
  readonly: boolean;
};

export const SettingsLogicFunctionHttpTriggerSection = ({
  value,
  onChange,
  readonly,
}: SettingsLogicFunctionHttpTriggerSectionProps) => {
  const { t } = useLingui();
  const { theme } = useContext(ThemeContext);
  const { copyToClipboard } = useCopyToClipboard();

  const isEnabled = isDefined(value);

  if (readonly && !isEnabled) {
    return null;
  }

  const handleToggle = (checked: boolean) => {
    onChange(checked ? DEFAULT_HTTP_SETTINGS : null);
  };

  const updateField = <TKey extends keyof HttpRouteTriggerSettings>(
    key: TKey,
    fieldValue: HttpRouteTriggerSettings[TKey],
  ) => {
    if (!isDefined(value)) {
      return;
    }
    onChange({ ...value, [key]: fieldValue });
  };

  const fullUrl = isEnabled
    ? `${REACT_APP_SERVER_BASE_URL}/s${value.path}`
    : '';

  return (
    <Section>
      <StyledHeader>
        <H2Title
          title={t`HTTP`}
          description={t`Triggers the function with an HTTP request`}
        />
        {!readonly && (
          <Toggle
            value={isEnabled}
            onChange={handleToggle}
            toggleSize="small"
            color={theme.color.blue}
          />
        )}
      </StyledHeader>
      {isEnabled && (
        <StyledFields>
          <Select
            dropdownId="logic-function-http-trigger-method"
            label={t`Method`}
            fullWidth
            disabled={readonly}
            value={value.httpMethod as 'GET' | 'POST'}
            options={HTTP_METHOD_OPTIONS}
            onChange={(newMethod) => updateField('httpMethod', newMethod)}
            dropdownOffset={{ y: 4 }}
            dropdownWidth={GenericDropdownContentWidth.ExtraLarge}
          />
          <SettingsTextInput
            instanceId="logic-function-http-trigger-path"
            label={t`Path`}
            placeholder="/my-route"
            value={value.path}
            onChange={(newPath: string) => updateField('path', newPath)}
            readOnly={readonly}
            fullWidth
          />
          <SettingsTextInput
            instanceId="logic-function-http-trigger-url"
            label={t`Live URL`}
            value={fullUrl}
            onChange={() => {}}
            readOnly
            fullWidth
            RightIcon={IconCopy}
            onRightIconClick={() =>
              copyToClipboard(fullUrl, t`URL copied to clipboard`)
            }
          />
          <StyledAuthRow>
            <Toggle
              value={value.isAuthRequired}
              onChange={(checked) => updateField('isAuthRequired', checked)}
              disabled={readonly}
              toggleSize="small"
              color={theme.color.blue}
            />
            <StyledAuthLabel>{t`Require authentication`}</StyledAuthLabel>
          </StyledAuthRow>
        </StyledFields>
      )}
    </Section>
  );
};
