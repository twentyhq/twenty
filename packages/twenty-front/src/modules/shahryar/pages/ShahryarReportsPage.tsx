import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import { Fragment, useState } from 'react';
import { IconChartBar, IconDownload, IconRefresh } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

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

const StyledReportTable = styled.div`
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

const formatOptionalNumber = (value: number | undefined) =>
  value === undefined ? '-' : value;

export const ShahryarReportsPage = () => {
  const { reportRows, isLoading, errorMessage, refresh } =
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
              نەتوانرا داتای سێرڤەر وەربگیرێت؛ داتای نموونە پیشان دەدرێت.
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
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
