import { AppChip } from '@/applications/components/AppChip';
import { SettingsAppPreferencesVariableInput } from '@/settings/app-preferences/components/SettingsAppPreferencesVariableInput';
import { type AppPreferencesApplication } from '@/settings/app-preferences/types/AppPreferencesApplication';
import { type AppPreferenceVariable } from '@/settings/app-preferences/types/AppPreferenceVariable';
import { getAppPreferenceVariableError } from '@/settings/app-preferences/utils/getAppPreferenceVariableError';
import { getAppPreferenceVariableUpdates } from '@/settings/app-preferences/utils/getAppPreferenceVariableUpdates';
import { SaveAndCancelButtons } from '@/settings/components/SaveAndCancelButtons/SaveAndCancelButtons';
import { SettingsPageContainer } from '@/settings/components/SettingsPageContainer';
import { SettingsPageLayout } from '@/settings/components/layout/SettingsPageLayout';
import { FormFieldInputContainer } from '@/ui/input/components/FormFieldInputContainer';
import { useMutation } from '@apollo/client/react';
import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type ReactNode, useId, useState } from 'react';
import { SettingsPath } from 'twenty-shared/types';
import { getSettingsPath, isDefined } from 'twenty-shared/utils';
import { InlineBanner, useToast } from 'twenty-ui/components/feedback';
import { Section } from 'twenty-ui/components/layout';
import { Pill } from 'twenty-ui/primitives/data-display';
import { Field } from 'twenty-ui/primitives/input';
import { UpdateMyUserApplicationVariableDocument } from '~/generated-metadata/graphql';
import { getApplicationVariableDisplayLabel } from '~/pages/settings/applications/utils/getApplicationVariableDisplayLabel';
import { shouldDisplayVariable } from '~/pages/settings/applications/utils/shouldDisplayVariable';

type SettingsAppPreferencesApplicationFormProps = {
  application: AppPreferencesApplication;
  applicationVariables: AppPreferenceVariable[];
  onRefetch: () => Promise<unknown>;
  children?: ReactNode;
};

export const SettingsAppPreferencesApplicationForm = ({
  application,
  applicationVariables,
  onRefetch,
  children,
}: SettingsAppPreferencesApplicationFormProps) => {
  const { t } = useLingui();
  const { enqueueToast } = useToast();
  const fieldId = useId();
  const [draftValueByKey, setDraftValueByKey] = useState<
    Record<string, string>
  >({});
  const [inputResetVersion, setInputResetVersion] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string>();
  const [updateMyUserApplicationVariable] = useMutation(
    UpdateMyUserApplicationVariableDocument,
  );
  const displayedVariables = applicationVariables.filter((variable) =>
    shouldDisplayVariable({
      isDeprecated: variable.isDeprecated,
      hasValue: isNonEmptyString(variable.value),
    }),
  );
  const updates = getAppPreferenceVariableUpdates({
    applicationVariables: displayedVariables,
    draftValueByKey,
  });
  const validationMessages = {
    REQUIRED: t`This preference is required.`,
    INVALID_NUMBER: t`Enter a valid number.`,
    INVALID_BOOLEAN: t`Choose true or false.`,
    INVALID_OPTION: t`Choose one of the available options.`,
  };
  const hasValidationErrors = displayedVariables.some((variable) =>
    isDefined(
      getAppPreferenceVariableError({
        variable,
        value: draftValueByKey[variable.key] ?? variable.value,
      }),
    ),
  );

  const handleCancel = () => {
    setDraftValueByKey({});
    setSaveError(undefined);
    setInputResetVersion((previousVersion) => previousVersion + 1);
  };

  const handleSave = async () => {
    if (isSaving || hasValidationErrors || updates.length === 0) {
      return;
    }

    setIsSaving(true);
    setSaveError(undefined);

    try {
      const results = await Promise.allSettled(
        updates.map(({ key, value }) =>
          updateMyUserApplicationVariable({
            variables: {
              applicationUniversalIdentifier: application.universalIdentifier,
              key,
              value,
            },
          }),
        ),
      );

      await onRefetch();

      const savedKeys = updates
        .filter((_, index) => {
          const result = results[index];

          return (
            result.status === 'fulfilled' &&
            result.value.data?.updateMyUserApplicationVariable === true
          );
        })
        .map(({ key }) => key);

      setDraftValueByKey((previousDraftValues) =>
        Object.fromEntries(
          Object.entries(previousDraftValues).filter(
            ([key]) => !savedKeys.includes(key),
          ),
        ),
      );
      setInputResetVersion((previousVersion) => previousVersion + 1);

      if (savedKeys.length !== updates.length) {
        setSaveError(t`Some preferences could not be saved. Try again.`);
      } else {
        enqueueToast({ variant: 'success', children: t`Preferences saved.` });
      }
    } catch {
      setSaveError(t`Unable to save preferences. Try again.`);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <SettingsPageLayout
      title={application.name}
      icon={
        <AppChip
          applicationId={application.id}
          logoUrl={application.logoUrl}
          fallbackApplicationData={{ name: application.name }}
          size="md"
          chipOnly
        />
      }
      links={[
        {
          children: t`Apps`,
          href: getSettingsPath(SettingsPath.AppPreferences),
        },
        { children: application.name },
      ]}
      actionButton={
        updates.length > 0 ? (
          <SaveAndCancelButtons
            onSave={handleSave}
            onCancel={handleCancel}
            isLoading={isSaving}
            isSaveDisabled={hasValidationErrors || isSaving}
            isCancelDisabled={isSaving}
          />
        ) : undefined
      }
    >
      <SettingsPageContainer>
        {isDefined(saveError) && (
          <InlineBanner color="danger" variant="compact" message={saveError} />
        )}
        {children}
        {displayedVariables.length === 0 && !isDefined(children) && (
          <InlineBanner
            color="blue"
            variant="compact"
            message={t`This app has no personal preferences to configure.`}
          />
        )}
        {displayedVariables.map((variable) => {
          const value = draftValueByKey[variable.key] ?? variable.value;
          const error = getAppPreferenceVariableError({ variable, value });
          const label = getApplicationVariableDisplayLabel(variable);
          const labelId = `${fieldId}-${variable.key}`;

          return (
            <Section.Root key={variable.key}>
              <Section.Header
                title={<span id={labelId}>{label}</span>}
                description={variable.description}
                adornment={
                  variable.isDeprecated ? (
                    <Pill label={t`Deprecated`} />
                  ) : variable.isRequired ? (
                    <Pill label={t`Required`} />
                  ) : undefined
                }
              />
              <div role="group" aria-labelledby={labelId}>
                <FormFieldInputContainer>
                  <SettingsAppPreferencesVariableInput
                    key={inputResetVersion}
                    variable={variable}
                    value={value}
                    disabled={isSaving}
                    onChange={(newValue) => {
                      setSaveError(undefined);
                      setDraftValueByKey((previousDraftValues) => ({
                        ...previousDraftValues,
                        [variable.key]: newValue,
                      }));
                    }}
                  />
                  {isDefined(error) && (
                    <Field.Error match>{validationMessages[error]}</Field.Error>
                  )}
                </FormFieldInputContainer>
              </div>
            </Section.Root>
          );
        })}
      </SettingsPageContainer>
    </SettingsPageLayout>
  );
};
