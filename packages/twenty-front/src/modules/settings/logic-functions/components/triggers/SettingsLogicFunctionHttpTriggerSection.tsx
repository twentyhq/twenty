import { SettingsLogicFunctionTriggerPayloadFormat } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerPayloadFormat';
import { SettingsLogicFunctionTriggerSection } from '@/settings/logic-functions/components/triggers/SettingsLogicFunctionTriggerSection';
import { buildHttpPayload } from '@/settings/logic-functions/utils/getTriggerSamplePayload';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { type HttpRouteTriggerSettings } from 'twenty-shared/application';
import { HTTPMethod } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import {
  IconCopy,
  IconHttpDelete,
  IconHttpGet,
  IconHttpPatch,
  IconHttpPost,
  IconHttpPut,
  type IconComponent,
} from 'twenty-ui/display';
import { Toggle } from 'twenty-ui/input';
import { ThemeContext, themeCssVariables } from 'twenty-ui/theme-constants';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useCopyToClipboard } from '~/hooks/useCopyToClipboard';

const HTTP_METHOD_OPTIONS: Array<{
  label: string;
  value: HTTPMethod;
  Icon: IconComponent;
}> = [
  { label: 'GET', value: HTTPMethod.GET, Icon: IconHttpGet },
  { label: 'POST', value: HTTPMethod.POST, Icon: IconHttpPost },
  { label: 'PUT', value: HTTPMethod.PUT, Icon: IconHttpPut },
  { label: 'PATCH', value: HTTPMethod.PATCH, Icon: IconHttpPatch },
  { label: 'DELETE', value: HTTPMethod.DELETE, Icon: IconHttpDelete },
];

const DEFAULT_HTTP_SETTINGS: HttpRouteTriggerSettings = {
  path: '',
  httpMethod: HTTPMethod.POST,
  isAuthRequired: false,
};

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

  const updateField = <TKey extends keyof HttpRouteTriggerSettings>(
    key: TKey,
    fieldValue: HttpRouteTriggerSettings[TKey],
  ) => {
    if (!isDefined(value)) {
      return;
    }
    onChange({ ...value, [key]: fieldValue });
  };

  const fullUrl = isDefined(value)
    ? `${REACT_APP_SERVER_BASE_URL}/s${value.path}`
    : '';

  return (
    <SettingsLogicFunctionTriggerSection
      title={t`HTTP`}
      description={t`Triggers the function with an HTTP request`}
      enabled={isDefined(value)}
      onEnabledChange={(checked) =>
        onChange(checked ? DEFAULT_HTTP_SETTINGS : null)
      }
      readonly={readonly}
    >
      {isDefined(value) && (
        <StyledFields>
          <Select
            dropdownId="logic-function-http-trigger-method"
            label={t`Method`}
            fullWidth
            disabled={readonly}
            value={value.httpMethod as HTTPMethod}
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
          <SettingsLogicFunctionTriggerPayloadFormat
            payload={buildHttpPayload(value)}
            hint={
              value.httpMethod === HTTPMethod.GET
                ? t`Your handler receives this object. The body is empty because GET requests carry no payload.`
                : t`Your handler receives this object. The body holds the parsed JSON sent by the client.`
            }
          />
        </StyledFields>
      )}
    </SettingsLogicFunctionTriggerSection>
  );
};
