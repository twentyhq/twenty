import { useMutation } from '@apollo/client/react';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { type ValidationRuleFieldDescriptor } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components';
import { IconCheck, IconTrash } from 'twenty-ui/icon';
import { Button, Switch } from 'twenty-ui/primitives/input';
import { Card, CardContent } from 'twenty-ui/primitives/surfaces';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { SettingsValidationRuleExpressionEditor } from '@/validation-rules/components/SettingsValidationRuleExpressionEditor';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import {
  CreateValidationRuleDocument,
  DeleteValidationRuleDocument,
  UpdateValidationRuleDocument,
} from '~/generated-metadata/graphql';

const RECORD_LEVEL_OPTION_VALUE = 'record-level';

const StyledCardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledRow = styled.div`
  align-items: flex-end;
  display: flex;
  gap: ${themeCssVariables.spacing[3]};
`;

const StyledErrorFieldSelectContainer = styled.div`
  flex-shrink: 0;
  width: 220px;
`;

const StyledActions = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  justify-content: space-between;
`;

const StyledActiveToggle = styled.label`
  align-items: center;
  color: ${themeCssVariables.font.color.secondary};
  display: flex;
  font-size: ${themeCssVariables.font.size.sm};
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsValidationRuleCardProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fields: ValidationRuleFieldDescriptor[];
  validationRule?: ValidationRule;
  onSaved: () => void;
  onDeleted: () => void;
};

export const SettingsValidationRuleCard = ({
  objectMetadataItem,
  fields,
  validationRule,
  onSaved,
  onDeleted,
}: SettingsValidationRuleCardProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();

  const [expression, setExpression] = useState(
    validationRule?.expression ?? '',
  );
  const [message, setMessage] = useState(validationRule?.message ?? '');
  const [errorFieldMetadataId, setErrorFieldMetadataId] = useState<
    string | null
  >(validationRule?.errorFieldMetadataId ?? null);
  const [isActive, setIsActive] = useState(validationRule?.isActive ?? true);
  const [isSaving, setIsSaving] = useState(false);

  const [createValidationRule] = useMutation(CreateValidationRuleDocument);
  const [updateValidationRule] = useMutation(UpdateValidationRuleDocument);
  const [deleteValidationRule] = useMutation(DeleteValidationRuleDocument);

  const errorFieldOptions = [
    { label: t`Whole record`, value: RECORD_LEVEL_OPTION_VALUE },
    ...objectMetadataItem.fields
      .filter((field) => field.isActive && !field.isSystem)
      .map((field) => ({ label: field.label, value: field.id })),
  ];

  const handleSave = async () => {
    setIsSaving(true);

    try {
      if (isDefined(validationRule)) {
        await updateValidationRule({
          variables: {
            input: {
              id: validationRule.id,
              update: { expression, message, errorFieldMetadataId, isActive },
            },
          },
        });
      } else {
        await createValidationRule({
          variables: {
            input: {
              objectMetadataId: objectMetadataItem.id,
              expression,
              message,
              errorFieldMetadataId,
              isActive,
            },
          },
        });
      }

      enqueueToast({ variant: 'success', children: t`Validation rule saved` });
      onSaved();
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          error instanceof Error
            ? error.message
            : t`Could not save the validation rule`,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!isDefined(validationRule)) {
      onDeleted();
      return;
    }

    await deleteValidationRule({ variables: { id: validationRule.id } });
    onDeleted();
  };

  return (
    <Card rounded>
      <CardContent>
        <StyledCardContent>
          <SettingsValidationRuleExpressionEditor
            value={expression}
            fields={fields}
            onChange={setExpression}
          />
          <StyledRow>
            <SettingsTextInput
              instanceId={`validation-rule-message-${validationRule?.id ?? 'new'}`}
              label={t`Error message`}
              placeholder={t`A won opportunity needs an amount`}
              value={message}
              onChange={setMessage}
              fullWidth
            />
            <StyledErrorFieldSelectContainer>
              <Select
                dropdownId={`validation-rule-error-field-${validationRule?.id ?? 'new'}`}
                label={t`Show error on`}
                value={errorFieldMetadataId ?? RECORD_LEVEL_OPTION_VALUE}
                options={errorFieldOptions}
                onChange={(value: string) =>
                  setErrorFieldMetadataId(
                    value === RECORD_LEVEL_OPTION_VALUE ? null : value,
                  )
                }
                withSearchInput
                fullWidth
              />
            </StyledErrorFieldSelectContainer>
          </StyledRow>
          <StyledActions>
            <StyledActiveToggle>
              <Switch
                aria-label={t`Active`}
                checked={isActive}
                onCheckedChange={setIsActive}
                size="sm"
              />
              {t`Active`}
            </StyledActiveToggle>
            <StyledRow>
              <Button
                size="sm"
                variant="outline"
                color="danger"
                startIcon={<IconTrash />}
                onClick={handleDelete}
              >{t`Delete`}</Button>
              <Button
                size="sm"
                variant="solid"
                color="accent"
                startIcon={<IconCheck />}
                onClick={handleSave}
                loading={isSaving}
              >{t`Save`}</Button>
            </StyledRow>
          </StyledActions>
        </StyledCardContent>
      </CardContent>
    </Card>
  );
};
