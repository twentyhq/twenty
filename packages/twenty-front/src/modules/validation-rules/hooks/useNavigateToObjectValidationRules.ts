import { SettingsPath } from 'twenty-shared/types';

import { OBJECT_SETTINGS_TAB_HASH } from '@/validation-rules/constants/ObjectSettingsTabHash';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const useNavigateToObjectValidationRules = ({
  objectNamePlural,
}: {
  objectNamePlural: string;
}) => {
  const navigate = useNavigateSettings();

  return () =>
    navigate(
      SettingsPath.ObjectDetail,
      { objectNamePlural },
      undefined,
      undefined,
      OBJECT_SETTINGS_TAB_HASH,
    );
};
