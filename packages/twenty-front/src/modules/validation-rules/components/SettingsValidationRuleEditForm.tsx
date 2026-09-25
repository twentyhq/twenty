import { Trans, useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath } from 'twenty-shared/utils';
import { Section, useToast } from 'twenty-ui/components';
import { IconTrash } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { ConfirmationDialog } from '@/ui/layout/dialog/components/ConfirmationDialog';
import { useDialog } from '@/ui/layout/dialog/hooks/useDialog';
import { SettingsValidationRuleForm } from '@/validation-rules/components/SettingsValidationRuleForm';
import { useValidationRuleMutations } from '@/validation-rules/hooks/useValidationRuleMutations';
import { type ValidationRule } from '@/validation-rules/types/ValidationRule';
import { type ValidationRuleFormValues } from '@/validation-rules/types/ValidationRuleFormValues';
import { buildValidationRuleFieldDescriptors } from '@/validation-rules/utils/buildValidationRuleFieldDescriptors';
import { getValidationRuleSaveErrorMessage } from '@/validation-rules/utils/getValidationRuleSaveErrorMessage';
import { isValidationRuleFormSubmittable } from '@/validation-rules/utils/isValidationRuleFormSubmittable';
import { useNavigateSettings } from '~/hooks/useNavigateSettings';

const DELETE_VALIDATION_RULE_MODAL_ID = 'validation-rule-edit-delete';
const OBJECT_SETTINGS_TAB_HASH = 'settings';

type SettingsValidationRuleEditFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  validationRule: ValidationRule;
};

export const SettingsValidationRuleEditForm = ({
  objectMetadataItem,
  validationRule,
}: SettingsValidationRuleEditFormProps) => {
  const { t } = useLingui();
  const navigate = useNavigateSettings();
  const { enqueueToast } = useToast();
  const { openDialog, closeDialog } = useDialog();
  const { objectMetadataItems } = useObjectMetadataItems();
  const { updateValidationRule, deleteValidationRule, isSaving, isDeleting } =
    useValidationRuleMutations({ objectMetadataId: objectMetadataItem.id });

  const [values, setValues] = useState<ValidationRuleFormValues>({
    expression: validationRule.expression,
    message: validationRule.message,
    errorFieldMetadataId: validationRule.errorFieldMetadataId ?? null,
    isActive: validationRule.isActive,
  });

  const fields = buildValidationRuleFieldDescriptors({
    objectMetadataItem,
    objectMetadataItems,
  });

  const objectNamePlural = objectMetadataItem.namePlural;

  const handleSave = async () => {
    try {
      await updateValidationRule({
        variables: { input: { id: validationRule.id, update: values } },
      });
      enqueueToast({ variant: 'success', children: t`Rule updated.` });
      navigate(
        SettingsPath.ObjectDetail,
        { objectNamePlural },
        undefined,
        undefined,
        OBJECT_SETTINGS_TAB_HASH,
      );
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
      navigate(
        SettingsPath.ObjectDetail,
        { objectNamePlural },
        undefined,
        undefined,
        OBJECT_SETTINGS_TAB_HASH,
      );
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
    <SettingsPageLayout
      title={t`Edit rule`}
      links={[
        {
          children: <Trans>Workspace</Trans>,
          href: getSettingsPath(SettingsPath.General),
        },
        {
          children: <Trans>Objects</Trans>,
          href: getSettingsPath(SettingsPath.Objects),
        },
        {
          children: objectMetadataItem.labelPlural,
          href: getSettingsPath(
            SettingsPath.ObjectDetail,
            { objectNamePlural },
            undefined,
            OBJECT_SETTINGS_TAB_HASH,
          ),
        },
        { children: <Trans>Edit rule</Trans> },
      ]}
      actionButton={
        <SaveAndCancelButtons
          onSave={handleSave}
          onCancel={() =>
            navigate(
              SettingsPath.ObjectDetail,
              { objectNamePlural },
              undefined,
              undefined,
              OBJECT_SETTINGS_TAB_HASH,
            )
          }
          isSaveDisabled={!isValidationRuleFormSubmittable({ values, fields })}
          isLoading={isSaving}
        />
      }
    >
      <SettingsPageContainer>
        <SettingsValidationRuleForm
          objectMetadataItem={objectMetadataItem}
          fields={fields}
          values={values}
          onChange={setValues}
        />
        <Section.Root>
          <Section.Header
            title={t`Danger zone`}
            description={t`Records will no longer be checked against this rule.`}
          />
          <Button
            startIcon={<IconTrash />}
            size="sm"
            disabled={isDeleting}
            onClick={() => openDialog(DELETE_VALIDATION_RULE_MODAL_ID)}
            variant="outline"
            color="danger"
          >{t`Delete rule`}</Button>
          <ConfirmationDialog
            dialogId={DELETE_VALIDATION_RULE_MODAL_ID}
            title={t`Delete this rule?`}
            subtitle={t`Records will no longer be checked against it. Existing records are not changed.`}
            confirmButtonText={t`Delete`}
            loading={isDeleting}
            onConfirmClick={handleDelete}
          />
        </Section.Root>
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
