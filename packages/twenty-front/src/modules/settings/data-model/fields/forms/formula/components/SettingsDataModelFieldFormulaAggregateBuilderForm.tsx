import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import {
  type FieldMetadataType,
  type FormulaAggregateFunctionName,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconPlus } from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { type SettingsDataModelFieldFormulaFormValues } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaForm';
import { SettingsDataModelFieldFormulaAggregateConditionRow } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaAggregateConditionRow';
import { FORMULA_AGGREGATE_FUNCTION_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/formula/constants/FormulaAggregateFunctionSelectOptions';
import { type FormulaAggregateBuilderState } from '@/settings/data-model/fields/forms/formula/types/FormulaAggregateBuilderState';
import { buildFormulaAggregateExpression } from '@/settings/data-model/fields/forms/formula/utils/buildFormulaAggregateExpression';
import { getFormulaAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregatableFieldMetadataItems';
import { getFormulaAggregateConditionForFieldMetadataItem } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateConditionForFieldMetadataItem';
import { getFormulaAggregatedFieldNameForFunction } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregatedFieldNameForFunction';
import { getFormulaAggregateFilterableFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateFilterableFieldMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { useCloseDropdown } from '@/ui/layout/dropdown/hooks/useCloseDropdown';

const StyledFields = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${themeCssVariables.spacing[2]};
  padding: ${themeCssVariables.spacing[2]};
`;

const StyledFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: ${themeCssVariables.spacing[1]};
`;

type SettingsDataModelFieldFormulaAggregateBuilderFormProps = {
  fieldType: FieldMetadataType;
  functionNames: FormulaAggregateFunctionName[];
  relationFieldMetadataItems: (FieldMetadataItem & {
    relation: NonNullable<FieldMetadataItem['relation']>;
  })[];
};

export const SettingsDataModelFieldFormulaAggregateBuilderForm = ({
  fieldType,
  functionNames,
  relationFieldMetadataItems,
}: SettingsDataModelFieldFormulaAggregateBuilderFormProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { closeDropdown } = useCloseDropdown();
  const { setValue } =
    useFormContext<SettingsDataModelFieldFormulaFormValues>();
  const { objectMetadataItems } = useObjectMetadataItems();

  const getRelatedFieldMetadataItems = (relationFieldName: string) =>
    objectMetadataItems.find(
      ({ id }) =>
        id ===
        relationFieldMetadataItems.find(
          ({ name }) => name === relationFieldName,
        )?.relation.targetObjectMetadata.id,
    )?.fields ?? [];

  const [builderState, setBuilderState] =
    useState<FormulaAggregateBuilderState>(() => {
      const relationFieldName = relationFieldMetadataItems[0]?.name ?? '';
      const functionName = functionNames[0] ?? 'count';

      return {
        relationFieldName,
        functionName,
        aggregatedFieldName: getFormulaAggregatedFieldNameForFunction({
          functionName,
          fieldType,
          relatedFieldMetadataItems:
            getRelatedFieldMetadataItems(relationFieldName),
        }),
        conditions: [],
      };
    });

  const relatedFieldMetadataItems = getRelatedFieldMetadataItems(
    builderState.relationFieldName,
  );
  const aggregatableFieldMetadataItems =
    getFormulaAggregatableFieldMetadataItems({
      fieldMetadataItems: relatedFieldMetadataItems,
      functionName: builderState.functionName,
      fieldType,
    });
  const filterableFieldMetadataItems =
    getFormulaAggregateFilterableFieldMetadataItems(relatedFieldMetadataItems);
  const expression = buildFormulaAggregateExpression({
    builderState,
    relatedFieldMetadataItems,
  });

  const handleRelationChange = (relationFieldName: string) =>
    setBuilderState({
      ...builderState,
      relationFieldName,
      aggregatedFieldName: getFormulaAggregatedFieldNameForFunction({
        functionName: builderState.functionName,
        fieldType,
        relatedFieldMetadataItems:
          getRelatedFieldMetadataItems(relationFieldName),
      }),
      conditions: [],
    });

  const handleFunctionChange = (functionName: FormulaAggregateFunctionName) =>
    setBuilderState({
      ...builderState,
      functionName,
      aggregatedFieldName: getFormulaAggregatedFieldNameForFunction({
        functionName,
        fieldType,
        currentAggregatedFieldName: builderState.aggregatedFieldName,
        relatedFieldMetadataItems,
      }),
    });

  const handleAddCondition = () => {
    const [firstFilterableFieldMetadataItem] = filterableFieldMetadataItems;

    if (!isDefined(firstFilterableFieldMetadataItem)) {
      return;
    }

    setBuilderState({
      ...builderState,
      conditions: [
        ...builderState.conditions,
        getFormulaAggregateConditionForFieldMetadataItem({
          conditionId: v4(),
          fieldMetadataItem: firstFilterableFieldMetadataItem,
        }),
      ],
    });
  };

  const handleInsert = () => {
    if (!isDefined(expression)) {
      return;
    }

    setValue('formula', expression, { shouldDirty: true });
    closeDropdown();
  };

  return (
    <>
      <Dropdown.Section>
        <StyledFields>
          <Select<string>
            dropdownId="formula-aggregate-relation"
            label={t`Relation`}
            selectSizeVariant="small"
            fullWidth
            needIconCheck={false}
            value={builderState.relationFieldName}
            onChange={handleRelationChange}
            options={relationFieldMetadataItems.map((relationField) => ({
              Icon: getIcon(relationField.icon),
              label: relationField.label,
              value: relationField.name,
            }))}
          />
          <Select<FormulaAggregateFunctionName>
            dropdownId="formula-aggregate-function"
            label={t`Calculation`}
            selectSizeVariant="small"
            fullWidth
            needIconCheck={false}
            value={builderState.functionName}
            onChange={handleFunctionChange}
            options={FORMULA_AGGREGATE_FUNCTION_SELECT_OPTIONS.filter(
              ({ value }) => functionNames.includes(value),
            ).map((option) => ({ ...option, label: t(option.label) }))}
          />
          {builderState.functionName !== 'count' && (
            <Select<string>
              dropdownId="formula-aggregate-field"
              label={t`Field`}
              selectSizeVariant="small"
              fullWidth
              needIconCheck={false}
              value={builderState.aggregatedFieldName ?? ''}
              onChange={(aggregatedFieldName) =>
                setBuilderState({ ...builderState, aggregatedFieldName })
              }
              options={aggregatableFieldMetadataItems.map((field) => ({
                Icon: getIcon(field.icon),
                label: field.label,
                value: field.name,
              }))}
            />
          )}
        </StyledFields>
      </Dropdown.Section>
      {filterableFieldMetadataItems.length > 0 && (
        <>
          <Dropdown.Separator />
          <Dropdown.Section label={t`Conditions`}>
            {builderState.conditions.length > 0 && (
              <StyledFields>
                {builderState.conditions.map((condition) => (
                  <SettingsDataModelFieldFormulaAggregateConditionRow
                    key={condition.id}
                    condition={condition}
                    filterableFieldMetadataItems={filterableFieldMetadataItems}
                    onChange={(updatedCondition) =>
                      setBuilderState({
                        ...builderState,
                        conditions: builderState.conditions.map(
                          (existingCondition) =>
                            existingCondition.id === updatedCondition.id
                              ? updatedCondition
                              : existingCondition,
                        ),
                      })
                    }
                    onRemove={() =>
                      setBuilderState({
                        ...builderState,
                        conditions: builderState.conditions.filter(
                          ({ id }) => id !== condition.id,
                        ),
                      })
                    }
                  />
                ))}
              </StyledFields>
            )}
            <LightButton
              startIcon={<IconPlus />}
              fullWidth
              onClick={handleAddCondition}
            >{t`Add condition`}</LightButton>
          </Dropdown.Section>
        </>
      )}
      <Dropdown.Separator />
      <StyledFooter>
        <Button
          color="accent"
          variant="solid"
          size="sm"
          disabled={!isDefined(expression)}
          onClick={handleInsert}
        >{t`Insert`}</Button>
      </StyledFooter>
    </>
  );
};
