import { useLingui } from '@lingui/react/macro';
import { IconCheck, IconRefresh, IconX } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import {
  StyledNavigationButtons,
  StyledSummaryContainer,
  StyledSummaryDetails,
  StyledSummaryFileName,
  StyledSummaryIcon,
  StyledSummaryItem,
  StyledSummaryList,
  StyledSummaryMessage,
} from '../SettingsImport.styles';
import { ImportSummary } from '../types/ImportSummary';
import { Heading } from './Heading';

export const ImportSummaryStep = ({
  summaries,
  onRestart,
}: {
  summaries: ImportSummary[];
  onRestart: () => void;
}) => {
  const { t } = useLingui();
  const successCount = summaries.filter((s) => s.status === 'success').length;
  const failedCount = summaries.filter((s) => s.status === 'failed').length;
  const sumariesLength = summaries.length;
  return (
    <StyledSummaryContainer>
      <Heading
        title={t({
          id: 'importSummary.title',
          message: 'Import Complete',
        })}
        description={t`Processed ${sumariesLength} file(s). Success: ${successCount}, Failed: ${failedCount}.`}
      />
      <StyledSummaryList>
        {summaries.map((summary, index) => (
          <StyledSummaryItem key={index} status={summary.status}>
            <StyledSummaryIcon status={summary.status}>
              {summary.status === 'success' ? (
                <IconCheck size={20} />
              ) : (
                <IconX size={20} />
              )}
            </StyledSummaryIcon>
            <StyledSummaryDetails>
              <StyledSummaryFileName>{summary.fileName}</StyledSummaryFileName>
              <StyledSummaryMessage>{summary.message}</StyledSummaryMessage>
            </StyledSummaryDetails>
          </StyledSummaryItem>
        ))}
      </StyledSummaryList>
      <StyledNavigationButtons>
        <div />
        <Button
          Icon={IconRefresh}
          title={t({
            id: 'importSummary.restart',
            message: 'Import More Files',
          })}
          accent="blue"
          onClick={onRestart}
        />
      </StyledNavigationButtons>
    </StyledSummaryContainer>
  );
};
