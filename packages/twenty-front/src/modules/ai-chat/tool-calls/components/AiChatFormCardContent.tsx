import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString, isObject } from '@sniptt/guards';
import { type RequestFormField } from 'twenty-shared/ai';
import { isDefined } from 'twenty-shared/utils';
import { IconForms } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { AiChatFormFields } from '@/ai-chat/tool-calls/components/AiChatFormFields';
import { StyledAiChatAskCard } from '@/ai-chat/tool-calls/components/StyledAiChatAskCard';
import { isFieldValueEmpty } from '@/object-record/record-field/ui/utils/isFieldValueEmpty';

const StyledHeader = styled.div`
  align-items: center;
  color: ${themeCssVariables.font.color.primary};
  display: flex;
  font-size: ${themeCssVariables.font.size.md};
  font-weight: ${themeCssVariables.font.weight.medium};
  gap: ${themeCssVariables.spacing[2]};
  min-height: ${themeCssVariables.spacing[6]};
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: flex-end;
  padding-left: ${themeCssVariables.spacing[1]};
`;

const StyledPrefillFeedback = styled.span`
  color: ${themeCssVariables.font.color.light};
  flex: 1;
  font-size: ${themeCssVariables.font.size.sm};
  min-width: 0;
`;

type AiChatFormCardContentProps = {
  fields: RequestFormField[];
  defaultValues?: Record<string, unknown>;
  values?: Record<string, unknown>;
  title?: string;
  isSubmitting?: boolean;
  isSubmitDisabled?: boolean;
  onFieldChange: (fieldChange: { fieldName: string; value: unknown }) => void;
  onError: (error: string | undefined) => void;
  onSubmit: () => void;
  onSkip?: () => void;
};

export const AiChatFormCardContent = ({
  fields,
  defaultValues,
  values,
  title,
  isSubmitting = false,
  isSubmitDisabled = false,
  onFieldChange,
  onError,
  onSubmit,
  onSkip,
}: AiChatFormCardContentProps) => {
  const { t } = useLingui();
  const prefilledCount = fields.filter(({ name, type }) => {
    const value = defaultValues?.[name];

    if (type === 'RECORD') {
      return isObject(value) && 'id' in value && isNonEmptyString(value.id);
    }

    return !isFieldValueEmpty({ fieldDefinition: { type }, fieldValue: value });
  }).length;
  const fieldCount = fields.length;
  const fieldValues = { ...defaultValues, ...values };

  return (
    <StyledAiChatAskCard isPadded>
      <StyledHeader>
        <IconForms size={16} />
        {title ?? t`Form`}
      </StyledHeader>
      <AiChatFormFields
        fields={fields}
        values={fieldValues}
        readonly={isSubmitting}
        onFieldChange={onFieldChange}
        onError={onError}
      />
      <StyledActions>
        {prefilledCount > 0 && (
          <StyledPrefillFeedback>
            {t`${prefilledCount} of ${fieldCount} fields prefilled`}
          </StyledPrefillFeedback>
        )}
        {isDefined(onSkip) && (
          <Button size="sm" disabled={isSubmitting} onClick={onSkip}>
            {t`Skip`}
          </Button>
        )}
        <Button
          size="sm"
          variant="solid"
          color="accent"
          disabled={isSubmitting || isSubmitDisabled}
          loading={isSubmitting}
          onClick={onSubmit}
        >
          {t`Submit`}
        </Button>
      </StyledActions>
    </StyledAiChatAskCard>
  );
};
