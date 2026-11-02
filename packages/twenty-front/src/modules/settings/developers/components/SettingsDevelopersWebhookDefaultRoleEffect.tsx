import { type WebhookFormValues } from '@/settings/developers/validation-schemas/webhookFormSchema';
import { isNonEmptyString } from '@sniptt/guards';
import { useEffect } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';
import { isDefined } from 'twenty-shared/utils';

type SettingsDevelopersWebhookDefaultRoleEffectProps = {
  defaultRoleId: string | undefined;
};

// The role selector displays the first role when none is set, so the form value must match it
export const SettingsDevelopersWebhookDefaultRoleEffect = ({
  defaultRoleId,
}: SettingsDevelopersWebhookDefaultRoleEffectProps) => {
  const { control, setValue } = useFormContext<WebhookFormValues>();
  const roleId = useWatch({ control, name: 'roleId' });

  useEffect(() => {
    if (isDefined(defaultRoleId) && !isNonEmptyString(roleId)) {
      setValue('roleId', defaultRoleId, { shouldValidate: true });
    }
  }, [defaultRoleId, roleId, setValue]);

  return null;
};
