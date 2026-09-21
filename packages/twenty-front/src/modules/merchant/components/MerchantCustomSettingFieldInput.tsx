import { useRef } from 'react';

import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { Button, Checkbox, type SelectOption } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme-constants';

import {
  type CustomSettingFieldSchemaEntry,
  type CustomSettingValue,
} from '@/merchant/types/CustomSettingSchema';
import { isCustomSettingFileValue } from '@/merchant/utils/customSettingValueTransforms';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { DropdownMenuInnerSelect } from '@/ui/layout/dropdown/components/DropdownMenuInnerSelect';
import { isDefined } from 'twenty-shared/utils';

const NO_SELECT_VALUE = '';

// Shared row layout for every place that renders custom-setting fields
// (settings section AND tool blocks) — one template so labels always align.
export const StyledCustomSettingFieldGrid = styled.div`
  column-gap: ${themeCssVariables.spacing[4]};
  display: grid;
  grid-template-columns: minmax(100px, 140px) 1fr;
  row-gap: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

export const StyledCustomSettingFieldLabel = styled.div`
  align-items: center;
  display: flex;
  min-height: 32px;
`;

// Grid items default to min-width auto — without this, wide content (a long
// uploaded file name) stretches the value column past the modal and forces a
// horizontal scrollbar.
export const StyledCustomSettingFieldCell = styled.div`
  min-width: 0;
`;

const StyledNativeInput = styled.input`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  height: 32px;
  padding: 0 ${themeCssVariables.spacing[2]};
  width: 100%;
`;

const StyledNativeTextarea = styled.textarea`
  background: ${themeCssVariables.background.primary};
  border: 1px solid ${themeCssVariables.border.color.medium};
  border-radius: ${themeCssVariables.border.radius.sm};
  box-sizing: border-box;
  color: ${themeCssVariables.font.color.primary};
  font-family: inherit;
  font-size: ${themeCssVariables.font.size.md};
  min-height: 72px;
  padding: ${themeCssVariables.spacing[2]};
  resize: vertical;
  width: 100%;
`;

const StyledFileRow = styled.div`
  align-items: center;
  display: flex;
  gap: ${themeCssVariables.spacing[2]};
  min-width: 0;
`;

const StyledHiddenFileInput = styled.input`
  display: none;
`;

const StyledFileLink = styled.a`
  color: ${themeCssVariables.font.color.primary};
  font-size: ${themeCssVariables.font.size.md};
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

type MerchantCustomSettingFieldInputProps = {
  entry: CustomSettingFieldSchemaEntry;
  value: CustomSettingValue | undefined;
  instanceIdPrefix: string;
  isUploading?: boolean;
  onChange: (value: CustomSettingValue) => void;
  onFileSelected?: (file: File | undefined) => void;
};

export const MerchantCustomSettingFieldInput = ({
  entry,
  value,
  instanceIdPrefix,
  isUploading = false,
  onChange,
  onFileSelected,
}: MerchantCustomSettingFieldInputProps) => {
  const { t } = useLingui();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const currentValue = String(value ?? '');
  const currentFileValue = isCustomSettingFileValue(value) ? value : undefined;

  if (entry.type === 'BOOLEAN') {
    return (
      <Checkbox
        checked={Boolean(value)}
        onCheckedChange={(checked) => onChange(checked)}
      />
    );
  }

  if (entry.type === 'SELECT') {
    const selectOptions: SelectOption[] = [
      { label: t`None`, value: NO_SELECT_VALUE },
      ...(entry.options ?? []).map((option) => ({
        label: option,
        value: option,
      })),
    ];
    const selectedOption =
      selectOptions.find((option) => option.value === currentValue) ??
      selectOptions[0];

    return (
      <DropdownMenuInnerSelect
        dropdownId={`${instanceIdPrefix}-select-${entry.key}`}
        options={selectOptions}
        selectedOption={selectedOption}
        isDropdownInModal
        onChange={(option) => onChange(option.value as string)}
      />
    );
  }

  if (entry.type === 'DATE' || entry.type === 'NUMBER') {
    return (
      <StyledNativeInput
        type={entry.type === 'DATE' ? 'date' : 'number'}
        value={currentValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (entry.type === 'RICH_TEXT') {
    return (
      <StyledNativeTextarea
        value={currentValue}
        onChange={(event) => onChange(event.target.value)}
      />
    );
  }

  if (entry.type === 'FILE') {
    return (
      <StyledFileRow>
        <StyledHiddenFileInput
          ref={fileInputRef}
          type="file"
          onChange={(event) => {
            onFileSelected?.(event.target.files?.[0]);
            // Same file re-selected after a failed upload should fire again.
            event.target.value = '';
          }}
        />
        <Button
          onClick={() => fileInputRef.current?.click()}
          title={isUploading ? t`Uploading...` : t`Choose file`}
          variant="secondary"
          size="small"
          disabled={isUploading}
        />
        {isDefined(currentFileValue) && (
          <StyledFileLink
            href={currentFileValue.url}
            target="_blank"
            rel="noreferrer"
          >
            {currentFileValue.label}
          </StyledFileLink>
        )}
      </StyledFileRow>
    );
  }

  return (
    <SettingsTextInput
      instanceId={`${instanceIdPrefix}-${entry.key}`}
      value={currentValue}
      onChange={(newValue) => onChange(newValue ?? '')}
      placeholder={
        entry.type === 'ARRAY' ? t`Comma-separated values` : entry.label
      }
      disableHotkeys
      fullWidth
    />
  );
};
