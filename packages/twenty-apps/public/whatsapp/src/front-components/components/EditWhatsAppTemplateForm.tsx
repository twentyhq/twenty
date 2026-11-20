import { isNonEmptyString } from '@sniptt/guards';
import { useEffect, useState } from 'react';
import { RestApiClient } from 'twenty-client-sdk/rest';
import { closeSidePanel, enqueueSnackbar, useSelectedRecordIds, useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { Callout } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { WHATSAPP_TEMPLATE_ROUTE_PATHS } from 'src/constants/whatsapp-template-route-paths.constant';
import { WhatsAppTemplateFormField } from 'src/front-components/components/WhatsAppTemplateFormField';
import { getTemplatePlaceholderKeys } from 'src/logic-functions/data/get-template-placeholder-keys.util';
import { type TemplateRouteResult } from 'src/logic-functions/types/template-route-result.type';
import { type WhatsAppTemplateComponent } from 'src/logic-functions/types/whatsapp-template-component.type';

const CATEGORIES = ['UTILITY', 'MARKETING', 'AUTHENTICATION'] as const;

type WhatsAppTemplateResponse = {
  data?: {
    whatsAppTemplate?: {
      id: string;
      name: string;
      category: string | null;
      parameterFormat: string | null;
      components: unknown;
    };
  };
};

type EditableTemplate = {
  id: string;
  name: string;
  parameterFormat: string | null;
  hasMediaHeader: boolean;
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

const findComponentText = (components: WhatsAppTemplateComponent[], type: string) =>
  components.find((component) => component.type.toUpperCase() === type)?.text ?? '';

export const EditWhatsAppTemplateForm = () => {
  const { t } = useTranslate();
  const [templateId] = useSelectedRecordIds();
  const [template, setTemplate] = useState<EditableTemplate | undefined>(undefined);
  const [loadError, setLoadError] = useState<string | undefined>(undefined);
  const [category, setCategory] = useState('');
  const [header, setHeader] = useState('');
  const [body, setBody] = useState('');
  const [footer, setFooter] = useState('');
  const [examples, setExamples] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  // front components have no data hook, so the template loads once when the panel opens
  useEffect(() => {
    if (!isDefined(templateId)) {
      return;
    }

    new RestApiClient()
      .get<WhatsAppTemplateResponse>(`/rest/whatsAppTemplates/${templateId}`)
      .then((response) => {
        const record = response.data?.whatsAppTemplate;

        if (!isDefined(record)) {
          setLoadError(t('WhatsApp template not found.'));

          return;
        }

        const components: WhatsAppTemplateComponent[] = Array.isArray(record.components) ? record.components : [];
        const headerComponent = components.find((component) => component.type.toUpperCase() === 'HEADER');

        setTemplate({
          id: record.id,
          name: record.name,
          parameterFormat: record.parameterFormat,
          hasMediaHeader: isDefined(headerComponent) && headerComponent.format?.toUpperCase() !== 'TEXT',
        });
        setCategory(record.category ?? '');
        setHeader(headerComponent?.format?.toUpperCase() === 'TEXT' ? (headerComponent.text ?? '') : '');
        setBody(findComponentText(components, 'BODY'));
        setFooter(findComponentText(components, 'FOOTER'));
      })
      .catch(() => setLoadError(t('Could not load the WhatsApp template. Try again.')));
  }, [templateId]);

  const exampleKeys = getTemplatePlaceholderKeys(body);
  const isContentEditable = isDefined(template) && !template.hasMediaHeader;
  const canSave =
    isDefined(template) &&
    !isSaving &&
    isNonEmptyString(body.trim()) &&
    (!isContentEditable || exampleKeys.every((key) => isNonEmptyString(examples[key]?.trim())));

  const handleSave = async () => {
    if (!isDefined(template)) {
      return;
    }

    setIsSaving(true);

    try {
      const result = await new RestApiClient().post<TemplateRouteResult>(`/s${WHATSAPP_TEMPLATE_ROUTE_PATHS.edit}`, {
        templateId: template.id,
        ...(isNonEmptyString(category) ? { category } : {}),
        ...(isContentEditable
          ? {
              body: body.trim(),
              ...(isNonEmptyString(header.trim()) ? { header: header.trim() } : {}),
              ...(isNonEmptyString(footer.trim()) ? { footer: footer.trim() } : {}),
              bodyExamples: exampleKeys.map((key) => ({
                ...(template.parameterFormat === 'NAMED' ? { name: key } : {}),
                example: examples[key]?.trim() ?? '',
              })),
            }
          : {}),
      });

      if (!result.success) {
        await enqueueSnackbar({ message: result.error, variant: 'error' });

        return;
      }

      await enqueueSnackbar({ message: t('Template sent to Meta for review.'), variant: 'success' });
      await closeSidePanel();
    } catch {
      await enqueueSnackbar({ message: t('Could not save the WhatsApp template. Try again.'), variant: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Section.Root>
      <Section.Header
        title={isDefined(template) ? t('Edit {name}', { name: template.name }) : t('Edit WhatsApp template')}
        description={t('Saving sends the template back to Meta for review. Meta limits how often an approved template can be edited.')}
      />
      {isNonEmptyString(loadError) ? (
        <Callout status="error" title={loadError} />
      ) : !isDefined(template) ? (
        <span>{t('Loading template…')}</span>
      ) : (
        <div style={columnStyle}>
          <select
            style={selectStyle}
            value={category}
            disabled={isSaving}
            aria-label={t('Category')}
            onChange={(event) => setCategory(event.target.value)}
          >
            {CATEGORIES.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          {template.hasMediaHeader ? (
            <Callout
              status="warning"
              title={t('Only the category can be changed here, because this template has a media header.')}
            />
          ) : (
            <>
              <WhatsAppTemplateFormField label={t('Header')} value={header} disabled={isSaving} onChange={setHeader} />
              <WhatsAppTemplateFormField
                label={t('Body')}
                value={body}
                disabled={isSaving}
                isMultiline
                onChange={setBody}
              />
              <WhatsAppTemplateFormField label={t('Footer')} value={footer} disabled={isSaving} onChange={setFooter} />
              {exampleKeys.map((key) => (
                <WhatsAppTemplateFormField
                  key={key}
                  label={t('Example for {key}', { key })}
                  value={examples[key] ?? ''}
                  disabled={isSaving}
                  onChange={(value) => setExamples((previous) => ({ ...previous, [key]: value }))}
                />
              ))}
            </>
          )}
          <Button type="button" variant="solid" color="accent" disabled={!canSave} onClick={handleSave}>
            {isSaving ? t('Saving…') : t('Save and submit for review')}
          </Button>
        </div>
      )}
    </Section.Root>
  );
};
