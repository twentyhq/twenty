import { Controller, useFormContext } from 'react-hook-form';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { Separator } from '@/settings/components/Separator';
import {
  StyledSettingsCardContent,
  StyledSettingsCardDescription,
  StyledSettingsCardIcon,
  StyledSettingsCardTextContainer,
  StyledSettingsCardTitle,
} from '@/settings/components/SettingsOptions/SettingsCardContentBase';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsOptionCardContentToggle } from '@/settings/components/SettingsOptions/SettingsOptionCardContentToggle';
import { SettingsOptionIconCustomizer } from '@/settings/components/SettingsOptions/SettingsOptionIconCustomizer';
import { TEXT_DATA_MODEL_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/components/text/constants/TextDataModelSelectOptions';
import { TextInput } from '@/ui/input/components/TextInput';
import { Select } from '@/ui/input/components/Select';
import { useLingui } from '@lingui/react/macro';
import { styled } from '@linaria/react';
import { useState } from 'react';
import { IconCode, IconTextWrap } from 'twenty-ui/display';
import { themeCssVariables } from 'twenty-ui/theme-constants';
import { z } from 'zod';

type SettingsDataModelFieldTextFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

const textFieldDefaultValueSchema = z
  .object({
    displayedMaxRows: z.number().nullable(),
    validationPattern: z.string().optional(),
    validationErrorMessage: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.validationPattern) {
      try {
        new RegExp(data.validationPattern);
      } catch {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          path: ['validationPattern'],
          message: 'Invalid regular expression',
        });
      }
    }
  });

export const settingsDataModelFieldTextFormSchema = z.object({
  settings: textFieldDefaultValueSchema,
});

export type SettingsDataModelFieldTextFormValues = z.infer<
  typeof settingsDataModelFieldTextFormSchema
>;

const StyledValidationContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  margin-top: ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledInputRow = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

export const SettingsDataModelFieldTextForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldTextFormProps) => {
  const { t } = useLingui();

  const { fieldMetadataItem: existingFieldMetadataItem } =
    useFieldMetadataItemById(existingFieldMetadataId);

  const {
    control,
    formState: { errors },
  } = useFormContext<SettingsDataModelFieldTextFormValues>();
  const patternError = errors.settings?.validationPattern?.message;

  const [validationEnabled, setValidationEnabled] = useState(
    !!existingFieldMetadataItem?.settings?.validationPattern,
  );

  return (
    <Controller
      name="settings"
      defaultValue={{
        displayedMaxRows:
          existingFieldMetadataItem?.settings?.displayedMaxRows || 0,
        validationPattern:
          existingFieldMetadataItem?.settings?.validationPattern ?? '',
        validationErrorMessage:
          existingFieldMetadataItem?.settings?.validationErrorMessage ?? '',
      }}
      control={control}
      render={({ field: { onChange, value } }) => {
        const displayedMaxRows = value?.displayedMaxRows ?? 0;
        const validationPattern = value?.validationPattern ?? '';
        const validationErrorMessage = value?.validationErrorMessage ?? '';

        const handleToggle = (enabled: boolean) => {
          setValidationEnabled(enabled);
          if (!enabled) {
            onChange({
              ...value,
              validationPattern: '',
              validationErrorMessage: '',
            });
          }
        };

        return (
          <>
            <SettingsOptionCardContentSelect
              Icon={IconTextWrap}
              title={t`Wrap on record pages`}
              description={t`Display text on multiple lines`}
            >
              <Select<number>
                dropdownId="text-wrap"
                value={displayedMaxRows}
                onChange={(newValue) =>
                  onChange({
                    ...value,
                    displayedMaxRows: newValue,
                  })
                }
                disabled={disabled}
                options={TEXT_DATA_MODEL_SELECT_OPTIONS.map((option) => ({
                  ...option,
                  label: t(option.label),
                }))}
                selectSizeVariant="small"
              />
            </SettingsOptionCardContentSelect>
            <Separator />
            <SettingsOptionCardContentToggle
              Icon={IconCode}
              title={t`Validation pattern`}
              description={t`Require values to match a regex`}
              checked={validationEnabled}
              onChange={handleToggle}
              disabled={disabled}
            />
            {validationEnabled && (
              <StyledSettingsCardContent alignItems="flex-start">
                <StyledSettingsCardIcon>
                  <SettingsOptionIconCustomizer Icon={IconCode} />
                </StyledSettingsCardIcon>
                <StyledSettingsCardTextContainer>
                  <StyledSettingsCardTitle>{t`Pattern & error message`}</StyledSettingsCardTitle>
                  <StyledSettingsCardDescription>
                    {t`Regex the field value must match`}
                  </StyledSettingsCardDescription>
                  <StyledValidationContainer>
                    <StyledInputRow>
                      <TextInput
                        value={validationPattern}
                        onChange={(newValue) =>
                          onChange({
                            ...value,
                            validationPattern: newValue,
                          })
                        }
                        placeholder="^[A-Z0-9]+$"
                        disabled={disabled}
                        error={patternError}
                        fullWidth
                      />
                    </StyledInputRow>
                    <StyledInputRow>
                      <TextInput
                        value={validationErrorMessage}
                        onChange={(newValue) =>
                          onChange({
                            ...value,
                            validationErrorMessage: newValue,
                          })
                        }
                        placeholder={t`Custom error message (optional)`}
                        disabled={disabled}
                        fullWidth
                      />
                    </StyledInputRow>
                  </StyledValidationContainer>
                </StyledSettingsCardTextContainer>
              </StyledSettingsCardContent>
            )}
          </>
        );
      }}
    />
  );
};
