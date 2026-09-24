import { useLingui } from '@lingui/react/macro';
import { isDefined } from 'twenty-shared/utils';
import { Tag } from 'twenty-ui/primitives/data-display';

import { SETTINGS_LOGS_LEVELS } from '@/log-console/constants/SettingsLogsLevels';

type SettingsLogsLevelCellProps = {
  level: string;
};

export const SettingsLogsLevelCell = ({
  level,
}: SettingsLogsLevelCellProps) => {
  const { t } = useLingui();

  const levelDefinition = SETTINGS_LOGS_LEVELS[level];

  if (!isDefined(levelDefinition)) {
    return null;
  }

  return (
    <Tag color={levelDefinition.color} variant={levelDefinition.variant}>
      {t(levelDefinition.label)}
    </Tag>
  );
};
