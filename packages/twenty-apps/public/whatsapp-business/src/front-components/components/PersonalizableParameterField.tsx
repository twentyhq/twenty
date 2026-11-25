import { useTranslate } from 'twenty-sdk/front-component';
import { isDefined } from 'twenty-sdk/utils';
import { themeCssVariables } from 'twenty-ui/theme';

import { usePersonFieldLabels } from 'src/front-components/hooks/use-person-field-labels';
import { WHATSAPP_TEMPLATE_PERSON_FIELDS } from 'src/constants/whatsapp-template-person-fields.constant';
import { type WhatsAppTemplatePersonField } from 'src/logic-functions/types/personalizable-template-parameter.type';

const FIXED_VALUE_SOURCE = 'fixed';

const rowStyle = {
  display: 'flex',
  flexDirection: 'column',
  gap: themeCssVariables.spacing[1],
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.sm,
  color: themeCssVariables.font.color.secondary,
} as const;

const controlsStyle = { display: 'flex', gap: themeCssVariables.spacing[2] } as const;

const controlStyle = {
  backgroundColor: themeCssVariables.background.transparent.lighter,
  border: `1px solid ${themeCssVariables.border.color.medium}`,
  borderRadius: themeCssVariables.border.radius.md,
  boxSizing: 'border-box',
  color: themeCssVariables.font.color.primary,
  fontFamily: themeCssVariables.font.family,
  fontSize: themeCssVariables.font.size.md,
  height: '32px',
  padding: `0 ${themeCssVariables.spacing[2]}`,
} as const;

type PersonalizableParameterFieldProps = {
  label: string;
  value: string;
  personField: WhatsAppTemplatePersonField | undefined;
  disabled: boolean;
  onValueChange: (value: string) => void;
  onPersonFieldChange: (personField: WhatsAppTemplatePersonField | undefined) => void;
};

export const PersonalizableParameterField = ({
  label,
  value,
  personField,
  disabled,
  onValueChange,
  onPersonFieldChange,
}: PersonalizableParameterFieldProps) => {
  const { t } = useTranslate();
  const personFieldLabels = usePersonFieldLabels();

  return (
    <div style={rowStyle}>
      {label}
      <div style={controlsStyle}>
        <select
          style={controlStyle}
          value={personField ?? FIXED_VALUE_SOURCE}
          disabled={disabled}
          aria-label={t('Value source for {label}', { label })}
          onChange={(event) => {
            const source = WHATSAPP_TEMPLATE_PERSON_FIELDS.find((field) => field === event.target.value);

            onPersonFieldChange(source);
          }}
        >
          <option value={FIXED_VALUE_SOURCE}>{t('Same text for everyone')}</option>
          {WHATSAPP_TEMPLATE_PERSON_FIELDS.map((field) => (
            <option key={field} value={field}>
              {t("Person's {field}", { field: personFieldLabels[field].toLowerCase() })}
            </option>
          ))}
        </select>
        {!isDefined(personField) && (
          <input
            style={{ ...controlStyle, flexGrow: 1 }}
            value={value}
            disabled={disabled}
            aria-label={label}
            onChange={(event) => onValueChange(event.target.value)}
          />
        )}
      </div>
    </div>
  );
};
