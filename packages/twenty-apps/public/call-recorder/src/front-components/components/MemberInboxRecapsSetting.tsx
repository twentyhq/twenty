import { useState } from 'react';
import { useTranslate } from 'twenty-sdk/front-component';
import { Section } from 'twenty-ui/components/layout';
import { IconInbox } from 'twenty-ui/icon';
import { Card } from 'twenty-ui/primitives/surfaces';

import { SettingsOptionCardContentSwitch } from 'src/front-components/components/SettingsOptionCardContentSwitch';
import { useAutosaveApplicationVariable } from 'src/front-components/hooks/use-autosave-application-variable';
import { getApplicationVariableValue } from 'src/front-components/utils/get-application-variable-value.util';
import { CALL_RECORDER_MEMBER_INBOX_RECAPS_ENABLED_ENV_VAR_NAME } from 'src/logic-functions/constants/call-recorder-member-inbox-recaps-enabled-env-var-name';
import { DEFAULT_MEMBER_INBOX_RECAPS_ENABLED } from 'src/logic-functions/constants/default-member-inbox-recaps-enabled';
import { parseBooleanApplicationVariableValue } from 'src/logic-functions/utils/parse-boolean-application-variable-value.util';

export const MemberInboxRecapsSetting = () => {
  const { t } = useTranslate();
  const [isEnabled, setIsEnabled] = useState(() =>
    parseBooleanApplicationVariableValue({
      rawValue: getApplicationVariableValue(
        CALL_RECORDER_MEMBER_INBOX_RECAPS_ENABLED_ENV_VAR_NAME,
      ),
      defaultValue: DEFAULT_MEMBER_INBOX_RECAPS_ENABLED,
    }),
  );
  const { saveImmediately } = useAutosaveApplicationVariable({
    variableKey: CALL_RECORDER_MEMBER_INBOX_RECAPS_ENABLED_ENV_VAR_NAME,
    scope: 'USER',
    onSaveError: (value) => setIsEnabled(value !== 'true'),
  });

  const handleChange = (checked: boolean) => {
    setIsEnabled(checked);
    saveImmediately(checked ? 'true' : 'false');
  };

  return (
    <Section.Root>
      <Card.Root fullWidth>
        <SettingsOptionCardContentSwitch
          Icon={IconInbox}
          title={t('Recaps in my inbox')}
          description={t(
            'Get a recap in your inbox after each of your recorded calls.',
          )}
          checked={isEnabled}
          onChange={handleChange}
        />
      </Card.Root>
    </Section.Root>
  );
};
