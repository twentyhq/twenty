import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import { Fragment, useState } from 'react';
import {
  IconBell,
  IconChartBar,
  IconDownload,
  IconHome,
  IconRefresh,
  IconSend,
} from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';
import { useShahryarReportSummary } from '@/shahryar/hooks/useShahryarReportSummary';
import {
  dispatchShahryarNotifications,
  downloadShahryarReportExcel,
  downloadShahryarReportPdf,
} from '@/shahryar/services/shahryarReportApi';
import { type ShahryarNotificationDispatchResult } from '@/shahryar/types/shahryarNotificationApi';
import { exportShahryarReport } from '@/shahryar/utils/exportShahryarReport';
import { type ShahryarReportRow } from '@/shahryar/utils/shahryarReportUtils';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[6]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledMetricsGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledStatusLine = styled.div`
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledMetric = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  min-height: 96px;
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledMetricLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.4;
`;

const StyledMetricValueRow = styled.div`
  align-items: baseline;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledMetricValue = styled.strong`
  color: ${SHAHRYAR_COLORS.navy};
  font-size: 28px;
  font-weight: ${themeCssVariables.font.weight.semiBold};
`;

const StyledMetricTrend = styled.span`
  color: ${SHAHRYAR_COLORS.blue};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${themeCssVariables.font.weight.medium};
`;

const StyledSection = styled.section`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledSectionHeader = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledSectionTitle = styled.h2`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledReportGrid = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  grid-template-columns:
    minmax(112px, 1fr) repeat(3, minmax(112px, 0.5fr))
    repeat(3, minmax(112px, 0.5fr))
    repeat(2, minmax(136px, 1fr))
    minmax(180px, 2fr);
  min-width: 1180px;
  overflow: hidden;
`;

const StyledReportCell = styled.div<{ isHeader?: boolean }>`
  background: ${({ isHeader }) =>
    isHeader ? themeCssVariables.background.secondary : 'transparent'};
  border-bottom: 1px solid ${themeCssVariables.border.color.light};
  color: ${({ isHeader }) =>
    isHeader
      ? themeCssVariables.font.color.secondary
      : themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  font-weight: ${({ isHeader }) =>
    isHeader
      ? themeCssVariables.font.weight.medium
      : themeCssVariables.font.weight.regular};
  line-height: 1.4;
  min-width: 0;
  overflow-wrap: anywhere;
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledAlerts = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
`;

const StyledAlert = styled.div`
  border: 1px solid ${themeCssVariables.color.red5};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${SHAHRYAR_COLORS.navy};
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledAlertIcon = styled.div`
  color: ${SHAHRYAR_COLORS.red};
  display: flex;
  flex-shrink: 0;
`;

const StyledAlertText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
`;

const StyledAlertTitle = styled.strong`
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledAlertDescription = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  line-height: 1.5;
`;

const formatOptionalNumber = (value: number | undefined) =>
  value === undefined ? '-' : value;

const formatNotificationDispatchMessage = ({
  attemptedCount,
  failedCount,
  sentCount,
}: ShahryarNotificationDispatchResult) => {
  if (attemptedCount === 0) {
    return 'هیچ ئاگادارکردنەوەیەکی موبایل بۆ ناردن نییە.';
  }

  if (failedCount > 0 && sentCount > 0) {
    return `${sentCount} ئاگادارکردنەوە نێردران؛ ${failedCount} شکستی هێنا.`;
  }

  if (failedCount > 0) {
    return `ناردنی ${failedCount} ئاگادارکردنەوە شکستی هێنا.`;
  }

  return `${sentCount} ئاگادارکردنەوەی موبایل نێردران.`;
};

