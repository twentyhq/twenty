import { objectMetadataItemFamilySelector } from '@/object-metadata/states/objectMetadataItemFamilySelector';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { type GraphWidgetFieldSelection } from '@/page-layout/types/GraphWidgetFieldSelection';

export const useOpportunityDefaultChartConfig = () => {
  const opportunityObjectMetadata = useRecoilValue(
    objectMetadataItemFamilySelector({
      objectName: CoreObjectNameSingular.Opportunity,
      objectNameType: 'singular',
    }),
  );

  const buildBarChartFieldSelection = ():
    | GraphWidgetFieldSelection
    | undefined => {
    if (!isDefined(opportunityObjectMetadata)) {
      return;
    }

    const stageField = opportunityObjectMetadata.fields.find(
      (field) => field.name === 'stage',
    );

    const amountField = opportunityObjectMetadata.fields.find(
      (field) => field.name === 'amount',
    );

    if (!isDefined(stageField) || !isDefined(amountField)) {
      return;
    }

    return {
      objectMetadataId: opportunityObjectMetadata.id,
      groupByFieldMetadataIdX: stageField.id,
      aggregateFieldMetadataId: amountField.id,
    };
  };

  const buildNumberChartFieldSelection = ():
    | GraphWidgetFieldSelection
    | undefined => {
    if (!isDefined(opportunityObjectMetadata)) {
      return;
    }

    const amountField = opportunityObjectMetadata.fields.find(
      (field) => field.name === 'amount',
    );

    if (!isDefined(amountField)) {
      return;
    }

    return {
      objectMetadataId: opportunityObjectMetadata.id,
      aggregateFieldMetadataId: amountField.id,
    };
  };

  return { buildBarChartFieldSelection, buildNumberChartFieldSelection };
};
