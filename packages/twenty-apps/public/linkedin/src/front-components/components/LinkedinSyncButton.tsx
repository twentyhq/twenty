import styled from '@emotion/styled';
import { t } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { IconRefresh } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { formatLinkedinSyncProgressLabel } from 'src/front-components/utils/format-linkedin-sync-progress-label.util';
import { getLinkedinHistoryImportErrorReason } from 'src/front-components/utils/get-linkedin-history-import-error-reason.util';
import { getLinkedinSyncProgress } from 'src/front-components/utils/get-linkedin-sync-progress.util';
import { type LinkedinHistoryImportState } from 'src/types/linkedin-history-import-state.type';

const StyledRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${() => themeCssVariables.spacing[4]};
  justify-content: flex-end;
`;

const StyledError = styled.p`
  color: ${() => themeCssVariables.color.red};
  flex: 1;
  font-size: ${() => themeCssVariables.font.size.sm};
  margin: 0;
  min-width: 0;
`;

const StyledErrorTitle = styled.span`
  font-weight: ${() => themeCssVariables.font.weight.medium};
`;

type LinkedinSyncButtonProps = {
  historyImport: LinkedinHistoryImportState | null;
  isStarting: boolean;
  onSync: () => void;
};

export const LinkedinSyncButton = ({
  historyImport,
  isStarting,
  onSync,
}: LinkedinSyncButtonProps) => {
  const isRunning = historyImport?.status === 'IMPORTING';
  const hasFailed = historyImport?.status === 'FAILED';
  const progress = isRunning
    ? getLinkedinSyncProgress(historyImport)
    : undefined;

  const label = isRunning
    ? isDefined(progress)
      ? t('Syncing {progress}', {
          progress: formatLinkedinSyncProgressLabel(progress),
        })
      : t('Syncing…')
    : hasFailed
      ? t('Retry')
      : t('Sync now');

  return (
    <StyledRow>
      {hasFailed && (
        <StyledError role="alert">
          <StyledErrorTitle>
            {t('The import stopped before finishing.')}
          </StyledErrorTitle>{' '}
          {getLinkedinHistoryImportErrorReason(historyImport.error)}
        </StyledError>
      )}
      <Button
        startIcon={<IconRefresh />}
        variant="solid"
        color="accent"
        size="md"
        onClick={onSync}
        loading={isRunning}
        loadingPosition="end"
      >
        {label}
      </Button>
    </StyledRow>
  );
};
