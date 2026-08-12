import { useUpdateOneFieldMetadataItem } from '@/object-metadata/hooks/useUpdateOneFieldMetadataItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getActiveFieldMetadataItems } from '@/object-metadata/utils/getActiveFieldMetadataItems';
import {
  formatLabelIdentifierFormulaForInput,
  isFieldMetadataItemEligibleForLabelIdentifierFormula,
  parseLabelIdentifierFormulaInput,
} from '@/settings/data-model/objects/utils/labelIdentifierFormula';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { styled } from '@linaria/react';
import { t } from '@lingui/core/macro';
import { useEffect, useMemo, useState } from 'react';
import {
  type FieldMetadataSettingsMapping,
  FieldMetadataType,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { themeCssVariables } from 'twenty-ui/theme-constants';

const StyledContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[1]};
  width: 100%;
`;

const StyledHelpText = styled.span`
  color: ${themeCssVariables.font.color.tertiary};
  font-size: ${themeCssVariables.font.size.xs};
`;

type SettingsDataModelObjectLabelFormulaFormProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  readonly: boolean;
};

export const SettingsDataModelObjectLabelFormulaForm = ({
  objectMetadataItem,
  readonly,
}: SettingsDataModelObjectLabelFormulaFormProps) => {
  const labelIdentifierFieldMetadataItem = objectMetadataItem.fields.find(
    ({ id }) => id === objectMetadataItem.labelIdentifierFieldMetadataId,
  );

  const textSettings = labelIdentifierFieldMetadataItem?.settings as
    | FieldMetadataSettingsMapping[FieldMetadataType.TEXT]
    | null
    | undefined;

  const eligibleFieldMetadataItems = useMemo(
    () =>
      getActiveFieldMetadataItems(objectMetadataItem).filter(
        (fieldMetadataItem) =>
          fieldMetadataItem.id !== labelIdentifierFieldMetadataItem?.id &&
          isFieldMetadataItemEligibleForLabelIdentifierFormula(
            fieldMetadataItem,
          ),
      ),
    [labelIdentifierFieldMetadataItem?.id, objectMetadataItem],
  );

  const formattedFormula = formatLabelIdentifierFormulaForInput({
    fieldMetadataItems: eligibleFieldMetadataItems,
    formula: textSettings?.labelIdentifierFormula,
  });
  const [formulaInput, setFormulaInput] = useState(formattedFormula);
  const [formulaError, setFormulaError] = useState<string>();
  const { updateOneFieldMetadataItem } = useUpdateOneFieldMetadataItem();

  useEffect(() => {
    setFormulaInput(formattedFormula);
    setFormulaError(undefined);
  }, [formattedFormula]);

  if (
    !isDefined(labelIdentifierFieldMetadataItem) ||
    labelIdentifierFieldMetadataItem.type !== FieldMetadataType.TEXT
  ) {
    return null;
  }

  const saveFormula = async () => {
    const parseResult = parseLabelIdentifierFormulaInput({
      fieldMetadataItems: eligibleFieldMetadataItems,
      formulaInput,
    });

    if (parseResult.status === 'invalid') {
      setFormulaError(parseResult.error);
      return;
    }

    const nextSettings = { ...(textSettings ?? {}) };

    if (parseResult.status === 'disabled') {
      delete nextSettings.labelIdentifierFormula;
    } else {
      nextSettings.labelIdentifierFormula = parseResult.formula;
    }

    if (JSON.stringify(nextSettings) === JSON.stringify(textSettings ?? {})) {
      setFormulaError(undefined);
      return;
    }

    const result = await updateOneFieldMetadataItem({
      objectMetadataId: objectMetadataItem.id,
      fieldMetadataIdToUpdate: labelIdentifierFieldMetadataItem.id,
      updatePayload: {
        settings: Object.keys(nextSettings).length > 0 ? nextSettings : null,
      },
    });

    if (result.status === 'successful') {
      setFormulaError(undefined);
    }
  };

  const availableFieldNames = eligibleFieldMetadataItems
    .map(({ name }) => name)
    .join(', ');

  return (
    <StyledContainer>
      <SettingsTextInput
        instanceId={`${objectMetadataItem.id}-record-label-formula`}
        label={t`Record label formula`}
        placeholder="{cohort} - {person}"
        value={formulaInput}
        onChange={(value) => {
          setFormulaInput(value);
          setFormulaError(undefined);
        }}
        onBlur={saveFormula}
        onInputEnter={saveFormula}
        disabled={readonly}
        error={formulaError}
        fullWidth
      />
      <StyledHelpText>
        {t`Use field API names in braces. Use ?? for a fallback. Clear the formula to enter labels manually.`}{' '}
        {t`Available fields:`} {availableFieldNames || t`None`}
      </StyledHelpText>
    </StyledContainer>
  );
};
