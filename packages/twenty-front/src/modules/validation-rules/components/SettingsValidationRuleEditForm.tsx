import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { Section, useToast } from 'twenty-ui/components';
import { IconArchive, IconArchiveOff, IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SettingsValidationRuleForm } from '@/validation-rules/components/SettingsValidationRuleForm';
import { SettingsValidationRulePageLayout } from '@/validation-rules/components/SettingsValidationRulePageLayout';
import { useNavigateToObjectValidationRules } from '@/validation-rules/hooks/useNavigateToObjectValidationRules';
import { useValidationRuleMutations } from '@/validation-rules/hooks/useValidationRuleMutations';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { buildValidationRuleEditorFields } from '@/validation-rules/utils/buildValidationRuleEditorFields';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { getValidationRuleFormValues } from '@/validation-rules/utils/getValidationRuleFormValues';
import { getValidationRuleSaveErrorMessage } from '@/validation-rules/utils/getValidationRuleSaveErrorMessage';
import { isValidationRuleFormSubmittable } from '@/validation-rules/utils/isValidationRuleFormSubmittable';

const DELETE_VALIDATION_RULE_MODAL_ID = 'validation-rule-edit-delete';

const StyledDangerButtons = styled.div`
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
`;

type SettingsValidationRuleEditFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  validationRule: ValidationRule;
};

export const SettingsValidationRuleEditForm = ({
  objectMetadataItem,
  validationRule,
}: SettingsValidationRuleEditFormProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();
  const { objectMetadataItems } = useObjectMetadataItems();
  const navigateToObjectValidationRules = useNavigateToObjectValidationRules({
    objectNamePlural: objectMetadataItem.namePlural,
  });
  const { updateValidationRule, deleteValidationRule, isSaving, isDeleting } =
    useValidationRuleMutations({ objectMetadataId: objectMetadataItem.id });

  const [values, setValues] = useState<ValidationRuleFormValues>(() =>
    getValidationRuleFormValues({
      validationRule,
      fields: buildValidationRuleFieldDescriptors({
        objectMetadataItem,
        objectMetadataItems,
        includesInactiveFields: true,
      }),
    }),
  );

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataItem,
    objectMetadataItems,
  });
  const editorFields = buildValidationRuleEditorFields({
    objectMetadataItem,
    objectMetadataItems,
  });

  const handleSave = async () => {
    try {
      await updateValidationRule({
        variables: { input: { id: validationRule.id, update: values } },
      });
      enqueueToast({ variant: 'success', children: t`Rule updated.` });
      navigateToObjectValidationRules();
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          getValidationRuleSaveErrorMessage(error) ??
          t`Failed to update the rule.`,
      });
    }
  };

  const handleToggleActive = async () => {
    const isActive = !validationRule.isActive;

    try {
      await updateValidationRule({
        variables: { input: { id: validationRule.id, update: { isActive } } },
      });
      enqueueToast({
        variant: 'success',
        children: isActive ? t`Rule enabled.` : t`Rule disabled.`,
      });
      navigateToObjectValidationRules();
    } catch (error) {
      enqueueToast({
        variant: 'error',
        children:
          getValidationRuleSaveErrorMessage(error) ??
          t`Failed to update the rule.`,
      });
    }
  };

  const handleDelete = async () => {
    try {
      await deleteValidationRule({ variables: { id: validationRule.id } });
      enqueueToast({ variant: 'success', children: t`Rule deleted.` });
      navigateToObjectValidationRules();
    } catch {
      enqueueToast({
        variant: 'error',
        children: t`Failed to delete the rule.`,
      });
    } finally {
      closeDialog(DELETE_VALIDATION_RULE_MODAL_ID);
    }
  };

  return (
    <SettingsValidationRulePageLayout
      objectMetadataItem={objectMetadataItem}
      breadcrumbLabel={validationRule.name}
      stepLabel={t`Edit rule`}
      isSaveDisabled={
        isSaving || !isValidationRuleFormSubmittable({ values, fields })
      }
      onSave={handleSave}
    >
      <SettingsValidationRuleForm
        objectMetadataItem={objectMetadataItem}
        fields={fields}
        editorFields={editorFields}
        values={values}
        onChange={setValues}
      />
      <Section.Root>
        <Section.Header
          title={t`Danger zone`}
          description={
            validationRule.isActive
              ? t`Disable the rule to stop checking records against it.`
              : t`This rule is disabled. Records are not checked against it.`
          }
        />
        <StyledDangerButtons>
          <Button
            startIcon={
              validationRule.isActive ? <IconArchive /> : <IconArchiveOff />
            }
            size="sm"
            variant="outline"
            disabled={isSaving}
            onClick={handleToggleActive}
          >
            {validationRule.isActive ? t`Disable` : t`Enable`}
          </Button>
          <Button
            startIcon={<IconTrash />}
            size="sm"
            variant="outline"
            color="danger"
            disabled={isDeleting}
            onClick={() => openDialog(DELETE_VALIDATION_RULE_MODAL_ID)}
          >{t`Delete`}</Button>
        </StyledDangerButtons>
        <ConfirmationDialog
          dialogId={DELETE_VALIDATION_RULE_MODAL_ID}
          title={t`Delete this rule?`}
          subtitle={t`Records will no longer be checked against it. Existing records are not changed.`}
          confirmButtonText={t`Delete`}
          loading={isDeleting}
          onConfirmClick={handleDelete}
        />
      </Section.Root>
    </SettingsValidationRulePageLayout>
  );
};
