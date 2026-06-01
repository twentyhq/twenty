import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import { IconDatabaseExport, IconRefresh, IconShield } from 'twenty-ui/display';
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

const StyledBackupPanel = styled.section`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
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
  font-size: 24px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledPanelMeta = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

export const ShahryarBackupsPage = () => {
  const { backupStatus, errorMessage, isLoading, refresh } =
    useShahryarBackupStatus();

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
            <StyledStatusLine>
              نەتوانرا دۆخی باک ئەپ لە سێرڤەرەوە وەربگیرێت؛ داتای نموونە پیشان
              دەدرێت.
            </StyledStatusLine>
          )}

          <StyledBackupGrid>
            <StyledBackupPanel>
              <StyledPanelHeader>
                <IconShield size={18} />
                <span>دۆخی باک ئەپ</span>
              </StyledPanelHeader>
              <StyledPanelValue>{backupStatus.label}</StyledPanelValue>
              <StyledPanelMeta>
                دوایین جار: {backupStatus.lastRunLabel}
              </StyledPanelMeta>
            </StyledBackupPanel>
            <StyledBackupPanel>
              <StyledPanelHeader>
                <IconRefresh size={18} />
                <span>دووبارەکردنەوە</span>
              </StyledPanelHeader>
              <StyledPanelValue>{backupStatus.intervalHours}h</StyledPanelValue>
              <StyledPanelMeta>
                {backupStatus.operationModeLabel}
              </StyledPanelMeta>
            </StyledBackupPanel>
            <StyledBackupPanel>
              <StyledPanelHeader>
                <IconDatabaseExport size={18} />
                <span>قەبارەی داتا</span>
              </StyledPanelHeader>
              <StyledPanelValue>{backupStatus.dataSizeLabel}</StyledPanelValue>
              <StyledPanelMeta>
                {backupStatus.storageScopeLabel}
              </StyledPanelMeta>
            </StyledBackupPanel>
          </StyledBackupGrid>
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
