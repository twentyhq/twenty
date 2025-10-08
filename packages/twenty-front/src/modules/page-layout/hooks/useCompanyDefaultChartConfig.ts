import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';

export const useCompanyDefaultChartConfig = () => {
  const companyObjectMetadata = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: 'company',
      objectNameType: 'singular',
    }),
  );

  const buildBarChartFieldSelection = ():
    | GraphWidgetFieldSelection
    | undefined => {
    if (!isDefined(companyObjectMetadata)) {
      return undefined;
    }

    const labelIdentifierField = companyObjectMetadata.fields.find(
      (field) =>
        field.id === companyObjectMetadata.labelIdentifierFieldMetadataId,
    );

    const employeesField = companyObjectMetadata.fields.find(
      (field) => field.name === 'employees',
    );

    const arrField = companyObjectMetadata.fields.find(
      (field) => field.name === 'annualRecurringRevenue',
    );

    const aggregateField = employeesField ?? arrField;

    if (!isDefined(labelIdentifierField) || !isDefined(aggregateField)) {
      return undefined;
    }

    return {
      objectMetadataId: companyObjectMetadata.id,
      groupByFieldMetadataIdX: labelIdentifierField.id,
      aggregateFieldMetadataId: aggregateField.id,
    };
  };

  const buildNumberChartFieldSelection = ():
    | GraphWidgetFieldSelection
    | undefined => {
    if (!isDefined(companyObjectMetadata)) {
      return undefined;
    }

    const employeesField = companyObjectMetadata.fields.find(
      (field) => field.name === 'employees',
    );

    const arrField = companyObjectMetadata.fields.find(
      (field) => field.name === 'annualRecurringRevenue',
    );

    const aggregateField = employeesField ?? arrField;

    if (!isDefined(aggregateField)) {
      return undefined;
    }

    return {
      objectMetadataId: companyObjectMetadata.id,
      aggregateFieldMetadataId: aggregateField.id,
    };
  };

  return { buildBarChartFieldSelection, buildNumberChartFieldSelection };
};
