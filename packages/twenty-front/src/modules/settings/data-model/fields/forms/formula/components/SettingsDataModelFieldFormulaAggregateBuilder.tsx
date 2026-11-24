import { styled } from '@linaria/react';
import { useLingui } from '@lingui/react/macro';
import { type FieldMetadataType } from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';
import { Dropdown } from 'twenty-ui/components/navigation';
import { IconSum } from 'twenty-ui/icon';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';

import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { SettingsDataModelFieldFormulaAggregateBuilderForm } from '@/settings/data-model/fields/forms/formula/components/SettingsDataModelFieldFormulaAggregateBuilderForm';
import { getFormulaAggregateFunctionNamesForFieldType } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateFunctionNamesForFieldType';
import { getFormulaAggregateRelationFieldMetadataItems } from '@/settings/data-model/fields/forms/formula/utils/getFormulaAggregateRelationFieldMetadataItems';
import { DropdownContent } from '@/ui/layout/dropdown/components/DropdownContent';
import { DropdownRoot } from '@/ui/layout/dropdown/components/DropdownRoot';
import { GenericDropdownContentWidth } from '@/ui/layout/dropdown/constants/GenericDropdownContentWidth';

const StyledActionRow = styled.div`
  display: flex;
  margin-top: ${themeCssVariables.spacing[3]};
`;

type SettingsDataModelFieldFormulaAggregateBuilderProps = {
  objectMetadataItem: EnrichedObjectMetadataItem;
  fieldType: FieldMetadataType;
};

export const SettingsDataModelFieldFormulaAggregateBuilder = ({
  objectMetadataItem,
  fieldType,
}: SettingsDataModelFieldFormulaAggregateBuilderProps) => {
  const { t } = useLingui();
  const functionNames = getFormulaAggregateFunctionNamesForFieldType(fieldType);
  const relationFieldMetadataItems =
    getFormulaAggregateRelationFieldMetadataItems(objectMetadataItem.fields);

  if (
    !isNonEmptyArray(functionNames) ||
    !isNonEmptyArray(relationFieldMetadataItems)
  ) {
    return null;
  }

  return (
    <StyledActionRow>
      <DropdownRoot
        dropdownId="settings-data-model-field-formula-aggregate-builder"
        type="panel"
      >
        <Dropdown.Trigger
          render={
            <Button
              startIcon={<IconSum />}
            >{t`Summarize related records`}</Button>
          }
        />
        <DropdownContent
          align="start"
          sideOffset={8}
          width={GenericDropdownContentWidth.ExtraExtraLarge}
          aria-label={t`Summarize related records`}
        >
          <SettingsDataModelFieldFormulaAggregateBuilderForm
            fieldType={fieldType}
            functionNames={functionNames}
            relationFieldMetadataItems={relationFieldMetadataItems}
          />
        </DropdownContent>
      </DropdownRoot>
    </StyledActionRow>
  );
};
