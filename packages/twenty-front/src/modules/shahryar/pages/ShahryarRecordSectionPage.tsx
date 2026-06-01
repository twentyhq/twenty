import {
  SHAHRYAR_RECORD_SECTIONS,
  buildInitialShahryarCanCreateByPath,
  buildInitialShahryarRowsByPath,
  buildShahryarCanCreateByPath,
  buildShahryarRecordRow,
  buildShahryarRowsByPath,
  getDefaultShahryarRecordFormValues,
  type ShahryarRecordFormField,
  type ShahryarRecordFormValues,
} from '@/shahryar/utils/shahryarRecordSectionUtils';
import {
  createShahryarRecord,
  fetchShahryarRecordSections,
} from '@/shahryar/services/shahryarReportApi';
import { PageBody } from '@/ui/layout/page/components/PageBody';
import { PageContainer } from '@/ui/layout/page/components/PageContainer';
import { PageHeader } from '@/ui/layout/page/components/PageHeader';
import { styled } from '@linaria/react';
import {
  Fragment,
  type ChangeEvent,
  type FormEvent,
  useEffect,
  useState,
} from 'react';
import { useLocation } from 'react-router-dom';
import { IconMap } from 'twenty-ui/display';
import { Button } from 'twenty-ui/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[5]};
  height: 100%;
  overflow: auto;
  padding: ${themeCssVariables.spacing[6]};
`;

const StyledCreatePanel = styled.form`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[4]};
  padding: ${themeCssVariables.spacing[4]};
`;

const StyledFormGrid = styled.div`
  display: grid;
  gap: ${themeCssVariables.spacing[3]};
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
`;

const StyledField = styled.label`
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  flex-direction: column;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

const StyledInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 32px;
  padding: 0 ${themeCssVariables.spacing[3]};
`;

const StyledTextarea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.sm};
  min-height: 72px;
  padding: ${themeCssVariables.spacing[2]} ${themeCssVariables.spacing[3]};
  resize: vertical;
`;

const StyledFormActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
`;

const StyledStatusLine = styled.div`
  background: ${themeCssVariables.background.transparent.light};
  border: 1px solid ${themeCssVariables.border.color.light};
  border-radius: ${themeCssVariables.border.radius.sm};
  color: ${themeCssVariables.font.color.secondary};
  font-size: ${themeCssVariables.font.size.sm};
  padding: ${themeCssVariables.spacing[3]};
`;

const StyledTable = styled.div<{ columnCount: number }>`
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  display: grid;
  grid-template-columns: ${({ columnCount }) =>
    `repeat(${columnCount}, minmax(112px, 1fr))`};
  min-width: ${({ columnCount }) => `${columnCount * 112}px`};
  overflow: hidden;
`;

const StyledCell = styled.div<{ isHeader?: boolean }>`
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

const formatCurrentTime = (): string => new Date().toISOString().slice(11, 16);

const resolveBrowserGpsLocation = async (): Promise<string> => {
  if (navigator.geolocation === undefined) {
    return '36.191, 44.009';
  }

  return await new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve(
          `${position.coords.latitude.toFixed(3)}, ${position.coords.longitude.toFixed(3)}`,
        );
      },
      () => resolve('36.191, 44.009'),
      {
        enableHighAccuracy: true,
        maximumAge: 30_000,
        timeout: 5_000,
      },
    );
  });
};

const isSupervisorVisitSection = (path: string) =>
  path === '/shahryar/supervisor-visits';

