/* eslint-disable @nx/workspace-no-navigate-prefer-link */
import { IconSettings } from 'twenty-ui';

import { RecordTableEmptyStateDisplay } from '@/object-record/record-table/empty-state/components/RecordTableEmptyStateDisplay';
import { useNavigate } from 'react-router-dom';

export const RecordTableEmptyStateRemote = () => {
  const navigate = useNavigate();

  const handleButtonClick = () => {
    navigate('/settings/integrations');
  };

  return (
    <RecordTableEmptyStateDisplay
      buttonTitle={'Go to Settings'}
      subTitle={'If this is unexpected, please verify your settings.'}
      title={'No Data Available for Remote Table'}
      Icon={IconSettings}
      animatedPlaceholderType="noRecord"
      onClick={handleButtonClick}
    />
  );
};