export const ShahryarDashboardPage = () => {
  const {
    dashboardMetrics,
    reportRows,
    notifications,
    isLoading,
    errorMessage,
    refresh,
  } = useShahryarReportSummary();
  const [exportErrorMessage, setExportErrorMessage] = useState<
    string | undefined
  >();
  const [isDispatchingNotifications, setIsDispatchingNotifications] =
    useState(false);
  const [notificationDispatchMessage, setNotificationDispatchMessage] =
    useState<string | undefined>();

  const hasPendingNotificationAlerts = notifications.some(
    (notification) => notification.count > 0,
  );

  const handleExcelExport = async (rows: ShahryarReportRow[]) => {
    setExportErrorMessage(undefined);
    setNotificationDispatchMessage(undefined);

    try {
      await downloadShahryarReportExcel();
    } catch {
      setExportErrorMessage(
        'نەتوانرا Excel لە سێرڤەرەوە دابگیرێت؛ CSV ناوخۆ دروست کرا.',
      );
      exportShahryarReport({
        format: 'csv',
        rows,
      });
    }
  };

  const handlePdfExport = async (rows: ShahryarReportRow[]) => {
    setExportErrorMessage(undefined);
    setNotificationDispatchMessage(undefined);

    try {
      await downloadShahryarReportPdf();
    } catch {
      setExportErrorMessage(
        'نەتوانرا PDF لە سێرڤەرەوە دابگیرێت؛ چاپی ناوخۆ کراوە.',
      );
      exportShahryarReport({
        format: 'print',
        rows,
      });
    }
  };

  const handleDispatchNotifications = async () => {
    setExportErrorMessage(undefined);
    setNotificationDispatchMessage(undefined);
    setIsDispatchingNotifications(true);

    try {
      const result = await dispatchShahryarNotifications();

      setNotificationDispatchMessage(formatNotificationDispatchMessage(result));
    } catch {
      setNotificationDispatchMessage(
        'نەتوانرا ئاگادارکردنەوەکانی موبایل بنێردرێن.',
      );
    } finally {
      setIsDispatchingNotifications(false);
    }
  };

  return (
    <PageContainer dir="rtl">
      <PageHeader title="Dashboard" Icon={IconHome}>
        <Button
          title="نوێکردنەوە"
          Icon={IconRefresh}
          size="small"
          variant="secondary"
          isLoading={isLoading}
          onClick={() => void refresh()}
        />
        <Button
          title="Excel"
          Icon={IconDownload}
          size="small"
          variant="secondary"
          onClick={() => void handleExcelExport(reportRows)}
        />
        <Button
          title="PDF"
          Icon={IconDownload}
          size="small"
          variant="secondary"
          onClick={() => void handlePdfExport(reportRows)}
        />
      </PageHeader>
      <PageBody>
        <StyledContent>
          {isLoading ? (
            <StyledStatusLine>ڕاپۆرتەکان نوێ دەکرێنەوە...</StyledStatusLine>
          ) : errorMessage !== undefined ? (
            <StyledStatusLine>
              نەتوانرا داتای سێرڤەر وەربگیرێت؛ داتای نموونە پیشان دەدرێت.
            </StyledStatusLine>
          ) : exportErrorMessage !== undefined ? (
            <StyledStatusLine>{exportErrorMessage}</StyledStatusLine>
          ) : notificationDispatchMessage !== undefined ? (
            <StyledStatusLine>{notificationDispatchMessage}</StyledStatusLine>
          ) : null}

          <StyledMetricsGrid>
            {dashboardMetrics.map((metric) => (
              <StyledMetric key={metric.label}>
                <StyledMetricLabel>{metric.label}</StyledMetricLabel>
                <StyledMetricValueRow>
                  <StyledMetricValue>{metric.value}</StyledMetricValue>
                  <StyledMetricTrend>{metric.trend}</StyledMetricTrend>
                </StyledMetricValueRow>
              </StyledMetric>
            ))}
          </StyledMetricsGrid>

          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>ڕاپۆرتەکان</StyledSectionTitle>
              <IconChartBar size={18} />
            </StyledSectionHeader>
            <StyledReportGrid>
              <StyledReportCell isHeader>ماوە</StyledReportCell>
              <StyledReportCell isHeader>سەردان</StyledReportCell>
              <StyledReportCell isHeader>فرۆشتن</StyledReportCell>
              <StyledReportCell isHeader>داواکاری</StyledReportCell>
              <StyledReportCell isHeader>پارەدان</StyledReportCell>
              <StyledReportCell isHeader>غرامە</StyledReportCell>
              <StyledReportCell isHeader>غیابات</StyledReportCell>
              <StyledReportCell isHeader>پوختەی 1</StyledReportCell>
              <StyledReportCell isHeader>پوختەی 2</StyledReportCell>
              <StyledReportCell isHeader>تێبینی</StyledReportCell>
              {reportRows.map((row) => (
                <Fragment key={row.period}>
                  <StyledReportCell>{row.period}</StyledReportCell>
                  <StyledReportCell>{row.visits}</StyledReportCell>
                  <StyledReportCell>{row.salesCartons}</StyledReportCell>
                  <StyledReportCell>{row.requests}</StyledReportCell>
                  <StyledReportCell>
                    {formatOptionalNumber(row.paidAmount)}
                  </StyledReportCell>
                  <StyledReportCell>
                    {formatOptionalNumber(row.penaltyAmount)}
                  </StyledReportCell>
                  <StyledReportCell>
                    {formatOptionalNumber(row.absenceCount)}
                  </StyledReportCell>
                  <StyledReportCell>{row.primaryInsight}</StyledReportCell>
                  <StyledReportCell>{row.secondaryInsight}</StyledReportCell>
                  <StyledReportCell>{row.notes}</StyledReportCell>
                </Fragment>
              ))}
            </StyledReportGrid>
          </StyledSection>

          <StyledSection>
            <StyledSectionHeader>
              <StyledSectionTitle>ئاگادارکردنەوەکان</StyledSectionTitle>
              <Button
                title="ناردنی موبایل"
                Icon={IconSend}
                size="small"
                variant="secondary"
                disabled={
                  !hasPendingNotificationAlerts || isDispatchingNotifications
                }
                isLoading={isDispatchingNotifications}
                onClick={() => void handleDispatchNotifications()}
              />
            </StyledSectionHeader>
            <StyledAlerts>
              {notifications.map((notification) => (
                <StyledAlert key={notification.kind}>
                  <StyledAlertIcon>
                    <IconBell size={18} />
                  </StyledAlertIcon>
                  <StyledAlertText>
                    <StyledAlertTitle>
                      {notification.label}: {notification.count}{' '}
                      {notification.unit}
                    </StyledAlertTitle>
                    <StyledAlertDescription>
                      {notification.description}
                    </StyledAlertDescription>
                  </StyledAlertText>
                </StyledAlert>
              ))}
            </StyledAlerts>
          </StyledSection>
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