export const ShahryarRecordSectionPage = () => {
  const location = useLocation();
  const section =
    SHAHRYAR_RECORD_SECTIONS.find(
      (sectionItem) => sectionItem.path === location.pathname,
    ) ?? SHAHRYAR_RECORD_SECTIONS[0];
  const [rowsByPath, setRowsByPath] = useState<Record<string, string[][]>>(
    buildInitialShahryarRowsByPath,
  );
  const [canCreateByPath, setCanCreateByPath] = useState<
    Record<string, boolean>
  >(buildInitialShahryarCanCreateByPath);
  const [isCreatePanelOpen, setIsCreatePanelOpen] = useState(false);
  const [formValuesByPath, setFormValuesByPath] = useState<
    Record<string, ShahryarRecordFormValues>
  >(() =>
    Object.fromEntries(
      SHAHRYAR_RECORD_SECTIONS.map((sectionItem) => [
        sectionItem.path,
        getDefaultShahryarRecordFormValues(sectionItem),
      ]),
    ),
  );
  const [statusMessage, setStatusMessage] = useState<string | undefined>();
  const [isRecordRowsLoading, setIsRecordRowsLoading] = useState(true);
  const [recordRowsErrorMessage, setRecordRowsErrorMessage] = useState<
    string | undefined
  >();
  const [isSavingRecord, setIsSavingRecord] = useState(false);
  const formValues = formValuesByPath[section.path];
  const rows = rowsByPath[section.path] ?? section.rows;
  const canCreateSection = canCreateByPath[section.path] ?? section.canCreate;

  useEffect(() => {
    const controller = new AbortController();

    const loadRecordRows = async () => {
      try {
        const recordSections = await fetchShahryarRecordSections({
          signal: controller.signal,
        });

        if (controller.signal.aborted) {
          return;
        }

        setRowsByPath(buildShahryarRowsByPath(recordSections));
        setCanCreateByPath(buildShahryarCanCreateByPath(recordSections));
        setRecordRowsErrorMessage(undefined);
        setIsRecordRowsLoading(false);
      } catch {
        if (controller.signal.aborted) {
          return;
        }

        setRecordRowsErrorMessage('record-rows-unavailable');
        setIsRecordRowsLoading(false);
      }
    };

    void loadRecordRows();

    return () => controller.abort();
  }, []);

  useEffect(() => {
    if (!canCreateSection && isCreatePanelOpen) {
      setIsCreatePanelOpen(false);
    }
  }, [canCreateSection, isCreatePanelOpen]);

  const updateFormValue = ({
    fieldName,
    value,
  }: {
    fieldName: string;
    value: string;
  }) => {
    setFormValuesByPath((currentFormValuesByPath) => ({
      ...currentFormValuesByPath,
      [section.path]: {
        ...currentFormValuesByPath[section.path],
        [fieldName]: value,
      },
    }));
  };

  const handleFieldChange =
    (field: ShahryarRecordFormField) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateFormValue({
        fieldName: field.name,
        value:
          field.type === 'file'
            ? ((event.currentTarget as HTMLInputElement).files?.[0]?.name ?? '')
            : event.currentTarget.value,
      });
    };

  const handleCheckIn = async () => {
    updateFormValue({
      fieldName: 'checkInAt',
      value: formatCurrentTime(),
    });
    updateFormValue({
      fieldName: 'gpsLocation',
      value: await resolveBrowserGpsLocation(),
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!canCreateSection) {
      setIsCreatePanelOpen(false);
      setStatusMessage(`${section.title} تەنها بۆ بینینە.`);

      return;
    }

    setIsSavingRecord(true);

    let nextRow: string[];
    let nextStatusMessage: string;

    try {
      const response = await createShahryarRecord({
        path: section.path,
        values: formValues,
      });

      nextRow = response.row;
      nextStatusMessage = `${section.title} لە سێرڤەر زیاد کرا.`;
    } catch {
      nextRow = buildShahryarRecordRow({ section, values: formValues });
      nextStatusMessage = `${section.title} لە ناوخۆ زیاد کرا؛ سێرڤەر بەردەست نییە.`;
    }

    setRowsByPath((currentRowsByPath) => ({
      ...currentRowsByPath,
      [section.path]: [
        ...(currentRowsByPath[section.path] ?? section.rows),
        nextRow,
      ],
    }));
    setFormValuesByPath((currentFormValuesByPath) => ({
      ...currentFormValuesByPath,
      [section.path]: getDefaultShahryarRecordFormValues(section),
    }));
    setStatusMessage(nextStatusMessage);
    setIsCreatePanelOpen(false);
    setIsSavingRecord(false);
  };

  return (
    <PageContainer dir="rtl">
      <PageHeader title={section.title} Icon={section.Icon}>
        {canCreateSection && (
          <Button
            title={isCreatePanelOpen ? 'داخستن' : 'زیادکردن'}
            size="small"
            variant="secondary"
            onClick={() => setIsCreatePanelOpen((isOpen) => !isOpen)}
          />
        )}
      </PageHeader>
      <PageBody>
        <StyledContent>
          {statusMessage !== undefined && (
            <StyledStatusLine>{statusMessage}</StyledStatusLine>
          )}
          {isRecordRowsLoading && (
            <StyledStatusLine>داتا بار دەکرێت...</StyledStatusLine>
          )}
          {recordRowsErrorMessage !== undefined && (
            <StyledStatusLine>
              داتای سێرڤەر بەردەست نییە؛ داتای نمونە پیشان دەدرێت.
            </StyledStatusLine>
          )}

          {isCreatePanelOpen && canCreateSection && (
            <StyledCreatePanel onSubmit={(event) => void handleSubmit(event)}>
              <StyledFormGrid>
                {section.formFields.map((field) => (
                  <StyledField key={field.name}>
                    <span>{field.label}</span>
                    {field.type === 'textarea' ? (
                      <StyledTextarea
                        value={formValues[field.name] ?? ''}
                        onChange={handleFieldChange(field)}
                      />
                    ) : (
                      <StyledInput
                        type={field.type === 'file' ? 'file' : field.type}
                        value={
                          field.type === 'file'
                            ? undefined
                            : (formValues[field.name] ?? '')
                        }
                        onChange={handleFieldChange(field)}
                      />
                    )}
                  </StyledField>
                ))}
              </StyledFormGrid>
              <StyledFormActions>
                {isSupervisorVisitSection(section.path) && (
                  <Button
                    title="Check-in GPS"
                    Icon={IconMap}
                    type="button"
                    size="small"
                    variant="secondary"
                    onClick={() => void handleCheckIn()}
                  />
                )}
                <Button
                  title="پاشەکەوت"
                  type="submit"
                  size="small"
                  variant="primary"
                  accent="blue"
                  isLoading={isSavingRecord}
                />
              </StyledFormActions>
            </StyledCreatePanel>
          )}

          <StyledTable columnCount={section.columns.length}>
            {section.columns.map((column) => (
              <StyledCell key={column} isHeader>
                {column}
              </StyledCell>
            ))}
            {rows.map((row, rowIndex) => (
              <Fragment key={`${section.path}-${rowIndex}`}>
                {row.map((cell, cellIndex) => (
                  <StyledCell key={`${section.path}-${rowIndex}-${cellIndex}`}>
                    {cell}
                  </StyledCell>
                ))}
              </Fragment>
            ))}
          </StyledTable>
        </StyledContent>
      </PageBody>
    </PageContainer>
  );
};
