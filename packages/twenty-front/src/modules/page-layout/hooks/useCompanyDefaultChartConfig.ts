import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';

export const useCompanyDefaultChartConfig = () => {
  const companyObjectMetadata = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: CoreObjectNameSingular.Company,
      objectNameType: 'singular',
    }),
  );

  const buildBarChartFieldSelection = ():
    | GraphWidgetFieldSelection
    | undefined => {
    if (!isDefined(companyObjectMetadata)) {
      return;
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
      return;
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
      return;
    }

    const employeesField = companyObjectMetadata.fields.find(
      (field) => field.name === 'employees',
    );

    const arrField = companyObjectMetadata.fields.find(
      (field) => field.name === 'annualRecurringRevenue',
    );

    const aggregateField = employeesField ?? arrField;

    if (!isDefined(aggregateField)) {
      return;
    }

    return {
      objectMetadataId: companyObjectMetadata.id,
      aggregateFieldMetadataId: aggregateField.id,
    };
  };

  return { buildBarChartFieldSelection, buildNumberChartFieldSelection };
};
