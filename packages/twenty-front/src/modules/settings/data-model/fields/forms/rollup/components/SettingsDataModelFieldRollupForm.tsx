import { Controller, useFormContext } from 'react-hook-form';
import { z } from 'zod';

import { useFieldMetadataItemById } from '@/object-metadata/hooks/useFieldMetadataItemById';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { SettingsCardSeparator } from '@/settings/components/SettingsCardSeparator';
import { SettingsOptionCardContentSelect } from '@/settings/components/SettingsOptions/SettingsOptionCardContentSelect';
import { SettingsDataModelFieldRollupFilterRow } from '@/settings/data-model/fields/forms/rollup/components/SettingsDataModelFieldRollupFilterRow';
import { ROLLUP_AGGREGATE_OPERATION_SELECT_OPTIONS } from '@/settings/data-model/fields/forms/rollup/constants/RollupAggregateOperationSelectOptions';
import { getRollupAggregatableFieldMetadataItems } from '@/settings/data-model/fields/forms/rollup/utils/getRollupAggregatableFieldMetadataItems';
import { getRollupAggregatedFieldMetadataIdForOperation } from '@/settings/data-model/fields/forms/rollup/utils/getRollupAggregatedFieldMetadataIdForOperation';
import { getRollupFilterForFieldMetadataItem } from '@/settings/data-model/fields/forms/rollup/utils/getRollupFilterForFieldMetadataItem';
import { getRollupFilterableFieldMetadataItems } from '@/settings/data-model/fields/forms/rollup/utils/getRollupFilterableFieldMetadataItems';
import { getRollupRelationFieldMetadataItems } from '@/settings/data-model/fields/forms/rollup/utils/getRollupRelationFieldMetadataItems';
import { Select } from '@/ui/input/components/Select';
import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { ROLLUP_AGGREGATE_OPERATIONS } from 'twenty-shared/constants';
import {
  AggregateOperations,
  type RollupAggregateOperation,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { LightButton } from 'twenty-ui/components/input';
import {
  IconFilter,
  IconPlus,
  IconRelationOneToMany,
  IconSum,
} from 'twenty-ui/icon';
import { useIcons } from 'twenty-ui/icon/provider';
import { themeCssVariables } from 'twenty-ui/theme';
import { v4 } from 'uuid';

export const settingsDataModelFieldRollupFormSchema = z.object({
  // Loose objects keep settings this form does not edit, e.g. filterGroups
  settings: z
    .looseObject({
      relationFieldMetadataId: z.uuid(),
      aggregateOperation: z.enum(ROLLUP_AGGREGATE_OPERATIONS),
      aggregatedFieldMetadataId: z.uuid().nullable(),
      filters: z.array(
        z.looseObject({
          id: z.uuid(),
          fieldMetadataId: z.uuid(),
          operand: z.enum(ViewFilterOperand),
          value: z.union([
            z.string(),
            z.array(z.string()),
            z.boolean(),
            z.number(),
            z.record(z.string(), z.unknown()),
          ]),
        }),
      ),
    })
    .refine(
      ({ aggregateOperation, aggregatedFieldMetadataId }) =>
        aggregateOperation === AggregateOperations.COUNT ||
        isDefined(aggregatedFieldMetadataId),
    ),
});

export type SettingsDataModelFieldRollupFormValues = z.infer<
  typeof settingsDataModelFieldRollupFormSchema
>;

const StyledFooter = styled.div`
  background-color: ${themeCssVariables.background.secondary};
  border-top: 1px solid ${themeCssVariables.border.color.light};
  padding: ${themeCssVariables.spacing[1]};
`;

type SettingsDataModelFieldRollupFormProps = {
  disabled?: boolean;
  existingFieldMetadataId: string;
  objectNameSingular: string;
};

export const SettingsDataModelFieldRollupForm = ({
  disabled,
  existingFieldMetadataId,
  objectNameSingular,
}: SettingsDataModelFieldRollupFormProps) => {
  const { t } = useLingui();
  const { getIcon } = useIcons();
  const { control } = useFormContext<SettingsDataModelFieldRollupFormValues>();
  const { fieldMetadataItem } = useFieldMetadataItemById(
    existingFieldMetadataId,
  );
  const { objectMetadataItem } = useObjectMetadataItem({ objectNameSingular });
  const { objectMetadataItems } = useObjectMetadataItems();
  const relationFieldMetadataItems = getRollupRelationFieldMetadataItems(
    objectMetadataItem.fields,
  );

  return (
    <Controller
      name="settings"
      control={control}
      defaultValue={{
        ...fieldMetadataItem?.settings,
        relationFieldMetadataId:
          fieldMetadataItem?.settings?.relationFieldMetadataId ??
          relationFieldMetadataItems[0]?.id ??
          '',
        aggregateOperation:
          fieldMetadataItem?.settings?.aggregateOperation ??
          AggregateOperations.COUNT,
        aggregatedFieldMetadataId:
          fieldMetadataItem?.settings?.aggregatedFieldMetadataId ?? null,
        filters: fieldMetadataItem?.settings?.filters ?? [],
      }}
      render={({ field: { onChange, value } }) => {
        const relatedObjectMetadataItem = objectMetadataItems.find(
          ({ id }) =>
            id ===
            relationFieldMetadataItems.find(
              (relationField) =>
                relationField.id === value.relationFieldMetadataId,
            )?.relation.targetObjectMetadata.id,
        );
        const relatedFieldMetadataItems =
          relatedObjectMetadataItem?.fields ?? [];
        const aggregatableFieldMetadataItems =
          getRollupAggregatableFieldMetadataItems({
            fieldMetadataItems: relatedFieldMetadataItems,
            aggregateOperation: value.aggregateOperation,
          });
        const filterableFieldMetadataItems =
          getRollupFilterableFieldMetadataItems(relatedFieldMetadataItems);
        const isCount = value.aggregateOperation === AggregateOperations.COUNT;

        return (
          <>
            <SettingsOptionCardContentSelect
              Icon={IconRelationOneToMany}
              title={t`Related records`}
              description={t`The relation whose records are calculated`}
            >
              <Select<string>
                dropdownId="rollup-relation-field"
                selectSizeVariant="small"
                dropdownWidth={200}
                needIconCheck={false}
                disabled={disabled}
                value={value.relationFieldMetadataId}
                onChange={(relationFieldMetadataId) =>
                  onChange({
                    ...value,
                    relationFieldMetadataId,
                    aggregatedFieldMetadataId: null,
                    aggregateOperation: AggregateOperations.COUNT,
                    filters: [],
                    filterGroups: [],
                  })
                }
                options={relationFieldMetadataItems.map((relationField) => ({
                  Icon: getIcon(relationField.icon),
                  label: relationField.label,
                  value: relationField.id,
                }))}
              />
            </SettingsOptionCardContentSelect>
            <SettingsCardSeparator />
            <SettingsOptionCardContentSelect
              Icon={IconSum}
              title={t`Calculation`}
              description={t`How the related records are summarized`}
            >
              <Select<RollupAggregateOperation>
                dropdownId="rollup-aggregate-operation"
                selectSizeVariant="small"
                dropdownWidth={160}
                needIconCheck={false}
                disabled={disabled}
                value={value.aggregateOperation}
                onChange={(aggregateOperation) =>
                  onChange({
                    ...value,
                    aggregateOperation,
                    aggregatedFieldMetadataId:
                      getRollupAggregatedFieldMetadataIdForOperation({
                        aggregateOperation,
                        currentAggregatedFieldMetadataId:
                          value.aggregatedFieldMetadataId,
                        relatedFieldMetadataItems,
                      }),
                  })
                }
                options={ROLLUP_AGGREGATE_OPERATION_SELECT_OPTIONS.map(
                  (option) => ({ ...option, label: t(option.label) }),
                )}
              />
            </SettingsOptionCardContentSelect>
            {!isCount && (
              <>
                <SettingsCardSeparator />
                <SettingsOptionCardContentSelect
                  Icon={IconSum}
                  title={t`Field`}
                  description={t`The field of the related records to calculate on`}
                >
                  <Select<string>
                    dropdownId="rollup-aggregated-field"
                    selectSizeVariant="small"
                    dropdownWidth={200}
                    needIconCheck={false}
                    disabled={disabled}
                    value={value.aggregatedFieldMetadataId ?? ''}
                    onChange={(aggregatedFieldMetadataId) =>
                      onChange({ ...value, aggregatedFieldMetadataId })
                    }
                    options={aggregatableFieldMetadataItems.map((field) => ({
                      Icon: getIcon(field.icon),
                      label: field.label,
                      value: field.id,
                    }))}
                  />
                </SettingsOptionCardContentSelect>
              </>
            )}
            <SettingsCardSeparator />
            <SettingsOptionCardContentSelect
              Icon={IconFilter}
              title={t`Filters`}
              description={t`Only calculate on the related records matching every filter`}
            />
            {value.filters.map((filter) => (
              <SettingsDataModelFieldRollupFilterRow
                key={filter.id}
                filter={filter}
                filterableFieldMetadataItems={filterableFieldMetadataItems}
                disabled={disabled}
                onChange={(updatedFilter) =>
                  onChange({
                    ...value,
                    filters: value.filters.map((existingFilter) =>
                      existingFilter.id === updatedFilter.id
                        ? updatedFilter
                        : existingFilter,
                    ),
                  })
                }
                onRemove={() =>
                  onChange({
                    ...value,
                    filters: value.filters.filter(({ id }) => id !== filter.id),
                  })
                }
              />
            ))}
            {!disabled && filterableFieldMetadataItems.length > 0 && (
              <StyledFooter>
                <LightButton
                  startIcon={<IconPlus />}
                  fullWidth
                  onClick={() =>
                    onChange({
                      ...value,
                      filters: [
                        ...value.filters,
                        getRollupFilterForFieldMetadataItem({
                          filterId: v4(),
                          fieldMetadataItem: filterableFieldMetadataItems[0],
                        }),
                      ],
                    })
                  }
                >{t`Add filter`}</LightButton>
              </StyledFooter>
            )}
          </>
        );
      }}
    />
  );
};
