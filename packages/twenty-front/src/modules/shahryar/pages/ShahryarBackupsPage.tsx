import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import {
  IconAlertTriangle,
  IconClock,
  IconDatabaseExport,
  IconDownload,
  IconRefresh,
  IconShield,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';
import { useShahryarBackupStatus } from '@/shahryar/hooks/useShahryarBackupStatus';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledBackupGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const StyledStatusLine = styled.div`
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledFailureLine = styled(StyledStatusLine)`
  border-color: ${SHAHRYAR_COLORS.red};
  color: ${SHAHRYAR_COLORS.red};
`;

const StyledBackupPanel = styled.section`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledBackupPanelWarning = styled(StyledBackupPanel)`
  border-color: ${SHAHRYAR_COLORS.red};
`;

const StyledPanelHeader = styled.div`
  align-items: center;
  color: ${SHAHRYAR_COLORS.navy};
  display: flex;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledPanelValue = styled.strong`
  color: ${SHAHRYAR_COLORS.blue};
  font-size: 20px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
  overflow-wrap: anywhere;
`;

const StyledPanelMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

const StyledHistoryHeader = styled.div`
  color: ${SHAHRYAR_COLORS.navy};
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledHistoryList = styled.div`
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
`;

const StyledHistoryItem = styled.div`
  align-items: flex-start;
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  display: grid;
  gap: ${themeCssVariables.spacing[2]};
  grid-template-columns: minmax(120px, 180px) 1fr minmax(120px, 160px);
  padding: ${themeCssVariables.spacing[3]};

  &:last-child {
    border-bottom: 0;
  }
`;

const StyledHistoryStatus = styled.strong`
  color: ${SHAHRYAR_COLORS.blue};
`;

const StyledHistoryFailure = styled.span`
  color: ${SHAHRYAR_COLORS.red};
  display: block;
  font-size: ${themeCssVariables.font.size.sm};
  margin-top: ${themeCssVariables.spacing[1]};
`;

const StyledManualExportAction = styled.div`
  display: flex;
`;

export const ShahryarBackupsPage = () => {
  const { backupStatus, errorMessage, isLoading, refresh } =
    useShahryarBackupStatus();
  const hasBackupStatus = backupStatus !== undefined;
  const isBackupFailure =
    backupStatus?.status === 'failed' || backupStatus?.status === 'warning';
  const BackupStatusPanel = isBackupFailure
    ? StyledBackupPanelWarning
    : StyledBackupPanel;

  return (
    <PageContainer dir="rtl">
      <PageHeader title="باک ئەپ" Icon={IconDatabaseExport}>
        <Button
          title="نوێکردنەوە"
          Icon={IconRefresh}
          size="small"
          variant="secondary"
          isLoading={isLoading}
          onClick={() => void refresh()}
        />
      </PageHeader>
      <PageBody>
        <StyledContent>
          {errorMessage !== undefined && (
            <StyledFailureLine>
              نەتوانرا دۆخی باک ئەپ لە سێرڤەرەوە وەربگیرێت.
            </StyledFailureLine>
          )}

          {!hasBackupStatus && (
            <StyledStatusLine>
              {isLoading
                ? 'دۆخی باک ئەپ بار دەکرێت...'
                : 'هیچ دۆخێکی باک ئەپ بەردەست نییە.'}
            </StyledStatusLine>
          )}

          {backupStatus !== undefined && (
            <>
              {backupStatus.failureReason !== undefined && (
                <StyledFailureLine>
                  <IconAlertTriangle size={16} /> {backupStatus.failureReason}
                </StyledFailureLine>
              )}

              <StyledBackupGrid>
                <BackupStatusPanel>
                  <StyledPanelHeader>
                    <IconShield size={18} />
                    <span>دۆخی باک ئەپ</span>
                  </StyledPanelHeader>
                  <StyledPanelValue>{backupStatus.label}</StyledPanelValue>
                  <StyledPanelMeta>
                    دوایین سەرکەوتوو: {backupStatus.lastSuccessfulBackupLabel}
                  </StyledPanelMeta>
                </BackupStatusPanel>
                <StyledBackupPanel>
                  <StyledPanelHeader>
                    <IconClock size={18} />
                    <span>کاتی داهاتوو</span>
                  </StyledPanelHeader>
                  <StyledPanelValue>
                    {backupStatus.nextScheduledBackupLabel}
                  </StyledPanelValue>
                  <StyledPanelMeta>
                    هەر {backupStatus.intervalHours} کاتژمێر -{' '}
                    {backupStatus.operationModeLabel}
                  </StyledPanelMeta>
                </StyledBackupPanel>
                <StyledBackupPanel>
                  <StyledPanelHeader>
                    <IconDatabaseExport size={18} />
                    <span>قەبارە و شوێن</span>
                  </StyledPanelHeader>
                  <StyledPanelValue>
                    {backupStatus.dataSizeLabel}
                  </StyledPanelValue>
                  <StyledPanelMeta>
                    {backupStatus.storageScopeLabel}
                  </StyledPanelMeta>
                </StyledBackupPanel>
                <StyledBackupPanel>
                  <StyledPanelHeader>
                    <IconDownload size={18} />
                    <span>دابەزاندنی دەستی</span>
                  </StyledPanelHeader>
                  <StyledPanelValue>
                    {backupStatus.manualExport.isAvailable
                      ? 'Available'
                      : 'Unavailable'}
                  </StyledPanelValue>
                  <StyledPanelMeta>
                    {backupStatus.manualExport.label}
                  </StyledPanelMeta>
                  {backupStatus.manualExport.isAvailable &&
                    backupStatus.manualExport.downloadUrl !== undefined && (
                      <StyledManualExportAction>
                        <Button
                          title="دابەزاندن"
                          Icon={IconDownload}
                          size="small"
                          variant="secondary"
                          onClick={() =>
                            window.open(
                              backupStatus.manualExport.downloadUrl,
                              '_blank',
                            )
                          }
                        />
                      </StyledManualExportAction>
                    )}
                </StyledBackupPanel>
              </StyledBackupGrid>

              <StyledHistoryHeader>مێژووی باک ئەپ</StyledHistoryHeader>
              {backupStatus.history.length === 0 ? (
                <StyledStatusLine>
                  هیچ باک ئەپێکی سەرکەوتوو لە مێژووی سێرڤەرەکەدا نەدۆزرایەوە.
                </StyledStatusLine>
              ) : (
                <StyledHistoryList>
                  {backupStatus.history.map((historyEntry) => (
                    <StyledHistoryItem key={historyEntry.id}>
                      <StyledHistoryStatus>
                        {historyEntry.label}
                      </StyledHistoryStatus>
                      <StyledPanelMeta>
                        {historyEntry.completedAtLabel}
                        {historyEntry.failureReason !== undefined && (
                          <StyledHistoryFailure>
                            {historyEntry.failureReason}
                          </StyledHistoryFailure>
                        )}
                      </StyledPanelMeta>
                      <StyledPanelMeta>
                        {historyEntry.dataSizeLabel}
                      </StyledPanelMeta>
                    </StyledHistoryItem>
                  ))}
                </StyledHistoryList>
              )}
            </>
          )}
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
