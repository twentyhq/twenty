import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import {
  IconDeviceFloppy,
  IconPlus,
  IconRefreshAlert,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { ConfigSource } from '~/generated/graphql';
import { ConfigVariableWithTypes } from '../types/ConfigVariableWithTypes';

type ConfigVariableActionButtonsProps = {
  variable: ConfigVariableWithTypes;
  isValueValid: boolean;
  isSubmitting: boolean;
  onSave: () => void;
  onReset: () => void;
};

export const ConfigVariableActionButtons = ({
  variable,
  isValueValid,
  isSubmitting,
  onSave,
  onReset,
}: ConfigVariableActionButtonsProps) => {
  const { t } = useLingui();
  const isConfigVariablesInDbEnabled = useRecoilValue(
    isConfigVariablesInDbEnabledState,
  );
  const isFromDatabase = variable.source === ConfigSource.DATABASE;

  return (
    <>
      {isConfigVariablesInDbEnabled &&
        variable.source === ConfigSource.DATABASE && (
          <Button
            title={t`Reset to Default`}
            variant="secondary"
            size="small"
            accent="danger"
            disabled={isSubmitting}
            onClick={onReset}
            type="submit"
            Icon={IconRefreshAlert}
          />
        )}
      {isConfigVariablesInDbEnabled && !variable.isEnvOnly && (
        <Button
          title={isFromDatabase ? t`Save` : t`Save in Database`}
          variant="primary"
          size="small"
          accent="blue"
          disabled={isSubmitting || !isValueValid}
          onClick={onSave}
          type="submit"
          Icon={isFromDatabase ? IconDeviceFloppy : IconPlus}
        />
      )}
    </>
  );
};
