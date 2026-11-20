import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import {
  closeSidePanel,
  enqueueSnackbar,
  useSelectedRecordIds,
  useTranslate,
} from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH } from 'src/constants/send-template-to-people-route-path.constant';
import { SendWhatsAppTemplateField } from 'src/front-components/components/SendWhatsAppTemplateField';
import { buildTemplateParametersFromValues } from 'src/logic-functions/data/build-template-parameters-from-values.util';
import { getWhatsAppTemplateFormFields } from 'src/logic-functions/data/get-whatsapp-template-form-fields.util';
import { renderWhatsAppTemplateText } from 'src/logic-functions/data/render-whatsapp-template-text.util';
import { type WhatsAppTemplateComponent } from 'src/logic-functions/types/whatsapp-template-component.type';

type WhatsAppTemplateOption = {
  id: string;
  name: string;
  language: string;
  category: string | null;
  parameterFormat: string | null;
  components: WhatsAppTemplateComponent[];
};

type WhatsAppTemplatesResponse = {
  data?: {
    whatsAppTemplates?: Array<Omit<WhatsAppTemplateOption, 'components'> & { status: string | null; components: unknown }>;
  };
};

type SendTemplateToPeopleResult =
  | { success: true; queuedCount: number; skipped: Array<{ personId: string; reason: string }> }
  | { success: false; error: string };

const columnStyle = { display: 'flex', flexDirection: 'column', gap: themeCssVariables.spacing[3] } as const;

const selectStyle = {
  backgroundColor: themeCssVariables.background.transparent.lighter,
  border: `1px solid ${themeCssVariables.border.color.medium}`,
  borderRadius: themeCssVariables.border.radius.md,
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.md,
  height: '32px',
  padding: `0 ${themeCssVariables.spacing[2]}`,
} as const;

const previewStyle = {
  backgroundColor: themeCssVariables.background.secondary,
  border: `1px solid ${themeCssVariables.border.color.light}`,
  borderRadius: themeCssVariables.border.radius.md,
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.md,
  padding: themeCssVariables.spacing[3],
  whiteSpace: 'pre-wrap',
} as const;

const fetchApprovedTemplates = async (): Promise<WhatsAppTemplateOption[]> => {
  const response = await new RestApiClient().get<WhatsAppTemplatesResponse>('/rest/whatsAppTemplates', {
    query: { limit: '200' },
  });

  return (response.data?.whatsAppTemplates ?? [])
    .filter(({ status }) => status === 'APPROVED')
    .map(({ status: _status, components, ...template }) => ({
      ...template,
      components: Array.isArray(components) ? components : [],
    }));
};

