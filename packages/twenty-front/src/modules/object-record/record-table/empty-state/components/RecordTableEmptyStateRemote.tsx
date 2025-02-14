/* eslint-disable @nx/workspace-no-navigate-prefer-link */
import { IconSettings } from 'twenty-ui';

import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { SettingsPath } from '@/types/SettingsPath';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

export const RecordTableEmptyStateRemote = () => {
  const navigate = useNavigateSettings();

  const handleButtonClick = () => {
    navigate(SettingsPath.Integrations);
  };

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={'Go to Settings'}
      subTitle={'If this is unexpected, please verify your settings.'}
      title={'No Data Available for Remote Table'}
      ButtonIcon={IconSettings}
      animatedPlaceholderType="noRecord"
      onClick={handleButtonClick}
    />
  );
};
