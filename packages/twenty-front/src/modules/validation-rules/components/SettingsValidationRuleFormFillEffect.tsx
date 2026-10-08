import { useEffect } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { validationRuleFormFillState } from '@/validation-rules/states/validationRuleFormFillState';
import { type ValidationRuleFormFill } from '@/validation-rules/types/ValidationRuleFormFill';

type SettingsValidationRuleFormFillEffectProps = {
  onFill: (validationRuleFormFill: ValidationRuleFormFill) => void;
};

export const SettingsValidationRuleFormFillEffect = ({
  onFill,
}: SettingsValidationRuleFormFillEffectProps) => {
  const validationRuleFormFill = useAtomStateValue(validationRuleFormFillState);
  const setValidationRuleFormFill = useSetAtomState(
    validationRuleFormFillState,
  );

  useEffect(() => {
    if (!isDefined(validationRuleFormFill)) {
      return;
    }

    onFill(validationRuleFormFill);
    setValidationRuleFormFill(null);
  }, [validationRuleFormFill, onFill, setValidationRuleFormFill]);

  return null;
};