export const SendWhatsAppTemplateForm = () => {
  const { t } = useTranslate();
  const personIds = useSelectedRecordIds();
  const [templates, setTemplates] = useState<WhatsAppTemplateOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [templateId, setTemplateId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [isSending, setIsSending] = useState(false);

  // front components have no data hook, so templates load once when the panel opens
  useEffect(() => {
    let isCancelled = false;

    fetchApprovedTemplates()
      .then((approvedTemplates) => {
        if (!isCancelled) {
          setTemplates(approvedTemplates);
        }
      })
      .catch(() => {
        if (!isCancelled) {
          setLoadError(t('Could not load WhatsApp templates. Try again.'));
        }
      })
      .finally(() => {
        if (!isCancelled) {
          setIsLoading(false);
        }
      });

    return () => {
      isCancelled = true;
    };
  }, []);

  const template = templates.find(({ id }) => id === templateId);
  const formFields = isDefined(template) ? getWhatsAppTemplateFormFields(template.components) : undefined;

  const valueKeys = isDefined(formFields)
    ? [
        ...formFields.headerParameterKeys.map((key) => `header:${key}`),
        ...(isDefined(formFields.headerMediaType) ? ['headerMedia'] : []),
        ...formFields.bodyParameterKeys.map((key) => `body:${key}`),
        ...formFields.buttonInputs.map(({ index }) => `button:${index}`),
      ]
    : [];
  const canSend =
    isDefined(template) && !isSending && valueKeys.every((key) => isNonEmptyString(values[key]?.trim()));

  const getScopedValues = (scope: string, keys: string[], { keepPlaceholders }: { keepPlaceholders: boolean }) =>
    Object.fromEntries(
      keys.map((key) => {
        const value = values[`${scope}:${key}`] ?? '';

        return [key, keepPlaceholders && !isNonEmptyString(value) ? `{{${key}}}` : value];
      }),
    );

  const buildParameters = ({ keepPlaceholders }: { keepPlaceholders: boolean }) => ({
    headerParameters: buildTemplateParametersFromValues({
      keys: formFields?.headerParameterKeys ?? [],
      values: getScopedValues('header', formFields?.headerParameterKeys ?? [], { keepPlaceholders }),
      parameterFormat: template?.parameterFormat,
    }),
    parameters: buildTemplateParametersFromValues({
      keys: formFields?.bodyParameterKeys ?? [],
      values: getScopedValues('body', formFields?.bodyParameterKeys ?? [], { keepPlaceholders }),
      parameterFormat: template?.parameterFormat,
    }),
  });

  const previewParameters = buildParameters({ keepPlaceholders: true });
  const preview = isDefined(template)
    ? renderWhatsAppTemplateText({
        components: template.components,
        headerParameters: previewParameters.headerParameters,
        bodyParameters: previewParameters.parameters,
        parameterFormat: template.parameterFormat,
      })
    : '';

  const setValue = (key: string, value: string) => setValues((previous) => ({ ...previous, [key]: value }));

  const handleSend = async () => {
    if (!isDefined(template) || !isDefined(formFields)) {
      return;
    }

    setIsSending(true);

    try {
      const result = await new RestApiClient().post<SendTemplateToPeopleResult>(
        `/s${SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH}`,
        {
          requestId: crypto.randomUUID(),
          personIds,
          templateId: template.id,
          ...buildParameters({ keepPlaceholders: false }),
          ...(isDefined(formFields.headerMediaType)
            ? { headerMedia: { type: formFields.headerMediaType, link: values.headerMedia?.trim() } }
            : {}),
          buttonParameters: formFields.buttonInputs.map(({ index, subType }) => ({
            index,
            subType,
            value: values[`button:${index}`]?.trim() ?? '',
          })),
        },
      );

      if (!result.success) {
        enqueueSnackbar({ message: result.error, variant: 'error' });

        return;
      }

      enqueueSnackbar({
        message:
          result.skipped.length > 0
            ? t('{queuedCount} WhatsApp messages queued, {skippedCount} people skipped (no WhatsApp number or opted out of marketing).', {
                queuedCount: result.queuedCount,
                skippedCount: result.skipped.length,
              })
            : t('{queuedCount} WhatsApp messages queued.', { queuedCount: result.queuedCount }),
        variant: result.queuedCount > 0 ? 'success' : 'warning',
      });
      await closeSidePanel();
    } catch {
      enqueueSnackbar({ message: t('Could not send the WhatsApp template. Try again.'), variant: 'error' });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={t('Send WhatsApp template')}
        description={t('Sends an approved template to {count} selected people. Each message is queued and appears in its conversation once sent.', {
          count: personIds.length,
        })}
      />
      {isLoading ? (
        <span>{t('Loading templates…')}</span>
      ) : isNonEmptyString(loadError) ? (
        <Callout status="error" title={loadError} />
      ) : templates.length === 0 ? (
        <Callout status="warning" title={t('No approved WhatsApp template yet')} />
      ) : (
        <div style={columnStyle}>
          <select
            style={selectStyle}
            value={templateId}
            disabled={isSending}
            aria-label={t('Template')}
            onChange={(event) => {
              setTemplateId(event.target.value);
              setValues({});
            }}
          >
            <option value="">{t('Pick a template')}</option>
            {templates.map((option) => (
              <option key={option.id} value={option.id}>
                {`${option.name} (${option.language})`}
              </option>
            ))}
          </select>
          {isDefined(formFields) && (
            <>
              {formFields.headerParameterKeys.map((key) => (
                <SendWhatsAppTemplateField
                  key={`header:${key}`}
                  label={t('Header parameter {key}', { key })}
                  value={values[`header:${key}`] ?? ''}
                  disabled={isSending}
                  onChange={(value) => setValue(`header:${key}`, value)}
                />
              ))}
              {isDefined(formFields.headerMediaType) && (
                <SendWhatsAppTemplateField
                  label={t('Header {mediaType} link', { mediaType: formFields.headerMediaType })}
                  placeholder="https://"
                  value={values.headerMedia ?? ''}
                  disabled={isSending}
                  onChange={(value) => setValue('headerMedia', value)}
                />
              )}
              {formFields.bodyParameterKeys.map((key) => (
                <SendWhatsAppTemplateField
                  key={`body:${key}`}
                  label={t('Body parameter {key}', { key })}
                  value={values[`body:${key}`] ?? ''}
                  disabled={isSending}
                  onChange={(value) => setValue(`body:${key}`, value)}
                />
              ))}
              {formFields.buttonInputs.map(({ index, subType, label }) => (
                <SendWhatsAppTemplateField
                  key={`button:${index}`}
                  label={subType === 'url' ? t('{label} link ending', { label }) : t('{label} code', { label })}
                  value={values[`button:${index}`] ?? ''}
                  disabled={isSending}
                  onChange={(value) => setValue(`button:${index}`, value)}
                />
              ))}
              <div style={previewStyle}>{preview}</div>
              <Button type="button" variant="solid" color="accent" disabled={!canSend} onClick={handleSend}>
                {isSending ? t('Sending…') : t('Send to {count} people', { count: personIds.length })}
              </Button>
            </>
          )}
        </div>
      )}
    </Section.Root>
  );
};
