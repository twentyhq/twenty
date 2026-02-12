import { type FieldMetadataItemOption } from '@/object-metadata/types/FieldMetadataItem';
import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { getSelectOptionColorForValue } from '@/page-layout/widgets/graph/utils/getSelectOptionColorForValue';
import { isDefined } from 'twenty-shared/utils';

type DetermineChartItemColorParams = {
  configurationColor: GraphColor | null | undefined;
  selectOptions: FieldMetadataItemOption[] | null | undefined;
  rawValue: string | null | undefined;
};

export const determineChartItemColor = ({
  configurationColor,
  selectOptions,
  rawValue,
}: DetermineChartItemColorParams): GraphColor | undefined => {
  if (isDefined(configurationColor) && configurationColor !== 'auto') {
    return configurationColor;
  }

  if (isDefined(selectOptions)) {
    const optionColor = getSelectOptionColorForValue({
      rawValue,
      selectOptions,
    });
    if (isDefined(optionColor)) {
      return optionColor;
    }
  }

  return undefined;
};
