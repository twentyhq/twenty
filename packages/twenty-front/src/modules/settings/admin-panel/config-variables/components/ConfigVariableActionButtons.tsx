import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';

import { isConfigVariablesInDbEnabledState } from '@/client-config/states/isConfigVariablesInDbEnabledState';
import {
  IconDeviceFloppy,
  IconPencil,
  IconRefreshAlert,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { ConfigSource, type ConfigVariable } from '~/generated/graphql';

type ConfigVariableActionButtonsProps = {
  variable: ConfigVariable;
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
            Icon={IconRefreshAlert}
          />
        )}
      {isConfigVariablesInDbEnabled && !variable.isEnvOnly && (
        <Button
          title={isFromDatabase ? t`Save` : t`Edit`}
          variant="primary"
          size="small"
          accent="blue"
          disabled={isSubmitting || !isValueValid}
          onClick={onSave}
          type="submit"
          Icon={isFromDatabase ? IconDeviceFloppy : IconPencil}
        />
      )}
    </>
  );
};
