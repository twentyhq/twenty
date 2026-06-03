import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import { Fragment, useState } from 'react';
import { IconChartBar, IconDownload, IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { ShahryarAnalyticsSection } from '@/shahryar/components/ShahryarAnalyticsSection';
import { SHAHRYAR_COLORS } from '@/shahryar/constants/shahryar-colors';
import { useShahryarReportSummary } from '@/shahryar/hooks/useShahryarReportSummary';
import {
  downloadShahryarReportExcel,
  downloadShahryarReportPdf,
} from '@/shahryar/services/shahryarReportApi';
import { exportShahryarReport } from '@/shahryar/utils/exportShahryarReport';
import { type ShahryarReportRow } from '@/shahryar/utils/shahryarReportUtils';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledPeriodGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
`;

const StyledStatusLine = styled.div`
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledPeriodPanel = styled.section`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledPanelTitle = styled.h2`
  color: ${SHAHRYAR_COLORS.navy};
  font-size: ${themeCssVariables.font.size.lg};
  font-weight: ${themeCssVariables.font.weight.semiBold};
  margin: 0;
`;

const StyledMetricLine = styled.div`
  align-items: center;
  border-top: 1px solid ${themeCssVariables.border.color.light};
  display: flex;
  justify-content: space-between;
  padding-top: ${themeCssVariables.spacing[2]};
`;

const StyledLineLabel = styled.span`
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
`;

const StyledLineValue = styled.strong`
  color: ${SHAHRYAR_COLORS.blue};
  font-size: ${themeCssVariables.font.size.md};
`;

const StyledReportTableScroller = styled.div`
  max-width: 100%;
  min-width: 0;
  overflow-x: auto;
  scrollbar-gutter: stable;
`;

const StyledReportTable = styled.div`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  grid-template-columns:
    minmax(88px, 0.8fr) repeat(6, minmax(80px, 0.55fr))
    repeat(2, minmax(120px, 1fr))
    minmax(160px, 1.4fr);
  min-width: 968px;
  overflow: hidden;
  width: 100%;
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

const formatOptionalNumber = (value: number | undefined) =>
  value === undefined ? '-' : value;

export const ShahryarReportsPage = () => {
  const { analytics, reportRows, isLoading, errorMessage, refresh } =
    useShahryarReportSummary();
  const [exportErrorMessage, setExportErrorMessage] = useState<
    string | undefined
  >();

  const handleExcelExport = async (rows: ShahryarReportRow[]) => {
    setExportErrorMessage(undefined);

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

  return (
    <PageContainer dir="rtl">
      <PageHeader title="ڕاپۆرتەکان" Icon={IconChartBar}>
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
              نەتوانرا داتای سێرڤەر وەربگیرێت؛ تکایە پەیوەندی بە بەکئەندەوە
              بپشکنە.
            </StyledStatusLine>
          ) : exportErrorMessage !== undefined ? (
            <StyledStatusLine>{exportErrorMessage}</StyledStatusLine>
          ) : null}

          <StyledPeriodGrid>
            {reportRows.map((row) => (
              <StyledPeriodPanel key={row.period}>
                <StyledPanelTitle>{row.period}</StyledPanelTitle>
                <StyledMetricLine>
                  <StyledLineLabel>سەردان</StyledLineLabel>
                  <StyledLineValue>{row.visits}</StyledLineValue>
                </StyledMetricLine>
                <StyledMetricLine>
                  <StyledLineLabel>فرۆشتن</StyledLineLabel>
                  <StyledLineValue>{row.salesCartons}</StyledLineValue>
                </StyledMetricLine>
                <StyledMetricLine>
                  <StyledLineLabel>داواکاری</StyledLineLabel>
                  <StyledLineValue>{row.requests}</StyledLineValue>
                </StyledMetricLine>
                <StyledMetricLine>
                  <StyledLineLabel>پوختەی 1</StyledLineLabel>
                  <StyledLineValue>{row.primaryInsight}</StyledLineValue>
                </StyledMetricLine>
                <StyledMetricLine>
                  <StyledLineLabel>پوختەی 2</StyledLineLabel>
                  <StyledLineValue>{row.secondaryInsight}</StyledLineValue>
                </StyledMetricLine>
              </StyledPeriodPanel>
            ))}
          </StyledPeriodGrid>

          <ShahryarAnalyticsSection analytics={analytics} />

          <StyledReportTableScroller>
            <StyledReportTable>
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
            </StyledReportTable>
          </StyledReportTableScroller>
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
