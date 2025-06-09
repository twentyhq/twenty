import { useLingui } from '@lingui/react/macro';
import { H2Title } from 'twenty-ui/display';
import type { ExportProgress } from '../types/exportProgress';
import {
  StyledModalContent,
  StyledModalOverlay,
  StyledProgressBar,
  StyledProgressFill,
  StyledProgressText,
} from './SettingsExport.styles';

type ExportProgressModalProps = {
  isVisible: boolean;
  progress: ExportProgress;
};

export const ExportProgressModal = ({
  isVisible,
  progress,
}: ExportProgressModalProps) => {
  const { t } = useLingui();

  if (!isVisible) return null;

  const percentage =
    progress.total > 0 ? (progress.current / progress.total) * 100 : 0;

  const currentObject = progress.currentObject;
  const progressTotal = progress.total;
  const progressCurrent = progress.current;

  return (
    <StyledModalOverlay>
      <StyledModalContent>
        <H2Title title={t`Exporting Objects...`} />
        <div>
          {progress.currentObject !== '' && (
            <p>{t`Currently exporting: ${currentObject}`}</p>
          )}
        </div>
        <StyledProgressBar>
          <StyledProgressFill percentage={percentage} />
        </StyledProgressBar>
        <StyledProgressText>
          {t`${progressCurrent} of ${progressTotal} objects completed`}
        </StyledProgressText>
      </StyledModalContent>
    </StyledModalOverlay>
  );
};
