import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import {
  closeSidePanel,
  enqueueSnackbar,
  openCommandConfirmationModal,
  useSelectedRecordIds,
  useSelectedRecordsFilter,
  useTranslate,
} from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH } from 'src/constants/send-template-to-people-route-path.constant';
import { PersonalizableParameterField } from 'src/front-components/components/PersonalizableParameterField';
import { usePersonFieldLabels } from 'src/front-components/hooks/use-person-field-labels';
import { WhatsAppTemplateFormField } from 'src/front-components/components/WhatsAppTemplateFormField';
import { buildPersonalizableTemplateParameters } from 'src/logic-functions/data/build-personalizable-template-parameters.util';
import { getWhatsAppTemplateFormFields } from 'src/logic-functions/data/get-whatsapp-template-form-fields.util';
import { renderWhatsAppTemplateText } from 'src/logic-functions/data/render-whatsapp-template-text.util';
import { type SendTemplateToPeopleResult } from 'src/logic-functions/types/send-template-to-people-result.type';
import { type WhatsAppTemplatePersonField } from 'src/logic-functions/types/personalizable-template-parameter.type';
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

const sendAtLabelStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: themeCssVariables.spacing[1],
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
  color: themeCssVariables.font.color.secondary,
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
  const personFieldLabels = usePersonFieldLabels();
  const personIds = useSelectedRecordIds();
  // the filter also covers "select all", where the selected ids are not all known
  const selectionFilter = useSelectedRecordsFilter();
  const recipients = isDefined(selectionFilter) ? { filter: selectionFilter } : { personIds };
  const [templates, setTemplates] = useState<WhatsAppTemplateOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [templateId, setTemplateId] = useState('');
  const [values, setValues] = useState<Record<string, string>>({});
  const [personFields, setPersonFields] = useState<Record<string, WhatsAppTemplatePersonField | undefined>>({});
  const [isSending, setIsSending] = useState(false);
  const [sendAtLocal, setSendAtLocal] = useState('');

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
    isDefined(template) &&
    !isSending &&
    valueKeys.every((key) => isDefined(personFields[key]) || isNonEmptyString(values[key]?.trim()));

  const getScopedEntries = <TValue,>(scope: string, keys: string[], source: Record<string, TValue>) =>
    Object.fromEntries(keys.map((key) => [key, source[`${scope}:${key}`]]));

  const buildScopedParameters = (scope: 'header' | 'body', keys: string[]) =>
    buildPersonalizableTemplateParameters({
      keys,
      values: getScopedEntries(scope, keys, values),
      personFields: getScopedEntries(scope, keys, personFields),
      parameterFormat: template?.parameterFormat,
    });

  const headerParameters = buildScopedParameters('header', formFields?.headerParameterKeys ?? []);
  const bodyParameters = buildScopedParameters('body', formFields?.bodyParameterKeys ?? []);

  // person fields show as [field name] and empty values keep their placeholder
  const toPreviewParameters = (parameters: typeof bodyParameters, keys: string[]) =>
    parameters.map(({ name, value, personField }, index) => ({
      ...(isDefined(name) ? { name } : {}),
      value: isDefined(personField)
        ? `[${personFieldLabels[personField]}]`
        : isNonEmptyString(value)
          ? value
          : `{{${keys[index] ?? ''}}}`,
    }));

  const preview = isDefined(template)
    ? renderWhatsAppTemplateText({
        components: template.components,
        headerParameters: toPreviewParameters(headerParameters, formFields?.headerParameterKeys ?? []),
        bodyParameters: toPreviewParameters(bodyParameters, formFields?.bodyParameterKeys ?? []),
        parameterFormat: template.parameterFormat,
      })
    : '';

  const setValue = (key: string, value: string) => setValues((previous) => ({ ...previous, [key]: value }));
  const setPersonField = (key: string, personField: WhatsAppTemplatePersonField | undefined) =>
    setPersonFields((previous) => ({ ...previous, [key]: personField }));

  const handleSend = async () => {
    if (!isDefined(template) || !isDefined(formFields)) {
      return;
    }

    setIsSending(true);

    const sendAt = isNonEmptyString(sendAtLocal) ? new Date(sendAtLocal).toISOString() : undefined;
    const request = {
      requestId: crypto.randomUUID(),
      ...(isDefined(sendAt) ? { sendAt } : {}),
      recipients,
      templateId: template.id,
      headerParameters,
      parameters: bodyParameters,
      ...(isDefined(formFields.headerMediaType)
        ? { headerMedia: { type: formFields.headerMediaType, link: values.headerMedia?.trim() } }
        : {}),
      buttonParameters: formFields.buttonInputs.map(({ index, subType }) => ({
        index,
        subType,
        value: values[`button:${index}`]?.trim() ?? '',
      })),
    };
    const postSendRequest = (isDryRun: boolean) =>
      new RestApiClient().post<SendTemplateToPeopleResult>(`/s${SEND_TEMPLATE_TO_PEOPLE_ROUTE_PATH}`, {
        ...request,
        isDryRun,
      });

    try {
      const dryRun = await postSendRequest(true);

      if (!dryRun.success) {
        await enqueueSnackbar({ message: dryRun.error, variant: 'error' });

        return;
      }

      if (dryRun.queuedCount === 0) {
        await enqueueSnackbar({
          message: t('None of the selected people can receive this template: no WhatsApp number, opted out of marketing, or a missing personalized value.'),
          variant: 'warning',
        });

        return;
      }

      const choice = await openCommandConfirmationModal({
        title: isDefined(sendAt)
          ? t('Schedule for {count} people on {sendAt}?', {
              count: dryRun.queuedCount,
              sendAt: new Date(sendAt).toLocaleString(),
            })
          : t('Send to {count} people?', { count: dryRun.queuedCount }),
        subtitle:
          dryRun.skippedCount > 0
            ? t('{skippedCount} selected people are skipped: no WhatsApp number, opted out of marketing, or a missing personalized value.', {
                skippedCount: dryRun.skippedCount,
              })
            : t('Each message is queued and shows up in its conversation once sent.'),
        confirmButtonText: isDefined(sendAt) ? t('Schedule') : t('Send'),
      });

      if (choice !== 'confirm') {
        return;
      }

      const result = await postSendRequest(false);

      if (!result.success) {
        await enqueueSnackbar({ message: result.error, variant: 'error' });

        return;
      }

      await enqueueSnackbar({
        message: isDefined(sendAt)
          ? t('{queuedCount} WhatsApp messages scheduled. Follow them in WhatsApp campaigns.', {
              queuedCount: result.queuedCount,
            })
          : t('{queuedCount} WhatsApp messages queued. Follow them in WhatsApp campaigns.', {
              queuedCount: result.queuedCount,
            }),
        variant: 'success',
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
        description={t('Sends an approved template to the selected people as a campaign. Values can be the same for everyone or taken from each person.')}
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
              setPersonFields({});
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
                <PersonalizableParameterField
                  key={`header:${key}`}
                  label={t('Header parameter {key}', { key })}
                  value={values[`header:${key}`] ?? ''}
                  personField={personFields[`header:${key}`]}
                  disabled={isSending}
                  onValueChange={(value) => setValue(`header:${key}`, value)}
                  onPersonFieldChange={(personField) => setPersonField(`header:${key}`, personField)}
                />
              ))}
              {isDefined(formFields.headerMediaType) && (
                <WhatsAppTemplateFormField
                  label={t('Header {mediaType} link', { mediaType: formFields.headerMediaType })}
                  placeholder="https://"
                  value={values.headerMedia ?? ''}
                  disabled={isSending}
                  onChange={(value) => setValue('headerMedia', value)}
                />
              )}
              {formFields.bodyParameterKeys.map((key) => (
                <PersonalizableParameterField
                  key={`body:${key}`}
                  label={t('Body parameter {key}', { key })}
                  value={values[`body:${key}`] ?? ''}
                  personField={personFields[`body:${key}`]}
                  disabled={isSending}
                  onValueChange={(value) => setValue(`body:${key}`, value)}
                  onPersonFieldChange={(personField) => setPersonField(`body:${key}`, personField)}
                />
              ))}
              {formFields.buttonInputs.map(({ index, subType, label }) => (
                <WhatsAppTemplateFormField
                  key={`button:${index}`}
                  label={subType === 'url' ? t('{label} link ending', { label }) : t('{label} code', { label })}
                  value={values[`button:${index}`] ?? ''}
                  disabled={isSending}
                  onChange={(value) => setValue(`button:${index}`, value)}
                />
              ))}
              <div style={previewStyle}>{preview}</div>
              <label style={sendAtLabelStyle}>
                {t('Send later (optional, up to 30 days ahead)')}
                <input
                  type="datetime-local"
                  style={selectStyle}
                  value={sendAtLocal}
                  disabled={isSending}
                  onChange={(event) => setSendAtLocal(event.target.value)}
                />
              </label>
              <Button type="button" variant="solid" color="accent" disabled={!canSend} onClick={handleSend}>
                {isSending ? t('Sending…') : t('Review and send')}
              </Button>
            </>
          )}
        </div>
      )}
    </Section.Root>
  );
};
