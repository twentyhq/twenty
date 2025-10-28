import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { validateCustomDateFormat } from '@/localization/utils/validateCustomDateFormat';
import { FieldDateDisplayFormat } from '@/object-record/record-field/ui/types/FieldMetadata';
import { isDateFieldCustomDisplayFormat } from '@/object-record/record-field/ui/types/guards/isDateFIeldCustomDisplayFormat';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { ADVANCED_SETTINGS_ANIMATION_DURATION } from '@/settings/constants/AdvancedSettingsAnimationDurations';
import { useDateSettingsFormInitialValues } from '@/settings/data-model/fields/forms/date/hooks/useDateSettingsFormInitialValues';
import { getDisplayFormatLabel } from '@/settings/data-model/fields/forms/date/utils/getDisplayFormatLabel';
import { getDisplayFormatSelectDescription } from '@/settings/data-model/fields/forms/date/utils/getDisplayFormatSelectDescription';
import { Select } from '@/ui/input/components/Select';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { IconSlash } from 'twenty-ui/display';
import { AnimatedExpandableContainer } from 'twenty-ui/layout';

const fieldDateSettings = z.discriminatedUnion('displayFormat', [
  z.object({
    displayFormat: z.enum([
      FieldDateDisplayFormat.RELATIVE,
      FieldDateDisplayFormat.USER_SETTINGS,
    ]),
  }),
  z.object({
    displayFormat: z.literal(FieldDateDisplayFormat.CUSTOM),
    customUnicodeDateFormat: z.string().refine(validateCustomDateFormat),
  }),
]);

export const settingsDataModelFieldDateFormSchema = z.object({
  settings: fieldDateSettings.optional(),
});

const StyledTextInput = styled(SettingsTextInput)`
  padding: ${({ theme }) => theme.spacing(4)};
  padding-top: 0;
`;

export type SettingsDataModelFieldDateFormValues = z.infer<
  typeof settingsDataModelFieldDateFormSchema
>;

type SettingsDataModelFieldDateFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
};

export const SettingsDataModelFieldDateForm = ({
  disabled,
  existingFieldMetadataId,
}: SettingsDataModelFieldDateFormProps) => {
  const { t } = useLingui();

  const { control, watch } =
    useFormContext<SettingsDataModelFieldDateFormValues>();

  const { initialDisplayFormat, initialCustomUnicodeDateFormat } =
    useDateSettingsFormInitialValues({
      fieldMetadataId: existingFieldMetadataId,
    });

  const displayFormatFromForm = watch('settings.displayFormat');

  const activeDisplayFormat = displayFormatFromForm
    ? displayFormatFromForm
    : initialDisplayFormat;

  const showCustomFormatTextInput =
    isDateFieldCustomDisplayFormat(activeDisplayFormat);

  const displayFormatSelectDescription =
    getDisplayFormatSelectDescription(activeDisplayFormat);

  return (
    <>
      <Controller
        name="settings.displayFormat"
        control={control}
        defaultValue={initialDisplayFormat}
        render={({ field: { onChange, value } }) => (
          <SettingsOptionCardContentSelect
            Icon={IconSlash}
            title={t`Display Format`}
            disabled={disabled}
            description={displayFormatSelectDescription}
          >
            <Select<FieldDateDisplayFormat>
              disabled={disabled}
              selectSizeVariant="small"
              dropdownWidth={120}
              dropdownId="selectFieldDateDisplayFormat"
              value={value}
              onChange={onChange}
              options={Object.keys(FieldDateDisplayFormat).map((key) => {
                return {
                  label: getDisplayFormatLabel(key as FieldDateDisplayFormat),
                  value: key as FieldDateDisplayFormat,
                };
              })}
            />
          </SettingsOptionCardContentSelect>
        )}
      />
      <AnimatedExpandableContainer
        isExpanded={showCustomFormatTextInput}
        dimension="height"
        animationDurations={ADVANCED_SETTINGS_ANIMATION_DURATION}
        mode="scroll-height"
        containAnimation={false}
      >
        <Controller
          name="settings.customUnicodeDateFormat"
          control={control}
          defaultValue={initialCustomUnicodeDateFormat}
          render={({ field: { onChange, value } }) => (
            <StyledTextInput
              instanceId="custom-date-format-input"
              placeholder={t`Format e.g. d-MMM-y (qqq''yy)`}
              value={value}
              onChange={(value) => onChange(value)}
              disabled={false}
              fullWidth
            />
          )}
        />
      </AnimatedExpandableContainer>
    </>
  );
};
